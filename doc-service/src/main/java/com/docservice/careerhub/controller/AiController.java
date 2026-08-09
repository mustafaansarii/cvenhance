package com.docservice.careerhub.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.docservice.careerhub.ai.AiRequest;
import com.docservice.careerhub.ai.AiService;
import com.docservice.careerhub.dto.ai.AiAssistResult;
import com.docservice.careerhub.dto.ai.AtsAnalysisResult;
import com.docservice.careerhub.dto.request.AiAssistRequest;
import com.docservice.careerhub.dto.request.AtsAnalysisRequest;
import com.docservice.careerhub.entity.AtsAnalysisHistory;
import com.docservice.careerhub.service.AtsAnalysisService;
import com.docservice.careerhub.service.ResumeAiService;
import com.docservice.careerhub.dto.request.JdTailorRequest;
import com.docservice.careerhub.dto.request.SeedBulletRequest;
import com.docservice.careerhub.service.BulletBankService;
import com.docservice.careerhub.service.CareerVaultService;
import com.docservice.careerhub.service.JdTailorService;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    @Autowired
    private AiService aiService;

    @Autowired
    private ResumeAiService resumeAiService;

    @Autowired
    private AtsAnalysisService atsAnalysisService;

    @Autowired
    private JdTailorService jdTailorService;

    @Autowired
    private BulletBankService bulletBankService;

    @Autowired
    private CareerVaultService careerVaultService;

    @PostMapping("/generate")
    public Map<String, String> generate(@RequestBody AiRequest request) {
        return Map.of("text", aiService.generate(request));
    }

    @PostMapping("/assist")
    public AiAssistResult assist(Authentication authentication, @RequestBody AiAssistRequest request) {
        return resumeAiService.assist(authentication.getName(), request);
    }

    @PostMapping("/ats-analyze")
    public AtsAnalysisResult analyze(Authentication authentication, @RequestBody AtsAnalysisRequest request) {
        return atsAnalysisService.analyze(authentication.getName(), request);
    }

    @GetMapping("/ats-history")
    public Page<AtsAnalysisHistory> history(Authentication authentication,
                                            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        return atsAnalysisService.history(authentication.getName(), pageable);
    }

    @GetMapping("/ats-history/{id}")
    public ResponseEntity<AtsAnalysisResult> getHistory(Authentication authentication, @PathVariable Long id) {
        AtsAnalysisHistory history = atsAnalysisService.getHistory(authentication.getName(), id);
        return ResponseEntity.ok(atsAnalysisService.toResult(history));
    }

    /**
     * RAG-powered: tailor the user's resume to a specific job description.
     * POST /api/ai/tailor
     */
    @PostMapping("/tailor")
    public Map<String, String> tailorResume(Authentication authentication,
                                            @RequestBody JdTailorRequest request) {
        return Map.of("tailoredResume", jdTailorService.tailor(authentication.getName(), request));
    }

    /**
     * Admin: seed high-quality bullets into the bullet bank vector store.
     * POST /api/ai/bullets/seed
     */
    @PostMapping("/bullets/seed")
    public Map<String, Object> seedBullets(@RequestBody SeedBulletRequest request) {
        int count = bulletBankService.seed(request);
        return Map.of("seeded", count, "status", "ok");
    }

    /**
     * RAG-powered: query personal career vault for past experiences matching query.
     * GET /api/ai/vault/experiences?query=...
     */
    @GetMapping("/vault/experiences")
    public Map<String, Object> findVaultExperiences(Authentication authentication,
                                                     @org.springframework.web.bind.annotation.RequestParam(required = false, defaultValue = "") String query) {
        List<String> experiences = careerVaultService.findRelevantExperiences(authentication.getName(), query, 5);
        return Map.of("experiences", experiences);
    }
}
