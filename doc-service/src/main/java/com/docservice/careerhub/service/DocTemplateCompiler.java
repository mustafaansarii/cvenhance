package com.docservice.careerhub.service;

import com.docservice.careerhub.dto.constants.DocTemplateStatus;
import com.docservice.careerhub.entity.DocTemplate;
import com.docservice.careerhub.repo.DocTemplateRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.List;


@Component
public class DocTemplateCompiler {

    private static final Logger LOGGER = LoggerFactory.getLogger(DocTemplateCompiler.class);
    private static final int MAX_ERROR_LENGTH = 2000;
    private static final int BATCH_SIZE = 5;
    private static final Duration STALE_COMPILING = Duration.ofMinutes(5);

    @Autowired
    private DocTemplateRepository docTemplateRepository;

    @Autowired
    private LatexCompiler latexCompiler;

    @Autowired
    private StorageService storageService;

    @Autowired
    private LatexMergeService latexMergeService;

    @Autowired
    private ResumeDataResolver resumeDataResolver;

    public void compilePending() {
        List<DocTemplate> batch = docTemplateRepository.findCompilable(
                DocTemplateStatus.PENDING,
                DocTemplateStatus.COMPILING,
                Instant.now().minus(STALE_COMPILING),
                PageRequest.of(0, BATCH_SIZE));
        for (DocTemplate template : batch) {
            process(template);
        }
    }

    // Orchestrates the three independent steps: claim (persist) → render (compile) → persist outcome.
    private void process(DocTemplate template) {
        claim(template);
        RenderResult result = render(template);
        persistOutcome(template, result);
    }

    /** Persistence only: mark the template as being worked on. */
    private void claim(DocTemplate template) {
        template.setStatus(DocTemplateStatus.COMPILING);
        docTemplateRepository.save(template);
    }

    /** Rendering only: merge sample data, compile, upload the preview. No DB writes. */
    private RenderResult render(DocTemplate template) {
        try {
            String filled = latexMergeService.merge(template.getLatexCode(), resumeDataResolver.sample());
            byte[] pdf = latexCompiler.compile(filled);
            String url = storageService.upload(pdf, "doc-templates/" + template.getId() + ".pdf", "application/pdf");
            return RenderResult.ready(url);
        } catch (RuntimeException exception) {
            LOGGER.warn("Template {} ({}) failed to compile: {}", template.getId(), template.getName(),
                    exception.getMessage());
            return RenderResult.failed(truncate(exception.getMessage()));
        }
    }

    /** Persistence only: write the render outcome back to the template. */
    private void persistOutcome(DocTemplate template, RenderResult result) {
        if (result.ready()) {
            template.setPdfUrl(result.pdfUrl());
            template.setStatus(DocTemplateStatus.READY);
            template.setErrorMessage(null);
        } else {
            template.setStatus(DocTemplateStatus.FAILED);
            template.setErrorMessage(result.error());
        }
        docTemplateRepository.save(template);
    }

    private String truncate(String message) {
        if (message == null) {
            return "Unknown error";
        }
        return message.length() <= MAX_ERROR_LENGTH ? message : message.substring(0, MAX_ERROR_LENGTH);
    }

    private record RenderResult(boolean ready, String pdfUrl, String error) {
        static RenderResult ready(String pdfUrl) {
            return new RenderResult(true, pdfUrl, null);
        }

        static RenderResult failed(String error) {
            return new RenderResult(false, null, error);
        }
    }
}
