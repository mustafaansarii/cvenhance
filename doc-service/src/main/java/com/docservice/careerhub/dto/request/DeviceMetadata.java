package com.docservice.careerhub.dto.request;

/** Request-derived device details captured when a session is opened (no servlet types). */
public record DeviceMetadata(String userAgent, String ipAddress) {
}
