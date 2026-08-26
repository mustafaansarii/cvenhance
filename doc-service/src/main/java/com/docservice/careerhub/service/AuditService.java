package com.docservice.careerhub.service;

import com.docservice.careerhub.dto.constants.AuditAction;
import com.docservice.careerhub.entity.AuditEvent;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Service
public class AuditService {

    @Autowired
    private AuditEventWriter auditEventWriter;

    public void record(AuditAction action, String actorEmail) {
        record(action, actorEmail, null, null, null);
    }

    public void record(AuditAction action, String actorEmail, String targetType, String targetId) {
        record(action, actorEmail, targetType, targetId, null);
    }

    public void record(AuditAction action, String actorEmail, String targetType, String targetId, String detail) {
        try {
            AuditEvent event = new AuditEvent();
            event.setAction(action);
            event.setActorEmail(actorEmail);
            event.setTargetType(targetType);
            event.setTargetId(targetId);
            event.setDetail(clip(detail, 2000));

            HttpServletRequest request = currentRequest();
            if (request != null) {
                event.setIpAddress(clientIp(request));
                event.setUserAgent(clip(request.getHeader("User-Agent"), 512));
            }
            auditEventWriter.write(event);
        } catch (Exception ignored) {
            // never let auditing break the business flow
        }
    }

    private HttpServletRequest currentRequest() {
        try {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            return attrs != null ? attrs.getRequest() : null;
        } catch (Exception e) {
            return null;
        }
    }

    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return clip(forwarded.split(",")[0].trim(), 100);
        }
        return clip(request.getRemoteAddr(), 100);
    }

    private String clip(String value, int max) {
        if (value == null) {
            return null;
        }
        return value.length() <= max ? value : value.substring(0, max);
    }
}
