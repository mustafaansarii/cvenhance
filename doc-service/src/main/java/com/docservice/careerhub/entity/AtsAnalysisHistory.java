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
@Table(name = "ats_analysis_history", indexes = {
        @Index(name = "idx_ats_history_owner_created", columnList = "ownerEmail, createdAt"),
        @Index(name = "idx_ats_history_score", columnList = "score")
})
public class AtsAnalysisHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 320)
    private String ownerEmail;

    private String targetRole;

    @Column(nullable = false)
    private int score;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String strengthsJson;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String weaknessesJson;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String suggestionsJson;

    @Column(columnDefinition = "TEXT")
    private String resumeSnapshot;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}