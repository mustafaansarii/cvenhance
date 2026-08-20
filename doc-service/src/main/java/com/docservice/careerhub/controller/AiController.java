package com.docservice.careerhub.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.docservice.careerhub.ai.AiRequest;
import com.docservice.careerhub.ai.AiService;
import com.docservice.careerhub.dto.ai.AiAssistResult;
import com.docservice.careerhub.dto.request.AiAssistRequest;
import com.docservice.careerhub.entity.ResumeCheckHistory;
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
    private ResumeCheckService resumeCheckService;

    @PostMapping("/generate")
    public Map<String, String> generate(@RequestBody AiRequest request) {
        return Map.of("text", aiService.generate(request));
    }

    @PostMapping("/assist")
    public AiAssistResult assist(Authentication authentication, @RequestBody AiAssistRequest request) {
        return resumeAiService.assist(authentication.getName(), request);
    }

    @PostMapping(value = "/resume-check", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResumeCheckHistory resumeCheck(Authentication authentication,
                                          @RequestParam("resumeText") String resumeText,
                                          @RequestParam(value = "file", required = false) MultipartFile file) {
        return resumeCheckService.check(authentication.getName(), resumeText, file);
    }

    @GetMapping("/resume-check/history")
    public Page<ResumeCheckHistory> resumeCheckHistory(Authentication authentication,
                                                       @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        return resumeCheckService.history(authentication.getName(), pageable);
    }

    @GetMapping("/resume-check/history/{id}")
    public ResponseEntity<ResumeCheckHistory> resumeCheckHistoryItem(Authentication authentication, @PathVariable Long id) {
        return ResponseEntity.ok(resumeCheckService.getHistory(authentication.getName(), id));
    }
}
