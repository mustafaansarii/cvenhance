package com.docservice.careerhub.service;

import com.docservice.careerhub.entity.AuditEvent;
import com.docservice.careerhub.repo.AuditEventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class AuditEventWriter {

    private static final Logger logger = LoggerFactory.getLogger(AuditEventWriter.class);

    @Autowired
    private AuditEventRepository auditEventRepository;

    @Async
    public void write(AuditEvent event) {
        try {
            auditEventRepository.save(event);
        } catch (Exception e) {
            logger.error("Failed to persist audit event {}", event.getAction(), e);
        }
    }
}
