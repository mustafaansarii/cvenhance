package com.docservice.careerhub.repo;

import com.docservice.careerhub.dto.constants.AuditAction;
import com.docservice.careerhub.entity.AuditEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditEventRepository extends JpaRepository<AuditEvent, Long> {

    Page<AuditEvent> findAllByActorEmailOrderByCreatedAtDesc(String actorEmail, Pageable pageable);

    Page<AuditEvent> findAllByActionOrderByCreatedAtDesc(AuditAction action, Pageable pageable);
}
