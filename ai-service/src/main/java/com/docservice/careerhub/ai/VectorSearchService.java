package com.docservice.careerhub.ai;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.filter.FilterExpressionBuilder;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class VectorSearchService {

    private static final Logger LOGGER = LoggerFactory.getLogger(VectorSearchService.class);

    private final VectorStore vectorStore;

    public VectorSearchService(VectorStore vectorStore) {
        this.vectorStore = vectorStore;
    }

    public void store(List<Document> documents) {
        try {
            vectorStore.add(documents);
        } catch (Exception e) {
            LOGGER.warn("Failed to store {} documents in vector store: {}", documents.size(), e.getMessage());
            throw new AiException("Vector store write failed", e);
        }
    }

    public List<Document> search(String query, int topK, double similarityThreshold,
            Map<String, Object> metadataFilter) {
        if (query == null || query.isBlank()) {
            return Collections.emptyList();
        }
        try {
            SearchRequest.Builder builder = SearchRequest.builder()
                    .query(query)
                    .topK(topK)
                    .similarityThreshold(similarityThreshold);

            if (metadataFilter != null && !metadataFilter.isEmpty()) {
                String filterExpression = metadataFilter.entrySet().stream()
                        .map(e -> e.getKey() + " == '" + e.getValue() + "'")
                        .collect(Collectors.joining(" AND "));
                builder.filterExpression(filterExpression);
            }

            return vectorStore.similaritySearch(builder.build());
        } catch (Exception e) {
            LOGGER.warn("Vector search failed for query '{}': {}", query, e.getMessage());
            return Collections.emptyList(); // degrade gracefully — never block the user request
        }
    }

    public List<Document> search(String query, int topK, Map<String, Object> metadataFilter) {
        return search(query, topK, 0.65, metadataFilter);
    }

    public List<Document> search(String query, int topK) {
        return search(query, topK, 0.65, null);
    }

    public void delete(List<String> ids) {
        try {
            vectorStore.delete(ids);
        } catch (Exception e) {
            LOGGER.warn("Failed to delete {} documents from vector store: {}", ids.size(), e.getMessage());
        }
    }
}
