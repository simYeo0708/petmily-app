package com.petmily.backend.api.mall.service;

import com.petmily.backend.api.exception.CustomException;
import com.petmily.backend.api.exception.ErrorCode;
import com.petmily.backend.api.mall.dto.review.request.ReviewCreateRequest;
import com.petmily.backend.api.mall.dto.review.request.ReviewHelpfulRequest;
import com.petmily.backend.api.mall.dto.review.request.ReviewUpdateRequest;
import com.petmily.backend.api.mall.dto.review.response.ReviewResponse;
import com.petmily.backend.api.mall.dto.review.response.ReviewSummaryResponse;
import com.petmily.backend.domain.mall.order.entity.Order;
import com.petmily.backend.domain.mall.order.entity.OrderStatus;
import com.petmily.backend.domain.mall.order.repository.OrderRepository;
import com.petmily.backend.domain.mall.product.entity.Product;
import com.petmily.backend.domain.mall.product.repository.ProductRepository;
import com.petmily.backend.domain.mall.review.entity.Review;
import com.petmily.backend.domain.mall.review.entity.ReviewHelpful;
import com.petmily.backend.domain.mall.review.repository.ReviewHelpfulRepository;
import com.petmily.backend.domain.mall.review.repository.ReviewRepository;
import com.petmily.backend.domain.user.entity.User;
import com.petmily.backend.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ReviewHelpfulRepository reviewHelpfulRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    private User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
    }

    private Product getProductById(Long productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new CustomException(ErrorCode.PRODUCT_NOT_FOUND));
    }

    private Order getOrderById(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND));
    }

    private Review getReviewById(Long reviewId) {
        return reviewRepository.findById(reviewId)
                .orElseThrow(() -> new CustomException(ErrorCode.REVIEW_NOT_FOUND));
    }

    @Transactional
    public ReviewResponse createReview(Long userId, ReviewCreateRequest request) {
        User user = getUserById(userId);
        Product product = getProductById(request.getProductId());
        Order order = getOrderById(request.getOrderId());

        if(!order.getUser().getId().equals(userId)){
            throw new CustomException(ErrorCode.NO_ACCESS);
        }

        if(order.getStatus() != OrderStatus.DELIVERED) {
            throw new IllegalArgumentException("배송 완료된 주문에만 리뷰를 작성할 수 있습니다.");
        }

        boolean hasProduct = order.getOrderItems().stream()
                .anyMatch(item -> item.getProduct().getId().equals(request.getProductId()));

        if(!hasProduct) {
            throw new IllegalArgumentException("주문에 포함되지 않은 상품입니다.");
        }

        if(reviewRepository.existsByUserAndProductAndOrder(user, product, order)){
            throw new IllegalArgumentException("이미 리뷰를 작성한 상품입니다.");
        }

        Review review = Review.builder()
                .user(user)
                .product(product)
                .order(order)
                .rating(request.getRating())
                .content(request.getContent())
                .imageUrls(request.getImageUrls())
                .isVerifiedPurchase(true)
                .build();

        Review savedReview = reviewRepository.save(review);

        updateProductRating(product);

        return ReviewResponse.from(savedReview);
    }

    @Transactional
    public ReviewResponse updateReview(Long userId, Long reviewId, ReviewUpdateRequest request) {
        User user = getUserById(userId);
        Review review = getReviewById(reviewId);

        if(!review.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("본인의 리뷰만 수정할 수 있습니다.");
        }

        if(request.getRating() != null) {
            review.setRating(request.getRating());
        }
        if(request.getContent() != null) {
            review.setContent(request.getContent());
        }
        if(request.getImageUrls() != null) {
            review.setImageUrls(request.getImageUrls());
        }

        updateProductRating(review.getProduct());

        return ReviewResponse.from(review);
    }

    @Transactional
    public void deleteReview(Long userId, Long reviewId) {
        User user = getUserById(userId);
        Review review = getReviewById(reviewId);

        if(review.getUser().getId().equals(userId)){
            throw new IllegalArgumentException("본인의 리뷰만 삭제할 수 있습니다.");
        }

        Product product = review.getProduct();
        reviewRepository.delete(review);

        updateProductRating(product);
    }

    public Page<ReviewResponse> getProductReviews(Long userId, Long productId, String sort, Pageable pageable) {
        Product product = getProductById(productId);

        Page<Review> reviews = switch(sort) {
            case "helpful" -> reviewRepository.findByProductOrderByHelpfulCountDesc(product, pageable);
            case "rating_high" -> reviewRepository.findByProductOrderByRatingDescCreatedAtDesc(product, pageable);
            case "rating_low" -> reviewRepository.findByProductOrderByRatingAscCreatedAtDesc(product, pageable);
            case "photo" -> reviewRepository.findPhotoReviewsByProduct(product, pageable);
            default -> reviewRepository.findByProductOrderByCreatedAtDesc(product, pageable);
        };

        return reviews.map(review -> {
            String myVote = null;
            if(userId != null) {
                User user = userRepository.findById(userId).orElse(null);
                if(user != null) {
                    Optional<ReviewHelpful> helpful = reviewHelpfulRepository.findByUserAndReview(user, review);
                    myVote = helpful.map(h -> h.getType().name()).orElse(null);
                }
            }
            return ReviewResponse.from(review, myVote);
        });
    }

    public Page<ReviewResponse> getMyReviews(Long userId, Pageable pageable) {
        User user = getUserById(userId);

        Page<Review> reviews = reviewRepository.findByUser(user, pageable);
        return reviews.map(ReviewResponse::from);
    }

    public ReviewSummaryResponse getReviewSummary(Long productId) {
        Product product = getProductById(productId);

        Double averageRating = reviewRepository.calculateAverageRating(product);
        long totalReviews = reviewRepository.countByProduct(product);

        Map<Integer, Long> ratingDistribution = new HashMap<>();
        for (int i = 1; i <= 5; i++) {
            long count = reviewRepository.findByProductAndRating(product, i, Pageable.unpaged()).getTotalElements();
            ratingDistribution.put(i, count);
        }

        long photoReviewCount = reviewRepository.findPhotoReviewsByProduct(product, Pageable.unpaged()).getTotalElements();

        return ReviewSummaryResponse.builder()
                .productId(productId)
                .averageRating(averageRating != null ? averageRating : 0.0)
                .totalReviews(totalReviews)
                .ratingDistribution(ratingDistribution)
                .photoReviewCount(photoReviewCount)
                .build();
    }

    @Transactional
    public ReviewResponse voteReviewHelpful(Long userId, Long reviewId, ReviewHelpfulRequest request) {
        User user = getUserById(userId);
        Review review = getReviewById(reviewId);

        if(review.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("본인의 리뷰에는 투표할 수 없습니다.");
        }

        Optional<ReviewHelpful> existingVote = reviewHelpfulRepository.findByUserAndReview(user, review);

        if(existingVote.isPresent()) {
            ReviewHelpful vote = existingVote.get();

            if(vote.getType() == request.getType()) {
                if(vote.getType() == ReviewHelpful.HelpfulType.HELPFUL) {
                    review.decreaseHelpfulCount();
                }else {
                    review.decreaseUnhelpfulCount();
                }
                reviewHelpfulRepository.delete(vote);
            } else {
                if(vote.getType() == ReviewHelpful.HelpfulType.HELPFUL) {
                    review.decreaseHelpfulCount();
                    review.increaseUnhelpfulCount();
                } else {
                    review.decreaseUnhelpfulCount();
                    review.increaseHelpfulCount();
                }
                vote.setType(request.getType());
            }
        } else {
            ReviewHelpful newVote = ReviewHelpful.builder()
                    .user(user)
                    .review(review)
                    .type(request.getType())
                    .build();
            reviewHelpfulRepository.save(newVote);

            if(request.getType() == ReviewHelpful.HelpfulType.HELPFUL) {
                review.increaseHelpfulCount();
            } else {
                review.increaseUnhelpfulCount();
            }
        }

        Optional<ReviewHelpful> currentVote = reviewHelpfulRepository.findByUserAndReview(user, review);
        String myVote = currentVote.map(v -> v.getType().name()).orElse(null);

        return ReviewResponse.from(review, myVote);
    }

    private void updateProductRating(Product product) {
        Double averageRating = reviewRepository.calculateAverageRating(product);
        long reviewCount = reviewRepository.countByProduct(product);

        product.updateRating(
                averageRating != null ? averageRating : 0.0,
                (int) reviewCount
        );
    }

}
