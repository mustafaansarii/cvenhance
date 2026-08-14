package com.docservice.careerhub.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Data;

import java.time.Instant;

@Data
@Entity
@Table(name = "resume_builder_documents", indexes = {
        @Index(name = "idx_resume_builder_documents_owner", columnList = "ownerEmail"),
        @Index(name = "idx_resume_builder_documents_owner_template", columnList = "ownerEmail, templateCode")
})
public class ResumeBuilderDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String ownerEmail;

    @Column(nullable = false)
    private String templateCode;

    @Column(nullable = false)
    private int templateVersion;

    @Column(nullable = false)
    private String name = "Untitled resume";

    @Column(columnDefinition = "TEXT", nullable = false)
    private String resumeDataJson = "{}";

    @Column(columnDefinition = "TEXT", nullable = false)
    private String sectionOrderJson = "[]";

    @Column(columnDefinition = "TEXT", nullable = false)
    private String editorSettingsJson = "{}";

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    public String resumeKey() {
        return "builder-doc-" + id;
    }

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}
