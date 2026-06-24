package com.docservice.careerhub.service;

import com.docservice.careerhub.dto.constants.DocTemplateStatus;
import com.docservice.careerhub.dto.constants.DocType;
import com.docservice.careerhub.dto.request.CreateDocTemplateRequest;
import com.docservice.careerhub.entity.DocTemplate;
import com.docservice.careerhub.exception.ApiException;
import com.docservice.careerhub.repo.DocTemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@Service
public class DocTemplateService {

    @Autowired
    private DocTemplateRepository docTemplateRepository;

    public List<DocTemplate> createAll(List<CreateDocTemplateRequest> requests) {
        Set<String> seenCodes = new HashSet<>();
        for (CreateDocTemplateRequest request : requests) {
            String code = normalizeCode(request.getTemplateCode());
            if (Objects.isNull(code)) {
                continue;
            }
            if (!seenCodes.add(code)) {
                throw ApiException.conflict("Duplicate templateCode in request: " + code);
            }
            if (docTemplateRepository.existsByTemplateCode(code)) {
                throw ApiException.conflict("Template code already exists: " + code);
            }
        }
        return requests.stream().map(this::newPending).toList();
    }

    public DocTemplate getById(Long id) {
        return docTemplateRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Doc template not found: " + id));
    }

    public Page<DocTemplate> list(String keyword, DocType type, Pageable pageable) {
        return docTemplateRepository.search(keyword, type, pageable);
    }

    private DocTemplate newPending(CreateDocTemplateRequest request) {
        DocTemplate template = new DocTemplate();
        template.setTemplateCode(normalizeCode(request.getTemplateCode()));
        template.setName(request.getName());
        template.setType(request.getType());
        template.setDescription(request.getDescription());
        template.setImageUrl(request.getImageUrl());
        template.setLatexCode(request.getLatexCode());
        template.setStatus(DocTemplateStatus.PENDING);
        return docTemplateRepository.save(template);
    }

    private String normalizeCode(String code) {
        if (Objects.isNull(code)) {
            return null;
        }
        String trimmed = code.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
