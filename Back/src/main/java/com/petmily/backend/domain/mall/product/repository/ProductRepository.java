package com.petmily.backend.domain.mall.product.repository;

import com.petmily.backend.domain.mall.product.entity.Product;
import com.petmily.backend.domain.mall.product.entity.ProductCategory;
import com.petmily.backend.domain.mall.product.entity.ProductStatus;
import com.petmily.backend.domain.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductRepository extends JpaRepository<Product, Long> {

    // 판매자별 상품 조회
    Page<Product> findBySeller(User seller, Pageable pageable);

    // 카테고리별 활성 상품 조회
    Page<Product> findByCategoryAndStatus(ProductCategory category, ProductStatus status, Pageable pageable);

    // 상품명 검색
    @Query("SELECT p FROM Product p WHERE (p.name LIKE %:keyword% OR p.description LIKE %:keyword%) AND p.status = :status")
    Page<Product> searchByKeyword(@Param("keyword") String keyword,
                                  @Param("status") ProductStatus status,
                                  Pageable pageable);

    // 인기 상품 (좋아요 순)
    Page<Product> findByStatusOrderByLikeCountDesc(ProductStatus status, Pageable pageable);

    // 최신 상품
    Page<Product> findByStatusOrderByCreateTimeDesc(ProductStatus status, Pageable pageable);

    // 평점 높은 순
    Page<Product> findByStatusOrderByAverageRatingDesc(ProductStatus status, Pageable pageable);

    // 판매량 높은 순
    Page<Product> findByStatusOrderBySalesCountDesc(ProductStatus status, Pageable pageable);
}
