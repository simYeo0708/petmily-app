package com.petmily.backend.domain.mall.review.repository;

import com.petmily.backend.domain.mall.review.entity.Review;
import com.petmily.backend.domain.mall.review.entity.ReviewHelpful;
import com.petmily.backend.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewHelpfulRepository extends JpaRepository<ReviewHelpful, Long> {

    Optional<ReviewHelpful> findByUserAndReview(User user, Review review);

    boolean existsByUserAndReview(User user, Review review);

    List<ReviewHelpful> findByReview(Review review);

    Optional<ReviewHelpful> findByUserAndReviewAndType(User user, Review review, ReviewHelpful.HelpfulType type);

}
