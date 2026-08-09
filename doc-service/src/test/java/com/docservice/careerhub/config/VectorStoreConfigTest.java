package com.docservice.careerhub.config;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;
import org.springframework.ai.document.Document;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.embedding.EmbeddingRequest;
import org.springframework.ai.embedding.EmbeddingResponse;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.jdbc.core.JdbcTemplate;

class VectorStoreConfigTest {

    @Test
    void createsVectorStoreBeanWithProvidedDependencies() {
        VectorStoreConfig config = new VectorStoreConfig();

        VectorStore vectorStore = config.vectorStore(
                new JdbcTemplate(),
                new EmbeddingModel() {
                    @Override
                    public EmbeddingResponse call(EmbeddingRequest request) {
                        return new EmbeddingResponse(java.util.List.of());
                    }

                    @Override
                    public float[] embed(Document document) {
                        return new float[768];
                    }

                    @Override
                    public int dimensions() {
                        return 768;
                    }
                },
                true,
                768,
                "COSINE_DISTANCE",
                "HNSW",
                "public",
                "vector_store");

        assertThat(vectorStore).isNotNull();
    }
}
