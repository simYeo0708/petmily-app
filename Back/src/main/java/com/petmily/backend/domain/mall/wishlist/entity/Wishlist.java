package com.petmily.backend.domain.mall.wishlist.entity;

import com.petmily.backend.api.mall.enums.ShoppingMall;
import com.petmily.backend.domain.common.entity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name ="wishlist")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Wishlist extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String externalProductId;

    @Column(nullable = false)
    private String productName;

    @Column(nullable = false)
    private Integer savedPrice;

    @Column(nullable = false)
    private Integer currentPrice;

    private String imageUrl;

    @Column(nullable = false)
    private String productUrl;

    private String mallName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ShoppingMall source;

    private LocalDateTime lastChecked;

    public void updatePrice(Integer newPrice){
        this.currentPrice = newPrice;
        this.lastChecked = LocalDateTime.now();
    }

}
