package com.docservice.careerhub.repo;

import com.docservice.careerhub.entity.ResumeBuilderDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ResumeBuilderDocumentRepository extends JpaRepository<ResumeBuilderDocument, Long> {

    Optional<ResumeBuilderDocument> findFirstByOwnerEmailAndTemplateCodeOrderByUpdatedAtDesc(String ownerEmail, String templateCode);

    Optional<ResumeBuilderDocument> findByIdAndOwnerEmail(Long id, String ownerEmail);

    List<ResumeBuilderDocument> findAllByOwnerEmailOrderByUpdatedAtDesc(String ownerEmail);
}
