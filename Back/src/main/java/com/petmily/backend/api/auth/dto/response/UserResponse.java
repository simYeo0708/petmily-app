package com.petmily.backend.api.auth.dto.response;

import com.petmily.backend.domain.user.entity.Role;
import com.petmily.backend.domain.user.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private String name;
    private String profile;
    private String phone;
    private Role role;

    public static UserResponse from(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .name(user.getName())
                .profile(user.getProfile())
                .phone(user.getPhone())
                .role(user.getRole())
                .build();
    }
}

