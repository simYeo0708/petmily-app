package com.petmily.backend.api.category.service;

import com.petmily.backend.api.category.dto.*;
import com.petmily.backend.api.exception.CustomException;
import com.petmily.backend.api.exception.ErrorCode;
import com.petmily.backend.domain.product.entity.Category;
import com.petmily.backend.domain.product.repository.CategoryRepository;
import com.petmily.backend.domain.product.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private CategoryService categoryService;

    private Category parentCategory;
    private Category childCategory;
    private CategoryCreateRequest createRequest;
    private CategoryUpdateRequest updateRequest;

    @BeforeEach
    void setUp() {
        parentCategory = Category.builder()
                .id(1L)
                .name("Electronics")
                .description("Electronic devices")
                .imageUrl("http://example.com/electronics.jpg")
                .iconUrl("http://example.com/electronics-icon.png")
                .parentId(null)
                .sortOrder(1)
                .isActive(true)
                .build();

        childCategory = Category.builder()
                .id(2L)
                .name("Smartphones")
                .description("Mobile phones")
                .imageUrl("http://example.com/phones.jpg")
                .iconUrl("http://example.com/phones-icon.png")
                .parentId(1L)
                .sortOrder(1)
                .isActive(true)
                .build();

        createRequest = CategoryCreateRequest.builder()
                .name("New Category")
                .description("New category description")
                .imageUrl("http://example.com/new.jpg")
                .iconUrl("http://example.com/new-icon.png")
                .parentId(null)
                .sortOrder(1)
                .isActive(true)
                .build();

        updateRequest = CategoryUpdateRequest.builder()
                .name("Updated Category")
                .description("Updated description")
                .imageUrl("http://example.com/updated.jpg")
                .iconUrl("http://example.com/updated-icon.png")
                .parentId(null)
                .sortOrder(2)
                .isActive(true)
                .build();
    }

    @Test
    @DisplayName("카테고리 목록 조회 성공")
    void getCategories_Success() {
        // Given
        List<Category> categories = Arrays.asList(parentCategory);
        when(categoryRepository.findByParentIdIsNullAndIsActiveTrueOrderBySortOrderAsc())
                .thenReturn(categories);
        when(categoryRepository.findByParentIdAndIsActiveTrueOrderBySortOrderAsc(1L))
                .thenReturn(Arrays.asList(childCategory));
        when(productRepository.countByCategoryIdAndIsActiveTrue(anyLong())).thenReturn(5L);

        // When
        CategoryListResponse response = categoryService.getCategories();

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getCategories()).hasSize(1);
        assertThat(response.getTotalCount()).isEqualTo(1);

        CategorySummary categorySummary = response.getCategories().get(0);
        assertThat(categorySummary.getId()).isEqualTo(1L);
        assertThat(categorySummary.getName()).isEqualTo("Electronics");
        assertThat(categorySummary.getChildren()).hasSize(1);
        assertThat(categorySummary.getProductCount()).isEqualTo(5);

        verify(categoryRepository).findByParentIdIsNullAndIsActiveTrueOrderBySortOrderAsc();
        verify(categoryRepository).findByParentIdAndIsActiveTrueOrderBySortOrderAsc(1L);
    }

    @Test
    @DisplayName("카테고리 목록 조회 - 빈 결과")
    void getCategories_EmptyResult() {
        // Given
        when(categoryRepository.findByParentIdIsNullAndIsActiveTrueOrderBySortOrderAsc())
                .thenReturn(Collections.emptyList());

        // When
        CategoryListResponse response = categoryService.getCategories();

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getCategories()).isEmpty();
        assertThat(response.getTotalCount()).isEqualTo(0);
    }

    @Test
    @DisplayName("카테고리 상세 조회 성공")
    void getCategory_Success() {
        // Given
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(parentCategory));

        // When
        CategoryDetailResponse response = categoryService.getCategory(1L);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getName()).isEqualTo("Electronics");
        assertThat(response.getIsActive()).isTrue();

        verify(categoryRepository).findById(1L);
    }

    @Test
    @DisplayName("카테고리 상세 조회 실패 - 존재하지 않는 카테고리")
    void getCategory_NotFound() {
        // Given
        when(categoryRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> categoryService.getCategory(999L))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.CATEGORY_NOT_FOUND);

        verify(categoryRepository).findById(999L);
    }

    @Test
    @DisplayName("카테고리 상세 조회 실패 - 비활성 카테고리")
    void getCategory_Inactive() {
        // Given
        Category inactiveCategory = Category.builder()
                .id(1L)
                .name("Inactive Category")
                .isActive(false)
                .build();
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(inactiveCategory));

        // When & Then
        assertThatThrownBy(() -> categoryService.getCategory(1L))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.CATEGORY_INACTIVE);

        verify(categoryRepository).findById(1L);
    }

    @Test
    @DisplayName("하위 카테고리 조회 성공")
    void getCategoryChildren_Success() {
        // Given
        when(categoryRepository.existsById(1L)).thenReturn(true);
        when(categoryRepository.findByParentIdAndIsActiveTrueOrderBySortOrderAsc(1L))
                .thenReturn(Arrays.asList(childCategory));
        when(productRepository.countByCategoryIdAndIsActiveTrue(2L)).thenReturn(3L);

        // When
        CategoryListResponse response = categoryService.getCategoryChildren(1L);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getCategories()).hasSize(1);
        assertThat(response.getTotalCount()).isEqualTo(1);

        CategorySummary childSummary = response.getCategories().get(0);
        assertThat(childSummary.getId()).isEqualTo(2L);
        assertThat(childSummary.getName()).isEqualTo("Smartphones");
        assertThat(childSummary.getProductCount()).isEqualTo(3);

        verify(categoryRepository).existsById(1L);
        verify(categoryRepository).findByParentIdAndIsActiveTrueOrderBySortOrderAsc(1L);
    }

    @Test
    @DisplayName("하위 카테고리 조회 실패 - 부모 카테고리 없음")
    void getCategoryChildren_ParentNotFound() {
        // Given
        when(categoryRepository.existsById(999L)).thenReturn(false);

        // When & Then
        assertThatThrownBy(() -> categoryService.getCategoryChildren(999L))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.CATEGORY_NOT_FOUND);

        verify(categoryRepository).existsById(999L);
    }

    @Test
    @DisplayName("카테고리 생성 성공")
    void createCategory_Success() {
        // Given
        when(categoryRepository.existsByNameAndIsActiveTrue(createRequest.getName())).thenReturn(false);
        when(categoryRepository.save(any(Category.class))).thenReturn(parentCategory);
        when(categoryRepository.findByParentIdAndIsActiveTrueOrderBySortOrderAsc(anyLong()))
                .thenReturn(Collections.emptyList());
        when(productRepository.countByCategoryIdAndIsActiveTrue(anyLong())).thenReturn(0L);

        // When
        CategoryDetailResponse response = categoryService.createCategory(createRequest);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getName()).isEqualTo("Electronics");

        verify(categoryRepository).existsByNameAndIsActiveTrue(createRequest.getName());
        verify(categoryRepository).save(any(Category.class));
    }

    @Test
    @DisplayName("카테고리 생성 성공 - 부모 카테고리 지정")
    void createCategory_WithParent_Success() {
        // Given
        createRequest = CategoryCreateRequest.builder()
                .name("Child Category")
                .parentId(1L)
                .sortOrder(1)
                .isActive(true)
                .build();

        when(categoryRepository.existsByNameAndIsActiveTrue(createRequest.getName())).thenReturn(false);
        when(categoryRepository.existsById(1L)).thenReturn(true);
        when(categoryRepository.save(any(Category.class))).thenReturn(childCategory);
        when(categoryRepository.findByParentIdAndIsActiveTrueOrderBySortOrderAsc(anyLong()))
                .thenReturn(Collections.emptyList());
        when(productRepository.countByCategoryIdAndIsActiveTrue(anyLong())).thenReturn(0L);

        // When
        CategoryDetailResponse response = categoryService.createCategory(createRequest);

        // Then
        assertThat(response).isNotNull();
        verify(categoryRepository).existsByNameAndIsActiveTrue(createRequest.getName());
        verify(categoryRepository).existsById(1L);
        verify(categoryRepository).save(any(Category.class));
    }

    @Test
    @DisplayName("카테고리 생성 실패 - 중복 이름")
    void createCategory_DuplicateName() {
        // Given
        when(categoryRepository.existsByNameAndIsActiveTrue(createRequest.getName())).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> categoryService.createCategory(createRequest))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.CATEGORY_ALREADY_EXISTS);

        verify(categoryRepository).existsByNameAndIsActiveTrue(createRequest.getName());
        verify(categoryRepository, never()).save(any(Category.class));
    }

    @Test
    @DisplayName("카테고리 생성 실패 - 부모 카테고리 없음")
    void createCategory_ParentNotFound() {
        // Given
        createRequest.setParentId(999L);
        when(categoryRepository.existsByNameAndIsActiveTrue(createRequest.getName())).thenReturn(false);
        when(categoryRepository.existsById(999L)).thenReturn(false);

        // When & Then
        assertThatThrownBy(() -> categoryService.createCategory(createRequest))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.CATEGORY_NOT_FOUND);

        verify(categoryRepository).existsByNameAndIsActiveTrue(createRequest.getName());
        verify(categoryRepository).existsById(999L);
        verify(categoryRepository, never()).save(any(Category.class));
    }

    @Test
    @DisplayName("카테고리 수정 성공")
    void updateCategory_Success() {
        // Given
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(parentCategory));
        when(categoryRepository.existsByNameAndIsActiveTrueAndIdNot(updateRequest.getName(), 1L)).thenReturn(false);
        when(categoryRepository.findByParentIdAndIsActiveTrueOrderBySortOrderAsc(anyLong()))
                .thenReturn(Collections.emptyList());
        when(productRepository.countByCategoryIdAndIsActiveTrue(anyLong())).thenReturn(0L);

        // When
        CategoryDetailResponse response = categoryService.updateCategory(1L, updateRequest);

        // Then
        assertThat(response).isNotNull();
        verify(categoryRepository).findById(1L);
        verify(categoryRepository).existsByNameAndIsActiveTrueAndIdNot(updateRequest.getName(), 1L);
        verify(categoryRepository).save(any(Category.class));
    }

    @Test
    @DisplayName("카테고리 수정 실패 - 존재하지 않는 카테고리")
    void updateCategory_NotFound() {
        // Given
        when(categoryRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> categoryService.updateCategory(999L, updateRequest))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.CATEGORY_NOT_FOUND);

        verify(categoryRepository).findById(999L);
    }

    @Test
    @DisplayName("카테고리 수정 실패 - 중복 이름")
    void updateCategory_DuplicateName() {
        // Given
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(parentCategory));
        when(categoryRepository.existsByNameAndIsActiveTrueAndIdNot(updateRequest.getName(), 1L)).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> categoryService.updateCategory(1L, updateRequest))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.CATEGORY_ALREADY_EXISTS);

        verify(categoryRepository).findById(1L);
        verify(categoryRepository).existsByNameAndIsActiveTrueAndIdNot(updateRequest.getName(), 1L);
    }

    @Test
    @DisplayName("카테고리 수정 실패 - 자기 자신을 부모로 설정")
    void updateCategory_SelfParent() {
        // Given
        updateRequest.setParentId(1L);
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(parentCategory));
        when(categoryRepository.existsByNameAndIsActiveTrueAndIdNot(updateRequest.getName(), 1L)).thenReturn(false);

        // When & Then
        assertThatThrownBy(() -> categoryService.updateCategory(1L, updateRequest))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.INVALID_CATEGORY_HIERARCHY);

        verify(categoryRepository).findById(1L);
        verify(categoryRepository).existsByNameAndIsActiveTrueAndIdNot(updateRequest.getName(), 1L);
    }

    @Test
    @DisplayName("카테고리 삭제 성공")
    void deleteCategory_Success() {
        // Given
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(parentCategory));
        when(productRepository.countByCategoryIdAndIsActiveTrue(1L)).thenReturn(0L);
        when(categoryRepository.findByParentIdAndIsActiveTrueOrderBySortOrderAsc(1L))
                .thenReturn(Collections.emptyList());

        // When
        categoryService.deleteCategory(1L);

        // Then
        verify(categoryRepository).findById(1L);
        verify(productRepository).countByCategoryIdAndIsActiveTrue(1L);
        verify(categoryRepository).findByParentIdAndIsActiveTrueOrderBySortOrderAsc(1L);
        verify(categoryRepository).save(any(Category.class));
    }

    @Test
    @DisplayName("카테고리 삭제 실패 - 존재하지 않는 카테고리")
    void deleteCategory_NotFound() {
        // Given
        when(categoryRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> categoryService.deleteCategory(999L))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.CATEGORY_NOT_FOUND);

        verify(categoryRepository).findById(999L);
    }

    @Test
    @DisplayName("카테고리 삭제 실패 - 하위 상품 존재")
    void deleteCategory_HasProducts() {
        // Given
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(parentCategory));
        when(productRepository.countByCategoryIdAndIsActiveTrue(1L)).thenReturn(5L);

        // When & Then
        assertThatThrownBy(() -> categoryService.deleteCategory(1L))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.CATEGORY_HAS_PRODUCTS);

        verify(categoryRepository).findById(1L);
        verify(productRepository).countByCategoryIdAndIsActiveTrue(1L);
    }

    @Test
    @DisplayName("카테고리 삭제 실패 - 하위 카테고리 존재")
    void deleteCategory_HasChildren() {
        // Given
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(parentCategory));
        when(productRepository.countByCategoryIdAndIsActiveTrue(1L)).thenReturn(0L);
        when(categoryRepository.findByParentIdAndIsActiveTrueOrderBySortOrderAsc(1L))
                .thenReturn(Arrays.asList(childCategory));

        // When & Then
        assertThatThrownBy(() -> categoryService.deleteCategory(1L))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.CATEGORY_HAS_PRODUCTS);

        verify(categoryRepository).findById(1L);
        verify(productRepository).countByCategoryIdAndIsActiveTrue(1L);
        verify(categoryRepository).findByParentIdAndIsActiveTrueOrderBySortOrderAsc(1L);
    }

    @Test
    @DisplayName("카테고리 존재 여부 확인")
    void existsById_Success() {
        // Given
        when(categoryRepository.existsById(1L)).thenReturn(true);

        // When
        boolean exists = categoryService.existsById(1L);

        // Then
        assertThat(exists).isTrue();
        verify(categoryRepository).existsById(1L);
    }

    @Test
    @DisplayName("카테고리 존재하지 않음")
    void existsById_NotFound() {
        // Given
        when(categoryRepository.existsById(999L)).thenReturn(false);

        // When
        boolean exists = categoryService.existsById(999L);

        // Then
        assertThat(exists).isFalse();
        verify(categoryRepository).existsById(999L);
    }
}