package com.petmily.backend.domain.pet.entity;

import com.petmily.backend.domain.common.entity.BaseTimeEntity;
import com.petmily.backend.domain.user.entity.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "pets")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class Pet extends BaseTimeEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank
    private String name;
    
    @NotBlank
    private String species; // 개, 고양이 등
    
    private String breed; // 품종
    
    private String age;
    
    private String gender; // 수컷, 암컷
    
    @ElementCollection
    @CollectionTable(name = "pet_temperaments", joinColumns = @JoinColumn(name = "pet_id"))
    @Column(name = "temperament")
    private String[] temperaments; // 성격 배열
    
    @Column(name = "photo_uri")
    private String photoUri;
    
    @Column(name = "has_photo")
    private Boolean hasPhoto = false;
    
    private String description; // 설명
    
    // Weight and size information
    private String weight; // kg
    
    @Enumerated(EnumType.STRING)
    private Size size; // SMALL, MEDIUM, LARGE
    
    // Health and medical information
    @Column(name = "is_vaccinated")
    private Boolean isVaccinated = false;
    
    @ElementCollection
    @CollectionTable(name = "pet_allergies", joinColumns = @JoinColumn(name = "pet_id"))
    @Column(name = "allergy")
    private String[] allergies; // 알레르기 목록 (상품 추천에 활용)
    
    @ElementCollection
    @CollectionTable(name = "pet_medications", joinColumns = @JoinColumn(name = "pet_id"))
    @Column(name = "medication")
    private String[] medications; // 복용 중인 약물
    
    @Column(name = "medical_conditions", length = 1000)
    private String medicalConditions; // 기존 질병/건강 상태
    
    @Column(name = "special_notes", length = 1000)
    private String specialNotes; // 특별 주의사항
    
    // Activity level and preferences
    @Enumerated(EnumType.STRING)
    @Column(name = "activity_level")
    private ActivityLevel activityLevel; // LOW, MODERATE, HIGH
    
    @Column(name = "favorite_activities")
    private String favoriteActivities; // 좋아하는 활동들
    
    // Social behavior
    @Column(name = "good_with_children")
    private Boolean goodWithChildren;
    
    @Column(name = "good_with_other_pets")
    private Boolean goodWithOtherPets;
    
    @Column(name = "is_neutered")
    private Boolean isNeutered = false;
    
    @NotNull
    @Column(name = "user_id")
    private Long userId;
    
    
    
    // Relations
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;
    
    // Enums
    public enum Size {
        SMALL,   // 소형견/고양이 (5kg 미만)
        MEDIUM,  // 중형견 (5-25kg)
        LARGE    // 대형견 (25kg 초과)
    }
    
    public enum ActivityLevel {
        LOW,      // 낮음 - 조용하고 차분한 성격
        MODERATE, // 보통 - 적당한 활동량
        HIGH      // 높음 - 활발하고 에너지가 많음
    }

}
