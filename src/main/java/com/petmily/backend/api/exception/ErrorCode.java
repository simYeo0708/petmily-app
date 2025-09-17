package com.petmily.backend.api.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

import static org.springframework.http.HttpStatus.*;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // auth
    ILLEGAL_REGISTRATION_ID(NOT_ACCEPTABLE, "illegal registration id"),
    TOKEN_EXPIRED(UNAUTHORIZED, "토큰이 만료되었습니다."),
    INVALID_TOKEN(UNAUTHORIZED, "올바르지 않은 토큰입니다."),
    INVALID_JWT_SIGNATURE(UNAUTHORIZED, "잘못된 JWT 시그니처입니다."),
    INVALID_PASSWORD(UNAUTHORIZED, "비밀번호가 일치하지 않습니다."),

    // member
    USER_NOT_FOUND(NOT_FOUND, "회원을 찾을 수 없습니다."),

    // payment history
    INVALID_PAYMENT(BAD_REQUEST, "결제 정보가 일치하지 않습니다."),

    // notification
    NOTIFICATION_NOT_FOUND(NOT_FOUND, "알림을 찾을 수 없습니다."),

    // location
    LOCATION_REQUIRED(BAD_REQUEST, "위치 정보가 필요합니다."),
    INVALID_COORDINATES(BAD_REQUEST, "올바르지 않은 좌표입니다."),
    LOCATION_PERMISSION_REQUIRED(BAD_REQUEST, "위치 권한이 필요합니다."),
    UNREALISTIC_LOCATION_CHANGE(BAD_REQUEST, "비현실적인 위치 변화입니다."),
    LOCATION_SERVICE_UNAVAILABLE(SERVICE_UNAVAILABLE, "위치 서비스를 사용할 수 없습니다."),

    // global
    RESOURCE_LOCKED(LOCKED, "자원이 잠겨있어 접근할 수 없습니다."),
    NO_ACCESS(FORBIDDEN, "접근 권한이 없습니다."),
    RESOURCE_NOT_FOUND(NOT_FOUND, "요청한 자원을 찾을 수 없습니다."),
    INVALID_REQUEST(BAD_REQUEST, "올바르지 않은 요청입니다."),
    INTERNAL_ERROR(INTERNAL_SERVER_ERROR, "예상치못한 에러가 발생했습니다.");

    private final HttpStatus httpStatus;
    private final String message;

}
