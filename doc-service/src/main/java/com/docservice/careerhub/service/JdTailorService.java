package com.docservice.careerhub.service;

import com.docservice.careerhub.ai.AiPrompt;
import com.docservice.careerhub.ai.AiException;
import com.docservice.careerhub.ai.AiRequest;
import com.docservice.careerhub.ai.AiService;
import com.docservice.careerhub.ai.VectorSearchService;
import com.docservice.careerhub.dto.request.JdTailorRequest;
import com.docservice.careerhub.exception.ApiException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.document.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * RAG-powered resume tailoring to a specific Job Description.
 *
 * Flow:
 * 1. Chunk and embed the provided JD into pgvector (ephemeral, tagged by session).
 * 2. Embed the user's resume text and retrieve the top-k JD requirements that
 *    are most mismatched or most relevant.
 * 3. Inject the retrieved JD context into a Gemini prompt alongside the resume.
 * 4. Return a tailored rewrite suggestion.
 */
@Service
public class JdTailorService {

    private static final Logger LOGGER = LoggerFactory.getLogger(JdTailorService.class);
    private static final double TEMPERATURE = 0.3;
    private static final String TYPE_JD = "jd_chunk";

    @Autowired
    private AiService aiService;

    @Autowired
    private VectorSearchService vectorSearchService;

    @Autowired
    private EntitlementService entitlementService;

    @Autowired
    private RedisRateLimiter redisRateLimiter;

    public String tailor(String userEmail, JdTailorRequest request) {
        if (!entitlementService.hasActivePlan(userEmail)) {
            throw ApiException.paymentRequired("Subscribe to a plan to use AI resume tailoring.");
        }
        redisRateLimiter.checkDailyLimit(userEmail);
        validate(request);

        // Step 1: chunk JD into sentences/paragraphs and store in pgvector
        String sessionId = UUID.randomUUID().toString();
        List<Document> jdChunks = chunkJd(request.getJobDescription(), sessionId);
        vectorSearchService.store(jdChunks);

        try {
            // Step 2: retrieve top-5 JD requirements most relevant to the resume
            String searchQuery = StringUtils.hasText(request.getResumeText())
                    ? request.getResumeText()
                    : request.getSection();
            List<Document> topRequirements = vectorSearchService.search(
                    searchQuery, 5, 0.55, Map.of("type", TYPE_JD, "session", sessionId));

            // Step 3: build RAG-enriched prompt
            String prompt = buildPrompt(request, topRequirements);
            AiRequest aiRequest = new AiRequest(prompt, AiPrompt.JD_TAILOR_SYSTEM.getPrompt(), TEMPERATURE);
            return aiService.generate(aiRequest);

        } catch (AiException e) {
            LOGGER.warn("JD tailor AI call failed for {}: {}", userEmail, e.getMessage());
            throw ApiException.badData("AI is busy right now. Please try again in a moment.");
        } finally {
            // Step 4: clean up ephemeral JD chunks from vector store
            List<String> ids = jdChunks.stream().map(Document::getId).toList();
            vectorSearchService.delete(ids);
        }
    }

    // ── private helpers ─────────────────────────────────────────────────────

    private List<Document> chunkJd(String jdText, String sessionId) {
        // Split on double-newlines (paragraphs) or single newlines, chunk at ~300 chars
        String[] rawChunks = jdText.split("\\n{1,}");
        StringBuilder current = new StringBuilder();
        List<Document> docs = new java.util.ArrayList<>();
        for (String line : rawChunks) {
            String trimmed = line.trim();
            if (trimmed.isEmpty()) continue;
            if (current.length() + trimmed.length() > 300 && current.length() > 0) {
                docs.add(makeJdDoc(current.toString().trim(), sessionId));
                current = new StringBuilder();
            }
            current.append(trimmed).append(" ");
        }
        if (current.length() > 0) {
            docs.add(makeJdDoc(current.toString().trim(), sessionId));
        }
        return docs;
    }

    private Document makeJdDoc(String content, String sessionId) {
        return new Document(
                UUID.randomUUID().toString(),
                content,
                Map.of("type", TYPE_JD, "session", sessionId)
        );
    }

    private String buildPrompt(JdTailorRequest request, List<Document> topRequirements) {
        StringBuilder sb = new StringBuilder();
        if (!topRequirements.isEmpty()) {
            sb.append("KEY JD REQUIREMENTS (most relevant to this resume):\n");
            topRequirements.forEach(d -> sb.append("- ").append(d.getText()).append("\n"));
            sb.append("\n");
        }
        if (StringUtils.hasText(request.getSection())) {
            sb.append("Resume section: ").append(request.getSection()).append("\n");
        }
        sb.append("\nUSER RESUME:\n").append(request.getResumeText());
        return sb.toString();
    }

    private void validate(JdTailorRequest request) {
        if (!StringUtils.hasText(request.getResumeText())) {
            throw ApiException.badData("Resume text is required.");
        }
        if (!StringUtils.hasText(request.getJobDescription())) {
            throw ApiException.badData("Job description is required.");
        }
    }
}
