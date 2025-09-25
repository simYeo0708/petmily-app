package com.petmily.backend.api.walker.dto.walkerProfile;

import com.petmily.backend.domain.walker.entity.WalkerStatus;
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
    private boolean isAvailable;
    private String location;
    private boolean isFavorite; // 즐겨찾기 여부

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
                .isAvailable(walkerProfile.getIsAvailable())
                .location(walkerProfile.getLocation())
                .isFavorite(false) // 기본값, 서비스에서 별도로 설정
                .build();
    }
}
