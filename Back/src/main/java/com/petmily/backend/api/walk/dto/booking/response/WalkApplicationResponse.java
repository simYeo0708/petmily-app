package com.petmily.backend.api.walk.dto.booking.response;

import com.petmily.backend.domain.walk.entity.WalkBooking;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class WalkApplicationResponse {
    private Long bookingId;
    private Long walkerId;
    private String walkerName;
    private String walkerProfileImage;
    private Double walkerRating;
    private String walkerExperience;
    private String message;
    private Double proposedPrice;
    private LocalDateTime appliedAt;
    private WalkBooking.BookingStatus status;

    public static WalkApplicationResponse from(WalkBooking booking, String walkerName, String profileImage, Double rating, String experience) {
        return WalkApplicationResponse.builder()
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