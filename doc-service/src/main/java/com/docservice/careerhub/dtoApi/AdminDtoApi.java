package com.docservice.careerhub.dtoApi;

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
import com.docservice.careerhub.entity.AuditEvent;
import com.docservice.careerhub.entity.AuthUser;
import com.docservice.careerhub.entity.DocTemplate;
import com.docservice.careerhub.entity.UserDoc;
import com.docservice.careerhub.exception.ApiException;
import com.docservice.careerhub.service.AdminService;
import com.docservice.careerhub.util.AbstractDtoUtil;
import com.docservice.careerhub.util.PageUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;
import com.docservice.careerhub.dto.response.MessageResponse;

import java.util.List;
import java.util.Objects;

@Component
public class AdminDtoApi extends AbstractDtoUtil {

    private static final int MAX_BATCH = 100;

    @Autowired
    private AdminService adminService;

    public PageResponse<AuditEvent> listAudit(PageQuery query, AuditAction action) {
        Pageable pageable = PageUtil.toPageable(query, "createdAt");
        Page<AuditEvent> result = adminService.listAudit(query.getKeyword(), action, pageable);
        return PageUtil.toResponse(result, result.getContent());
    }

    public PageResponse<AdminUserDto> listUsers(PageQuery query) {
        Pageable pageable = PageUtil.toPageable(query, "createdAt");
        Page<AuthUser> result = adminService.listUsers(query.getKeyword(), pageable);
        return PageUtil.toResponse(result, result.getContent().stream().map(this::toUserDto).toList());
    }

    public List<AdminUserDto> updateUsers(List<AdminUserUpdate> updates) {
        validateBatch(updates);
        return adminService.updateUsers(updates).stream().map(this::toUserDto).toList();
    }

    public MessageResponse assignResume(
            String adminEmail, com.docservice.careerhub.dto.request.AssignResumeRequest request) {
        validate(request);
        adminService.assignResume(adminEmail, request);
        return MessageResponse.of(
                "Resume assigned to " + request.getTargetEmail().trim());
    }

    public PageResponse<DocTemplateMetadata> listTemplates(PageQuery query, DocType type) {
        Pageable pageable = PageUtil.toPageable(query, "createdAt");
        Page<DocTemplate> result = adminService.listTemplates(query.getKeyword(), type, pageable);
        return PageUtil.toResponse(result, result.getContent().stream().map(this::toTemplateDto).toList());
    }

    public List<DocTemplateMetadata> updateTemplates(List<AdminDocTemplateUpdate> updates) {
        validateBatch(updates);
        return adminService.updateTemplates(updates).stream().map(this::toTemplateDto).toList();
    }

    public PageResponse<AdminUserDocDto> listUserDocs(PageQuery query, DocType type) {
        Pageable pageable = PageUtil.toPageable(query, "updatedAt");
        Page<UserDoc> result = adminService.listUserDocs(query.getKeyword(), type, pageable);
        return PageUtil.toResponse(result, result.getContent().stream().map(this::toUserDocDto).toList());
    }

    public List<AdminUserDocDto> updateUserDocs(List<AdminUserDocUpdate> updates) {
        validateBatch(updates);
        return adminService.updateUserDocs(updates).stream().map(this::toUserDocDto).toList();
    }

    // ---------------- mappers ----------------

    private void validateBatch(List<?> updates) {
        if (Objects.isNull(updates) || updates.isEmpty()) {
            throw ApiException.badData("At least one item is required");
        }
        if (updates.size() > MAX_BATCH) {
            throw ApiException.badData("At most " + MAX_BATCH + " items can be updated at once");
        }
        updates.forEach(AbstractDtoUtil::validate);
    }

    private AdminUserDto toUserDto(AuthUser u) {
        return AdminUserDto.builder()
                .id(u.getId())
                .email(u.getEmail())
                .fullName(u.getFullName())
                .verified(u.isVerified())
                .provider(u.getProvider())
                .roles(u.getRoles())
                .createdAt(u.getCreatedAt())
                .build();
    }

    private DocTemplateMetadata toTemplateDto(DocTemplate t) {
        return DocTemplateMetadata.builder()
                .id(t.getId())
                .templateCode(t.getTemplateCode())
                .name(t.getName())
                .type(t.getType())
                .subscriptionType(t.getSubscriptionType())
                .description(t.getDescription())
                .status(t.getStatus())
                .imageUrl(t.getImageUrl())
                .errorMessage(t.getErrorMessage())
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .build();
    }

    private AdminUserDocDto toUserDocDto(UserDoc d) {
        return AdminUserDocDto.builder()
                .id(d.getId())
                .ownerEmail(d.getOwnerEmail())
                .templateCode(d.getTemplateCode())
                .name(d.getName())
                .type(d.getType())
                .subscriptionType(d.getSubscriptionType())
                .status(d.getStatus())
                .pdfUrl(d.getPdfUrl())
                .imageUrl(d.getImageUrl())
                .createdAt(d.getCreatedAt())
                .updatedAt(d.getUpdatedAt())
                .build();
    }
}
