package com.docservice.careerhub.service;

import com.docservice.careerhub.ai.VectorSearchService;
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
 * Manages a user's personal Career Vault — a semantic index of all their
 * past resume sections stored in pgvector.
 *
 * After each resume import or save, relevant sections are embedded here.
 * When a user starts a new resume, the vault is queried to auto-suggest
 * the most relevant past experiences and projects.
 */
@Service
public class CareerVaultService {

    private static final Logger LOGGER = LoggerFactory.getLogger(CareerVaultService.class);
    public static final String TYPE_VAULT = "career_vault";

    @Autowired
    private VectorSearchService vectorSearchService;

    /**
     * Index a set of named sections from a user's resume into their career vault.
     *
     * @param userEmail the owner's email (used as metadata filter key)
     * @param sections  map of section name → text content (e.g. {"experience": "...", "projects": "..."})
     */
    public void indexSections(String userEmail, Map<String, String> sections) {
        List<Document> docs = new ArrayList<>();
        for (Map.Entry<String, String> entry : sections.entrySet()) {
            String sectionName = entry.getKey();
            String content = entry.getValue();
            if (!StringUtils.hasText(content)) continue;

            // chunk long sections into ~400-char pieces
            List<String> chunks = chunk(content, 400);
            for (String chunk : chunks) {
                docs.add(new Document(
                        UUID.randomUUID().toString(),
                        chunk,
                        Map.of(
                                "type",       TYPE_VAULT,
                                "user_email", userEmail,
                                "section",    sectionName
                        )
                ));
            }
        }
        if (!docs.isEmpty()) {
            vectorSearchService.store(docs);
            LOGGER.info("Indexed {} career vault chunks for user {}", docs.size(), userEmail);
        }
    }

    /**
     * Retrieve the most relevant past career experiences for a given query.
     *
     * @param userEmail the owner (scoped retrieval)
     * @param query     a job title, skill, or requirement to search against
     * @param topK      number of results
     * @return list of relevant text chunks from the user's past resumes
     */
    public List<String> findRelevantExperiences(String userEmail, String query, int topK) {
        Map<String, Object> filter = Map.of("type", TYPE_VAULT, "user_email", userEmail);
        List<Document> docs = vectorSearchService.search(query, topK, 0.60, filter);
        return docs.stream().map(Document::getText).toList();
    }

    // ── private helpers ─────────────────────────────────────────────────────

    private List<String> chunk(String text, int maxLen) {
        List<String> chunks = new ArrayList<>();
        String[] sentences = text.split("(?<=[.!?\\n])\\s*");
        StringBuilder cur = new StringBuilder();
        for (String s : sentences) {
            if (cur.length() + s.length() > maxLen && cur.length() > 0) {
                chunks.add(cur.toString().trim());
                cur = new StringBuilder();
            }
            cur.append(s).append(" ");
        }
        if (cur.length() > 0) chunks.add(cur.toString().trim());
        return chunks.isEmpty() ? List.of(text) : chunks;
    }
}
