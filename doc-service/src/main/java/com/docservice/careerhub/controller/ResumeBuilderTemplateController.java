package com.docservice.careerhub.controller;

import com.docservice.careerhub.dto.request.UpsertResumeBuilderTemplateRequest;
import com.docservice.careerhub.dto.response.ResumeBuilderTemplateResponse;
import com.docservice.careerhub.dtoApi.ResumeBuilderTemplateDtoApi;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/resume-builder/templates")
public class ResumeBuilderTemplateController {

    private final ResumeBuilderTemplateDtoApi templateDtoApi;

    public ResumeBuilderTemplateController(ResumeBuilderTemplateDtoApi templateDtoApi) {
        this.templateDtoApi = templateDtoApi;
    }

    @GetMapping
    public List<ResumeBuilderTemplateResponse> list() {
        return templateDtoApi.list();
    }

    @GetMapping("/{code}")
    public ResumeBuilderTemplateResponse get(@PathVariable String code) {
        return templateDtoApi.get(code);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResumeBuilderTemplateResponse upsert(@RequestBody UpsertResumeBuilderTemplateRequest request) {
        return templateDtoApi.upsert(request);
    }
}
