package com.petmily.backend.api.exception.handler;

import com.petmily.backend.api.common.dto.ApiResponse;
import com.petmily.backend.api.exception.CustomException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(CustomException.class)
    public ResponseEntity<ApiResponse<Void>> handleCustomException(CustomException ex, WebRequest request) {
        log.error("Custom exception occurred: {}", ex.getMessage(), ex);
        
        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .success(false)
                .message(getMobileOptimizedMessage(ex))
                .timestamp(System.currentTimeMillis())
                .build();
                
        return new ResponseEntity<>(response, ex.getErrorCode().getHttpStatus());
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericException(Exception ex, WebRequest request) {
        log.error("Unexpected error occurred", ex);
        
        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .success(false)
                .message("일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.")
                .timestamp(System.currentTimeMillis())
                .build();
                
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    // 모바일 사용자에게 친숙한 메시지로 변환
    private String getMobileOptimizedMessage(CustomException ex) {
        switch (ex.getErrorCode()) {
            case USER_NOT_FOUND:
                return "사용자를 찾을 수 없습니다. 다시 로그인해주세요.";
            case RESOURCE_NOT_FOUND:
                return "요청하신 정보를 찾을 수 없습니다.";
            case NO_ACCESS:
                return "접근 권한이 없습니다.";
            case INVALID_TOKEN:
                return "로그인이 만료되었습니다. 다시 로그인해주세요.";
            default:
                return "일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.";
        }
    }
}