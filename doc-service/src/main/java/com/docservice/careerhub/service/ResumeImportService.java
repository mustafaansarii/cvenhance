package com.docservice.careerhub.service;

import com.docservice.careerhub.ai.AiPrompt;
import com.docservice.careerhub.ai.AiRequest;
import com.docservice.careerhub.ai.AiService;
import com.docservice.careerhub.dto.ai.Profile;
import com.docservice.careerhub.exception.ApiException;
import com.docservice.careerhub.util.ParseProfileDataHelper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.Objects;


@Service
public class ResumeImportService {

    private static final Logger logger = LoggerFactory.getLogger(ResumeImportService.class);

    private static final double EXTRACT_TEMPERATURE = 0.2;

    @Autowired
    private AiService aiService;

    @Autowired
    private AuthService authService;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ParseProfileDataHelper parseProfileDataHelper;

    @Autowired
    private CareerVaultService careerVaultService;

    private String profileSchema = "{}";

    @PostConstruct
    void loadProfileSchema() {
        try (InputStream in = new ClassPathResource("sample-resume.json").getInputStream()) {
            profileSchema = new String(in.readAllBytes(), StandardCharsets.UTF_8);
        } catch (Exception ignored) {}
    }

    public Map<String, Object> importFromFile(String ownerEmail, MultipartFile file) {
        String resumeText = extractText(file);
        Map<String, Object> profile = parseProfile(resumeText);
        saveProfile(ownerEmail, profile);
        return profile;
    }

//-----------------Private Methods------------------------------

    private String extractText(MultipartFile file) {
        if (Objects.isNull(file) || file.isEmpty()) {
            throw ApiException.badData("Please choose a file to upload");
        }
        String fileName = Objects.requireNonNullElse(file.getOriginalFilename(), "").toLowerCase();

        String text;
        if (fileName.endsWith(".pdf")) {
            text = extractPdfText(file);
        } else if (fileName.endsWith(".docx")) {
            text = extractDocxText(file);
        } else if (fileName.endsWith(".txt")) {
            text = readBytes(file);
        } else {
            throw ApiException.badData("Unsupported file type. Please upload a PDF or DOCX.");
        }

        if (Objects.isNull(text) || text.isBlank()) {
            throw ApiException.badData("Couldn't read any text from that file. Try a text-based PDF or a DOCX.");
        }
        return text;
    }

    private String extractPdfText(MultipartFile file) {
        try (PDDocument document = Loader.loadPDF(file.getBytes())) {
            return new PDFTextStripper().getText(document);
        } catch (Exception e) {
            logger.error("PDF text extraction failed", e);
            throw ApiException.badData("Failed to read the PDF: " + e.getMessage());
        }
    }

    private String extractDocxText(MultipartFile file) {
        try (XWPFDocument document = new XWPFDocument(file.getInputStream());
             XWPFWordExtractor extractor = new XWPFWordExtractor(document)) {
            return extractor.getText();
        } catch (Exception e) {
            logger.error("DOCX text extraction failed", e);
            throw ApiException.badData("Failed to read the DOCX: " + e.getMessage());
        }
    }

    private String readBytes(MultipartFile file) {
        try {
            return new String(file.getBytes(), StandardCharsets.UTF_8);
        } catch (Exception e) {
            logger.error("File text extraction failed", e);
            throw ApiException.badData("Failed to read the file: " + e.getMessage());
        }
    }

    private Map<String, Object> parseProfile(String resumeText) {
        try {
            return parseProfileWithAi(resumeText);
        } catch (Exception e) {
            logger.error("AI parsing failed, falling back to manual parsing", e);
            return parseProfileDataHelper.parseProfileWithManual(resumeText, objectMapper, profileSchema);
        }
    }

    private Map<String, Object> parseProfileWithAi(String resumeText) {
        AiRequest request = new AiRequest(buildUserPrompt(resumeText), buildSystemInstruction(), EXTRACT_TEMPERATURE);
        Profile profile = aiService.generate(request, Profile.class);
        if (profile == null) {
            throw ApiException.badData("Could not turn that file into profile data. Please try a clearer resume file.");
        }
        return objectMapper.convertValue(profile, new TypeReference<Map<String, Object>>() { });
    }

    private String buildSystemInstruction() {
        return AiPrompt.RESUME_PARSER_SYSTEM.getPrompt();
    }

    private String buildUserPrompt(String resumeText) {
        return "RESUME TEXT:\n" + resumeText;
    }

    private void saveProfile(String ownerEmail, Map<String, Object> profile) {
        try {
            authService.updateProfile(ownerEmail, objectMapper.writeValueAsString(profile));
        } catch (Exception e) {
            logger.error("Saving imported profile failed", e);
            throw new RuntimeException("Failed to save the imported profile", e);
        }

        // ── Index into Career Vault (RAG personal memory) ─────────────────────
        // Extract the key textual sections from the parsed profile for semantic indexing.
        // This runs async-safely in a try/catch so a vault failure never blocks import.
        try {
            Map<String, String> sections = extractTextSections(profile);
            if (!sections.isEmpty()) {
                careerVaultService.indexSections(ownerEmail, sections);
            }
        } catch (Exception e) {
            logger.warn("Career vault indexing failed for {} (non-fatal): {}", ownerEmail, e.getMessage());
        }
        // ── end Career Vault ──────────────────────────────────────────────────────
    }

    /**
     * Flatten relevant top-level string fields from the parsed profile JSON
     * into a map of section → text for vector indexing.
     */
    @SuppressWarnings("unchecked")
    private Map<String, String> extractTextSections(Map<String, Object> profile) {
        Map<String, String> result = new java.util.LinkedHashMap<>();
        String[] textFields = {"summary", "objective", "skills", "experience", "education", "projects",
                               "certifications", "achievements", "publications", "courses"};
        for (String field : textFields) {
            Object val = profile.get(field);
            if (val == null) continue;
            String text;
            if (val instanceof String s) {
                text = s;
            } else {
                // Arrays / objects: serialize to compact JSON text for embedding
                try {
                    text = objectMapper.writeValueAsString(val);
                } catch (Exception ignored) {
                    continue;
                }
            }
            if (text != null && !text.isBlank() && !text.equals("null") && !text.equals("[]") && !text.equals("{}")) {
                result.put(field, text);
            }
        }
        return result;
    }
}
