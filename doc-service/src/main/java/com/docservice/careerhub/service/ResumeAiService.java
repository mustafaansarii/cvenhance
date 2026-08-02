package com.docservice.careerhub.service;

import com.docservice.careerhub.ai.AiException;
import com.docservice.careerhub.ai.AiRequest;
import com.docservice.careerhub.ai.AiService;
import com.docservice.careerhub.dto.ai.AiAssistResult;
import com.docservice.careerhub.dto.request.AiAssistRequest;
import com.docservice.careerhub.exception.ApiException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
public class ResumeAiService {

    private static final Logger LOGGER = LoggerFactory.getLogger(ResumeAiService.class);
    private static final double TEMPERATURE = 0.4;

    private static final String SYSTEM_BASE = """
            You are an expert ATS resume writer. Improve or write resume content that is concise,
            quantified, and led by strong action verbs. Never invent facts, employers, or metrics
            that were not provided. Return STRICT JSON matching the schema: an object with two arrays,
            "questions" and "suggestions".
            - If you have enough information, return 1-3 improved "suggestions" and an empty "questions".
            - If you need more detail to write good content, return 1-3 short "questions" and an empty "suggestions".
            """;

    private static final String SYSTEM_LATEX = """
            The input is a LaTeX resume fragment. Preserve all LaTeX commands, environments, and escaping
            (e.g. \\item, \\textbf{}, %, &). Rewrite ONLY the human-readable text. Each suggestion must be a
            valid, drop-in LaTeX fragment.
            """;

    @Autowired
    private AiService aiService;

    @Autowired
    private RedisRateLimiter redisRateLimiter;

    @Autowired
    private EntitlementService entitlementService;

    public AiAssistResult assist(String userEmail, AiAssistRequest request) {
        if (!entitlementService.hasActivePlan(userEmail)) {
            throw ApiException.paymentRequired("Subscribe to a plan to use the AI writing assistant.");
        }
        redisRateLimiter.checkDailyLimit(userEmail);
        validate(request);

        boolean latex = "latex".equalsIgnoreCase(request.getFormat());
        String system = latex ? SYSTEM_BASE + "\n" + SYSTEM_LATEX : SYSTEM_BASE;
        AiRequest aiRequest = new AiRequest(buildUserPrompt(request), system, TEMPERATURE);

        try {
            AiAssistResult result = aiService.generate(aiRequest, AiAssistResult.class);
            if (result == null) {
                throw ApiException.badData("AI did not return a response. Please try again.");
            }
            return new AiAssistResult(
                    result.questions() == null ? List.of() : result.questions(),
                    result.suggestions() == null ? List.of() : result.suggestions());
        } catch (AiException exception) {
            LOGGER.warn("AI assist failed for {}: {}", userEmail, exception.getMessage());
            throw ApiException.badData("AI is busy right now. Please try again in a moment.");
        }
    }

    private void validate(AiAssistRequest request) {
        boolean hasAnswers = request.getAnswers() != null && !request.getAnswers().isEmpty();
        if (!StringUtils.hasText(request.getCurrentText())
                && !StringUtils.hasText(request.getInstruction())
                && !hasAnswers) {
            throw ApiException.badData("Provide some text to improve or a prompt for the AI.");
        }
    }

    private String buildUserPrompt(AiAssistRequest request) {
        StringBuilder sb = new StringBuilder();
        sb.append("Resume section: ").append(StringUtils.hasText(request.getSection()) ? request.getSection() : "general").append("\n");
        if (StringUtils.hasText(request.getCurrentText())) {
            sb.append("\nCurrent text to improve:\n").append(request.getCurrentText()).append("\n");
        } else {
            sb.append("\nThere is no existing text — help the user write this section.\n");
        }
        if (StringUtils.hasText(request.getInstruction())) {
            sb.append("\nUser instruction: ").append(request.getInstruction()).append("\n");
        }
        if (request.getAnswers() != null && !request.getAnswers().isEmpty()) {
            sb.append("\nThe user answered your clarifying questions:\n");
            for (AiAssistRequest.QA qa : request.getAnswers()) {
                sb.append("- Q: ").append(qa.getQuestion()).append("\n  A: ").append(qa.getAnswer()).append("\n");
            }
            sb.append("\nNow produce suggestions (do not ask more questions unless essential).\n");
        }
        return sb.toString();
    }
}
