package com.docservice.careerhub.dtoApi;

import com.docservice.careerhub.dto.request.SaveResumeBuilderDocumentRequest;
import com.docservice.careerhub.dto.response.ResumeBuilderDocumentResponse;
import com.docservice.careerhub.entity.ResumeBuilderDocument;
import com.docservice.careerhub.service.ResumeBuilderDocumentService;
import com.docservice.careerhub.util.AbstractDtoUtil;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ResumeBuilderDocumentDtoApi extends AbstractDtoUtil {

    private final ResumeBuilderDocumentService documentService;

    public ResumeBuilderDocumentDtoApi(ResumeBuilderDocumentService documentService) {
        this.documentService = documentService;
    }

    public ResumeBuilderDocumentResponse open(String ownerEmail, String templateCode) {
        return toResponse(ownerEmail, documentService.open(ownerEmail, templateCode));
    }

    public ResumeBuilderDocumentResponse get(String ownerEmail, Long id) {
        return toResponse(ownerEmail, documentService.getOwned(ownerEmail, id));
    }

    public List<ResumeBuilderDocumentResponse> list(String ownerEmail) {
        return documentService.listOwned(ownerEmail).stream().map(document -> toResponse(ownerEmail, document)).toList();
    }

    public ResumeBuilderDocumentResponse save(String ownerEmail, Long id, SaveResumeBuilderDocumentRequest request) {
        validate(request);
        return toResponse(ownerEmail, documentService.save(ownerEmail, id, request));
    }

    public ResumeBuilderDocumentResponse claim(String ownerEmail, Long id) {
        return toResponse(ownerEmail, documentService.claim(ownerEmail, id));
    }

    private ResumeBuilderDocumentResponse toResponse(String ownerEmail, ResumeBuilderDocument document) {
        return ResumeBuilderDocumentResponse.builder()
                .id(document.getId())
                .templateCode(document.getTemplateCode())
                .templateVersion(document.getTemplateVersion())
                .name(document.getName())
                .resumeData(documentService.readJson(document.getResumeDataJson()))
                .sectionOrder(documentService.readJson(document.getSectionOrderJson()))
                .editorSettings(documentService.readJson(document.getEditorSettingsJson()))
                .unlocked(documentService.isUnlocked(ownerEmail, document))
                .createdAt(document.getCreatedAt())
                .updatedAt(document.getUpdatedAt())
                .build();
    }
}
