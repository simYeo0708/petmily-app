package com.petmily.backend.domain.mall.product.entity;

import com.petmily.backend.domain.common.BaseTimeEntity;
import com.petmily.backend.domain.mall.subscription.entity.SubscriptionCycle;
import com.petmily.backend.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Product extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_id")
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private BigDecimal price;

    @Column(nullable = false)
    private Integer stockQuantity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductCategory category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private User seller;

    @ElementCollection
    @CollectionTable(name = "product_images", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "image_url")
    @Builder.Default
    private List<String> imageUrls = new ArrayList<>();

    @Column(name = "like_count")
    @Builder.Default
    private Integer likeCount = 0;

    @Column(name = "view_count")
    @Builder.Default
    private Integer viewCount = 0;

    @Column(name = "sales_count")
    @Builder.Default
    private Integer salesCount = 0;

    @Column(name = "average_rating")
    @Builder.Default
    private Double averageRating = 0.0;

    @Column(name = "review_count")
    @Builder.Default
    private Integer reviewCount = 0;

    @Column(name = "subscription_enabled")
    @Builder.Default
    private Boolean subscriptionEnabled = false;

    @Column(name = "subscription_initial_discount")
    private BigDecimal subscriptionInitialDiscount;

    @Column(name = "subscription_3month_discount")
    private BigDecimal subscription3MonthDiscount;

    @Column(name = "subscription_6month_discount")
    private BigDecimal subscription6MonthDiscount;

    @Column(name = "subscription_12month_discount")
    private BigDecimal subscription12MonthDiscount;

    @ElementCollection
    @CollectionTable(name = "product_subscription_cycles",
                    joinColumns = @JoinColumn(name = "product_id"))
    private Set<SubscriptionCycle> availableSubscriptionCycles = new HashSet<>();

    @ElementCollection
    @CollectionTable(name = "product_ingredients", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "ingredient")
    @Builder.Default
    private List<String> ingredients = new ArrayList<>(); // 상품 성분 목록 (알레르기 체크용)

    public void increaseViewCount() {
        this.viewCount += 1;
    }

    public void increaseLikeCount() {
        this.likeCount += 1;
    }

    public void increaseSalesCount(int quantity) {
        this.salesCount += quantity;
    }

    public void decreaseLikeCount() {
        if (this.likeCount > 0) {
            this.likeCount -= 1;
        }
    }

    public void decreaseStock(int quantity) {
        if(this.stockQuantity < quantity) {
            throw new IllegalArgumentException("재고가 부족합니다.");
        }
        this.stockQuantity -= quantity;
        if(this.stockQuantity == 0) {
            this.status = ProductStatus.OUT_OF_STOCK;
        }
    }

    public void increaseStock(int quantity) {
        this.stockQuantity += quantity;
        if(this.status == ProductStatus.OUT_OF_STOCK && this.stockQuantity > 0) {
            this.status = ProductStatus.ACTIVE;
        }
    }

    public void updateRating(Double newAverage, Integer newReviewCount) {
        this.averageRating = newAverage;
        this.reviewCount = newReviewCount;
    }

    public boolean isSubscriptionAvailable() {
        return subscriptionEnabled && subscriptionInitialDiscount != null
                && !availableSubscriptionCycles.isEmpty() && status == ProductStatus.ACTIVE;
    }

    public boolean supportsSubscriptionCycle(SubscriptionCycle cycle) {
        return availableSubscriptionCycles.contains(cycle);
    }
}
