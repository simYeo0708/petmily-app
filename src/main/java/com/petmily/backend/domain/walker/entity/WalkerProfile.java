package com.petmily.backend.domain.walker.entity;

import com.petmily.backend.domain.common.entity.BaseTimeEntity;
import com.petmily.backend.domain.user.entity.User;
import com.petmily.backend.api.walker.dto.WalkerStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "walker_profiles")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class WalkerProfile extends BaseTimeEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull
    @Column(name = "user_id", unique = true)
    private Long userId;
    
    @Column(columnDefinition = "TEXT")
    private String bio;
    
    @Column(columnDefinition = "TEXT")
    private String experience;
    
    @Column(name = "rating")
    @Builder.Default
    private Double rating = 0.0;
    
    @NotNull
    @Positive
    @Column(name = "hourly_rate")
    private Double hourlyRate;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    @Builder.Default
    private WalkerStatus status = WalkerStatus.PENDING;
    
    private String location;
    
    @Column(name = "profile_image_url")
    private String profileImageUrl;
    
    @Column(name = "total_walks")
    @Builder.Default
    private Integer totalWalks = 0;
    
    @Column(name = "is_available")
    @Builder.Default
    private Boolean isAvailable = true;
    
    // Relations
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;
    
    @OneToMany(mappedBy = "walker", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<WalkerBooking> bookings = new ArrayList<>();
    
    @OneToMany(mappedBy = "walker", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<WalkerReview> reviews = new ArrayList<>();

}

