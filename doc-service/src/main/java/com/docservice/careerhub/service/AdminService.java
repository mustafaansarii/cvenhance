package com.docservice.careerhub.service;

import com.docservice.careerhub.dto.constants.AuditAction;
import com.docservice.careerhub.dto.constants.DocType;
import com.docservice.careerhub.dto.request.AdminDocTemplateUpdate;
import com.docservice.careerhub.dto.request.AdminUserDocUpdate;
import com.docservice.careerhub.dto.request.AdminUserUpdate;
import com.docservice.careerhub.dto.request.AssignResumeRequest;
import com.docservice.careerhub.entity.AuditEvent;
import com.docservice.careerhub.entity.AuthUser;
import com.docservice.careerhub.entity.DocTemplate;
import com.docservice.careerhub.entity.ResumeBuilderDocument;
import com.docservice.careerhub.entity.UserDoc;
import com.docservice.careerhub.exception.ApiException;
import com.docservice.careerhub.repo.AuditEventRepository;
import com.docservice.careerhub.repo.AuthUserRepository;
import com.docservice.careerhub.repo.DocTemplateRepository;
import com.docservice.careerhub.repo.ResumeBuilderDocumentRepository;
import com.docservice.careerhub.repo.UserDocRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.docservice.careerhub.audit.Auditable;

import java.util.List;
import java.util.Objects;

@Service
public class AdminService {

    @Autowired
    private AuditEventRepository auditEventRepository;

    @Autowired
    private AuthUserRepository authUserRepository;

    @Autowired
    private DocTemplateRepository docTemplateRepository;

    @Autowired
    private UserDocRepository userDocRepository;

    @Autowired
    private ResumeBuilderDocumentRepository resumeBuilderDocumentRepository;

    @Autowired
    private ResumeBuilderTemplateService resumeBuilderTemplateService;

    @Autowired
    private DocTemplateService docTemplateService;

    @Autowired
    private UserDocService userDocService;

    @Autowired
    private AccountMailer accountMailer;

    @Autowired
    private ObjectMapper objectMapper;

    // ---------------- Audit events (read-only) ----------------

    @Transactional(readOnly = true)
    public Page<AuditEvent> listAudit(String keyword, AuditAction action, Pageable pageable) {
        return auditEventRepository.search(blankToNull(keyword), action, pageable);
    }

    // ---------------- Users ----------------

    @Transactional(readOnly = true)
    public Page<AuthUser> listUsers(String keyword, Pageable pageable) {
        return authUserRepository.search(blankToNull(keyword), pageable);
    }

    @Transactional
    public List<AuthUser> updateUsers(List<AdminUserUpdate> updates) {
        List<AuthUser> saved = updates.stream().map(u -> {
            AuthUser user = authUserRepository.findById(u.getId())
                    .orElseThrow(() -> ApiException.notFound("User not found: " + u.getId()));
            if (u.getFullName() != null && !u.getFullName().isBlank()) {
                user.setFullName(u.getFullName().trim());
            }
            if (u.getVerified() != null) {
                user.setVerified(u.getVerified());
            }
            // Roles are intentionally not updatable via admin APIs.
            return user;
        }).toList();
        return authUserRepository.saveAll(saved);
    }

    // ---------------- Doc templates ----------------

    @Transactional(readOnly = true)
    public Page<DocTemplate> listTemplates(String keyword, DocType type, Pageable pageable) {
        return docTemplateRepository.search(keyword, type, pageable);
    }

    @Transactional
    public List<DocTemplate> updateTemplates(List<AdminDocTemplateUpdate> updates) {
        List<DocTemplate> saved = updates.stream().map(u -> {
            DocTemplate t = docTemplateRepository.findById(u.getId())
                    .orElseThrow(() -> ApiException.notFound("Doc template not found: " + u.getId()));
            if (u.getName() != null && !u.getName().isBlank()) {
                t.setName(u.getName().trim());
            }
            if (u.getDescription() != null) {
                t.setDescription(u.getDescription());
            }
            if (u.getStatus() != null) {
                t.setStatus(u.getStatus());
            }
            if (u.getSubscriptionType() != null) {
                t.setSubscriptionType(u.getSubscriptionType());
            }
            return t;
        }).toList();
        return docTemplateRepository.saveAll(saved);
    }

    // ---------------- User docs ----------------

    @Transactional(readOnly = true)
    public Page<UserDoc> listUserDocs(String keyword, DocType type, Pageable pageable) {
        return userDocRepository.searchAll(blankToNull(keyword), type, pageable);
    }

    @Transactional
    public List<UserDoc> updateUserDocs(List<AdminUserDocUpdate> updates) {
        List<UserDoc> saved = updates.stream().map(u -> {
            UserDoc d = userDocRepository.findById(u.getId())
                    .orElseThrow(() -> ApiException.notFound("Doc not found: " + u.getId()));
            if (u.getName() != null && !u.getName().isBlank()) {
                d.setName(u.getName().trim());
            }
            if (u.getStatus() != null) {
                d.setStatus(u.getStatus());
            }
            if (u.getSubscriptionType() != null) {
                d.setSubscriptionType(u.getSubscriptionType());
            }
            return d;
        }).toList();
        return userDocRepository.saveAll(saved);
    }

    @Transactional
    @Auditable(
            action = AuditAction.RESUME_ASSIGNED, targetType = "AUTH_USER",
            targetId = "#request.targetEmail", detail = "'template=' + #request.templateCode")
    public void assignResume(String adminEmail, AssignResumeRequest request) {
        String targetEmail = request.getTargetEmail().trim().toLowerCase();
        AuthUser user = authUserRepository.findByEmail(targetEmail)
                .orElseThrow(() -> ApiException.notFound("No user found with email: " + targetEmail));

        user.setProfileData(writeJson(request.getProfileData()));
        authUserRepository.save(user);
        accountMailer.sendResumeAssigned(targetEmail, user.getFullName());

        String templateCode = request.getTemplateCode();
        if (templateCode != null && !templateCode.isBlank()) {
            ResumeBuilderDocument doc = resumeBuilderDocumentRepository
                    .findFirstByOwnerEmailAndTemplateCodeOrderByUpdatedAtDesc(targetEmail, templateCode)
                    .orElseGet(ResumeBuilderDocument::new);
            doc.setOwnerEmail(targetEmail);
            doc.setTemplateCode(templateCode);
            doc.setTemplateVersion(templateVersionOf(templateCode));
            if (doc.getName() == null || doc.getName().isBlank()) {
                doc.setName("Resume");
            }
            if (request.getSectionOrder() != null) {
                doc.setSectionOrderJson(writeJson(request.getSectionOrder()));
            }
            if (request.getEditorSettings() != null) {
                doc.setEditorSettingsJson(writeJson(request.getEditorSettings()));
            }
            resumeBuilderDocumentRepository.save(doc);

            copyLatexDoc(adminEmail, targetEmail, templateCode);
        }
    }

    private void copyLatexDoc(String adminEmail, String targetEmail, String templateCode) {
        docTemplateService.findTemplate(templateCode).ifPresent(template -> {
            UserDoc target = userDocService.findOrCreateForTemplate(targetEmail, template);
            String latex = userDocRepository.findFirstByOwnerEmailAndTemplateCode(adminEmail, templateCode)
                    .map(UserDoc::getLatexCode)
                    .orElse(template.getLatexCode());
            target.setLatexCode(latex);
            target.setStatus(com.docservice.careerhub.dto.constants.DocTemplateStatus.READY);
            target.setErrorMessage(null);
            target.setPdfUrl(null); // stale for the new content; regenerated on download
            userDocRepository.save(target);
        });
    }

    private int templateVersionOf(String templateCode) {
        try {
            return resumeBuilderTemplateService.getActive(templateCode).getVersion();
        } catch (Exception e) {
            return 1;
        }
    }

    private String writeJson(JsonNode node) {
        try {
            return objectMapper.writeValueAsString(node);
        } catch (Exception e) {
            throw ApiException.badData("Invalid resume data");
        }
    }

    private String blankToNull(String value) {
        return Objects.isNull(value) || value.isBlank() ? null : value.trim();
    }
}
