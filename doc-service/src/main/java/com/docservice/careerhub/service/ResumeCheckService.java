package com.docservice.careerhub.service;

import com.docservice.careerhub.dto.ai.ResumeCheckResult;
import com.docservice.careerhub.entity.ResumeCheckHistory;
import com.docservice.careerhub.exception.ApiException;
import com.docservice.careerhub.repo.ResumeCheckHistoryRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Service
public class ResumeCheckService {

    private static final Logger LOGGER = LoggerFactory.getLogger(ResumeCheckService.class);

    private static final int FREE_DAILY_LIMIT = 5;
    private static final int HISTORY_LIMIT = 3;
    private static final int MAX_INPUT_CHARS = 20_000;

    @Autowired
    private ResumeAnalyzer resumeAnalyzer;

    @Autowired
    private RedisRateLimiter redisRateLimiter;

    @Autowired
    private ResumeCheckHistoryRepository historyRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private EntitlementService entitlementService;

    @Autowired
    private StorageService storageService;

    @com.docservice.careerhub.audit.Auditable(
            action = com.docservice.careerhub.dto.constants.AuditAction.RESUME_ANALYZED,
            actor = "#userEmail", targetType = "RESUME_CHECK",
            targetId = "#result.id", detail = "'score=' + #result.overallScore")
    public ResumeCheckHistory check(String userEmail, String resumeText, MultipartFile file) {
        boolean subscribed = entitlementService.hasActivePlan(userEmail);
        if (!subscribed) {
            redisRateLimiter.checkDailyLimit(userEmail, "resume-check", FREE_DAILY_LIMIT);
        }
        validate(resumeText);

        String text = resumeText.trim();
        ResumeCheckResult result = resumeAnalyzer.analyze(text);
        return saveHistory(userEmail, text, file, result);
    }

    // ---------------- History ----------------

    public Page<ResumeCheckHistory> history(String ownerEmail, Pageable pageable) {
        return historyRepository.findByOwnerEmailOrderByCreatedAtDesc(ownerEmail, pageable);
    }

    public ResumeCheckHistory getHistory(String ownerEmail, Long id) {
        return historyRepository.findByIdAndOwnerEmail(id, ownerEmail)
                .orElseThrow(() -> ApiException.notFound("Resume check not found: " + id));
    }

    private ResumeCheckHistory saveHistory(String ownerEmail, String resumeText, MultipartFile file, ResumeCheckResult result) {
        ResumeCheckHistory history = new ResumeCheckHistory();
        history.setOwnerEmail(ownerEmail);
        history.setOverallScore(result.overallScore());
        try {
            history.setCategoriesJson(objectMapper.writeValueAsString(result.categories()));
        } catch (Exception e) {
            LOGGER.warn("Failed to serialize resume-check categories for {}: {}", ownerEmail, e.getMessage());
            history.setCategoriesJson("[]");
        }
        history.setResumeSnapshot(resumeText);
        storeFile(ownerEmail, file, history);
        try {
            ResumeCheckHistory saved = historyRepository.save(history);
            pruneHistory(ownerEmail);
            return saved;
        } catch (Exception e) {
            LOGGER.warn("Failed to persist resume-check history for {}: {}", ownerEmail, e.getMessage());
            return history;
        }
    }

    private void storeFile(String ownerEmail, MultipartFile file, ResumeCheckHistory history) {
        if (file == null || file.isEmpty()) {
            return;
        }
        try {
            String contentType = StringUtils.hasText(file.getContentType()) ? file.getContentType() : "application/pdf";
            String ext = contentType.contains("word") || contentType.contains("docx") ? ".docx" : ".pdf";
            String path = "resume-checks/" + slug(ownerEmail) + "/" + UUID.randomUUID() + ext;
            String url = storageService.upload(file.getBytes(), path, contentType);
            history.setResumeFilePath(path);
            history.setResumeFileUrl(url);
            history.setResumeFileType(contentType);
        } catch (Exception e) {
            LOGGER.warn("Failed to store resume file for {}: {}", ownerEmail, e.getMessage());
        }
    }

    private void pruneHistory(String ownerEmail) {
        List<ResumeCheckHistory> all = historyRepository.findByOwnerEmailOrderByCreatedAtDesc(ownerEmail);
        if (all.size() > HISTORY_LIMIT) {
            List<ResumeCheckHistory> stale = all.subList(HISTORY_LIMIT, all.size());
            for (ResumeCheckHistory h : stale) {
                if (StringUtils.hasText(h.getResumeFilePath())) {
                    try { storageService.delete(h.getResumeFilePath()); } catch (Exception ignored) { /* orphan is acceptable */ }
                }
            }
            historyRepository.deleteAll(stale);
        }
    }

    private String slug(String email) {
        return email == null ? "anon" : email.replaceAll("[^a-zA-Z0-9]", "_");
    }

    private void validate(String resumeText) {
        if (!StringUtils.hasText(resumeText)) {
            throw ApiException.badData("Resume text is required for the resume check.");
        }
        if (resumeText.length() > MAX_INPUT_CHARS) {
            throw ApiException.badData("Resume text is too long.");
        }
    }
}
