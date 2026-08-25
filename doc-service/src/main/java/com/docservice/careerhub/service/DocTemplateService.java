package com.docservice.careerhub.service;

import com.docservice.careerhub.dto.constants.DocTemplateStatus;
import com.docservice.careerhub.dto.constants.DocType;
import com.docservice.careerhub.dto.constants.SubscriptionType;
import com.docservice.careerhub.dto.request.CreateDocTemplateRequest;
import com.docservice.careerhub.entity.DocTemplate;
import com.docservice.careerhub.exception.ApiException;
import com.docservice.careerhub.repo.DocTemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        }
        return requests.stream().map(this::upsertPending).toList();
    }

    public DocTemplate getById(Long id) {
        return docTemplateRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Doc template not found: " + id));
    }

    public DocTemplate getTemplate(String templateCode) {
        return docTemplateRepository.findFirstByTemplateCode(templateCode)
                .orElseThrow(() -> ApiException.notFound("Doc template not found: " + templateCode));
    }

    public java.util.Optional<DocTemplate> findTemplate(String templateCode) {
        return docTemplateRepository.findFirstByTemplateCode(templateCode);
    }

    @Transactional(readOnly = true)
    public boolean isFreeTemplate(String templateCode) {
        if (templateCode == null || templateCode.isBlank()) {
            return false;
        }
        return docTemplateRepository.findFirstByTemplateCode(templateCode)
                .map(t -> t.getSubscriptionType() == com.docservice.careerhub.dto.constants.SubscriptionType.FREE)
                .orElse(false);
    }

    @Transactional(readOnly = true)
    public Set<String> freeTemplateCodesAmong(java.util.Collection<String> codes) {
        if (codes == null || codes.isEmpty()) {
            return Set.of();
        }
        return new HashSet<>(docTemplateRepository.findFreeTemplateCodesIn(codes));
    }

    public Page<DocTemplate> list(String keyword, DocType type, Pageable pageable) {
        return docTemplateRepository.search(keyword, type, pageable);
    }

    private DocTemplate upsertPending(CreateDocTemplateRequest request) {
        String code = normalizeCode(request.getTemplateCode());
        DocTemplate template = (Objects.isNull(code) ? null
                : docTemplateRepository.findFirstByTemplateCode(code).orElse(null));
        if (Objects.isNull(template)) {
            template = new DocTemplate();
            template.setTemplateCode(code);
        }
        template.setName(request.getName());
        template.setType(request.getType());
        template.setSubscriptionType(request.getSubscriptionType() != null
                ? request.getSubscriptionType() : SubscriptionType.PAID);
        template.setDescription(request.getDescription());
        template.setImageUrl(request.getImageUrl());
        template.setLatexCode(request.getLatexCode());
        template.setStatus(DocTemplateStatus.PENDING);
        template.setErrorMessage(null);
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
