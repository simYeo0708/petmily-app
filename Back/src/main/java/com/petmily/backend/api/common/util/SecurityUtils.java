package com.petmily.backend.api.common.util;

import com.petmily.backend.api.auth.dto.model.PrincipalDetails;
import com.petmily.backend.api.exception.CustomException;
import com.petmily.backend.api.exception.ErrorCode;
import com.petmily.backend.domain.user.entity.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;

public class SecurityUtils {
    
    /**
     * UserDetails에서 사용자 ID를 추출합니다.
     */
    public static Long getUserId(UserDetails userDetails) {
        if (userDetails instanceof PrincipalDetails principalDetails) {
            return principalDetails.getUser().getId();
        }
        
        // PrincipalDetails가 아닌 경우 예외 처리
        throw new CustomException(ErrorCode.INVALID_REQUEST);
    }
    
    /**
     * 인증 정보가 없을 수 있는 상황에서 ID를 가져오되, 없으면 null 반환
     */
    public static Long getUserIdOrNull(UserDetails userDetails) {
        if (userDetails instanceof PrincipalDetails principalDetails) {
            return principalDetails.getUser().getId();
        }
        return null;
    }
    
    /**
     * UserDetails에서 User 엔티티를 추출합니다.
     */
    public static User getUser(UserDetails userDetails) {
        if (userDetails instanceof PrincipalDetails principalDetails) {
            return principalDetails.getUser();
        }
        
        // PrincipalDetails가 아닌 경우 예외 처리
        throw new CustomException(ErrorCode.INVALID_REQUEST);
    }
    
    /**
     * Authentication에서 사용자 ID를 추출합니다.
     */
    public static Long getUserId(Authentication authentication) {
        if (authentication.getPrincipal() instanceof PrincipalDetails principalDetails) {
            return principalDetails.getUser().getId();
        }
        
        // PrincipalDetails가 아닌 경우 예외 처리
        throw new CustomException(ErrorCode.INVALID_REQUEST);
    }
    
    /**
     * Authentication에서 User 엔티티를 추출합니다.
     */
    public static User getUser(Authentication authentication) {
        if (authentication.getPrincipal() instanceof PrincipalDetails principalDetails) {
            return principalDetails.getUser();
        }
        
        // PrincipalDetails가 아닌 경우 예외 처리
        throw new CustomException(ErrorCode.INVALID_REQUEST);
    }
    
    /**
     * 사용자가 특정 리소스에 접근할 권한이 있는지 확인합니다.
     */
    public static void validateUserAccess(UserDetails userDetails, Long targetUserId) {
        Long currentUserId = getUserId(userDetails);
        if (!currentUserId.equals(targetUserId)) {
            throw new CustomException(ErrorCode.NO_ACCESS);
        }
    }
}