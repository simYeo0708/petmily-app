package com.petmily.backend.domain.mall.review.entity;

import com.petmily.backend.api.mall.enums.ShoppingMall;
import com.petmily.backend.domain.common.entity.BaseTimeEntity;
import com.petmily.backend.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name ="mall_review")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Review extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String externalProductId;

    @Column(nullable = false)
    private String productName;

    private String productImageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ShoppingMall source;

    @Column(nullable = false)
    private Integer rating;

    @Column(columnDefinition = "TEXT")
    private String content;

    @ElementCollection
    @CollectionTable(name = "review_images", joinColumns = @JoinColumn(name = "review_id"))
    @Column(name = "image_url")
    @Builder.Default
    private List<String> imageUrls = new ArrayList<>();

    @Column(nullable = false)
    @Builder.Default
    private Integer helpfulCount = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer notHelpfulCount = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    public void incrementHelpfulCount(){
        this.helpfulCount++;
    }

    public void decrementHelpfulCount(){
        if(this.helpfulCount > 0){
            this.helpfulCount--;
        }
    }

    public void incrementNotHelpfulCount(){
        this.notHelpfulCount++;
    }

    public void decrementNotHelpfulCount(){
        if(this.notHelpfulCount > 0) {
            this.notHelpfulCount--;
        }
    }
}
