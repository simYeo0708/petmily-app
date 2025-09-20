package com.petmily.backend.api.product.service;

import com.petmily.backend.api.exception.CustomException;
import com.petmily.backend.api.exception.ErrorCode;
import com.petmily.backend.api.order.dto.ReviewDetailResponse;
import com.petmily.backend.api.order.dto.ReviewListResponse;
import com.petmily.backend.api.product.dto.*;
import com.petmily.backend.domain.order.entity.Review;
import com.petmily.backend.domain.order.repository.ReviewRepository;
import com.petmily.backend.domain.order.repository.ReviewHelpfulRepository;
import com.petmily.backend.domain.product.entity.Product;
import com.petmily.backend.domain.product.repository.ProductRepository;
import com.petmily.backend.domain.product.repository.CategoryRepository;
import com.petmily.backend.domain.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ReviewRepository reviewRepository;
    private final ReviewHelpfulRepository reviewHelpfulRepository;

    public ProductListResponse getProducts(ProductSearchRequest searchRequest, Pageable pageable) {
        Page<Product> productPage;
        
        // 검색 조건에 따른 상품 조회
        if (hasSearchConditions(searchRequest)) {
            productPage = productRepository.searchWithFilters(
                searchRequest.getCategoryId(),
                searchRequest.getKeyword(),
                searchRequest.getBrand(),
                searchRequest.getMinPrice(),
                searchRequest.getMaxPrice(),
                pageable
            );
        } else {
            productPage = productRepository.findByIsActiveTrueOrderByCreateTimeDesc(pageable);
        }
        
        return buildProductListResponse(productPage);
    }

    public ProductDetailResponse getProduct(Long id) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new CustomException(ErrorCode.PRODUCT_NOT_FOUND));
        
        if (!product.getIsActive()) {
            throw new CustomException(ErrorCode.PRODUCT_INACTIVE);
        }
        
        return convertToDetailResponse(product);
    }

    public ProductListResponse getProductsByCategory(Long categoryId, Pageable pageable) {
        // 카테고리 존재 여부 확인
        if (!categoryRepository.existsById(categoryId)) {
            throw new CustomException(ErrorCode.CATEGORY_NOT_FOUND);
        }
        
        Page<Product> productPage = productRepository.findByCategoryIdAndIsActiveTrue(categoryId, pageable);
        return buildProductListResponse(productPage);
    }

    public ProductListResponse searchProducts(ProductSearchRequest searchRequest, Pageable pageable) {
        if (!StringUtils.hasText(searchRequest.getKeyword())) {
            throw new CustomException(ErrorCode.INVALID_REQUEST);
        }
        
        Page<Product> productPage = productRepository.searchByKeyword(searchRequest.getKeyword(), pageable);
        return buildProductListResponse(productPage);
    }

    @Transactional
    public ProductDetailResponse createProduct(ProductCreateRequest request) {
        // 카테고리 존재 여부 확인
        if (!categoryRepository.existsById(request.getCategoryId())) {
            throw new CustomException(ErrorCode.CATEGORY_NOT_FOUND);
        }
        
        Product product = Product.builder()
            .name(request.getName())
            .description(request.getDescription())
            .price(request.getPrice())
            .imageUrl(request.getImageUrl())
            .brand(request.getBrand())
            .weight(request.getWeight())
            .dimensions(request.getDimensions())
            .stock(request.getStock())
            .categoryId(request.getCategoryId())
            .discountRate(request.getDiscountRate())
            .isActive(request.getIsActive())
            .ratingAverage(0.0)
            .reviewCount(0)
            .build();
        
        Product savedProduct = productRepository.save(product);
        return convertToDetailResponse(savedProduct);
    }

    @Transactional
    public ProductDetailResponse updateProduct(Long id, ProductUpdateRequest request) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new CustomException(ErrorCode.PRODUCT_NOT_FOUND));
        
        // 카테고리 존재 여부 확인
        if (!categoryRepository.existsById(request.getCategoryId())) {
            throw new CustomException(ErrorCode.CATEGORY_NOT_FOUND);
        }
        
        product.updateProduct(
            request.getName(),
            request.getDescription(),
            request.getPrice(),
            request.getImageUrl(),
            request.getBrand(),
            request.getWeight(),
            request.getDimensions(),
            request.getStock(),
            request.getCategoryId(),
            request.getDiscountRate(),
            request.getIsActive()
        );
        
        return convertToDetailResponse(product);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new CustomException(ErrorCode.PRODUCT_NOT_FOUND));
        
        // 소프트 삭제 (비활성화)
        product.deactivate();
    }

    @Transactional
    public void updateStock(Long productId, Integer quantity) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new CustomException(ErrorCode.PRODUCT_NOT_FOUND));
        
        if (product.getStock() < quantity) {
            throw new CustomException(ErrorCode.INSUFFICIENT_STOCK);
        }
        
        int updatedRows = productRepository.decreaseStock(productId, quantity);
        if (updatedRows == 0) {
            throw new CustomException(ErrorCode.INSUFFICIENT_STOCK);
        }
    }
    
    // Helper methods
    private boolean hasSearchConditions(ProductSearchRequest searchRequest) {
        return searchRequest.getCategoryId() != null ||
               StringUtils.hasText(searchRequest.getKeyword()) ||
               StringUtils.hasText(searchRequest.getBrand()) ||
               searchRequest.getMinPrice() != null ||
               searchRequest.getMaxPrice() != null;
    }
    
    private ProductListResponse buildProductListResponse(Page<Product> productPage) {
        List<ProductSummary> productSummaries = productPage.getContent().stream()
            .map(this::convertToSummary)
            .collect(Collectors.toList());
        
        return new ProductListResponse(
            productSummaries,
            productPage.getNumber(),
            productPage.getTotalPages(),
            productPage.getTotalElements(),
            productPage.hasNext(),
            productPage.hasPrevious()
        );
    }
    
    private ProductSummary convertToSummary(Product product) {
        return new ProductSummary(
            product.getId(),
            product.getName(),
            product.getPrice(),
            product.getImageUrl(),
            product.getBrand(),
            product.getDiscountRate(),
            product.getRatingAverage(),
            product.getReviewCount(),
            product.getStock(),
            product.getCategory() != null ? product.getCategory().getName() : null
        );
    }
    
    private ProductDetailResponse convertToDetailResponse(Product product) {
        ProductDetailResponse.CategoryInfo categoryInfo = null;
        if (product.getCategory() != null) {
            categoryInfo = new ProductDetailResponse.CategoryInfo(
                product.getCategory().getId(),
                product.getCategory().getName(),
                product.getCategory().getDescription()
            );
        }
        
        return new ProductDetailResponse(
            product.getId(),
            product.getName(),
            product.getDescription(),
            product.getPrice(),
            product.getImageUrl(),
            product.getBrand(),
            product.getWeight(),
            product.getDimensions(),
            product.getStock(),
            product.getDiscountRate(),
            product.getRatingAverage(),
            product.getReviewCount(),
            product.getIsActive(),
            categoryInfo,
            product.getCreateTime(),
            product.getUpdateTime()
        );
    }

    // ==================== 리뷰 조회 관련 메소드 ====================

    public ReviewListResponse getProductReviews(Long productId, Long currentUserId, Pageable pageable) {
        // 상품 존재 확인
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new CustomException(ErrorCode.PRODUCT_NOT_FOUND));
        
        Page<Review> reviewPage = reviewRepository.findByProductIdOrderByCreateTimeDesc(productId, pageable);
        
        List<ReviewDetailResponse> reviewResponses = reviewPage.getContent().stream()
            .map(review -> convertToReviewDetailResponse(review, currentUserId))
            .collect(Collectors.toList());
        
        // 리뷰 통계 생성
        ReviewListResponse.ReviewStats reviewStats = buildReviewStats(productId);
        
        return ReviewListResponse.builder()
            .reviews(reviewResponses)
            .totalElements(reviewPage.getTotalElements())
            .totalPages(reviewPage.getTotalPages())
            .currentPage(reviewPage.getNumber())
            .hasNext(reviewPage.hasNext())
            .hasPrevious(reviewPage.hasPrevious())
            .reviewStats(reviewStats)
            .build();
    }

    public ReviewListResponse getProductReviewsByRating(Long productId, Integer rating, Long currentUserId, Pageable pageable) {
        // 상품 존재 확인
        productRepository.findById(productId)
            .orElseThrow(() -> new CustomException(ErrorCode.PRODUCT_NOT_FOUND));
        
        Page<Review> reviewPage = reviewRepository.findByProductIdAndRatingOrderByCreateTimeDesc(productId, rating, pageable);
        
        List<ReviewDetailResponse> reviewResponses = reviewPage.getContent().stream()
            .map(review -> convertToReviewDetailResponse(review, currentUserId))
            .collect(Collectors.toList());
        
        return ReviewListResponse.builder()
            .reviews(reviewResponses)
            .totalElements(reviewPage.getTotalElements())
            .totalPages(reviewPage.getTotalPages())
            .currentPage(reviewPage.getNumber())
            .hasNext(reviewPage.hasNext())
            .hasPrevious(reviewPage.hasPrevious())
            .build();
    }

    public ReviewListResponse getProductReviewsWithImages(Long productId, Long currentUserId, Pageable pageable) {
        // 상품 존재 확인
        productRepository.findById(productId)
            .orElseThrow(() -> new CustomException(ErrorCode.PRODUCT_NOT_FOUND));
        
        Page<Review> reviewPage = reviewRepository.findByProductIdWithImagesOrderByCreateTimeDesc(productId, pageable);
        
        List<ReviewDetailResponse> reviewResponses = reviewPage.getContent().stream()
            .map(review -> convertToReviewDetailResponse(review, currentUserId))
            .collect(Collectors.toList());
        
        return ReviewListResponse.builder()
            .reviews(reviewResponses)
            .totalElements(reviewPage.getTotalElements())
            .totalPages(reviewPage.getTotalPages())
            .currentPage(reviewPage.getNumber())
            .hasNext(reviewPage.hasNext())
            .hasPrevious(reviewPage.hasPrevious())
            .build();
    }

    public ReviewListResponse getProductReviewsByHelpful(Long productId, Long currentUserId, Pageable pageable) {
        // 상품 존재 확인
        productRepository.findById(productId)
            .orElseThrow(() -> new CustomException(ErrorCode.PRODUCT_NOT_FOUND));
        
        Page<Review> reviewPage = reviewRepository.findByProductIdOrderByHelpfulCountDesc(productId, pageable);
        
        List<ReviewDetailResponse> reviewResponses = reviewPage.getContent().stream()
            .map(review -> convertToReviewDetailResponse(review, currentUserId))
            .collect(Collectors.toList());
        
        return ReviewListResponse.builder()
            .reviews(reviewResponses)
            .totalElements(reviewPage.getTotalElements())
            .totalPages(reviewPage.getTotalPages())
            .currentPage(reviewPage.getNumber())
            .hasNext(reviewPage.hasNext())
            .hasPrevious(reviewPage.hasPrevious())
            .build();
    }

    public ProductReviewStatsResponse getProductReviewStats(Long productId) {
        // 상품 존재 확인
        productRepository.findById(productId)
            .orElseThrow(() -> new CustomException(ErrorCode.PRODUCT_NOT_FOUND));
        
        // 평점 통계
        Object[] ratingStats = reviewRepository.getProductRatingStats(productId);
        Double averageRating = ratingStats[0] != null ? (Double) ratingStats[0] : 0.0;
        Long totalReviewCount = ratingStats[1] != null ? (Long) ratingStats[1] : 0L;
        
        // 평점별 분포
        List<Object[]> ratingDistributionData = reviewRepository.getProductRatingDistribution(productId);
        ProductReviewStatsResponse.RatingDistribution ratingDistribution = buildRatingDistribution(ratingDistributionData);
        
        return ProductReviewStatsResponse.builder()
            .productId(productId)
            .averageRating(averageRating)
            .totalReviewCount(totalReviewCount)
            .ratingDistribution(ratingDistribution)
            .build();
    }

    private ReviewListResponse.ReviewStats buildReviewStats(Long productId) {
        // 평점 통계
        Object[] ratingStats = reviewRepository.getProductRatingStats(productId);
        Double averageRating = ratingStats[0] != null ? (Double) ratingStats[0] : 0.0;
        Long totalReviewCount = ratingStats[1] != null ? (Long) ratingStats[1] : 0L;
        
        // 평점별 분포
        List<Object[]> ratingDistributionData = reviewRepository.getProductRatingDistribution(productId);
        ReviewListResponse.RatingDistribution ratingDistribution = buildRatingDistributionForList(ratingDistributionData);
        
        return ReviewListResponse.ReviewStats.builder()
            .averageRating(averageRating)
            .totalReviewCount(totalReviewCount)
            .ratingDistribution(ratingDistribution)
            .build();
    }

    private ReviewListResponse.RatingDistribution buildRatingDistributionForList(List<Object[]> ratingDistributionData) {
        Long[] ratings = new Long[5]; // 1~5점
        for (int i = 0; i < 5; i++) {
            ratings[i] = 0L;
        }
        
        for (Object[] data : ratingDistributionData) {
            Integer rating = (Integer) data[0];
            Long count = (Long) data[1];
            if (rating >= 1 && rating <= 5) {
                ratings[rating - 1] = count;
            }
        }
        
        return ReviewListResponse.RatingDistribution.builder()
            .fiveStars(ratings[4])
            .fourStars(ratings[3])
            .threeStars(ratings[2])
            .twoStars(ratings[1])
            .oneStars(ratings[0])
            .build();
    }

    private ProductReviewStatsResponse.RatingDistribution buildRatingDistribution(List<Object[]> ratingDistributionData) {
        Long[] ratings = new Long[5]; // 1~5점
        for (int i = 0; i < 5; i++) {
            ratings[i] = 0L;
        }
        
        for (Object[] data : ratingDistributionData) {
            Integer rating = (Integer) data[0];
            Long count = (Long) data[1];
            if (rating >= 1 && rating <= 5) {
                ratings[rating - 1] = count;
            }
        }
        
        return ProductReviewStatsResponse.RatingDistribution.builder()
            .fiveStars(ratings[4])
            .fourStars(ratings[3])
            .threeStars(ratings[2])
            .twoStars(ratings[1])
            .oneStars(ratings[0])
            .build();
    }

    private ReviewDetailResponse convertToReviewDetailResponse(Review review, Long currentUserId) {
        // 현재 사용자가 도움이 됨을 눌렀는지 확인
        Boolean isHelpful = null;
        if (currentUserId != null) {
            isHelpful = reviewHelpfulRepository.findByReviewIdAndUserId(review.getId(), currentUserId).isPresent();
        }
        
        return ReviewDetailResponse.builder()
            .id(review.getId())
            .orderId(review.getOrderId())
            .orderItemId(review.getOrderItemId())
            .productId(review.getProductId())
            .userId(review.getUserId())
            .rating(review.getRating())
            .content(review.getContent())
            .imageUrls(review.getImageUrls())
            .isAnonymous(review.getIsAnonymous())
            .helpfulCount(review.getHelpfulCount())
            .adminReply(review.getAdminReply())
            .adminReplyDate(review.getAdminReplyDate())
            .createTime(review.getCreateTime())
            .updateTime(review.getUpdateTime())
            .productInfo(buildProductInfoForReview(review.getProduct()))
            .reviewerInfo(buildReviewerInfo(review.getUser(), review.getIsAnonymous()))
            .isHelpful(isHelpful)
            .build();
    }

    private ReviewDetailResponse.ProductInfo buildProductInfoForReview(Product product) {
        if (product == null) return null;
        
        return ReviewDetailResponse.ProductInfo.builder()
            .productId(product.getId())
            .productName(product.getName())
            .productImage(product.getImageUrl())
            .brand(product.getBrand())
            .build();
    }

    private ReviewDetailResponse.ReviewerInfo buildReviewerInfo(User user, Boolean isAnonymous) {
        if (user == null) return null;
        
        // 익명 리뷰인 경우 사용자 정보 마스킹
        if (isAnonymous != null && isAnonymous) {
            return ReviewDetailResponse.ReviewerInfo.builder()
                .userId(null)
                .username("익명")
                .profileImage(null)
                .isAnonymous(true)
                .totalReviewCount(null)
                .build();
        }
        
        // 사용자 리뷰 개수 조회
        long totalReviewCount = reviewRepository.countByUserId(user.getId());
        
        return ReviewDetailResponse.ReviewerInfo.builder()
            .userId(user.getId())
            .username(user.getName())
            .profileImage(user.getProfileImageUrl())
            .isAnonymous(false)
            .totalReviewCount(totalReviewCount)
            .build();
    }
}