package com.petmily.backend.domain.mall.product.repository;

import com.petmily.backend.domain.mall.product.entity.Product;
import com.petmily.backend.domain.mall.product.entity.ProductLike;
import com.petmily.backend.domain.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProductLikeRepository extends JpaRepository<ProductLike, Long> {

    Optional<ProductLike> findByUserAndProduct(User user, Product product);

    boolean existsByUserAndProduct(User user, Product product);

    Page<ProductLike> findByUser(User user, Pageable pageable);

    void deleteByUserAndProduct(User user, Product product);
}
