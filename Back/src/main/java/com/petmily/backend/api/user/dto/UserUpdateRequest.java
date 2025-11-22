package com.petmily.backend.api.user.dto;

import lombok.Data;

@Data
public class UserUpdateRequest {
    private String username;
    private String password;
    private String name;
    private String email;
    private String profile;
    private String phone;
    private String roadAddress;
    private String addressDetail;
    private String zipCode;
}
