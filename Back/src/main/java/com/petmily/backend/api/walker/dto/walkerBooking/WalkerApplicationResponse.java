package com.petmily.backend.api.walker.dto.walkerBooking;

import com.petmily.backend.domain.walker.entity.WalkerBooking;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class WalkerApplicationResponse {
    private Long bookingId;
    private Long walkerId;
    private String walkerName;
    private String walkerProfileImage;
    private Double walkerRating;
    private String walkerExperience;
    private String message;
    private Double proposedPrice;
    private LocalDateTime appliedAt;
    private WalkerBooking.BookingStatus status;

    public static WalkerApplicationResponse from(WalkerBooking booking, String walkerName, String profileImage, Double rating, String experience) {
        return WalkerApplicationResponse.builder()
                .bookingId(booking.getId())
                .walkerId(booking.getWalkerId())
                .walkerName(walkerName)
                .walkerProfileImage(profileImage)
                .walkerRating(rating)
                .walkerExperience(experience)
                .message(booking.getNotes()) // 워커의 메시지를 notes에 저장
                .proposedPrice(booking.getTotalPrice())
                .appliedAt(booking.getCreateTime())
                .status(booking.getStatus())
                .build();
    }
}