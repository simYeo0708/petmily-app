package com.petmily.backend.domain.product.repository;

import com.petmily.backend.domain.product.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    
    // 활성화된 카테고리만 조회
    List<Category> findByIsActiveTrueOrderBySortOrderAsc();
    
    // 최상위 카테고리 조회 (parentId가 null인 것들)
    List<Category> findByParentIdIsNullAndIsActiveTrueOrderBySortOrderAsc();
    
    // 특정 부모 카테고리의 하위 카테고리 조회
    List<Category> findByParentIdAndIsActiveTrueOrderBySortOrderAsc(Long parentId);
    
    // 카테고리명으로 검색
    Optional<Category> findByNameAndIsActiveTrue(String name);
    
    // 계층 구조 포함한 전체 카테고리 조회
    @Query("SELECT c FROM Category c LEFT JOIN FETCH c.parentCategory WHERE c.isActive = true ORDER BY c.sortOrder ASC")
    List<Category> findAllWithParent();
    
    // 하위 카테고리를 포함한 카테고리 조회
    @Query("SELECT c FROM Category c LEFT JOIN FETCH c.subCategories sc WHERE c.id = :categoryId AND c.isActive = true AND (sc.isActive = true OR sc.isActive IS NULL)")
    Optional<Category> findByIdWithChildren(@Param("categoryId") Long categoryId);
    
    // 특정 카테고리와 모든 하위 카테고리 ID 조회
    @Query(value = "WITH RECURSIVE category_tree AS (" +
           "SELECT id FROM categories WHERE id = :categoryId " +
           "UNION ALL " +
           "SELECT c.id FROM categories c INNER JOIN category_tree ct ON c.parent_id = ct.id " +
           "WHERE c.is_active = true" +
           ") SELECT id FROM category_tree", nativeQuery = true)
    List<Long> findCategoryAndDescendantIds(@Param("categoryId") Long categoryId);
    
    // 카테고리별 상품 개수 조회
    @Query("SELECT c.id, COUNT(p.id) FROM Category c LEFT JOIN Product p ON c.id = p.categoryId AND p.isActive = true " +
           "WHERE c.isActive = true GROUP BY c.id")
    List<Object[]> getCategoryProductCounts();
    
    // 이름으로 중복 확인 (등록/수정시 사용)
    boolean existsByNameAndIsActiveTrue(String name);
    
    boolean existsByNameAndIsActiveTrueAndIdNot(String name, Long id);
}

