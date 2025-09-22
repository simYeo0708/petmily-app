package com.petmily.backend.api.product.service;

import com.petmily.backend.api.product.dto.*;
import com.petmily.backend.domain.product.entity.Category;
import com.petmily.backend.domain.product.repository.CategoryRepository;
import com.petmily.backend.domain.product.entity.Product;
import com.petmily.backend.domain.product.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private ProductService productService;

    private Product mockProduct;
    private Category mockCategory;

    @BeforeEach
    void setUp() {
        mockCategory = Category.builder()
                .id(1L)
                .name("사료")
                .description("반려동물 사료 카테고리")
                .isActive(true)
                .build();

        mockProduct = Product.builder()
                .id(1L)
                .name("프리미엄 강아지 사료")
                .description("고품질 강아지 사료입니다")
                .price(25000.0)
                .stock(100)
                .brand("펫밀리")
                .categoryId(1L)
                .isActive(true)
                .build();
    }

    @Test
    void getAllProducts_Success() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<Product> productPage = new PageImpl<>(Arrays.asList(mockProduct), pageable, 1);
        
        when(productRepository.findByIsActiveTrueOrderByCreateTimeDesc(any(Pageable.class)))
                .thenReturn(productPage);
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(mockCategory));

        // When
        ProductSearchRequest emptyRequest = new ProductSearchRequest();
        ProductListResponse result = productService.getProducts(emptyRequest, pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getProducts()).hasSize(1);
        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getCurrentPage()).isEqualTo(0);
    }

    @Test
    void getProduct_Success() {
        // Given
        when(productRepository.findById(1L)).thenReturn(Optional.of(mockProduct));
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(mockCategory));

        // When
        ProductDetailResponse result = productService.getProduct(1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getName()).isEqualTo("프리미엄 강아지 사료");
        assertThat(result.getPrice()).isEqualTo(BigDecimal.valueOf(25000));
        assertThat(result.getBrand()).isEqualTo("펫밀리");
    }

    @Test
    void getProduct_NotFound() {
        // Given
        when(productRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> productService.getProduct(1L))
                .isInstanceOf(RuntimeException.class);
    }

    @Test
    void searchProducts_Success() {
        // Given
        ProductSearchRequest searchRequest = new ProductSearchRequest();
        searchRequest.setKeyword("강아지");
        searchRequest.setCategoryId(1L);
        searchRequest.setMinPrice(10000.0);
        searchRequest.setMaxPrice(50000.0);

        Pageable pageable = PageRequest.of(0, 10);
        Page<Product> productPage = new PageImpl<>(Arrays.asList(mockProduct), pageable, 1);
        
        when(productRepository.searchWithFilters(
                eq(1L), eq("강아지"), any(), 
                eq(10000.0), eq(50000.0), 
                any(Pageable.class))).thenReturn(productPage);
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(mockCategory));

        // When
        ProductListResponse result = productService.searchProducts(searchRequest, pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getProducts()).hasSize(1);
        assertThat(result.getProducts().get(0).getName()).contains("강아지");
    }

    @Test
    void getProductsByCategory_Success() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<Product> productPage = new PageImpl<>(Arrays.asList(mockProduct), pageable, 1);
        
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(mockCategory));
        when(productRepository.findByCategoryIdAndIsActiveTrue(eq(1L), any(Pageable.class)))
                .thenReturn(productPage);

        // When
        ProductListResponse result = productService.getProductsByCategory(1L, pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getProducts()).hasSize(1);
        assertThat(result.getProducts().get(0).getCategoryName()).isNotNull();
    }

    @Test
    void updateStock_Success() {
        // Given
        when(productRepository.findById(1L)).thenReturn(Optional.of(mockProduct));

        // When
        productService.updateStock(1L, 50);

        // Then
        assertThat(mockProduct.getStock()).isEqualTo(50);
        verify(productRepository).save(mockProduct);
    }

    @Test
    void updateStock_InsufficientStock() {
        // Given
        when(productRepository.findById(1L)).thenReturn(Optional.of(mockProduct));

        // When & Then
        assertThatThrownBy(() -> productService.updateStock(1L, -10))
                .isInstanceOf(RuntimeException.class);
    }
}