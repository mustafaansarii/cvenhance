package com.docservice.careerhub.service;

import com.docservice.careerhub.dto.request.UpsertResumeBuilderTemplateRequest;
import com.docservice.careerhub.entity.ResumeBuilderTemplate;
import com.docservice.careerhub.exception.ApiException;
import com.docservice.careerhub.repo.ResumeBuilderTemplateRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ResumeBuilderTemplateService {

    private final ResumeBuilderTemplateRepository templateRepository;
    private final ObjectMapper objectMapper;

    public ResumeBuilderTemplateService(ResumeBuilderTemplateRepository templateRepository, ObjectMapper objectMapper) {
        this.templateRepository = templateRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public List<ResumeBuilderTemplate> listActive() {
        return templateRepository.findAllByActiveTrue(Sort.by(Sort.Direction.ASC, "name"));
    }

    @Transactional(readOnly = true)
    public ResumeBuilderTemplate getActive(String code) {
        ResumeBuilderTemplate template = getByCode(code);
        if (!template.isActive()) {
            throw ApiException.notFound("Resume builder template not found: " + code);
        }
        return template;
    }

    @Transactional(readOnly = true)
    public ResumeBuilderTemplate getByCode(String code) {
        return templateRepository.findByTemplateCode(normalizeCode(code))
                .orElseThrow(() -> ApiException.notFound("Resume builder template not found: " + code));
    }

    @Transactional
    public ResumeBuilderTemplate upsert(UpsertResumeBuilderTemplateRequest request) {
        validateConfig(request.getConfig());
        String code = normalizeCode(request.getTemplateCode());
        ResumeBuilderTemplate template = templateRepository.findByTemplateCode(code)
                .orElseGet(ResumeBuilderTemplate::new);
        boolean existing = template.getId() != null;
        template.setTemplateCode(code);
        template.setName(request.getName().trim());
        template.setDescription(blankToNull(request.getDescription()));
        template.setImageUrl(blankToNull(request.getImageUrl()));
        template.setConfigJson(writeJson(request.getConfig()));
        template.setActive(request.getActive() == null || request.getActive());
        if (existing) {
            template.setVersion(template.getVersion() + 1);
        }
        return templateRepository.save(template);
    }

    @Transactional
    public ResumeBuilderTemplate seed(String code, String name, String configJson) {
        return templateRepository.findByTemplateCode(code).orElseGet(() -> {
            ResumeBuilderTemplate template = new ResumeBuilderTemplate();
            template.setTemplateCode(code);
            template.setName(name);
            template.setDescription("Editable resume template");
            template.setActive(true);
            template.setVersion(1);
            JsonNode config = readJson(configJson);
            validateConfig(config);
            template.setConfigJson(writeJson(config));
            return templateRepository.save(template);
        });
    }

    public JsonNode readConfig(ResumeBuilderTemplate template) {
        return readJson(template.getConfigJson());
    }

    private void validateConfig(JsonNode config) {
        if (!config.isObject()) {
            throw ApiException.badData("config must be an object");
        }
        String layout = config.path("layout").asText("single-column");
        if (!layout.equals("single-column") && !layout.equals("two-column")) {
            throw ApiException.badData("config.layout must be single-column or two-column");
        }
        if (!config.path("accent").asText("#0f766e").matches("#[0-9a-fA-F]{6}")) {
            throw ApiException.badData("config.accent must be a six-digit hex colour");
        }
    }

    private String normalizeCode(String code) {
        String normalized = code == null ? "" : code.trim().toLowerCase();
        if (!normalized.matches("[a-z0-9]+(?:-[a-z0-9]+)*")) {
            throw ApiException.badData("templateCode may contain lowercase letters, numbers, and hyphens only");
        }
        return normalized;
    }

    private String writeJson(JsonNode value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception exception) {
            throw ApiException.badData("Invalid template config");
        }
    }

    private JsonNode readJson(String value) {
        try {
            return objectMapper.readTree(value);
        } catch (Exception exception) {
            throw ApiException.badData("Stored template config is invalid");
        }
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
