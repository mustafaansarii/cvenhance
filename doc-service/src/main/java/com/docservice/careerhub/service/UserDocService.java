package com.docservice.careerhub.service;

import com.docservice.careerhub.dto.constants.DocTemplateStatus;
import com.docservice.careerhub.dto.constants.DocType;
import com.docservice.careerhub.entity.DocTemplate;
import com.docservice.careerhub.entity.UserDoc;
import com.docservice.careerhub.exception.ApiException;
import com.docservice.careerhub.repo.DocTemplateRepository;
import com.docservice.careerhub.repo.UserDocRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.Objects;
import java.util.concurrent.Semaphore;

@Service
public class UserDocService {

    private static final int MAX_ERROR_LENGTH = 2000;
    private static final String COMPILED_CACHE_PREFIX = "compiled/";
    private static final String PREVIEW_CACHE_PREFIX = "preview/";


    private final Semaphore compileLock = new Semaphore(1);

    @Autowired
    private UserDocRepository userDocRepository;

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

    @Autowired
    private EntitlementService entitlementService;

    @Autowired
    private WatermarkService watermarkService;

    @Transactional
    public UserDoc saveTemplateToAccount(String ownerEmail, Long templateId) {
        DocTemplate template = docTemplateRepository.findById(templateId)
                .orElseThrow(() -> ApiException.notFound("Doc template not found: " + templateId));
        return findOrCreateForTemplate(ownerEmail, template);
    }

    @Transactional
    public UserDoc openByTemplateCode(String ownerEmail, String templateCode) {
        DocTemplate template = docTemplateRepository.findFirstByTemplateCode(templateCode)
                .orElseThrow(() -> ApiException.notFound("Doc template not found: " + templateCode));
        return findOrCreateForTemplate(ownerEmail, template);
    }

    @Transactional
    public void claim(String ownerEmail, Long id) {
        UserDoc doc = getOwned(ownerEmail, id);
        if (!entitlementService.unlock(ownerEmail, doc.resumeKey())) {
            throw ApiException.paymentRequired("Upgrade your plan to download this resume");
        }
    }

    @Transactional
    public UserDoc refreshFromProfile(String ownerEmail, Long id) {
        UserDoc doc = getOwned(ownerEmail, id);
        if (Objects.isNull(doc.getSourceTemplateId())) {
            throw ApiException.badData("This document has no source template to refresh from");
        }
        DocTemplate template = docTemplateRepository.findById(doc.getSourceTemplateId())
                .orElseThrow(() -> ApiException.notFound("Source template not found: " + doc.getSourceTemplateId()));
        doc.setLatexCode(latexMergeService.merge(template.getLatexCode(), resumeDataResolver.forUser(ownerEmail)));
        return userDocRepository.save(doc);
    }

    @Transactional(readOnly = true)
    public Page<UserDoc> list(String ownerEmail, String keyword, DocType type, Pageable pageable) {
        return userDocRepository.search(ownerEmail, keyword, type, pageable);
    }

    @Transactional(readOnly = true)
    public UserDoc getOwned(String ownerEmail, Long id) {
        return userDocRepository.findByIdAndOwnerEmail(id, ownerEmail)
                .orElseThrow(() -> ApiException.notFound("Doc not found: " + id));
    }

    @Transactional
    public byte[] compileAndUpdate(String ownerEmail, Long id, String latexCode) {
        UserDoc doc = getOwned(ownerEmail, id);
        doc.setLatexCode(latexCode);
        return renderAndStore(doc, entitlementService.isUnlocked(ownerEmail, doc.resumeKey()));
    }

    @Transactional
    public byte[] unlockAndCompile(String ownerEmail, Long id) {
        UserDoc doc = getOwned(ownerEmail, id);
        if (!entitlementService.unlock(ownerEmail, doc.resumeKey())) {
            throw ApiException.paymentRequired("Upgrade your plan to download this resume");
        }
        return renderAndStore(doc, true);
    }

//-----------------------------------private methods-----------------------------------

    private byte[] renderAndStore(UserDoc doc, boolean full) {
        try {
            String hash = sha256(doc.getLatexCode());
            String key = (full ? COMPILED_CACHE_PREFIX : PREVIEW_CACHE_PREFIX) + hash + ".pdf";
            byte[] output = full ? compiledPdf(doc.getLatexCode(), hash) : previewPdf(doc.getLatexCode(), hash);
            doc.setPdfUrl(storageService.publicUrl(key));
            doc.setStatus(DocTemplateStatus.READY);
            doc.setErrorMessage(null);
            userDocRepository.save(doc);
            return output;
        } catch (RuntimeException exception) {
            doc.setStatus(DocTemplateStatus.FAILED);
            doc.setErrorMessage(truncate(exception.getMessage()));
            userDocRepository.save(doc);
            throw exception;
        }
    }


    private byte[] compiledPdf(String latexCode, String hash) {
        String key = COMPILED_CACHE_PREFIX + hash + ".pdf";
        byte[] cached = storageService.download(key);
        if (hasContent(cached)) {
            return cached;
        }
        return compileAndCache(latexCode, key);
    }

    private byte[] previewPdf(String latexCode, String hash) {
        String key = PREVIEW_CACHE_PREFIX + hash + ".pdf";
        byte[] cached = storageService.download(key);
        if (hasContent(cached)) {
            return cached;
        }
        byte[] preview = watermarkService.buildPreview(compiledPdf(latexCode, hash));
        storageService.upload(preview, key, "application/pdf");
        return preview;
    }

    private byte[] compileAndCache(String latexCode, String cacheKey) {
        try {
            compileLock.acquire();
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw ApiException.badData("Compilation was interrupted while queued");
        }
        try {
            byte[] cached = storageService.download(cacheKey);
            if (hasContent(cached)) {
                return cached;
            }
            byte[] compiled = latexCompiler.compile(latexCode);
            storageService.upload(compiled, cacheKey, "application/pdf");
            return compiled;
        } finally {
            compileLock.release();
        }
    }

    private boolean hasContent(byte[] bytes) {
        return Objects.nonNull(bytes) && bytes.length > 0;
    }

    private String sha256(String value) {
        try {
            byte[] hash = MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is not available", exception);
        }
    }

    private String truncate(String message) {
        if (Objects.isNull(message)) {
            return "Unknown error";
        }
        return message.length() <= MAX_ERROR_LENGTH ? message : message.substring(0, MAX_ERROR_LENGTH);
    }
    
    private UserDoc findOrCreateForTemplate(String ownerEmail, DocTemplate template) {
        if (Objects.nonNull(template.getTemplateCode())) {
            UserDoc existing = userDocRepository
                    .findFirstByOwnerEmailAndTemplateCode(ownerEmail, template.getTemplateCode())
                    .orElse(null);
            if (Objects.nonNull(existing)) {
                return existing;
            }
        }

        String merged = latexMergeService.merge(template.getLatexCode(), resumeDataResolver.forUser(ownerEmail));

        UserDoc doc = new UserDoc();
        doc.setOwnerEmail(ownerEmail);
        doc.setSourceTemplateId(template.getId());
        doc.setTemplateCode(template.getTemplateCode());
        doc.setName(template.getName());
        doc.setType(template.getType());
        doc.setDescription(template.getDescription());
        doc.setLatexCode(merged);
        doc.setImageUrl(template.getImageUrl());
        doc.setStatus(DocTemplateStatus.READY);
        return userDocRepository.save(doc);
    }

}

