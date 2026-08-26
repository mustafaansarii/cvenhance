package com.docservice.careerhub.repo;

import com.docservice.careerhub.entity.AuthUser;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface AuthUserRepository extends JpaRepository<AuthUser, Long> {

    Optional<AuthUser> findByEmail(String email);
    boolean existsByEmail(String email);

    @Query("""
            SELECT u FROM AuthUser u
            WHERE :keyword IS NULL OR :keyword = ''
               OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))
            """)
    Page<AuthUser> search(@Param("keyword") String keyword, Pageable pageable);
}
