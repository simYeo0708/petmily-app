package com.petmily.backend.domain.mall.product.entity;

import com.petmily.backend.domain.common.BaseTimeEntity;
import com.petmily.backend.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "product_view_history",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "product_id"}))
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ProductViewHistory extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "view_history_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "view_count")
    @Builder.Default
    private Integer viewCount = 1; // 조회 횟수

    public void incrementViewCount() {
        this.viewCount += 1;
    }
}

