package com.telemed.repository;

import com.telemed.entity.CommunityHealthWorker;
import com.telemed.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CommunityHealthWorkerRepository extends JpaRepository<CommunityHealthWorker, Long> {
    Optional<CommunityHealthWorker> findByUser(User user);
    Optional<CommunityHealthWorker> findByUserId(Long userId);
}
