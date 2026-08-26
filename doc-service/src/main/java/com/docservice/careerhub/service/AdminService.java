package com.docservice.careerhub.service;

import com.docservice.careerhub.dto.constants.AuditAction;
import com.docservice.careerhub.dto.constants.DocType;
import com.docservice.careerhub.dto.request.AdminDocTemplateUpdate;
import com.docservice.careerhub.dto.request.AdminUserDocUpdate;
import com.docservice.careerhub.dto.request.AdminUserUpdate;
import com.docservice.careerhub.entity.AuditEvent;
import com.docservice.careerhub.entity.AuthUser;
import com.docservice.careerhub.entity.DocTemplate;
import com.docservice.careerhub.entity.UserDoc;
import com.docservice.careerhub.exception.ApiException;
import com.docservice.careerhub.repo.AuditEventRepository;
import com.docservice.careerhub.repo.AuthUserRepository;
import com.docservice.careerhub.repo.DocTemplateRepository;
import com.docservice.careerhub.repo.UserDocRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    private String blankToNull(String value) {
        return Objects.isNull(value) || value.isBlank() ? null : value.trim();
    }
}
