package com.docservice.careerhub.entity;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "resume_check_history", indexes = {
        @Index(name = "idx_resume_check_owner_created", columnList = "ownerEmail, createdAt")
})
public class ResumeCheckHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 320)
    private String ownerEmail;

    private String targetRole;

    @Column(nullable = false)
    private int overallScore;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String categoriesJson;

    @Column(columnDefinition = "TEXT")
    private String resumeSnapshot;

    /** Storage object path (used to delete the file when this history row is pruned). */
    @Column(columnDefinition = "TEXT")
    private String resumeFilePath;

    /** Public URL of the stored original file, rendered in the history preview. */
    @Column(columnDefinition = "TEXT")
    private String resumeFileUrl;

    /** MIME type of the stored file, e.g. application/pdf. */
    private String resumeFileType;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
