package com.docservice.careerhub.repo;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.docservice.careerhub.entity.AtsAnalysisHistory;

public interface AtsAnalysisHistoryRepository extends JpaRepository<AtsAnalysisHistory, Long> {

    Page<AtsAnalysisHistory> findByOwnerEmailOrderByCreatedAtDesc(String ownerEmail, Pageable pageable);

    Optional<AtsAnalysisHistory> findByIdAndOwnerEmail(Long id, String ownerEmail);

    void deleteByOwnerEmail(String ownerEmail);
}