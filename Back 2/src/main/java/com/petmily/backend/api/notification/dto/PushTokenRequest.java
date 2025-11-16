package com.petmily.backend.api.notification.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PushTokenRequest {

    @NotBlank(message = "Push token is required")
    private String token;

    private String deviceType; // ios, android
    private String deviceId;
}