package com.docservice.careerhub.repo;

import com.docservice.careerhub.entity.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserSessionRepository extends JpaRepository<UserSession, Long> {

    boolean existsByTokenId(String tokenId);

    void deleteByTokenId(String tokenId);

    List<UserSession> findByUserEmail(String userEmail);
}
