package com.docservice.careerhub.service;

import com.docservice.careerhub.dto.constants.DocTemplateStatus;
import com.docservice.careerhub.dto.constants.DocType;
import com.docservice.careerhub.dto.request.CreateDocTemplateRequest;
import com.docservice.careerhub.entity.DocTemplate;
import com.docservice.careerhub.exception.ApiException;
import com.docservice.careerhub.repo.DocTemplateRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicLong;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class DocTemplateServiceTest {

    private DocTemplateRepository repo;
    private DocTemplateService service;

    @BeforeEach
    void setUp() {
        repo = mock(DocTemplateRepository.class);
        service = new DocTemplateService();
        ReflectionTestUtils.setField(service, "docTemplateRepository", repo);

        AtomicLong ids = new AtomicLong(0);
        when(repo.save(any(DocTemplate.class))).thenAnswer(inv -> {
            DocTemplate t = inv.getArgument(0);
            if (t.getId() == null) {
                t.setId(ids.incrementAndGet());
            }
            return t;
        });
    }

    private CreateDocTemplateRequest request(String name) {
        CreateDocTemplateRequest request = new CreateDocTemplateRequest();
        request.setName(name);
        request.setType(DocType.CV_AND_RESUME);
        request.setDescription("a " + name);
        request.setLatexCode("\\documentclass{article}\\begin{document}hi\\end{document}");
        return request;
    }

    @Test
    void createPersistsAsPendingWithoutCompiling() {
        List<DocTemplate> result = service.createAll(List.of(request("resume")));

        assertThat(result).hasSize(1);
        DocTemplate template = result.get(0);
        assertThat(template.getStatus()).isEqualTo(DocTemplateStatus.PENDING);
        assertThat(template.getPdfUrl()).isNull();
    }

    @Test
    void createBlankCodeIsStoredAsNull() {
        CreateDocTemplateRequest request = request("resume");
        request.setTemplateCode("   ");

        DocTemplate template = service.createAll(List.of(request)).get(0);

        assertThat(template.getTemplateCode()).isNull();
    }

    @Test
    void createRejectsDuplicateCodeWithinBatch() {
        CreateDocTemplateRequest a = request("a");
        a.setTemplateCode("modern");
        CreateDocTemplateRequest b = request("b");
        b.setTemplateCode("modern");

        assertThatThrownBy(() -> service.createAll(List.of(a, b)))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Duplicate templateCode");
    }

    @Test
    void createRejectsCodeThatAlreadyExists() {
        when(repo.existsByTemplateCode("modern")).thenReturn(true);
        CreateDocTemplateRequest a = request("a");
        a.setTemplateCode("modern");

        assertThatThrownBy(() -> service.createAll(List.of(a)))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("already exists");
    }

    @Test
    void getByIdThrowsWhenMissing() {
        when(repo.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getById(99L))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("not found");
    }
}
