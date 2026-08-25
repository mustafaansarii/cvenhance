package com.docservice.careerhub.controller;

import com.docservice.careerhub.dto.request.ImportResumeRequest;
import com.docservice.careerhub.service.ResumeImportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/profile")
public class ResumeController {

    @Autowired
    private ResumeImportService resumeImportService;

    @PostMapping("/import-resume")
    public Map<String, Object> importResume(Authentication authentication, @RequestBody ImportResumeRequest request) {
        return resumeImportService.importFromText(authentication.getName(), request);
    }
}
