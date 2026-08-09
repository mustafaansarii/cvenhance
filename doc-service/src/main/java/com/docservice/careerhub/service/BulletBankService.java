package com.docservice.careerhub.service;

import com.docservice.careerhub.ai.VectorSearchService;
import com.docservice.careerhub.dto.request.SeedBulletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.document.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Manages a curated library of recruiter-approved resume bullet points stored
 * in pgvector. Used by ResumeAiService to inject few-shot examples into the
 * AI writing prompt, dramatically improving suggestion quality.
 */
@Service
public class BulletBankService {

    private static final Logger LOGGER = LoggerFactory.getLogger(BulletBankService.class);

    /** Metadata type tag used to distinguish bullet-bank documents in pgvector. */
    public static final String TYPE_BULLET = "bullet_bank";

    @Autowired
    private VectorSearchService vectorSearchService;

    /**
     * Admin-only: seed the vector DB with a batch of curated bullets.
     *
     * @param request contains role, section, and list of bullet texts
     * @return number of bullets stored
     */
    public int seed(SeedBulletRequest request) {
        validate(request);
        List<Document> docs = new ArrayList<>();
        for (String bullet : request.getBullets()) {
            if (!StringUtils.hasText(bullet)) continue;
            Document doc = new Document(
                    UUID.randomUUID().toString(),
                    bullet.trim(),
                    Map.of(
                            "type",    TYPE_BULLET,
                            "role",    request.getRole().trim().toLowerCase(),
                            "section", request.getSection().trim().toLowerCase()
                    )
            );
            docs.add(doc);
        }
        if (!docs.isEmpty()) {
            vectorSearchService.store(docs);
            LOGGER.info("Seeded {} bullets for role='{}' section='{}'",
                    docs.size(), request.getRole(), request.getSection());
        }
        return docs.size();
    }

    /**
     * Retrieve top-k bullets most similar to the given query text,
     * optionally filtered by role and section metadata.
     *
     * @param query   the user's current text or instruction
     * @param role    optional role filter (null = no filter)
     * @param section optional section filter (null = no filter)
     * @param topK    max results
     * @return list of matching bullet texts (content only)
     */
    public List<String> findSimilarBullets(String query, String role, String section, int topK) {
        Map<String, Object> filter = buildFilter(role, section);
        List<Document> docs = vectorSearchService.search(query, topK, 0.60, filter);
        return docs.stream().map(Document::getText).toList();
    }

    // ── private helpers ─────────────────────────────────────────────────────

    private Map<String, Object> buildFilter(String role, String section) {
        // We always filter by type; add role/section when provided
        if (StringUtils.hasText(role) && StringUtils.hasText(section)) {
            return Map.of("type", TYPE_BULLET, "role", role.trim().toLowerCase(),
                          "section", section.trim().toLowerCase());
        } else if (StringUtils.hasText(role)) {
            return Map.of("type", TYPE_BULLET, "role", role.trim().toLowerCase());
        } else if (StringUtils.hasText(section)) {
            return Map.of("type", TYPE_BULLET, "section", section.trim().toLowerCase());
        }
        return Map.of("type", TYPE_BULLET);
    }

    private void validate(SeedBulletRequest request) {
        if (!StringUtils.hasText(request.getRole())) {
            throw new IllegalArgumentException("role is required");
        }
        if (!StringUtils.hasText(request.getSection())) {
            throw new IllegalArgumentException("section is required");
        }
        if (request.getBullets() == null || request.getBullets().isEmpty()) {
            throw new IllegalArgumentException("bullets list must not be empty");
        }
    }
}
