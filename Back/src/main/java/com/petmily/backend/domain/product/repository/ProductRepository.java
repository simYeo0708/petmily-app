package com.petmily.backend.domain.product.repository;

import com.petmily.backend.domain.product.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // 기본 조회
    Page<Product> findByIsActiveTrueOrderByCreateTimeDesc(Pageable pageable);
    
    // 카테고리별 조회
    @Query("SELECT p FROM Product p WHERE p.categoryId = :categoryId AND p.isActive = true ORDER BY p.createTime DESC")
    Page<Product> findByCategoryIdAndIsActiveTrue(@Param("categoryId") Long categoryId, Pageable pageable);
    
    // 검색 (상품명, 브랜드, 설명)
    @Query("SELECT p FROM Product p WHERE p.isActive = true AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.brand) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "ORDER BY p.createTime DESC")
    Page<Product> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);
    
    // 필터링 검색
    @Query("SELECT p FROM Product p WHERE p.isActive = true " +
           "AND (:categoryId IS NULL OR p.categoryId = :categoryId) " +
           "AND (:keyword IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:brand IS NULL OR LOWER(p.brand) LIKE LOWER(CONCAT('%', :brand, '%'))) " +
           "AND (:minPrice IS NULL OR p.price >= :minPrice) " +
           "AND (:maxPrice IS NULL OR p.price <= :maxPrice)")
    Page<Product> searchWithFilters(
            @Param("categoryId") Long categoryId,
            @Param("keyword") String keyword,
            @Param("brand") String brand,
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice,
            Pageable pageable);
    
    // 인기 상품 (평점 높은 순)
    @Query("SELECT p FROM Product p WHERE p.isActive = true AND p.ratingAverage > 0 " +
           "ORDER BY p.ratingAverage DESC, p.reviewCount DESC")
    Page<Product> findPopularProducts(Pageable pageable);
    
    // 브랜드별 조회
    Page<Product> findByBrandAndIsActiveTrueOrderByCreateTimeDesc(String brand, Pageable pageable);
    
    // 재고 업데이트
    @Modifying
    @Query("UPDATE Product p SET p.stock = p.stock - :quantity WHERE p.id = :productId AND p.stock >= :quantity")
    int decreaseStock(@Param("productId") Long productId, @Param("quantity") Integer quantity);
    
    @Modifying
    @Query("UPDATE Product p SET p.stock = p.stock + :quantity WHERE p.id = :productId")
    int increaseStock(@Param("productId") Long productId, @Param("quantity") Integer quantity);
    
    // 평점 업데이트
    @Modifying
    @Query("UPDATE Product p SET p.ratingAverage = :ratingAverage, p.reviewCount = :reviewCount WHERE p.id = :productId")
    void updateRating(@Param("productId") Long productId, @Param("ratingAverage") Double ratingAverage, @Param("reviewCount") Integer reviewCount);
    
    // 카테고리별 상품 개수
    @Query("SELECT COUNT(p) FROM Product p WHERE p.categoryId = :categoryId AND p.isActive = true")
    long countByCategoryIdAndIsActiveTrue(@Param("categoryId") Long categoryId);
    
    // 재고 부족 상품 조회 (관리자용)
    @Query("SELECT p FROM Product p WHERE p.isActive = true AND p.stock <= :threshold ORDER BY p.stock ASC")
    List<Product> findLowStockProducts(@Param("threshold") Integer threshold);
    
    // ID 목록으로 조회 (장바구니, 주문에서 사용)
    @Query("SELECT p FROM Product p WHERE p.id IN :productIds AND p.isActive = true")
    List<Product> findByIdInAndIsActiveTrue(@Param("productIds") List<Long> productIds);
    
    // 기존 메서드들도 유지
    List<Product> findByCategoryId(Long categoryId);
    
    @Query("SELECT p FROM Product p WHERE p.name LIKE %:keyword% OR p.description LIKE %:keyword%")
    List<Product> findByKeyword(@Param("keyword") String keyword);
    
    List<Product> findByStockGreaterThan(Integer stock);
}

