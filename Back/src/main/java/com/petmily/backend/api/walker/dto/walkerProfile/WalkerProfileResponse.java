package com.petmily.backend.api.walker.dto.walkerProfile;

import com.petmily.backend.domain.walker.entity.WalkerStatus;
import com.petmily.backend.domain.user.entity.User;
import com.petmily.backend.domain.walker.entity.WalkerProfile;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class WalkerProfileResponse {
    private Long id;
    private Long userId;
    private String username;
    private String name;
    private String email;
    private String detailDescription;
    private Double rating;
    private BigDecimal hourlyRate;
    private WalkerStatus status;
    private String coordinates;
    private String serviceArea;
    private boolean isFavorite; // 즐겨찾기 여부

    public static WalkerProfileResponse from(WalkerProfile walkerProfile) {
        User user = walkerProfile.getUser();
        return WalkerProfileResponse.builder()
                .id(walkerProfile.getId())
                .userId(walkerProfile.getUserId())
                .username(user != null ? user.getUsername() : null)
                .name(user != null ? user.getName() : null)
                .email(user != null ? user.getEmail() : null)
                .detailDescription(walkerProfile.getDetailDescription())
                .rating(walkerProfile.getRating())
                .hourlyRate(walkerProfile.getHourlyRate())
                .status(walkerProfile.getStatus())
                .coordinates(walkerProfile.getCoordinates())
                .serviceArea(walkerProfile.getServiceArea())
                .isFavorite(false) // 기본값, 서비스에서 별도로 설정
                .build();
    }

    public static WalkerProfileResponse from(WalkerProfile walkerProfile, boolean isFavorite) {
        User user = walkerProfile.getUser();
        return WalkerProfileResponse.builder()
                .id(walkerProfile.getId())
                .userId(walkerProfile.getUserId())
                .username(user != null ? user.getUsername() : null)
                .name(user != null ? user.getName() : null)
                .email(user != null ? user.getEmail() : null)
                .detailDescription(walkerProfile.getDetailDescription())
                .rating(walkerProfile.getRating())
                .hourlyRate(walkerProfile.getHourlyRate())
                .status(walkerProfile.getStatus())
                .coordinates(walkerProfile.getCoordinates())
                .serviceArea(walkerProfile.getServiceArea())
                .isFavorite(isFavorite)
                .build();
    }
}
