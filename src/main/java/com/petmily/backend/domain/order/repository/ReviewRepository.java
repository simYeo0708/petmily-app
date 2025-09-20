package com.petmily.backend.domain.order.repository;

import com.petmily.backend.domain.order.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    // 주문별 리뷰 조회 (리스트 - 레거시)
    @Query("SELECT r FROM Review r WHERE r.orderId = :orderId AND r.userId = :userId ORDER BY r.createTime DESC")
    List<Review> findByOrderIdAndUserIdList(@Param("orderId") Long orderId, @Param("userId") Long userId);
    
    // 주문별 리뷰 조회 (단일)
    @Query("SELECT r FROM Review r WHERE r.orderId = :orderId AND r.userId = :userId")
    Optional<Review> findByOrderIdAndUserId(@Param("orderId") Long orderId, @Param("userId") Long userId);
    
    // 주문별 리뷰 조회 (단일, userId 상관없이)
    @Query("SELECT r FROM Review r WHERE r.orderId = :orderId")
    Optional<Review> findByOrderId(@Param("orderId") Long orderId);
    
    // 특정 리뷰 조회 (권한 확인용)
    @Query("SELECT r FROM Review r WHERE r.id = :reviewId AND r.orderId = :orderId AND r.userId = :userId")
    Optional<Review> findByIdAndOrderIdAndUserId(@Param("reviewId") Long reviewId, @Param("orderId") Long orderId, @Param("userId") Long userId);
    
    // 주문 아이템별 리뷰 존재 여부 확인
    @Query("SELECT COUNT(r) > 0 FROM Review r WHERE r.orderItemId = :orderItemId AND r.userId = :userId")
    boolean existsByOrderItemIdAndUserId(@Param("orderItemId") Long orderItemId, @Param("userId") Long userId);
    
    // 상품별 리뷰 조회 (페이징)
    @Query("SELECT r FROM Review r WHERE r.productId = :productId ORDER BY r.createTime DESC")
    Page<Review> findByProductIdOrderByCreateTimeDesc(@Param("productId") Long productId, Pageable pageable);
    
    // 상품별 평점 통계
    @Query("SELECT AVG(r.rating), COUNT(r) FROM Review r WHERE r.productId = :productId")
    Object[] getProductRatingStats(@Param("productId") Long productId);
    
    // 상품별 평점별 개수
    @Query("SELECT r.rating, COUNT(r) FROM Review r WHERE r.productId = :productId GROUP BY r.rating ORDER BY r.rating DESC")
    List<Object[]> getProductRatingDistribution(@Param("productId") Long productId);
    
    // 사용자별 리뷰 조회
    @Query("SELECT r FROM Review r WHERE r.userId = :userId ORDER BY r.createTime DESC")
    Page<Review> findByUserIdOrderByCreateTimeDesc(@Param("userId") Long userId, Pageable pageable);
    
    // 최근 리뷰 조회 (관리자용)
    @Query("SELECT r FROM Review r ORDER BY r.createTime DESC")
    Page<Review> findAllOrderByCreateTimeDesc(Pageable pageable);
    
    // 평점별 리뷰 조회
    @Query("SELECT r FROM Review r WHERE r.productId = :productId AND r.rating = :rating ORDER BY r.createTime DESC")
    Page<Review> findByProductIdAndRatingOrderByCreateTimeDesc(@Param("productId") Long productId, @Param("rating") Integer rating, Pageable pageable);
    
    // 이미지가 있는 리뷰 조회
    @Query("SELECT r FROM Review r WHERE r.productId = :productId AND SIZE(r.imageUrls) > 0 ORDER BY r.createTime DESC")
    Page<Review> findByProductIdWithImagesOrderByCreateTimeDesc(@Param("productId") Long productId, Pageable pageable);
    
    // 도움이 많이 된 리뷰 조회
    @Query("SELECT r FROM Review r WHERE r.productId = :productId ORDER BY r.helpfulCount DESC, r.createTime DESC")
    Page<Review> findByProductIdOrderByHelpfulCountDesc(@Param("productId") Long productId, Pageable pageable);
    
    // 관리자 답변이 있는 리뷰 조회
    @Query("SELECT r FROM Review r WHERE r.productId = :productId AND r.adminReply IS NOT NULL ORDER BY r.createTime DESC")
    Page<Review> findByProductIdWithAdminReplyOrderByCreateTimeDesc(@Param("productId") Long productId, Pageable pageable);
    
    // 월별 리뷰 통계
    @Query("SELECT YEAR(r.createTime), MONTH(r.createTime), COUNT(r), AVG(r.rating) " +
           "FROM Review r " +
           "GROUP BY YEAR(r.createTime), MONTH(r.createTime) " +
           "ORDER BY YEAR(r.createTime) DESC, MONTH(r.createTime) DESC")
    List<Object[]> getMonthlyReviewStats();
    
    // 리뷰 작성 가능한 주문 아이템 확인
    @Query("SELECT oi FROM OrderItem oi " +
           "JOIN oi.order o " +
           "WHERE o.userId = :userId " +
           "AND o.status = 'DELIVERED' " +
           "AND NOT EXISTS (SELECT 1 FROM Review r WHERE r.orderItemId = oi.id AND r.userId = :userId) " +
           "ORDER BY o.updateTime DESC")
    List<OrderItem> findReviewableOrderItems(@Param("userId") Long userId);
    
    // 특정 기간 내 리뷰 개수
    @Query("SELECT COUNT(r) FROM Review r WHERE r.createTime BETWEEN :startDate AND :endDate")
    long countReviewsBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    // 사용자별 리뷰 개수
    @Query("SELECT COUNT(r) FROM Review r WHERE r.userId = :userId")
    long countByUserId(@Param("userId") Long userId);
}