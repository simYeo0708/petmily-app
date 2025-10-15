package com.petmily.backend.api.user.controller;

import com.petmily.backend.api.common.util.SecurityUtils;
import com.petmily.backend.api.user.dto.ChangePasswordRequest;
import com.petmily.backend.api.user.dto.UserUpdateRequest;
import com.petmily.backend.api.user.service.UserService;
import com.petmily.backend.domain.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("{id}")
    public ResponseEntity<User> getUserById(@PathVariable long id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    @GetMapping("all")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @PutMapping("{id}")
    public ResponseEntity<User> updateUser(@RequestBody UserUpdateRequest request, @PathVariable long id) {
        User updatedUser = userService.updateUser(request, id);
        return ResponseEntity.ok(updatedUser);
    }

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(Authentication authentication) {
        Long userId = SecurityUtils.getUserId(authentication);
        return ResponseEntity.ok(userService.getCurrentUser(userId));
    }

    @PutMapping("/me")
    public ResponseEntity<User> updateCurrentUser(
            @RequestBody UserUpdateRequest request,
            Authentication authentication) {
        Long userId = SecurityUtils.getUserId(authentication);
        return ResponseEntity.ok(userService.updateCurrentUser(userId, request));
    }

    @PutMapping("/me/password")
    public ResponseEntity<Void> changePassword(
            @RequestBody ChangePasswordRequest request,
            Authentication authentication) {
        Long userId = SecurityUtils.getUserId(authentication);
        userService.changePassword(userId, request);
        return ResponseEntity.ok().build();
    }
}
