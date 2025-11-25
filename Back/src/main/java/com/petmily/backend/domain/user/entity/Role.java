package com.petmily.backend.domain.user.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;

@RequiredArgsConstructor
@Getter
public enum Role implements GrantedAuthority {
    USER("ROLE_USER"),
    WALKER("ROLE_WALKER"),
    SELLER("ROLE_SELLER"),
    ADMIN("ROLE_ADMIN");

    private final String key;

    @Override
    public String getAuthority() {
        return key;
    }
}
