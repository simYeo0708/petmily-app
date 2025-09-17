package com.petmily.backend.api.walker.dto.walkerProfile;

import com.petmily.backend.api.walker.dto.WalkerStatus;
import com.petmily.backend.domain.user.entity.User;
import com.petmily.backend.domain.walker.entity.WalkerProfile;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class WalkerProfileResponse {
    private Long id;
    private Long userId;
    private String username;
    private String name;
    private String email;
    private String bio;
    private String experience;
    private Double rating;
    private Double hourlyRate;
    private WalkerStatus status;
    private String location;

    public static WalkerProfileResponse from(WalkerProfile walkerProfile) {
        User user = walkerProfile.getUser();
        return WalkerProfileResponse.builder()
                .id(walkerProfile.getId())
                .userId(walkerProfile.getUserId())
                .username(user != null ? user.getUsername() : null)
                .name(user != null ? user.getName() : null)
                .email(user != null ? user.getEmail() : null)
                .bio(walkerProfile.getBio())
                .experience(walkerProfile.getExperience())
                .rating(walkerProfile.getRating())
                .hourlyRate(walkerProfile.getHourlyRate())
                .status(walkerProfile.getStatus())
                .location(walkerProfile.getLocation())
                .build();
    }
}
