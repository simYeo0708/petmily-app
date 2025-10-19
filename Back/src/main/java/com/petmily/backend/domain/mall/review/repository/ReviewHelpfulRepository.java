package com.petmily.backend.domain.mall.review.repository;

import com.petmily.backend.domain.mall.review.entity.ReviewHelpful;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ReviewHelpfulRepository extends JpaRepository<ReviewHelpful, Long> {

    Optional<ReviewHelpful> findByUserIdAndReviewId(Long userId, Long reviewId);

    boolean existsByUserIdAndReviewId(Long userId, Long reviewId);

    void deleteByUserIdAndReviewId(Long userId, Long reviewId);
}
