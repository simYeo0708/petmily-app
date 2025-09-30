package com.petmily.backend.domain.walker.entity;

import com.petmily.backend.domain.common.entity.BaseTimeEntity;
import com.petmily.backend.domain.user.entity.User;
import com.petmily.backend.domain.walk.entity.WalkBooking;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.math.BigDecimal;
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

    @Column(name = "introduction")
    private String introduction;

    @Column(columnDefinition = "TEXT")
    private String detailDescription;

    @Column(name = "profile_image_url")
    private String profileImageUrl;

    @NotNull
    @Positive
    @Column(name = "hourly_rate")
    private BigDecimal hourlyRate;
    
    @Column(name = "coordinates")
    private String coordinates;

    @Column(name = "service_area")
    private String serviceArea;

    @Column(name = "pet_types")
    private String petTypes;

    @Column(name = "certifications")
    private String certifications;

    @Column(name = "rating")
    @Builder.Default
    private Double rating = 0.0;

    @Column(name = "walks_count")
    @Builder.Default
    private Integer walksCount = 0;

    @Column(name = "reviews_count")
    @Builder.Default
    private Integer reviewsCount = 0;

    @Column(name = "experience_years")
    @Builder.Default
    private Integer experienceYears = 0;

    @Column(name = "is_insured")
    @Builder.Default
    private Boolean isInsured = false;

    @Column(name = "instant_booking")
    @Builder.Default
    private Boolean instantBooking = false;

    @Column(name = "weekend_available")
    @Builder.Default
    private Boolean weekendAvailable = false;

    @Column(name = "emergency_service")
    @Builder.Default
    private Boolean emergencyService = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    @Builder.Default
    private WalkerStatus status = WalkerStatus.PENDING;

    // Relations
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;
    
    @OneToMany(mappedBy = "walker", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<WalkBooking> bookings = new ArrayList<>();
    
    @OneToMany(mappedBy = "walker", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<WalkerReview> reviews = new ArrayList<>();

}

