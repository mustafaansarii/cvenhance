package com.docservice.careerhub.controller;

import com.docservice.careerhub.dto.request.SaveResumeBuilderDocumentRequest;
import com.docservice.careerhub.dto.response.ResumeBuilderDocumentResponse;
import com.docservice.careerhub.dtoApi.ResumeBuilderDocumentDtoApi;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/resume-builder/documents")
public class ResumeBuilderDocumentController {

    private final ResumeBuilderDocumentDtoApi documentDtoApi;

    public ResumeBuilderDocumentController(ResumeBuilderDocumentDtoApi documentDtoApi) {
        this.documentDtoApi = documentDtoApi;
    }

    @GetMapping
    public List<ResumeBuilderDocumentResponse> list(Authentication authentication) {
        return documentDtoApi.list(authentication.getName());
    }

    @PostMapping("/by-template/{code}")
    public ResumeBuilderDocumentResponse open(Authentication authentication, @PathVariable String code) {
        return documentDtoApi.open(authentication.getName(), code);
    }

    @GetMapping("/{id}")
    public ResumeBuilderDocumentResponse get(Authentication authentication, @PathVariable Long id) {
        return documentDtoApi.get(authentication.getName(), id);
    }

    @PatchMapping("/{id}")
    public ResumeBuilderDocumentResponse save(Authentication authentication, @PathVariable Long id,
                                               @RequestBody SaveResumeBuilderDocumentRequest request) {
        return documentDtoApi.save(authentication.getName(), id, request);
    }

    @PostMapping("/{id}/claim")
    public ResumeBuilderDocumentResponse claim(Authentication authentication, @PathVariable Long id) {
        return documentDtoApi.claim(authentication.getName(), id);
    }
}
