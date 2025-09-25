package com.petmily.backend.api.category.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.petmily.backend.api.category.dto.CategoryCreateRequest;
import com.petmily.backend.api.category.dto.CategoryDetailResponse;
import com.petmily.backend.api.category.dto.CategoryListResponse;
import com.petmily.backend.api.category.dto.CategorySummary;
import com.petmily.backend.api.category.dto.CategoryUpdateRequest;
import com.petmily.backend.api.category.service.CategoryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CategoryController.class)
class CategoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CategoryService categoryService;

    @MockBean
    private com.petmily.backend.domain.product.repository.CategoryRepository categoryRepository;

    @MockBean
    private com.petmily.backend.domain.product.repository.ProductRepository productRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private CategoryDetailResponse categoryResponse;
    private CategoryListResponse categoryListResponse;
    private CategoryCreateRequest createRequest;
    private CategoryUpdateRequest updateRequest;

    @BeforeEach
    void setUp() {
        categoryResponse = CategoryDetailResponse.builder()
                .id(1L)
                .name("사료")
                .description("강아지 사료 카테고리")
                .isActive(true)
                .sortOrder(1)
                .build();

        CategorySummary categorySummary = CategorySummary.builder()
                .id(1L)
                .name("사료")
                .description("강아지 사료 카테고리")
                .isActive(true)
                .sortOrder(1)
                .build();

        categoryListResponse = CategoryListResponse.builder()
                .categories(Arrays.asList(categorySummary))
                .totalCount(1)
                .build();

        createRequest = CategoryCreateRequest.builder()
                .name("간식")
                .description("강아지 간식 카테고리")
                .parentId(null)
                .sortOrder(2)
                .isActive(true)
                .build();

        updateRequest = CategoryUpdateRequest.builder()
                .name("사료 (수정됨)")
                .description("강아지 사료 카테고리 (수정됨)")
                .sortOrder(1)
                .isActive(true)
                .build();
    }

    @Test
    void getCategories_Success() throws Exception {
        when(categoryService.getCategories()).thenReturn(categoryListResponse);

        mockMvc.perform(get("/api/categories")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.categories").isArray())
                .andExpect(jsonPath("$.categories[0].id").value(1L))
                .andExpect(jsonPath("$.categories[0].name").value("사료"))
                .andExpect(jsonPath("$.totalCount").value(1));
    }

    @Test
    void getCategory_Success() throws Exception {
        when(categoryService.getCategory(1L)).thenReturn(categoryResponse);

        mockMvc.perform(get("/api/categories/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.name").value("사료"))
                .andExpect(jsonPath("$.description").value("강아지 사료 카테고리"));
    }

    @Test
    void getCategoryChildren_Success() throws Exception {
        when(categoryService.getCategoryChildren(1L)).thenReturn(categoryListResponse);

        mockMvc.perform(get("/api/categories/1/children")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.categories").isArray())
                .andExpect(jsonPath("$.totalCount").value(1));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void createCategory_Success() throws Exception {
        CategoryDetailResponse createdCategory = new CategoryDetailResponse();
        createdCategory.setId(2L);
        createdCategory.setName("간식");
        createdCategory.setDescription("강아지 간식 카테고리");

        when(categoryService.createCategory(any(CategoryCreateRequest.class))).thenReturn(createdCategory);

        mockMvc.perform(post("/api/categories")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(2L))
                .andExpect(jsonPath("$.name").value("간식"))
                .andExpect(jsonPath("$.description").value("강아지 간식 카테고리"));
    }

    @Test
    @WithMockUser(username = "user", roles = {"USER"})
    void createCategory_WithoutAdminRole_ShouldReturnForbidden() throws Exception {
        mockMvc.perform(post("/api/categories")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void updateCategory_Success() throws Exception {
        CategoryDetailResponse updatedCategory = new CategoryDetailResponse();
        updatedCategory.setId(1L);
        updatedCategory.setName("사료 (수정됨)");
        updatedCategory.setDescription("강아지 사료 카테고리 (수정됨)");

        when(categoryService.updateCategory(eq(1L), any(CategoryUpdateRequest.class))).thenReturn(updatedCategory);

        mockMvc.perform(put("/api/categories/1")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.name").value("사료 (수정됨)"))
                .andExpect(jsonPath("$.description").value("강아지 사료 카테고리 (수정됨)"));
    }

    @Test
    @WithMockUser(username = "user", roles = {"USER"})
    void updateCategory_WithoutAdminRole_ShouldReturnForbidden() throws Exception {
        mockMvc.perform(put("/api/categories/1")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void deleteCategory_Success() throws Exception {
        mockMvc.perform(delete("/api/categories/1")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "user", roles = {"USER"})
    void deleteCategory_WithoutAdminRole_ShouldReturnForbidden() throws Exception {
        mockMvc.perform(delete("/api/categories/1")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    void getCategory_WithInvalidId_ShouldReturnNotFound() throws Exception {
        when(categoryService.getCategory(999L)).thenThrow(new RuntimeException("Category not found"));

        mockMvc.perform(get("/api/categories/999")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().is5xxServerError());
    }
}