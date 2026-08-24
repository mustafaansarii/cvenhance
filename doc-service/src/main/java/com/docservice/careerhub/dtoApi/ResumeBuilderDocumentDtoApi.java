package com.docservice.careerhub.dtoApi;

import com.docservice.careerhub.dto.request.SaveResumeBuilderDocumentRequest;
import com.docservice.careerhub.dto.response.ResumeBuilderDocumentResponse;
import com.docservice.careerhub.entity.DocTemplate;
import com.docservice.careerhub.entity.ResumeBuilderDocument;
import com.docservice.careerhub.service.ResumeBuilderDocumentService;

import com.docservice.careerhub.service.UserDocService;
import com.docservice.careerhub.service.DocTemplateService;

import com.docservice.careerhub.util.AbstractDtoUtil;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ResumeBuilderDocumentDtoApi extends AbstractDtoUtil {

    private final ResumeBuilderDocumentService resumeBuilderDocumentService;
    private final UserDocService userDocService;
    private final DocTemplateService documentService;

    public ResumeBuilderDocumentDtoApi(ResumeBuilderDocumentService resumeBuilderDocumentService, UserDocService userDocService, DocTemplateService documentService) {
        this.resumeBuilderDocumentService = resumeBuilderDocumentService;
        this.userDocService = userDocService;
        this.documentService = documentService;
    }

    public ResumeBuilderDocumentResponse open(String ownerEmail, String templateCode) {
        ResumeBuilderDocument document = resumeBuilderDocumentService.open(ownerEmail, templateCode);
        try {
            DocTemplate docTemplate = documentService.getTemplate(document.getTemplateCode());
            userDocService.findOrCreateForTemplate(ownerEmail, docTemplate);
        } catch (Exception e) {
            // Ignore if doc template is missing
        }
        return buildResumeResponse(ownerEmail, document);
    }

    public ResumeBuilderDocumentResponse get(String ownerEmail, Long id) {
        return buildResumeResponse(ownerEmail, resumeBuilderDocumentService.getOwned(ownerEmail, id));
    }

    public List<ResumeBuilderDocumentResponse> list(String ownerEmail) {
        return resumeBuilderDocumentService.listOwned(ownerEmail).stream().map(document -> buildResumeResponse(ownerEmail, document)).toList();
    }

    public ResumeBuilderDocumentResponse save(String ownerEmail, Long id, SaveResumeBuilderDocumentRequest request) {
        validate(request);
        ResumeBuilderDocument document =  resumeBuilderDocumentService.save(ownerEmail, id, request);
        return buildResumeResponse(ownerEmail, document);
    }

    public ResumeBuilderDocumentResponse claim(String ownerEmail, Long id) {
        ResumeBuilderDocument document = resumeBuilderDocumentService.getOwned(ownerEmail, id);
        DocTemplate docTemplate = documentService.getTemplate(document.getTemplateCode());
        userDocService.findOrCreateForTemplate(ownerEmail, docTemplate);
        resumeBuilderDocumentService.claim(ownerEmail, id);
        return buildResumeResponse(ownerEmail, document);
    }

//---------------------Helper Methods-------------------------------

    private ResumeBuilderDocumentResponse buildResumeResponse(String ownerEmail, ResumeBuilderDocument document) {
        return ResumeBuilderDocumentResponse.builder()
                .id(document.getId())
                .templateCode(document.getTemplateCode())
                .templateVersion(document.getTemplateVersion())
                .name(document.getName())
                .resumeData(resumeBuilderDocumentService.readJson(document.getResumeDataJson()))
                .sectionOrder(resumeBuilderDocumentService.readJson(document.getSectionOrderJson()))
                .editorSettings(resumeBuilderDocumentService.readJson(document.getEditorSettingsJson()))
                .unlocked(resumeBuilderDocumentService.isUnlocked(ownerEmail, document))
                .createdAt(document.getCreatedAt())
                .updatedAt(document.getUpdatedAt())
                .build();
    }
}