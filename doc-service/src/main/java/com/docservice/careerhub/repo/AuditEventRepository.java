package com.docservice.careerhub.repo;

import com.docservice.careerhub.dto.constants.AuditAction;
import com.docservice.careerhub.entity.AuditEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AuditEventRepository extends JpaRepository<AuditEvent, Long> {

    Page<AuditEvent> findAllByActorEmailOrderByCreatedAtDesc(String actorEmail, Pageable pageable);

    Page<AuditEvent> findAllByActionOrderByCreatedAtDesc(AuditAction action, Pageable pageable);

    @Query("""
            SELECT a FROM AuditEvent a
            WHERE (:keyword IS NULL OR :keyword = ''
                   OR LOWER(COALESCE(a.actorEmail, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(COALESCE(a.targetType, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(COALESCE(a.targetId, '')) LIKE LOWER(CONCAT('%', :keyword, '%')))
              AND (:action IS NULL OR a.action = :action)
            """)
    Page<AuditEvent> search(@Param("keyword") String keyword, @Param("action") AuditAction action, Pageable pageable);
}
