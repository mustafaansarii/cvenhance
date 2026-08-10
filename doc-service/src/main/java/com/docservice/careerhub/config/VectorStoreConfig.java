package com.docservice.careerhub.config;

import java.util.Locale;

import org.springframework.ai.document.Document;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.embedding.EmbeddingRequest;
import org.springframework.ai.embedding.EmbeddingResponse;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.pgvector.PgVectorStore;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class VectorStoreConfig {

    @Bean
    @ConditionalOnMissingBean(EmbeddingModel.class)
    public EmbeddingModel embeddingModel() {
        return new EmbeddingModel() {
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
        };
    }

    @Bean
    @ConditionalOnMissingBean(VectorStore.class)
    public VectorStore vectorStore(JdbcTemplate jdbcTemplate,
                                    EmbeddingModel embeddingModel,
                                    @Value("${spring.ai.vectorstore.pgvector.initialize-schema:true}") boolean initializeSchema,
                                    @Value("${spring.ai.vectorstore.pgvector.dimensions:768}") int dimensions,
                                    @Value("${spring.ai.vectorstore.pgvector.distance-type:COSINE_DISTANCE}") String distanceType,
                                    @Value("${spring.ai.vectorstore.pgvector.index-type:HNSW}") String indexType,
                                    @Value("${spring.ai.vectorstore.pgvector.schema-name:public}") String schemaName,
                                    @Value("${spring.ai.vectorstore.pgvector.table-name:vector_store}") String tableName) {
        PgVectorStore.PgVectorStoreBuilder builder = PgVectorStore.builder(jdbcTemplate, embeddingModel)
                .initializeSchema(initializeSchema)
                .dimensions(dimensions)
                .schemaName(schemaName)
                .vectorTableName(tableName);

        if ("COSINE_DISTANCE".equalsIgnoreCase(distanceType)) {
            builder.distanceType(PgVectorStore.PgDistanceType.COSINE_DISTANCE);
        } else if ("EUCLIDEAN_DISTANCE".equalsIgnoreCase(distanceType) || "L2_DISTANCE".equalsIgnoreCase(distanceType)) {
            builder.distanceType(PgVectorStore.PgDistanceType.EUCLIDEAN_DISTANCE);
        } else if ("NEGATIVE_INNER_PRODUCT".equalsIgnoreCase(distanceType) || "INNER_PRODUCT".equalsIgnoreCase(distanceType)) {
            builder.distanceType(PgVectorStore.PgDistanceType.NEGATIVE_INNER_PRODUCT);
        }

        String normalizedIndexType = indexType.toUpperCase(Locale.ROOT);
        if ("HNSW".equals(normalizedIndexType)) {
            builder.indexType(PgVectorStore.PgIndexType.HNSW);
        } else if ("IVFFLAT".equals(normalizedIndexType)) {
            builder.indexType(PgVectorStore.PgIndexType.IVFFLAT);
        }

        return builder.build();
    }
}
