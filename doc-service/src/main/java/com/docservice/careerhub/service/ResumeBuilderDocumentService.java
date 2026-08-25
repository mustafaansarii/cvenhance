package com.docservice.careerhub.service;

import com.docservice.careerhub.dto.request.SaveResumeBuilderDocumentRequest;
import com.docservice.careerhub.entity.AuthUser;
import com.docservice.careerhub.entity.ResumeBuilderDocument;
import com.docservice.careerhub.entity.ResumeBuilderTemplate;
import com.docservice.careerhub.exception.ApiException;
import com.docservice.careerhub.repo.ResumeBuilderDocumentRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ResumeBuilderDocumentService {

    @Autowired
    private ResumeBuilderDocumentRepository documentRepository;

    @Autowired
    private ResumeBuilderTemplateService templateService;

    @Autowired
    private EntitlementService entitlementService;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AccountMailer accountMailer;

    @Autowired
    private AuthService authService;

    @Autowired
    private DocTemplateService docTemplateService;

    @Transactional
    public ResumeBuilderDocument open(String ownerEmail, String templateCode) {
        ResumeBuilderTemplate template = templateService.getActive(templateCode);
        return documentRepository.findFirstByOwnerEmailAndTemplateCodeOrderByUpdatedAtDesc(ownerEmail, template.getTemplateCode())
                .orElseGet(() -> {
                    ResumeBuilderDocument document = new ResumeBuilderDocument();
                    document.setOwnerEmail(ownerEmail);
                    document.setTemplateCode(template.getTemplateCode());
                    document.setTemplateVersion(template.getVersion());
                    document.setName(template.getName() + " resume");
                    return documentRepository.save(document);
                });
    }

    @Transactional(readOnly = true)
    public ResumeBuilderDocument getOwned(String ownerEmail, Long id) {
        return documentRepository.findByIdAndOwnerEmail(id, ownerEmail)
                .orElseThrow(() -> ApiException.notFound("Resume builder document not found: " + id));
    }

    @Transactional(readOnly = true)
    public List<ResumeBuilderDocument> listOwned(String ownerEmail) {
        return documentRepository.findAllByOwnerEmailOrderByUpdatedAtDesc(ownerEmail);
    }

    @Transactional
    public ResumeBuilderDocument save(String ownerEmail, Long id, SaveResumeBuilderDocumentRequest request) {
        validateDocument(request);
        ResumeBuilderDocument document = getOwned(ownerEmail, id);
        if (request.getName() != null && !request.getName().isBlank()) {
            document.setName(request.getName().trim());
        }
        document.setResumeDataJson(writeJson(request.getResumeData()));
        document.setSectionOrderJson(writeJson(request.getSectionOrder()));
        document.setEditorSettingsJson(writeJson(request.getEditorSettings()));
        return documentRepository.save(document);
    }

    @Transactional
    public ResumeBuilderDocument claim(String ownerEmail, Long id) {
        ResumeBuilderDocument document = getOwned(ownerEmail, id);
        AuthUser user = authService.getActiveUser(ownerEmail);
        boolean free = docTemplateService.isFreeTemplate(document.getTemplateCode());
        boolean wasUnlocked = free || entitlementService.isUnlocked(ownerEmail, document.resumeKey());
        if (!free && !entitlementService.unlock(ownerEmail, document.resumeKey())) {
            throw ApiException.paymentRequired("Upgrade your plan to download this resume");
        }
        if (!wasUnlocked) {
            accountMailer.sendTemplateUnlocked(ownerEmail, user.getFullName(), document.getName());
        }
        return document;
    }

    public boolean isUnlocked(String ownerEmail, ResumeBuilderDocument document) {
        return docTemplateService.isFreeTemplate(document.getTemplateCode())
                || entitlementService.isUnlocked(ownerEmail, document.resumeKey());
    }

    public JsonNode readJson(String value) {
        try {
            return objectMapper.readTree(value);
        } catch (Exception exception) {
            throw ApiException.badData("Stored resume builder document is invalid");
        }
    }

    private void validateDocument(SaveResumeBuilderDocumentRequest request) {
        if (!request.getResumeData().isObject()) {
            throw ApiException.badData("resumeData must be an object");
        }
        if (!request.getSectionOrder().isArray()) {
            throw ApiException.badData("sectionOrder must be an array");
        }
        if (!request.getEditorSettings().isObject()) {
            throw ApiException.badData("editorSettings must be an object");
        }
    }

    private String writeJson(JsonNode value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception exception) {
            throw ApiException.badData("Invalid resume builder document data");
        }
    }
}
