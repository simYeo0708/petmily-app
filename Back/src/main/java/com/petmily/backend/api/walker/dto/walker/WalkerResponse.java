package com.petmily.backend.api.walker.dto.walker;

import com.petmily.backend.domain.walker.entity.WalkerStatus;
import com.petmily.backend.domain.user.entity.User;
import com.petmily.backend.domain.walker.entity.Walker;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class WalkerResponse {
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

    public static WalkerResponse from(Walker walker) {
        User user = walker.getUser();
        return WalkerResponse.builder()
                .id(walker.getId())
                .userId(walker.getUserId())
                .username(user != null ? user.getUsername() : null)
                .name(user != null ? user.getName() : null)
                .email(user != null ? user.getEmail() : null)
                .detailDescription(walker.getDetailDescription())
                .rating(walker.getRating())
                .hourlyRate(walker.getHourlyRate())
                .status(walker.getStatus())
                .coordinates(walker.getCoordinates())
                .serviceArea(walker.getServiceArea())
                .isFavorite(false) // 기본값, 서비스에서 별도로 설정
                .build();
    }

    public static WalkerResponse from(Walker walker, boolean isFavorite) {
        User user = walker.getUser();
        return WalkerResponse.builder()
                .id(walker.getId())
                .userId(walker.getUserId())
                .username(user != null ? user.getUsername() : null)
                .name(user != null ? user.getName() : null)
                .email(user != null ? user.getEmail() : null)
                .detailDescription(walker.getDetailDescription())
                .rating(walker.getRating())
                .hourlyRate(walker.getHourlyRate())
                .status(walker.getStatus())
                .coordinates(walker.getCoordinates())
                .serviceArea(walker.getServiceArea())
                .isFavorite(isFavorite)
                .build();
    }
}
