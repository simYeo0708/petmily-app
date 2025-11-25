package com.petmily.backend.domain.walker.repository;

import com.petmily.backend.domain.walker.entity.Walker;
import com.petmily.backend.domain.walker.entity.WalkerStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface WalkerRepository extends JpaRepository<Walker, Long> {

    Optional<Walker> findByUserId(Long userId);

    // 즐겨찾기 워커 필터용
    List<Walker> findByIdInAndStatus(List<Long> ids, WalkerStatus status);

    // DashboardService용 페이징 지원 메서드
    @Query("SELECT w FROM Walker w WHERE w.status = 'ACTIVE' ORDER BY w.rating DESC")
    List<Walker> findByStatusActiveOrderByRatingDesc(Pageable pageable);

    // WalkerSearchService용 메소드
    List<Walker> findByStatus(WalkerStatus status);

}

