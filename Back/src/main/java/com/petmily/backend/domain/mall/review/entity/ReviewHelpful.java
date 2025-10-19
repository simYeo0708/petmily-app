package com.petmily.backend.domain.mall.review.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "review_helpful", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "review_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewHelpful {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Long reviewId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private HelpfulType type;

    public enum HelpfulType{
        HELPFUL,
        NOT_HELPFUL
    }

}
