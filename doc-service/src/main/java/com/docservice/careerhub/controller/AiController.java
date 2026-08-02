package com.docservice.careerhub.controller;

import com.docservice.careerhub.ai.AiRequest;
import com.docservice.careerhub.ai.AiService;
import com.docservice.careerhub.dto.ai.AiAssistResult;
import com.docservice.careerhub.dto.request.AiAssistRequest;
import com.docservice.careerhub.service.ResumeAiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    @Autowired
    private AiService aiService;

    @Autowired
    private ResumeAiService resumeAiService;

    @PostMapping("/generate")
    public Map<String, String> generate(@RequestBody AiRequest request) {
        return Map.of("text", aiService.generate(request));
    }

    @PostMapping("/assist")
    public AiAssistResult assist(Authentication authentication, @RequestBody AiAssistRequest request) {
        return resumeAiService.assist(authentication.getName(), request);
    }
}
