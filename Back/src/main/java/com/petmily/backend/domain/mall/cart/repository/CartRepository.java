package com.petmily.backend.domain.mall.cart.repository;

import com.petmily.backend.domain.mall.cart.entity.Cart;
import com.petmily.backend.domain.mall.product.entity.Product;
import com.petmily.backend.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {

    List<Cart> findByUser(User user);

    Optional<Cart> findByUserAndProduct(User user, Product product);

    void deleteByUserAndProduct(User user, Product product);

    void deleteAllByUser(User user);
}
