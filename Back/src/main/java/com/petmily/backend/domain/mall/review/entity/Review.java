package com.petmily.backend.domain.mall.review.entity;

import com.petmily.backend.domain.common.entity.BaseTimeEntity;
import com.petmily.backend.domain.mall.order.entity.Order;
import com.petmily.backend.domain.mall.product.entity.Product;
import com.petmily.backend.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "product_reviews",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "product_id", "order_id"}))
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
public class Review extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "review_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(nullable = false)
    private Integer rating;

    @Column(columnDefinition = "TEXT")
    private String content;

    @ElementCollection
    @CollectionTable(name = "review_images", joinColumns = @JoinColumn(name = "review_id"))
    @Column(name = "image_url")
    @Builder.Default
    private List<String> imageUrls = new ArrayList<>();

    @Column(name = "helpful_count")
    @Builder.Default
    private Integer helpfulCount = 0;

    @Column(name = "unhelpful_count")
    @Builder.Default
    private Integer unhelpfulCount = 0;

    @Column(name = "is_verified_purchase")
    @Builder.Default
    private Boolean isVerifiedPurchase = true;

    public void increaseHelpfulCount() {
        this.helpfulCount++;
    }

    public void decreaseHelpfulCount() {
        if (this.helpfulCount > 0) {
            this.helpfulCount--;
        }
    }

    public void increaseUnhelpfulCount() {
        this.unhelpfulCount++;
    }

    public void decreaseUnhelpfulCount() {
        if (this.unhelpfulCount > 0) {
            this.unhelpfulCount--;
        }
    }

    public double getHelpfulnessScore() {
        int total = helpfulCount + unhelpfulCount;
        if (total == 0) {
            return 0.0;
        }
        return (double) helpfulCount / total * 100;
    }

}
