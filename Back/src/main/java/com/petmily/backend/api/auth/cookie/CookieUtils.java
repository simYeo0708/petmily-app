package com.petmily.backend.api.auth.cookie;

import com.petmily.backend.api.auth.dto.response.TokenResponse;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.Cookie;
import org.springframework.http.ResponseCookie;

public final class CookieUtils {

    public static void setCookie(HttpServletResponse response, TokenResponse tokenResponse) {
        ResponseCookie accessTokenCookie = ResponseCookie.from("accessToken", tokenResponse.getAccessToken())
                .path("/")
                .httpOnly(true)
                .secure(false) // true는 https 환경에서만 전송
                .maxAge(3600) // 1시간
                .build();
        response.addHeader("Set-Cookie", accessTokenCookie.toString());

        ResponseCookie refreshTokenCookie = ResponseCookie.from("refreshToken", tokenResponse.getRefreshToken())
                .path("/")
                .httpOnly(true)
                .secure(false)
                .maxAge(604800) // 7일
                .build();
        response.addHeader("Set-Cookie", refreshTokenCookie.toString());
    }

    public static void deleteCookie(HttpServletResponse response) {
        ResponseCookie accessTokenCookie = ResponseCookie.from("accessToken", null)
                .path("/")
                .maxAge(0)
                .build();
        response.addHeader("Set-Cookie", accessTokenCookie.toString());

        ResponseCookie refreshTokenCookie = ResponseCookie.from("refreshToken", null)
                .path("/")
                .maxAge(0)
                .build();
        response.addHeader("Set-Cookie", refreshTokenCookie.toString());

    }

    public static String getCookie(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals(name)) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }

}
