package com.petmily.backend.domain.mall.review.repository;

import com.petmily.backend.api.mall.enums.ShoppingMall;
import com.petmily.backend.domain.mall.review.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    Page<Review> findByExternalProductIdAndSourceOrderByCreatedAtDesc(
        String externalProductId,
        ShoppingMall source,
        Pageable pageable
    );

    Long countByExternalProductIdAndSource(String externalProductId, ShoppingMall source);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.externalProductId = :productId And r.source = :source")
    Double findAverageRatingByProduct(@Param("productId") String productId, @Param("source") ShoppingMall source);

    Page<Review> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    boolean existsByUserIdAndExternalProductIdAndSource(Long userId, String externalProductId, ShoppingMall source);

    List<Review> findTop3ByExternalProductIdAndSourceOrderByHelpfulCountDescCreatedAtDesc(
            String externalProductId,
            ShoppingMall source
    );

}
