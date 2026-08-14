package com.docservice.careerhub.dtoApi;

import com.docservice.careerhub.dto.request.UpsertResumeBuilderTemplateRequest;
import com.docservice.careerhub.dto.response.ResumeBuilderTemplateResponse;
import com.docservice.careerhub.entity.ResumeBuilderTemplate;
import com.docservice.careerhub.service.ResumeBuilderTemplateService;
import com.docservice.careerhub.util.AbstractDtoUtil;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ResumeBuilderTemplateDtoApi extends AbstractDtoUtil {

    private final ResumeBuilderTemplateService templateService;

    public ResumeBuilderTemplateDtoApi(ResumeBuilderTemplateService templateService) {
        this.templateService = templateService;
    }

    public List<ResumeBuilderTemplateResponse> list() {
        return templateService.listActive().stream().map(this::toResponse).toList();
    }

    public ResumeBuilderTemplateResponse get(String code) {
        return toResponse(templateService.getActive(code));
    }

    public ResumeBuilderTemplateResponse upsert(UpsertResumeBuilderTemplateRequest request) {
        validate(request);
        return toResponse(templateService.upsert(request));
    }

    private ResumeBuilderTemplateResponse toResponse(ResumeBuilderTemplate template) {
        return ResumeBuilderTemplateResponse.builder()
                .id(template.getId())
                .templateCode(template.getTemplateCode())
                .name(template.getName())
                .description(template.getDescription())
                .imageUrl(template.getImageUrl())
                .active(template.isActive())
                .version(template.getVersion())
                .config(templateService.readConfig(template))
                .createdAt(template.getCreatedAt())
                .updatedAt(template.getUpdatedAt())
                .build();
    }
}
