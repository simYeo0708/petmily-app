package com.petmily.backend.api.mall.service.review;

import com.petmily.backend.api.exception.CustomException;
import com.petmily.backend.api.exception.ErrorCode;
import com.petmily.backend.api.mall.dto.review.ReviewCreateRequest;
import com.petmily.backend.api.mall.dto.review.ReviewResponse;
import com.petmily.backend.api.mall.dto.review.ReviewSummary;
import com.petmily.backend.api.mall.dto.review.ReviewUpdateRequest;
import com.petmily.backend.api.mall.enums.ShoppingMall;
import com.petmily.backend.domain.mall.review.entity.Review;
import com.petmily.backend.domain.mall.review.entity.ReviewHelpful;
import com.petmily.backend.domain.mall.review.repository.ReviewHelpfulRepository;
import com.petmily.backend.domain.mall.review.repository.ReviewRepository;
import com.petmily.backend.domain.user.entity.User;
import com.petmily.backend.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.swing.text.html.Option;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ReviewHelpfulRepository reviewHelpfulRepository;

    private Review findReviewById(Long reviewId){
        return reviewRepository.findById(reviewId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "리뷰를 찾을 수 없습니다."));
    }

    @Transactional
    public ReviewResponse createReview(Long userId, ReviewCreateRequest request){
        if(reviewRepository.existsByUserIdAndExternalProductIdAndSource(
                userId, request.getExternalProductId(), request.getSource())) {
            throw new CustomException(ErrorCode.DUPLICATE_RESOURCE, "이미 해당 상품에 리뷰를 작성하셨습니다.");
        }

        Review review = Review.builder()
                .userId(userId)
                .externalProductId(request.getExternalProductId())
                .productName(request.getProductName())
                .productImageUrl(request.getProductImageUrl())
                .source(request.getSource())
                .rating(request.getRating())
                .content(request.getContent())
                .imageUrls(request.getImageUrls())
                .helpfulCount(0)
                .build();

        Review savedReview = reviewRepository.save(review);
        log.info("리뷰 작성 완료 - User ID: {}, Product: {}", userId, request.getExternalProductId());

        return ReviewResponse.from(savedReview);
    }

    @Transactional
    public ReviewResponse updateReview(Long reviewId, Long userId, ReviewUpdateRequest request){
        Review review = findReviewById(reviewId);

        if(!review.getUserId().equals(userId)){
            throw new CustomException(ErrorCode.NO_ACCESS, "본인이 작성한 리뷰만 수정할 수 있습니다.");
        }

        review.setRating(request.getRating());
        review.setContent(request.getContent());
        review.setImageUrls(request.getImageUrls());

        return ReviewResponse.from(review);
    }

    @Transactional
    public void deleteReview(Long reviewId, Long userId){
        Review review = findReviewById(reviewId);

        if(!review.getUserId().equals(userId)){
            throw new CustomException(ErrorCode.NO_ACCESS, "본인이 작성한 리뷰만 삭제할 수 있습니다.");
        }

        reviewRepository.delete(review);
        log.info("리뷰 삭제 완료 - Review ID: {}", reviewId);
    }

    public Page<ReviewResponse> getProductReviews(String productId, ShoppingMall source, int page, int size, Long currentUserId){
        Pageable pageable = PageRequest.of(page, size);
        Page<Review> reviews = reviewRepository.findByExternalProductIdAndSourceOrderByCreatedAtDesc(
                productId, source, pageable
        );

        return reviews.map(review -> {
            ReviewHelpful userHelpful = null;
            if(currentUserId != null) {
                userHelpful = reviewHelpfulRepository.findByUserIdAndReviewId(currentUserId, review.getId())
                        .orElse(null);
            }
            return ReviewResponse.from(review, userHelpful);
        });
    }

    public ReviewSummary getReviewSummary(String productId, ShoppingMall source){
        Long totalCount = reviewRepository.countByExternalProductIdAndSource(productId, source);
        Double averageRating = reviewRepository.findAverageRatingByProduct(productId, source);

        return ReviewSummary.builder()
                .totalCount(totalCount)
                .averageRating(averageRating != null ? Math.round(averageRating * 10) / 10.0 : 0.0)
                .build();
    }

    public List<ReviewResponse> getBestReviews(String productId, ShoppingMall source){
        List<Review> bestReviews = reviewRepository.findTop3ByExternalProductIdAndSourceOrderByHelpfulCountDescCreatedAtDesc(
                productId, source
        );

        return bestReviews.stream()
                .map(ReviewResponse::from)
                .collect((Collectors.toList()));
    }

    public Page<ReviewResponse> getMyReviews(Long userId, int page, int size){
        Pageable pageable = PageRequest.of(page, size);
        Page<Review> reviews = reviewRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);

        return reviews.map(ReviewResponse::from);
    }

    @Transactional
    public void toggleHelpful(Long reviewId, Long userId){
        Review review = findReviewById(reviewId);
        Optional<ReviewHelpful> existing = reviewHelpfulRepository.findByUserIdAndReviewId(userId, reviewId);

        if(existing.isPresent()) {
            ReviewHelpful helpful = existing.get();

            if(helpful.getType() == ReviewHelpful.HelpfulType.HELPFUL){
                review.decrementHelpfulCount();
                reviewHelpfulRepository.delete(helpful);
                log.info("도움이 됨 취소 - Review ID: {}, User ID: {}", reviewId, userId);
            } else {
                review.decrementNotHelpfulCount();
                review.incrementHelpfulCount();
                helpful.setType(ReviewHelpful.HelpfulType.HELPFUL);
                log.info("별로예요 -> 도움이 됨 변경 - Review ID: {}, User ID: {}", reviewId, userId);
            }
        } else {
            review.incrementHelpfulCount();
            ReviewHelpful helpful = ReviewHelpful.builder()
                    .userId(userId)
                    .reviewId(reviewId)
                    .type(ReviewHelpful.HelpfulType.HELPFUL)
                    .build();
            reviewHelpfulRepository.save(helpful);
            log.info("도움이 됨 추가 - Review ID: {}, User ID: {}", reviewId, userId);
        }
    }

    @Transactional
    public void toggleNotHelpful(Long reviewId, Long userId){
        Review review = findReviewById(reviewId);
        Optional<ReviewHelpful> existing = reviewHelpfulRepository.findByUserIdAndReviewId(userId, reviewId);

        if(existing.isPresent()) {
            ReviewHelpful helpful = existing.get();

            if(helpful.getType() == ReviewHelpful.HelpfulType.NOT_HELPFUL) {
                review.decrementHelpfulCount();
                reviewHelpfulRepository.delete(helpful);
                log.info("별로예요 취소 - Review ID: {}, User ID: {}", reviewId, userId);
            } else {
                review.decrementHelpfulCount();
                review.incrementNotHelpfulCount();
                helpful.setType(ReviewHelpful.HelpfulType.NOT_HELPFUL);
                log.info("도움이 됨 -> 별로예요 변경 - Review ID: {}, User ID: {}", reviewId, userId);
            }
        } else {
            review.incrementNotHelpfulCount();
            ReviewHelpful helpful = ReviewHelpful.builder()
                    .userId(userId)
                    .reviewId(reviewId)
                    .type(ReviewHelpful.HelpfulType.NOT_HELPFUL)
                    .build();
            reviewHelpfulRepository.save(helpful);
            log.info("별로예요 추가 - Review ID: {}, User ID: {}", reviewId, userId);
        }
    }

}
