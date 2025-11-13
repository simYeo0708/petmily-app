package com.petmily.backend.domain.mall.review.repository;

import com.petmily.backend.domain.mall.order.entity.Order;
import com.petmily.backend.domain.mall.product.entity.Product;
import com.petmily.backend.domain.mall.review.entity.Review;
import com.petmily.backend.domain.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    Page<Review> findByProduct(Product product, Pageable pageable);

    Page<Review> findByProductAndRating(Product product, Integer rating, Pageable pageable);

    Page<Review> findByUser(User user, Pageable pageable);

    boolean existsByUserAndProductAndOrder(User user, Product product, Order order);

    Optional<Review> findByUserAndProductAndOrder(User user, Product product, Order order);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product = :product")
    Double calculateAverageRating(@Param("product") Product product);

    long countByProduct(Product product);

    @Query("SELECT r FROM Review r WHERE r.product = :product ORDER BY r.helpfulCount DESC, r.createTime DESC")
    Page<Review> findByProductOrderByHelpfulCountDesc(@Param("product") Product product, Pageable pageable);

    Page<Review> findByProductOrderByCreateTimeDesc(Product product, Pageable pageable);

    Page<Review> findByProductOrderByRatingDescCreateTimeDesc(Product product, Pageable pageable);

    Page<Review> findByProductOrderByRatingAscCreateTimeDesc(Product product, Pageable pageable);

    @Query("SELECT r FROM Review r WHERE r.product = :product AND SIZE(r.imageUrls) > 0 ORDER BY r.createTime DESC")
    Page<Review> findPhotoReviewsByProduct(@Param("product") Product product, Pageable pageable);

}
