package com.petmily.backend.domain.walker.entity;

import com.petmily.backend.domain.common.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "favorite_walkers",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "walker_id"}))
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class FavoriteWalker extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "walker_id", nullable = false)
    private Long walkerId;

    @Column(name = "note", length = 200)
    private String note; // 즐겨찾기 메모

    @Builder.Default
    @Column(name = "is_active")
    private Boolean isActive = true;

    // Relations
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "walker_id", insertable = false, updatable = false)
    private Walker walker;
}