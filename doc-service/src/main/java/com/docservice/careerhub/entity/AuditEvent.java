package com.docservice.careerhub.entity;

import com.docservice.careerhub.dto.constants.AuditAction;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Data;

import java.time.Instant;

@Data
@Entity
@Table(name = "audit_events", indexes = {
        @Index(name = "idx_audit_events_actor", columnList = "actorEmail"),
        @Index(name = "idx_audit_events_action", columnList = "action"),
        @Index(name = "idx_audit_events_created_at", columnList = "createdAt")
})
public class AuditEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private AuditAction action;

    private String actorEmail;

    private String targetType;
    private String targetId;

    @Column(length = 2000)
    private String detail;

    private String ipAddress;

    @Column(length = 512)
    private String userAgent;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }
}
