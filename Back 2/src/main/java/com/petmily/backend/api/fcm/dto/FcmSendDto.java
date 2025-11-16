package com.petmily.backend.api.fcm.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@ToString
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class FcmSendDto {

    @NotBlank(message = "FCM 토큰은 필수입니다")
    private String token;

    @NotBlank(message = "제목은 필수입니다")
    @Size(max = 100, message = "제목은 100자 이하여야 합니다")
    private String title;

    @NotBlank(message = "내용은 필수입니다")
    @Size(max = 500, message = "내용은 500자 이하여야 합니다")
    private String body;

    @Builder(toBuilder = true)
    public FcmSendDto(String token, String title, String body) {
        this.token = token;
        this.title = title;
        this.body = body;
    }

}
