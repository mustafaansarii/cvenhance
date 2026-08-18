package com.docservice.careerhub.repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.docservice.careerhub.entity.ResumeCheckHistory;

public interface ResumeCheckHistoryRepository extends JpaRepository<ResumeCheckHistory, Long> {

    Page<ResumeCheckHistory> findByOwnerEmailOrderByCreatedAtDesc(String ownerEmail, Pageable pageable);

    List<ResumeCheckHistory> findByOwnerEmailOrderByCreatedAtDesc(String ownerEmail);

    Optional<ResumeCheckHistory> findByIdAndOwnerEmail(Long id, String ownerEmail);

    void deleteByOwnerEmail(String ownerEmail);
}
