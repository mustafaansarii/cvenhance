package com.docservice.careerhub.config;

import com.docservice.careerhub.ai.VectorSearchService;
import com.docservice.careerhub.dto.request.SeedBulletRequest;
import com.docservice.careerhub.service.BulletBankService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.document.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Component
public class VectorStoreSeedInitializer {

    private static final Logger LOGGER = LoggerFactory.getLogger(VectorStoreSeedInitializer.class);

    @Autowired
    private BulletBankService bulletBankService;

    @Autowired
    private VectorSearchService vectorSearchService;

    @EventListener(ApplicationReadyEvent.class)
    public void seedInitialVectorData() {
        try {
            List<Document> existing = vectorSearchService.search("software", 1,
                    Map.of("type", BulletBankService.TYPE_BULLET));
            if (existing != null && !existing.isEmpty()) {
                LOGGER.info("Vector store already contains bullet bank data. Skipping auto-seeding.");
                return;
            }

            LOGGER.info("Seeding initial recruiter bullet points and ATS keywords into pgvector...");

            SeedBulletRequest fullstackExp = new SeedBulletRequest();
            fullstackExp.setRole("software engineer");
            fullstackExp.setSection("experience");
            fullstackExp.setBullets(List.of(
                    "Architected and deployed microservices handling 5M+ daily requests using Java Spring Boot and Kubernetes, reducing latency by 35%.",
                    "Spearheaded the migration of legacy monolithic codebase to Next.js and TypeScript, increasing page load speed by 45%.",
                    "Designed RESTful and GraphQL APIs with OAuth2 authentication, supporting 100k+ active daily users with 99.99% uptime.",
                    "Optimized SQL queries and PostgreSQL indexes, cutting database response times from 450ms to 60ms.",
                    "Implemented CI/CD pipelines using GitHub Actions and Docker, reducing feature deployment cycles from 2 weeks to 3 hours.",
                    "Led a cross-functional team of 6 engineers using Agile methodology, delivering 100% of quarterly roadmap commitments on time."));
            bulletBankService.seed(fullstackExp);

            SeedBulletRequest frontendExp = new SeedBulletRequest();
            frontendExp.setRole("frontend engineer");
            frontendExp.setSection("experience");
            frontendExp.setBullets(List.of(
                    "Engineered responsive React and Tailwind CSS UI components used by 250k+ monthly active users.",
                    "Reduced frontend bundle size by 40% via code splitting, dynamic imports, and tree shaking.",
                    "Implemented real-time state management using Redux Toolkit and WebSockets, delivering sub-100ms UI update latency.",
                    "Achieved 98+ Google Lighthouse accessibility and performance scores across all primary landing pages."));
            bulletBankService.seed(frontendExp);

            SeedBulletRequest backendExp = new SeedBulletRequest();
            backendExp.setRole("backend engineer");
            backendExp.setSection("experience");
            backendExp.setBullets(List.of(
                    "Built scalable ETL pipelines using Apache Spark and AWS S3, processing over 2TB of telemetry data per day.",
                    "Integrated Redis caching layer, achieving a 70% cache hit ratio and reducing primary DB load significantly.",
                    "Refactored asynchronous message consumer using Apache Kafka, boosting event processing throughput by 3x."));
            bulletBankService.seed(backendExp);

            SeedBulletRequest projectBullets = new SeedBulletRequest();
            projectBullets.setRole("software engineer");
            projectBullets.setSection("projects");
            projectBullets.setBullets(List.of(
                    "Built a real-time collaborative document editor with WebSockets and Operational Transformation, gaining 2.5k+ GitHub stars.",
                    "Developed an AI-driven resume builder featuring real-time ATS scoring, PDF generation, and OAuth2 security.",
                    "Created an open-source CLI tool for automated cloud deployment, downloaded over 50,000 times on NPM."));
            bulletBankService.seed(projectBullets);

            seedRoleKeywords("software engineer", List.of(
                    "Microservices, Java, Spring Boot, React, TypeScript, Docker, Kubernetes, PostgreSQL, REST APIs, CI/CD, AWS, Redis, Agile, System Design, Unit Testing"));

            seedRoleKeywords("frontend engineer", List.of(
                    "React.js, Next.js, TypeScript, JavaScript (ES6+), HTML5, CSS3, TailwindCSS, Redux, Webpack, Vite, Web Accessibility (WCAG), Jest, Cypress"));

            seedRoleKeywords("data engineer", List.of(
                    "Python, PySpark, SQL, Apache Kafka, Snowflake, AWS S3, Airflow, ETL Pipelines, Data Warehousing, Postgres, BigQuery"));

            LOGGER.info("Vector store seeding completed successfully.");
        } catch (Exception e) {
            LOGGER.warn("Vector store auto-seeding skipped: {}", e.getMessage());
        }
    }

    private void seedRoleKeywords(String role, List<String> keywordStrings) {
        List<Document> docs = new ArrayList<>();
        for (String kw : keywordStrings) {
            docs.add(new Document(
                    UUID.randomUUID().toString(),
                    kw,
                    Map.of("type", "role_keywords", "role", role.toLowerCase().trim())));
        }
        if (!docs.isEmpty()) {
            vectorSearchService.store(docs);
        }
    }
}
