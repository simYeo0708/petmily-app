package com.petmily.backend.domain.order.repository;

import com.petmily.backend.domain.order.entity.ReviewHelpful;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewHelpfulRepository extends JpaRepository<ReviewHelpful, Long> {

    // 사용자가 특정 리뷰에 도움이 됨을 눌렀는지 확인
    @Query("SELECT rh FROM ReviewHelpful rh WHERE rh.reviewId = :reviewId AND rh.userId = :userId")
    Optional<ReviewHelpful> findByReviewIdAndUserId(@Param("reviewId") Long reviewId, @Param("userId") Long userId);
    
    // 리뷰별 도움이 됨 개수
    @Query("SELECT COUNT(rh) FROM ReviewHelpful rh WHERE rh.reviewId = :reviewId")
    long countByReviewId(@Param("reviewId") Long reviewId);
    
    // 사용자가 도움이 됨을 누른 리뷰 목록
    @Query("SELECT rh.reviewId FROM ReviewHelpful rh WHERE rh.userId = :userId")
    List<Long> findReviewIdsByUserId(@Param("userId") Long userId);
    
    // 리뷰 삭제 시 관련 도움이 됨 데이터 삭제용
    void deleteByReviewId(Long reviewId);
}