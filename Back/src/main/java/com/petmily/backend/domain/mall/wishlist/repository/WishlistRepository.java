package com.petmily.backend.domain.mall.wishlist.repository;

import com.petmily.backend.api.mall.enums.ShoppingMall;
import com.petmily.backend.domain.mall.wishlist.entity.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {

    List<Wishlist> findByUserIdOrderByCreateTimeDesc(Long userId);

    List<Wishlist> findByUserId(Long userId);


    boolean existsByUserIdAndExternalProductIdAndSource(
            Long userId,
            String externalProductId,
            ShoppingMall source
    );
}
