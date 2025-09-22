package com.petmily.backend.api.exception.handler;

import com.petmily.backend.api.exception.CustomException;
import com.petmily.backend.api.exception.ErrorCode;
import com.petmily.backend.api.exception.InvalidCoordinatesException;
import com.petmily.backend.api.exception.LocationRequiredException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class LocationExceptionHandler {

    /**
     * 위치 정보 필수 에러 처리
     */
    @ExceptionHandler(LocationRequiredException.class)
    public ResponseEntity<ErrorResponse> handleLocationRequired(LocationRequiredException e) {
        log.warn("위치 정보 필수 에러: {}", e.getMessage());
        
        ErrorResponse errorResponse = ErrorResponse.builder()
                .code("LOCATION_PERMISSION_REQUIRED")
                .message("위치 정보 제공이 필요합니다. 설정에서 위치 권한을 허용해주세요.")
                .action("SHOW_PERMISSION_GUIDE")  // 프론트엔드에게 권한 안내 UI 표시 지시
                .details(e.getMessage())
                .build();
                
        return ResponseEntity.badRequest().body(errorResponse);
    }

    /**
     * 잘못된 좌표 에러 처리
     */
    @ExceptionHandler(InvalidCoordinatesException.class)
    public ResponseEntity<ErrorResponse> handleInvalidCoordinates(InvalidCoordinatesException e) {
        log.warn("잘못된 좌표 에러: {}", e.getMessage());
        
        ErrorResponse errorResponse = ErrorResponse.builder()
                .code("INVALID_COORDINATES")
                .message("올바르지 않은 위치 정보입니다. 다시 시도해주세요.")
                .action("REQUEST_LOCATION_REFRESH")  // 프론트엔드에게 위치 새로고침 요청
                .details(e.getMessage())
                .build();
                
        return ResponseEntity.badRequest().body(errorResponse);
    }

    /**
     * 비현실적인 위치 변화 에러 처리
     */
    @ExceptionHandler(CustomException.class)
    public ResponseEntity<ErrorResponse> handleUnrealisticLocationChange(CustomException e) {
        if (e.getErrorCode() == ErrorCode.UNREALISTIC_LOCATION_CHANGE) {
            log.warn("비현실적인 위치 변화 감지: {}", e.getMessage());
            
            ErrorResponse errorResponse = ErrorResponse.builder()
                    .code("UNREALISTIC_LOCATION_CHANGE")
                    .message("위치 변화가 너무 빠릅니다. GPS를 다시 확인해주세요.")
                    .action("GPS_ACCURACY_WARNING")  // GPS 정확도 경고 표시
                    .details(e.getMessage())
                    .build();
                    
            return ResponseEntity.badRequest().body(errorResponse);
        }
        
        // 다른 CustomException은 기존 핸들러가 처리하도록 다시 던짐
        throw e;
    }

    /**
     * 위치 서비스 사용 불가 에러 처리
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleLocationServiceUnavailable(Exception e) {
        // GPS 관련 예외 키워드 확인
        String message = e.getMessage() != null ? e.getMessage().toLowerCase() : "";
        
        if (message.contains("gps") || message.contains("location") || message.contains("coordinates")) {
            log.error("위치 서비스 에러: {}", e.getMessage(), e);
            
            ErrorResponse errorResponse = ErrorResponse.builder()
                    .code("LOCATION_SERVICE_UNAVAILABLE")
                    .message("위치 서비스를 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요.")
                    .action("RETRY_LOCATION_SERVICE")  // 위치 서비스 재시도 안내
                    .details("위치 서비스 내부 오류가 발생했습니다.")
                    .build();
                    
            return ResponseEntity.status(503).body(errorResponse);
        }
        
        // GPS와 관련없는 일반 예외는 다시 던짐
        throw new RuntimeException(e);
    }

    /**
     * 에러 응답 구조
     */
    public static class ErrorResponse {
        private final String code;
        private final String message;
        private final String action;
        private final String details;
        private final long timestamp;

        private ErrorResponse(String code, String message, String action, String details) {
            this.code = code;
            this.message = message;
            this.action = action;
            this.details = details;
            this.timestamp = System.currentTimeMillis();
        }

        public static ErrorResponseBuilder builder() {
            return new ErrorResponseBuilder();
        }

        // Getters
        public String getCode() { return code; }
        public String getMessage() { return message; }
        public String getAction() { return action; }
        public String getDetails() { return details; }
        public long getTimestamp() { return timestamp; }

        public static class ErrorResponseBuilder {
            private String code;
            private String message;
            private String action;
            private String details;

            public ErrorResponseBuilder code(String code) {
                this.code = code;
                return this;
            }

            public ErrorResponseBuilder message(String message) {
                this.message = message;
                return this;
            }

            public ErrorResponseBuilder action(String action) {
                this.action = action;
                return this;
            }

            public ErrorResponseBuilder details(String details) {
                this.details = details;
                return this;
            }

            public ErrorResponse build() {
                return new ErrorResponse(code, message, action, details);
            }
        }
    }
}