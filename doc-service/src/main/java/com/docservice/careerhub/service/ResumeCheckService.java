package com.docservice.careerhub.service;

import com.docservice.careerhub.ai.AiException;
import com.docservice.careerhub.ai.AiPrompt;
import com.docservice.careerhub.ai.AiRequest;
import com.docservice.careerhub.ai.AiService;
import com.docservice.careerhub.dto.ai.ResumeCheckAiPart;
import com.docservice.careerhub.dto.ai.ResumeCheckResult;
import com.docservice.careerhub.dto.ai.ResumeCheckResult.Category;
import com.docservice.careerhub.dto.ai.ResumeCheckResult.Finding;
import com.docservice.careerhub.dto.request.ResumeCheckRequest;
import com.docservice.careerhub.entity.ResumeCheckHistory;
import com.docservice.careerhub.exception.ApiException;
import com.docservice.careerhub.repo.ResumeCheckHistoryRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;


@Service
public class ResumeCheckService {

    private static final Logger LOGGER = LoggerFactory.getLogger(ResumeCheckService.class);
    private static final double TEMPERATURE = 0.3;
    private static final int DAILY_LIMIT = 20;
    private static final int LONG_SENTENCE_CHARS = 220;
    private static final int MIN_WORDS = 400;
    private static final int MAX_WORDS = 900;

    private static final List<String> ACTION_VERBS = List.of(
            "developed", "built", "implemented", "managed", "created", "designed",
            "led", "improved", "worked", "handled", "made", "used");
    private static final List<String> BUZZWORDS = List.of(
            "results-driven", "team player", "hardworking", "hard-working", "dynamic",
            "responsible for", "detail-oriented", "self-motivated", "go-getter",
            "think outside the box", "synergy", "proven track record");
    private static final List<String> SECTION_KEYWORDS = List.of("experience", "education", "skills");

    @Autowired
    private AiService aiService;

    @Autowired
    private RedisRateLimiter redisRateLimiter;

    @Autowired
    private ResumeCheckHistoryRepository historyRepository;

    @Autowired
    private ObjectMapper objectMapper;

    public ResumeCheckResult check(String userEmail, ResumeCheckRequest request) {
        redisRateLimiter.checkDailyLimit(userEmail, "resume-check", DAILY_LIMIT);
        validate(request);

        String text = request.getResumeText().trim();
        List<Category> categories = new ArrayList<>(deterministicCategories(text));
        categories.addAll(aiCategories(userEmail, request, text));

        ResumeCheckResult result = new ResumeCheckResult(overallScore(categories), categories);
        saveHistory(userEmail, request, text, result);
        return result;
    }

    public Page<ResumeCheckHistory> history(String ownerEmail, Pageable pageable) {
        return historyRepository.findByOwnerEmailOrderByCreatedAtDesc(ownerEmail, pageable);
    }

    public ResumeCheckHistory getHistory(String ownerEmail, Long id) {
        return historyRepository.findByIdAndOwnerEmail(id, ownerEmail)
                .orElseThrow(() -> ApiException.notFound("Resume check not found: " + id));
    }

    public ResumeCheckResult toResult(ResumeCheckHistory history) {
        try {
            List<Category> categories = objectMapper.readValue(history.getCategoriesJson(),
                    new TypeReference<List<Category>>() { });
            return new ResumeCheckResult(history.getOverallScore(), categories);
        } catch (Exception e) {
            LOGGER.warn("Failed to deserialize resume-check history {}: {}", history.getId(), e.getMessage());
            return new ResumeCheckResult(history.getOverallScore(), List.of());
        }
    }

    private void saveHistory(String ownerEmail, ResumeCheckRequest request, String resumeText, ResumeCheckResult result) {
        try {
            ResumeCheckHistory history = new ResumeCheckHistory();
            history.setOwnerEmail(ownerEmail);
            // target_role is varchar(255); users may paste a full JD here, so store only a short label.
            history.setTargetRole(labelForTargetRole(request.getTargetRole()));
            history.setOverallScore(result.overallScore());
            history.setCategoriesJson(objectMapper.writeValueAsString(result.categories()));
            history.setResumeSnapshot(resumeText);
            historyRepository.save(history);
        } catch (Exception e) {
            LOGGER.warn("Failed to persist resume-check history for {}: {}", ownerEmail, e.getMessage());
        }
    }

    private String labelForTargetRole(String targetRole) {
        if (!StringUtils.hasText(targetRole)) {
            return null;
        }
        String trimmed = targetRole.trim();
        return trimmed.length() <= 200 ? trimmed : trimmed.substring(0, 200) + "…";
    }

    // ---------------- Deterministic checks ----------------

    private List<Category> deterministicCategories(String text) {
        String lower = text.toLowerCase(Locale.ROOT);
        List<Category> categories = new ArrayList<>();
        categories.add(repetition(text));
        categories.add(buzzwords(text, lower));
        categories.add(brevity(text));
        categories.add(quantification(text));
        categories.add(sections(lower));
        categories.add(length(text));
        return categories;
    }

    private Category repetition(String text) {
        Map<String, Integer> counts = new LinkedHashMap<>();
        Matcher matcher = Pattern.compile("\\b[a-zA-Z][a-zA-Z-]{2,}\\b").matcher(text);
        while (matcher.find()) {
            String word = matcher.group().toLowerCase(Locale.ROOT);
            if (ACTION_VERBS.contains(word)) {
                counts.merge(word, 1, Integer::sum);
            }
        }
        List<Finding> findings = new ArrayList<>();
        counts.forEach((verb, n) -> {
            if (n >= 3) {
                findings.add(new Finding("warning", verb,
                        "\"" + verb + "\" is used " + n + " times.",
                        "Vary this with a more specific action verb so achievements stand out."));
            }
        });
        return category("repetition", "Repetition", findings,
                "Avoid repeating the same action verbs across bullets.");
    }

    private Category buzzwords(String text, String lower) {
        List<Finding> findings = new ArrayList<>();
        for (String buzz : BUZZWORDS) {
            int idx = lower.indexOf(buzz);
            if (idx >= 0) {
                findings.add(new Finding("warning", text.substring(idx, idx + buzz.length()),
                        "\"" + buzz + "\" is a cliché that adds no evidence.",
                        "Replace it with a concrete, measurable achievement."));
            }
        }
        return category("buzzwords", "Buzzwords", findings,
                "Swap generic clichés for specific, quantified accomplishments.");
    }

    private Category brevity(String text) {
        List<Finding> findings = new ArrayList<>();
        for (String sentence : text.split("(?<=[.!?])\\s+|\\R")) {
            String trimmed = sentence.trim();
            if (trimmed.length() > LONG_SENTENCE_CHARS) {
                String snippet = trimmed.substring(0, Math.min(40, trimmed.length()));
                findings.add(new Finding("warning", snippet,
                        "This line is " + trimmed.length() + " characters — too long to skim.",
                        "Split it into two concise, single-line bullet points."));
            }
        }
        return category("brevity", "Brevity", findings,
                "Keep bullets to a single, scannable line.");
    }

    private Category quantification(String text) {
        List<Finding> findings = new ArrayList<>();
        boolean hasNumbers = Pattern.compile("\\b\\d+[+%kKmM]?\\b").matcher(text).find();
        if (!hasNumbers) {
            findings.add(new Finding("bad", "",
                    "The resume has no numbers or metrics.",
                    "Add figures (%, $, counts, time saved) to show measurable impact."));
        }
        return category("quantification", "Quantification", findings,
                "Quantify impact wherever possible.");
    }

    private Category sections(String lower) {
        List<Finding> findings = new ArrayList<>();
        for (String section : SECTION_KEYWORDS) {
            if (!lower.contains(section)) {
                findings.add(new Finding("bad", "",
                        "No \"" + section + "\" section detected.",
                        "Add a clearly labelled " + section + " section for ATS parsing."));
            }
        }
        if (!Pattern.compile("[\\w.+-]+@[\\w-]+\\.[\\w.-]+").matcher(lower).find()) {
            findings.add(new Finding("warning", "",
                    "No email address detected.",
                    "Add a professional email so recruiters can reach you."));
        }
        return category("sections", "Sections & Contact", findings,
                "Ensure the core sections and contact details are present.");
    }

    private Category length(String text) {
        int words = text.split("\\s+").length;
        List<Finding> findings = new ArrayList<>();
        if (words < MIN_WORDS) {
            findings.add(new Finding("warning", "",
                    "The resume is short (~" + words + " words).",
                    "Expand with more detail on impact and responsibilities."));
        } else if (words > MAX_WORDS) {
            findings.add(new Finding("warning", "",
                    "The resume is long (~" + words + " words).",
                    "Trim to the most relevant, recent, high-impact content."));
        }
        return category("length", "Length", findings,
                "Aim for a focused, appropriately-sized resume.");
    }

    // ---------------- AI checks ----------------

    private List<Category> aiCategories(String userEmail, ResumeCheckRequest request, String text) {
        String userPrompt = buildUserPrompt(request, text);
        AiRequest aiRequest = new AiRequest(userPrompt, AiPrompt.RESUME_CHECK_SYSTEM.getPrompt(), TEMPERATURE);
        try {
            ResumeCheckAiPart part = aiService.generate(aiRequest, ResumeCheckAiPart.class);
            if (part == null || part.categories() == null) {
                return List.of();
            }
            List<Category> cleaned = new ArrayList<>();
            for (Category c : part.categories()) {
                if (c == null) {
                    continue;
                }
                cleaned.add(new Category(c.key(), c.label(),
                        clamp(c.score()), StringUtils.hasText(c.status()) ? c.status() : "warning",
                        c.summary(), c.findings() == null ? List.of() : c.findings()));
            }
            return cleaned;
        } catch (AiException exception) {
            LOGGER.warn("AI resume-check failed for {} — returning deterministic results only: {}",
                    userEmail, exception.getMessage());
            return List.of();
        }
    }

    private String buildUserPrompt(ResumeCheckRequest request, String text) {
        StringBuilder sb = new StringBuilder();
        if (StringUtils.hasText(request.getTargetRole())) {
            sb.append("Target role / job description:\n").append(request.getTargetRole().trim()).append("\n\n");
        }
        sb.append("RESUME TEXT:\n").append(text);
        return sb.toString();
    }

    // ---------------- Helpers ----------------

    private Category category(String key, String label, List<Finding> findings, String okSummary) {
        int problems = (int) findings.stream()
                .filter(f -> "bad".equals(f.severity()) || "warning".equals(f.severity()))
                .count();
        int score = clamp(100 - problems * 18);
        String status = problems == 0 ? "good" : problems <= 1 ? "warning" : "bad";
        String summary = problems == 0
                ? okSummary
                : problems + " issue" + (problems == 1 ? "" : "s") + " found.";
        return new Category(key, label, score, status, summary, findings);
    }

    private int overallScore(List<Category> categories) {
        if (categories.isEmpty()) {
            return 0;
        }
        int sum = categories.stream().mapToInt(Category::score).sum();
        return clamp(Math.round((float) sum / categories.size()));
    }

    private int clamp(int value) {
        return Math.max(0, Math.min(100, value));
    }

    private void validate(ResumeCheckRequest request) {
        if (request == null || !StringUtils.hasText(request.getResumeText())) {
            throw ApiException.badData("Resume text is required for the resume check.");
        }
        if (request.getResumeText().length() > 20_000) {
            throw ApiException.badData("Resume text is too long.");
        }
    }
}
