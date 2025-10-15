package com.petmily.backend.domain.user.entity;

import com.petmily.backend.domain.common.entity.BaseTimeEntity;
import com.petmily.backend.domain.order.entity.Order;
import com.petmily.backend.domain.pet.entity.Pet;
import com.petmily.backend.domain.walker.entity.WalkerProfile;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class User extends BaseTimeEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long id;

    @Column(unique = true)
    private String username;

    private String password;

    @Column(unique = true)
    private String email;

    private String profile;
    private String name;
    private String phone;

    @Column
    private String provider; // OAuth2 provider (e.g., google, kakao, naver)

    @Column
    private String providerId; // OAuth2 provider's unique ID for the user

    @Embedded
    private Address address;

    @Enumerated(EnumType.STRING)
    private Role role;

    public User update(String name, String profile) {
        this.name = name;
        this.profile = profile;
        return this;
    }
    
    public String getProfileImageUrl() {
        return this.profile;
    }



    // Relations
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Pet> pets = new ArrayList<>();
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Order> orders = new ArrayList<>();
    
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private WalkerProfile walkerProfile;
    
}
