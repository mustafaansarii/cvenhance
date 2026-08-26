package com.docservice.careerhub.controller;

import com.docservice.careerhub.dto.constants.AuditAction;
import com.docservice.careerhub.dto.constants.DocType;
import com.docservice.careerhub.dto.request.AdminDocTemplateUpdate;
import com.docservice.careerhub.dto.request.AdminUserDocUpdate;
import com.docservice.careerhub.dto.request.AdminUserUpdate;
import com.docservice.careerhub.dto.request.PageQuery;
import com.docservice.careerhub.dto.response.AdminUserDocDto;
import com.docservice.careerhub.dto.response.AdminUserDto;
import com.docservice.careerhub.dto.response.DocTemplateMetadata;
import com.docservice.careerhub.dto.response.PageResponse;
import com.docservice.careerhub.dtoApi.AdminDtoApi;
import com.docservice.careerhub.entity.AuditEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminDtoApi adminDtoApi;

    // ---------------- Audit events (read-only) ----------------

    @GetMapping("/audit-events")
    public PageResponse<AuditEvent> auditEvents(PageQuery query,
                                                @RequestParam(required = false) AuditAction action) {
        return adminDtoApi.listAudit(query, action);
    }

    // ---------------- Users ----------------

    @GetMapping("/users")
    public PageResponse<AdminUserDto> users(PageQuery query) {
        return adminDtoApi.listUsers(query);
    }

    @PatchMapping("/users")
    public List<AdminUserDto> updateUsers(@RequestBody List<AdminUserUpdate> updates) {
        return adminDtoApi.updateUsers(updates);
    }

    // ---------------- Doc templates ----------------

    @GetMapping("/templates")
    public PageResponse<DocTemplateMetadata> templates(PageQuery query,
                                                       @RequestParam(required = false) DocType type) {
        return adminDtoApi.listTemplates(query, type);
    }

    @PatchMapping("/templates")
    public List<DocTemplateMetadata> updateTemplates(@RequestBody List<AdminDocTemplateUpdate> updates) {
        return adminDtoApi.updateTemplates(updates);
    }

    // ---------------- User docs ----------------

    @GetMapping("/user-docs")
    public PageResponse<AdminUserDocDto> userDocs(PageQuery query,
                                                  @RequestParam(required = false) DocType type) {
        return adminDtoApi.listUserDocs(query, type);
    }

    @PatchMapping("/user-docs")
    public List<AdminUserDocDto> updateUserDocs(@RequestBody List<AdminUserDocUpdate> updates) {
        return adminDtoApi.updateUserDocs(updates);
    }
}
