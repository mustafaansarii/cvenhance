package com.docservice.careerhub.service;

import com.docservice.careerhub.ai.AiPrompt;
import com.docservice.careerhub.ai.AiRequest;
import com.docservice.careerhub.ai.AiService;
import com.docservice.careerhub.dto.ai.Profile;
import com.docservice.careerhub.dto.request.ImportResumeRequest;
import com.docservice.careerhub.exception.ApiException;
import com.docservice.careerhub.util.ParseProfileDataHelper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

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
    private RedisRateLimiter redisRateLimiter;

    @Autowired
    private EntitlementService entitlementService;

    private String profileSchema = "{}";

    @PostConstruct
    void loadProfileSchema() {
        try (InputStream in = new ClassPathResource("sample-resume.json").getInputStream()) {
            profileSchema = new String(in.readAllBytes(), StandardCharsets.UTF_8);
        } catch (Exception ignored) {}
    }

    @com.docservice.careerhub.audit.Auditable(
            action = com.docservice.careerhub.dto.constants.AuditAction.RESUME_IMPORTED, actor = "#ownerEmail")
    public Map<String, Object> importFromText(String ownerEmail, ImportResumeRequest request) {
        redisRateLimiter.checkAiDailyLimit(ownerEmail, entitlementService.hasActivePlan(ownerEmail));
        String resumeText = Objects.isNull(request) || Objects.isNull(request.getResumeText())
                ? "" : request.getResumeText().trim();
        String guidance = Objects.isNull(request) || Objects.isNull(request.getJobDescription())
                ? "" : request.getJobDescription().trim();

        if (resumeText.isBlank() && guidance.isBlank()) {
            throw ApiException.badData("Please upload a resume or provide some guidance.");
        }

        String sourceText = resumeText;
        if (sourceText.isBlank()) {
            sourceText = existingProfileText(ownerEmail);
            if (sourceText.isBlank()) {
                throw ApiException.badData("No existing resume to tailor — please upload your resume too.");
            }
        }

        Map<String, Object> profile = parseProfile(sourceText, guidance);
        saveProfile(ownerEmail, profile);
        return profile;
    }

    private String existingProfileText(String ownerEmail) {
        try {
            String data = authService.getActiveUser(ownerEmail).getProfileData();
            return Objects.isNull(data) || data.isBlank() || "{}".equals(data.trim()) ? "" : data.trim();
        } catch (Exception e) {
            logger.error("Loading existing profile for JD tailoring failed", e);
            return "";
        }
    }

//-----------------Private Methods------------------------------

    private Map<String, Object> parseProfile(String resumeText, String guidance) {
        try {
            return parseProfileWithAi(resumeText, guidance);
        } catch (Exception e) {
            logger.error("AI parsing failed, falling back to manual parsing", e);
            // Manual fallback can only extract; it cannot tailor or apply guidance.
            return parseProfileDataHelper.parseProfileWithManual(resumeText, objectMapper, profileSchema);
        }
    }

    private Map<String, Object> parseProfileWithAi(String resumeText, String guidance) {
        AiRequest request = new AiRequest(
                buildUserPrompt(resumeText, guidance),
                buildSystemInstruction(guidance),
                EXTRACT_TEMPERATURE);
        Profile profile = aiService.generate(request, Profile.class);
        if (profile == null) {
            throw ApiException.badData("Could not turn that resume into profile data. Please try a clearer resume.");
        }
        return objectMapper.convertValue(profile, new TypeReference<Map<String, Object>>() { });
    }

    private String buildSystemInstruction(String guidance) {
        // With guidance (a JD and/or improvement feedback) use the guided prompt; else plain extraction.
        return (guidance.isBlank() ? AiPrompt.RESUME_PARSER_SYSTEM : AiPrompt.RESUME_GUIDED_SYSTEM).getPrompt();
    }

    private String buildUserPrompt(String resumeText, String guidance) {
        if (guidance.isBlank()) {
            return "RESUME TEXT:\n" + resumeText;
        }
        return "GUIDANCE (target job description and/or improvement feedback):\n" + guidance
                + "\n\nRESUME TEXT:\n" + resumeText;
    }

    private void saveProfile(String ownerEmail, Map<String, Object> profile) {
        try {
            authService.updateProfile(ownerEmail, objectMapper.writeValueAsString(profile));
        } catch (Exception e) {
            logger.error("Saving imported profile failed", e);
            throw new RuntimeException("Failed to save the imported profile", e);
        }
    }
}
