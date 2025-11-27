package com.petmily.backend.domain.mall.review.entity;

import com.petmily.backend.domain.common.BaseTimeEntity;
import com.petmily.backend.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "review_helpful",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "review_id"}))
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ReviewHelpful extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "review_helpful_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "review_id", nullable = false)
    private Review review;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private HelpfulType type;

    public enum HelpfulType {
        HELPFUL("도움이 됨"),
        UNHELPFUL("도움이 안 됨");

        private final String displayName;

        HelpfulType(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

}
