package com.petmily.backend.domain.walker.entity;

import com.petmily.backend.domain.common.entity.BaseTimeEntity;
import com.petmily.backend.domain.user.entity.User;
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
    private BigDecimal hourlyRate;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    @Builder.Default
    private WalkerStatus status = WalkerStatus.PENDING;
    
    @Column(name = "coordinates")
    private String coordinates;
    
    @Column(name = "profile_image_url")
    private String profileImageUrl;
    
    @Column(name = "total_walks")
    @Builder.Default
    private Integer totalWalks = 0;
    
    @Column(name = "is_available")
    @Builder.Default
    private Boolean isAvailable = true;

    @Column(name = "introduction")
    private String introduction;

    @Column(name = "service_area")
    private String serviceArea;

    @Column(name = "experience_level")
    private String experienceLevel;

    @Column(name = "experience_years")
    @Builder.Default
    private Integer experienceYears = 0;

    @Column(name = "pet_types")
    private String petTypes;

    @Column(name = "certifications")
    private String certifications;

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

    @Column(name = "reviews_count")
    @Builder.Default
    private Integer reviewsCount = 0;

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

