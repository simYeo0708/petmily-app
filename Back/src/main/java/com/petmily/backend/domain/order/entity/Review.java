package com.petmily.backend.domain.order.entity;

import com.petmily.backend.domain.common.entity.BaseTimeEntity;
import com.petmily.backend.domain.product.entity.Product;
import com.petmily.backend.domain.user.entity.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "reviews")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Getter
@Builder
public class Review extends BaseTimeEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull
    @Column(name = "order_id")
    private Long orderId;
    
    @NotNull
    @Column(name = "order_item_id")
    private Long orderItemId;
    
    @NotNull
    @Column(name = "product_id")
    private Long productId;
    
    @NotNull
    @Column(name = "user_id")
    private Long userId;
    
    @NotNull
    @Min(1)
    @Max(5)
    @Column(name = "rating")
    private Integer rating;
    
    @NotBlank
    @Column(name = "content", columnDefinition = "TEXT")
    private String content;
    
    @ElementCollection
    @CollectionTable(name = "review_images", joinColumns = @JoinColumn(name = "review_id"))
    @Column(name = "image_url")
    @Builder.Default
    private List<String> imageUrls = new ArrayList<>();
    
    @Column(name = "is_anonymous")
    @Builder.Default
    private Boolean isAnonymous = false;
    
    @Column(name = "helpful_count")
    @Builder.Default
    private Integer helpfulCount = 0;
    
    @Column(name = "admin_reply", columnDefinition = "TEXT")
    private String adminReply;
    
    @Column(name = "admin_reply_date")
    private java.time.LocalDateTime adminReplyDate;
    
    // Relations
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", insertable = false, updatable = false)
    private Order order;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_item_id", insertable = false, updatable = false)
    private OrderItem orderItem;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", insertable = false, updatable = false)
    private Product product;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;
    
    public void updateReview(Integer rating, String content, List<String> imageUrls, Boolean isAnonymous) {
        this.rating = rating;
        this.content = content;
        this.imageUrls = imageUrls != null ? imageUrls : new ArrayList<>();
        this.isAnonymous = isAnonymous != null ? isAnonymous : false;
    }
    
    public void addHelpfulCount() {
        this.helpfulCount++;
    }
    
    public void subtractHelpfulCount() {
        if (this.helpfulCount > 0) {
            this.helpfulCount--;
        }
    }
    
    public void addAdminReply(String adminReply) {
        this.adminReply = adminReply;
        this.adminReplyDate = java.time.LocalDateTime.now();
    }
    
    public void updateAdminReply(String adminReply) {
        this.adminReply = adminReply;
        this.adminReplyDate = java.time.LocalDateTime.now();
    }
    
    public void removeAdminReply() {
        this.adminReply = null;
        this.adminReplyDate = null;
    }
    
    public boolean hasAdminReply() {
        return this.adminReply != null && !this.adminReply.trim().isEmpty();
    }
    
    public boolean isHighRating() {
        return this.rating >= 4;
    }
    
    public boolean isLowRating() {
        return this.rating <= 2;
    }
    
    public void addImage(String imageUrl) {
        if (this.imageUrls == null) {
            this.imageUrls = new ArrayList<>();
        }
        this.imageUrls.add(imageUrl);
    }
    
    public void removeImage(String imageUrl) {
        if (this.imageUrls != null) {
            this.imageUrls.remove(imageUrl);
        }
    }
    
    public boolean hasImages() {
        return this.imageUrls != null && !this.imageUrls.isEmpty();
    }
}