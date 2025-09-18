package com.petmily.backend.api.product.service;

import com.petmily.backend.api.exception.CustomException;
import com.petmily.backend.api.exception.ErrorCode;
import com.petmily.backend.api.product.dto.*;
import com.petmily.backend.domain.product.entity.Product;
import com.petmily.backend.domain.product.repository.ProductRepository;
import com.petmily.backend.domain.product.repository.CategoryRepository;
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
}