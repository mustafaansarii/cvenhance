package com.docservice.careerhub.controller;

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
import com.docservice.careerhub.dto.ai.ResumeCheckResult;
import com.docservice.careerhub.dto.request.AiAssistRequest;
import com.docservice.careerhub.dto.request.AtsAnalysisRequest;
import com.docservice.careerhub.dto.request.ResumeCheckRequest;
import com.docservice.careerhub.entity.AtsAnalysisHistory;
import com.docservice.careerhub.service.AtsAnalysisService;
import com.docservice.careerhub.service.ResumeAiService;
import com.docservice.careerhub.service.ResumeCheckService;

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
    private ResumeCheckService resumeCheckService;

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

    @PostMapping("/resume-check")
    public ResumeCheckResult resumeCheck(Authentication authentication, @RequestBody ResumeCheckRequest request) {
        return resumeCheckService.check(authentication.getName(), request);
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

}
