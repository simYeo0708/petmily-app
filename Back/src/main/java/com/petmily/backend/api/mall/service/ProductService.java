package com.petmily.backend.api.mall.service;

import com.petmily.backend.api.exception.CustomException;
import com.petmily.backend.api.exception.ErrorCode;
import com.petmily.backend.api.mall.dto.product.request.ProductCreateRequest;
import com.petmily.backend.api.mall.dto.product.request.ProductUpdateRequest;
import com.petmily.backend.api.mall.dto.product.response.ProductLikeResponse;
import com.petmily.backend.api.mall.dto.product.response.ProductResponse;
import com.petmily.backend.domain.mall.product.entity.Product;
import com.petmily.backend.domain.mall.product.entity.ProductCategory;
import com.petmily.backend.domain.mall.product.entity.ProductLike;
import com.petmily.backend.domain.mall.product.entity.ProductStatus;
import com.petmily.backend.domain.mall.product.entity.ProductViewHistory;
import com.petmily.backend.domain.mall.product.repository.ProductLikeRepository;
import com.petmily.backend.domain.mall.product.repository.ProductRepository;
import com.petmily.backend.domain.mall.product.repository.ProductViewHistoryRepository;
import com.petmily.backend.domain.user.entity.User;
import com.petmily.backend.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductLikeRepository productLikeRepository;
    private final ProductViewHistoryRepository productViewHistoryRepository;
    private final UserRepository userRepository;
    
    private static final int MAX_VIEW_HISTORY_COUNT = 100; // 최대 조회 이력 개수

    private User findUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
    }

    private Product findProductById(Long productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new CustomException(ErrorCode.PRODUCT_NOT_FOUND));
    }

    // 상품 등록
    @Transactional
    public ProductResponse createProduct(Long userId, ProductCreateRequest request) {
        User seller = findUserById(userId);

        if(!isSeller(seller)){
            throw new IllegalArgumentException("판매자 권한이 없습니다.");
        }

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .stockQuantity(request.getStockQuantity())
                .category(request.getCategory())
                .status(request.getStockQuantity() > 0 ? ProductStatus.ACTIVE : ProductStatus.OUT_OF_STOCK)
                .seller(seller)
                .imageUrls(request.getImageUrls())
                .build();

        Product savedProduct = productRepository.save(product);
        return ProductResponse.from(savedProduct);
    }

    // 상품 수정
    @Transactional
    public ProductResponse updateProduct(Long userId, Long productId, ProductUpdateRequest request) {
        User user = findUserById(userId);
        Product product = findProductById(productId);

        if(!isOwnerOrAdmin(user, product)) {
            throw new IllegalArgumentException("상품을 수정할 권한이 없습니다.");
        }

        if(request.getName() != null) {
            product.setName(request.getName());
        }
        if(request.getDescription() != null) {
            product.setDescription(request.getDescription());
        }
        if(request.getPrice() != null) {
            product.setPrice(request.getPrice());
        }
        if(request.getStockQuantity() != null) {
            product.setStockQuantity(request.getStockQuantity());
            if(request.getStockQuantity() == 0) {
                product.setStatus(ProductStatus.OUT_OF_STOCK);
            } else if(product.getStatus() == ProductStatus.OUT_OF_STOCK) {
                product.setStatus(ProductStatus.ACTIVE);
            }
        }
        if(request.getCategory() != null) {
            product.setCategory(request.getCategory());
        }
        if(request.getStatus() != null) {
            product.setStatus(request.getStatus());
        }
        if(request.getImageUrls() != null) {
            product.setImageUrls(request.getImageUrls());
        }

        return ProductResponse.from(product);
    }

    // 상품 삭제
    @Transactional
    public void deleteProduct(Long userId, Long productId) {
        User user = findUserById(userId);
        Product product = findProductById(productId);

        if(!isOwnerOrAdmin(user, product)) {
            throw new IllegalArgumentException("상품을 삭제할 권한이 없습니다.");
        }

        productRepository.delete(product);
    }

    // 상품 상세 조회
    @Transactional
    public ProductResponse getProduct(Long userId, Long productId) {
        Product product = findProductById(productId);

        product.increaseViewCount();

        boolean isLiked = false;
        if(userId != null) {
            User user = userRepository.findById(userId).orElse(null);
            if(user != null) {
                isLiked = productLikeRepository.existsByUserAndProduct(user, product);
                // 조회 이력 저장
                saveProductViewHistory(user, product);
            }
        }

        return ProductResponse.from(product, isLiked);
    }
    
    // 상품 조회 이력 저장
    @Transactional
    public void saveProductViewHistory(User user, Product product) {
        Optional<ProductViewHistory> existingHistory = 
            productViewHistoryRepository.findByUserAndProduct(user, product);
        
        if (existingHistory.isPresent()) {
            // 기존 이력이 있으면 조회 횟수 증가 및 업데이트 시간 갱신
            ProductViewHistory history = existingHistory.get();
            history.incrementViewCount();
            productViewHistoryRepository.save(history);
        } else {
            // 새 이력 생성
            ProductViewHistory newHistory = ProductViewHistory.builder()
                    .user(user)
                    .product(product)
                    .viewCount(1)
                    .build();
            productViewHistoryRepository.save(newHistory);
        }
        
        // 최대치 초과 시 오래된 이력 삭제
        List<ProductViewHistory> allHistories = 
            productViewHistoryRepository.findAllByUserOrderByUpdatedAtDesc(user, 
                org.springframework.data.domain.PageRequest.of(0, MAX_VIEW_HISTORY_COUNT + 1));
        
        if (allHistories.size() > MAX_VIEW_HISTORY_COUNT) {
            List<ProductViewHistory> toDelete = allHistories.subList(MAX_VIEW_HISTORY_COUNT, allHistories.size());
            productViewHistoryRepository.deleteAll(toDelete);
        }
    }

    // 상품 목록 조회 (카테고리, 검색, 정렬)
    public Page<ProductResponse> getProducts(ProductCategory category, String keyword, String sort, Pageable pageable){
        Page<Product> products;

        if(keyword != null && !keyword.trim().isEmpty()) {
            products = productRepository.searchByKeyword(keyword, ProductStatus.ACTIVE, pageable);
        } else if (category != null) {
            products = productRepository.findByCategoryAndStatus(category, ProductStatus.ACTIVE, pageable);
        } else {
            products = switch (sort) {
                case "popular" -> productRepository.findByStatusOrderByLikeCountDesc(ProductStatus.ACTIVE, pageable);
                case "rating" -> productRepository.findByStatusOrderByAverageRatingDesc(ProductStatus.ACTIVE, pageable);
                case "sales" -> productRepository.findByStatusOrderBySalesCountDesc(ProductStatus.ACTIVE, pageable);
                default -> productRepository.findByStatusOrderByCreatedAtDesc(ProductStatus.ACTIVE, pageable);
            };
        }

        return products.map(ProductResponse::from);
    }

    // 판매자의 상품 목록 조회
    public Page<ProductResponse> getProductsBySeller(Long sellerId, Pageable pageable) {
        User seller = findUserById(sellerId);
        Page<Product> products = productRepository.findBySeller(seller, pageable);
        return products.map(ProductResponse::from);
    }

    // 내 상품 목록 조회 (판매자용)
    public Page<ProductResponse> getMyProducts(Long userId, Pageable pageable) {
        User seller = findUserById(userId);
        Page<Product> products = productRepository.findBySeller(seller, pageable);
        return products.map(ProductResponse::from);
    }

    // 상품 좋아요 토글
    @Transactional
    public ProductLikeResponse toggleProductLike(Long userId, Long productId) {
        User user = findUserById(userId);
        Product product = findProductById(productId);

        Optional<ProductLike> existingLike = productLikeRepository.findByUserAndProduct(user, product);

        boolean isLiked;
        if(existingLike.isPresent()) {
            productLikeRepository.delete(existingLike.get());
            product.decreaseLikeCount();
            isLiked = false;
        } else {
            ProductLike newLike = ProductLike.builder()
                    .user(user)
                    .product(product)
                    .build();
            productLikeRepository.save(newLike);
            product.increaseLikeCount();
            isLiked = true;
        }

        return ProductLikeResponse.builder()
                .isLiked(isLiked)
                .likeCount(product.getLikeCount())
                .build();
    }

    public Page<ProductResponse> getLikedProducts(Long userId, Pageable pageable) {
        User user = findUserById(userId);
        Page<ProductLike> productLikes = productLikeRepository.findByUser(user, pageable);
        return productLikes.map(like -> ProductResponse.from(like.getProduct(), true));
    }

    private boolean isSeller(User user) {
        return user.getRole().name().equals("SELLER") || user.getRole().name().equals("ADMIN");
    }

    private boolean isOwnerOrAdmin(User user, Product product) {
        return product.getSeller().getId().equals(user.getId()) || user.getRole().name().equals("ADMIN");
    }

}
