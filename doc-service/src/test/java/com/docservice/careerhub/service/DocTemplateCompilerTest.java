package com.docservice.careerhub.service;

import com.docservice.careerhub.dto.constants.DocTemplateStatus;
import com.docservice.careerhub.dto.constants.DocType;
import com.docservice.careerhub.entity.DocTemplate;
import com.docservice.careerhub.exception.ApiException;
import com.docservice.careerhub.repo.DocTemplateRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class DocTemplateCompilerTest {

    private DocTemplateRepository repo;
    private LatexCompiler compiler;
    private StorageService storage;
    private LatexMergeService mergeService;
    private ResumeDataResolver resolver;
    private DocTemplateCompiler worker;

    @BeforeEach
    void setUp() {
        repo = mock(DocTemplateRepository.class);
        compiler = mock(LatexCompiler.class);
        storage = mock(StorageService.class);
        mergeService = mock(LatexMergeService.class);
        resolver = mock(ResumeDataResolver.class);
        worker = new DocTemplateCompiler();
        ReflectionTestUtils.setField(worker, "docTemplateRepository", repo);
        ReflectionTestUtils.setField(worker, "latexCompiler", compiler);
        ReflectionTestUtils.setField(worker, "storageService", storage);
        ReflectionTestUtils.setField(worker, "latexMergeService", mergeService);
        ReflectionTestUtils.setField(worker, "resumeDataResolver", resolver);
        when(repo.save(any(DocTemplate.class))).thenAnswer(inv -> inv.getArgument(0));
        when(resolver.sample()).thenReturn(java.util.Map.of());
        when(mergeService.merge(anyString(), any())).thenAnswer(inv -> inv.getArgument(0));
    }

    private DocTemplate pending(long id) {
        DocTemplate t = new DocTemplate();
        t.setId(id);
        t.setName("resume");
        t.setType(DocType.CV_AND_RESUME);
        t.setLatexCode("\\documentclass{article}\\begin{document}hi\\end{document}");
        t.setStatus(DocTemplateStatus.PENDING);
        return t;
    }

    @Test
    void compilesUploadsAndMarksReady() {
        DocTemplate t = pending(1L);
        when(repo.findCompilable(any(), any(), any(), any())).thenReturn(List.of(t));
        when(compiler.compile(anyString())).thenReturn(new byte[]{1, 2, 3});
        when(storage.upload(any(), anyString(), eq("application/pdf"))).thenReturn("https://store/doc-templates/1.pdf");

        worker.compilePending();

        assertThat(t.getStatus()).isEqualTo(DocTemplateStatus.READY);
        assertThat(t.getPdfUrl()).isEqualTo("https://store/doc-templates/1.pdf");
        assertThat(t.getErrorMessage()).isNull();
        verify(storage).upload(any(), eq("doc-templates/1.pdf"), eq("application/pdf"));
    }

    @Test
    void marksFailedWhenCompilationFailsAndDoesNotUpload() {
        DocTemplate t = pending(2L);
        when(repo.findCompilable(any(), any(), any(), any())).thenReturn(List.of(t));
        when(compiler.compile(anyString())).thenThrow(ApiException.badData("LaTeX compilation error"));

        worker.compilePending();

        assertThat(t.getStatus()).isEqualTo(DocTemplateStatus.FAILED);
        assertThat(t.getPdfUrl()).isNull();
        assertThat(t.getErrorMessage()).contains("LaTeX compilation error");
        verify(storage, never()).upload(any(), anyString(), anyString());
    }

    @Test
    void isolatesFailuresAcrossBatch() {
        DocTemplate ok = pending(1L);
        DocTemplate bad = pending(2L);
        when(repo.findCompilable(any(), any(), any(), any())).thenReturn(List.of(ok, bad));
        when(compiler.compile(anyString()))
                .thenReturn(new byte[]{1})
                .thenThrow(ApiException.badData("boom"));
        when(storage.upload(any(), anyString(), anyString())).thenReturn("https://store/x.pdf");

        worker.compilePending();

        assertThat(ok.getStatus()).isEqualTo(DocTemplateStatus.READY);
        assertThat(bad.getStatus()).isEqualTo(DocTemplateStatus.FAILED);
    }
}
