package com.petmily.backend.domain.walk.repository;

import com.petmily.backend.domain.walk.entity.WalkDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface WalkDetailRepository extends JpaRepository<WalkDetail, Long> {

    // 예약 ID로 산책 상세 정보 조회
    Optional<WalkDetail> findByBookingId(Long bookingId);

}