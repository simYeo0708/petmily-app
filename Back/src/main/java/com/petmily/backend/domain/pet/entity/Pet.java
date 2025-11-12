package com.petmily.backend.domain.pet.entity;

import com.petmily.backend.domain.common.BaseTimeEntity;
import com.petmily.backend.domain.user.entity.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

@Entity
@Table(name = "pets")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class Pet extends BaseTimeEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "user_id")
    private Long userId;
    
    @NotBlank
    private String name;
    
    @NotBlank
    private String species; // 개, 고양이, 기타
    
    private String breed; // 품종
    
    @Positive
    private Integer age;
    
    private String gender; // 수컷, 암컷
    
    private String personality; // 성격
    
    @Column(name = "image_url")
    private String imageUrl;
    
    // Weight and size information
    private Double weight; // kg
    
    @Enumerated(EnumType.STRING)
    private Size size; // SMALL, MEDIUM, LARGE

    @Column(name = "medical_conditions")
    private String medicalConditions; // 알러지, 질병 등
    
    @Column(name = "special_notes")
    private String specialNotes; // 특별 주의사항

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
