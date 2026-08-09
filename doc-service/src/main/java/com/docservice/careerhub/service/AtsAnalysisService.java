package com.docservice.careerhub.service;

import java.util.List;
import java.util.Map;
import java.util.Objects;

import org.springframework.ai.document.Document;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.docservice.careerhub.ai.AiPrompt;
import com.docservice.careerhub.ai.AiException;
import com.docservice.careerhub.ai.AiRequest;
import com.docservice.careerhub.ai.AiService;
import com.docservice.careerhub.ai.VectorSearchService;
import com.docservice.careerhub.dto.ai.AtsAnalysisResult;
import com.docservice.careerhub.dto.request.AtsAnalysisRequest;
import com.docservice.careerhub.entity.AtsAnalysisHistory;
import com.docservice.careerhub.exception.ApiException;
import com.docservice.careerhub.repo.AtsAnalysisHistoryRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class AtsAnalysisService {

    private static final Logger LOGGER = LoggerFactory.getLogger(AtsAnalysisService.class);
    private static final double TEMPERATURE = 0.3;

    @Autowired
    private AiService aiService;

    @Autowired
    private RedisRateLimiter redisRateLimiter;

    @Autowired
    private EntitlementService entitlementService;

    @Autowired
    private AtsAnalysisHistoryRepository historyRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private VectorSearchService vectorSearchService;

    public AtsAnalysisResult analyze(String userEmail, AtsAnalysisRequest request) {
        if (!entitlementService.hasActivePlan(userEmail)) {
            throw ApiException.paymentRequired("Subscribe to a plan to use the AI ATS analysis.");
        }
        redisRateLimiter.checkDailyLimit(userEmail);
        validate(request);

        String userPrompt = buildUserPrompt(request);
        AiRequest aiRequest = new AiRequest(userPrompt, AiPrompt.ATS_ANALYSIS_SYSTEM.getPrompt(), TEMPERATURE);

        try {
            AtsAnalysisResult result = aiService.generate(aiRequest, AtsAnalysisResult.class);
            if (result == null) {
                throw ApiException.badData("AI did not return a response. Please try again.");
            }
            saveHistory(userEmail, request, result);
            return result;
        } catch (AiException exception) {
            LOGGER.warn("AI ATS analysis failed for {}: {}", userEmail, exception.getMessage());
            throw ApiException.badData("AI is busy right now. Please try again in a moment.");
        }
    }

    public Page<AtsAnalysisHistory> history(String ownerEmail, Pageable pageable) {
        return historyRepository.findByOwnerEmailOrderByCreatedAtDesc(ownerEmail, pageable);
    }

    public AtsAnalysisHistory getHistory(String ownerEmail, Long id) {
        return historyRepository.findByIdAndOwnerEmail(id, ownerEmail)
                .orElseThrow(() -> ApiException.notFound("ATS analysis not found: " + id));
    }

    private void saveHistory(String ownerEmail, AtsAnalysisRequest request, AtsAnalysisResult result) {
        try {
            AtsAnalysisHistory history = new AtsAnalysisHistory();
            history.setOwnerEmail(ownerEmail);
            history.setTargetRole(StringUtils.hasText(request.getTargetRole()) ? request.getTargetRole().trim() : null);
            history.setScore(result.score());
            history.setStrengthsJson(objectMapper.writeValueAsString(Objects.requireNonNullElse(result.strengths(), List.of())));
            history.setWeaknessesJson(objectMapper.writeValueAsString(Objects.requireNonNullElse(result.weaknesses(), List.of())));
            history.setSuggestionsJson(objectMapper.writeValueAsString(Objects.requireNonNullElse(result.suggestions(), List.of())));
            history.setResumeSnapshot(request.getResumeText());
            historyRepository.save(history);
        } catch (Exception e) {
            LOGGER.warn("Failed to persist ATS history for {}: {}", ownerEmail, e.getMessage());
        }
    }

    public AtsAnalysisResult toResult(AtsAnalysisHistory history) {
        try {
            List<Map<String, Object>> rawSuggestions = objectMapper.readValue(history.getSuggestionsJson(),
                    new TypeReference<List<Map<String, Object>>>() { });
            List<AtsAnalysisResult.AtsSuggestion> suggestions = rawSuggestions.stream()
                    .map(m -> new AtsAnalysisResult.AtsSuggestion(
                            (String) m.get("section"),
                            (String) m.get("action"),
                            (String) m.get("target"),
                            (String) m.get("originalText"),
                            (String) m.get("newText"),
                            (String) m.get("reason")))
                    .toList();
            return new AtsAnalysisResult(
                    history.getScore(),
                    objectMapper.readValue(history.getStrengthsJson(), new TypeReference<List<String>>() { }),
                    objectMapper.readValue(history.getWeaknessesJson(), new TypeReference<List<String>>() { }),
                    suggestions);
        } catch (Exception e) {
            LOGGER.warn("Failed to deserialize ATS history {}: {}", history.getId(), e.getMessage());
            return new AtsAnalysisResult(history.getScore(), List.of(), List.of(), List.of());
        }
    }

    private void validate(AtsAnalysisRequest request) {
        if (request == null || !StringUtils.hasText(request.getResumeText())) {
            throw ApiException.badData("Resume text is required for ATS analysis.");
        }
    }

    private String buildUserPrompt(AtsAnalysisRequest request) {
        StringBuilder sb = new StringBuilder();
        if (StringUtils.hasText(request.getTargetRole())) {
            sb.append("Target role: ").append(request.getTargetRole().trim()).append("\n\n");

            // ── RAG: retrieve ATS keyword corpus for this role ────────────────
            try {
                List<Document> keywordDocs = vectorSearchService.search(
                        request.getTargetRole(), 3,
                        Map.of("type", "role_keywords"));
                if (!keywordDocs.isEmpty()) {
                    sb.append("TRENDING ATS KEYWORDS FOR THIS ROLE (sourced from real job postings):\n");
                    keywordDocs.forEach(d -> sb.append("- ").append(d.getText()).append("\n"));
                    sb.append("\n");
                }
            } catch (Exception e) {
                LOGGER.debug("Role keyword RAG retrieval skipped: {}", e.getMessage());
            }
            // ── end RAG ──────────────────────────────────────────────────────
        }
        sb.append("RESUME TEXT:\n").append(request.getResumeText().trim());
        return sb.toString();
    }
}