package com.petmily.backend.api.user.service;

import com.petmily.backend.api.exception.CustomException;
import com.petmily.backend.api.exception.ErrorCode;
import com.petmily.backend.api.user.dto.ChangePasswordRequest;
import com.petmily.backend.api.user.dto.UserUpdateRequest;
import com.petmily.backend.domain.user.entity.User;
import com.petmily.backend.domain.user.entity.Role;
import com.petmily.backend.domain.user.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    @Test
    @DisplayName("현재 사용자 프로필 조회 성공")
    void getCurrentUser_success() {
        // Given
        String username = "testuser";
        User user = User.builder().id(1L).username(username).name("Test User").email("test@example.com").build();
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));

        // When
        User foundUser = userService.getCurrentUser(username);

        // Then
        assertNotNull(foundUser);
        assertEquals(username, foundUser.getUsername());
        verify(userRepository, times(1)).findByUsername(username);
    }

    @Test
    @DisplayName("현재 사용자 프로필 조회 실패 - 사용자 없음")
    void getCurrentUser_fail_user_not_found() {
        // Given
        String username = "nonexistent";
        when(userRepository.findByUsername(username)).thenReturn(Optional.empty());

        // When & Then
        CustomException exception = assertThrows(CustomException.class, () -> userService.getCurrentUser(username));
        assertEquals(ErrorCode.USER_NOT_FOUND, exception.getErrorCode());
        verify(userRepository, times(1)).findByUsername(username);
    }

    @Test
    @DisplayName("현재 사용자 프로필 업데이트 성공")
    void updateCurrentUser_success() {
        // Given
        String username = "testuser";
        User existingUser = User.builder().id(1L).username(username).name("Old Name").email("old@example.com").role(Role.USER).build();
        UserUpdateRequest request = new UserUpdateRequest();
        request.setName("New Name");
        request.setEmail("new@example.com");

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(existingUser));
        doAnswer(invocation -> {
            User userArg = invocation.getArgument(0);
            existingUser.setName(userArg.getName());
            existingUser.setEmail(userArg.getEmail());
            return existingUser;
        }).when(userRepository).save(any(User.class)); // Return the updated user

        // When
        User updatedUser = userService.updateCurrentUser(username, request);

        // Then
        assertNotNull(updatedUser);
        // USER role cannot change name, so it should remain the same
        assertEquals("Old Name", updatedUser.getName()); 
        assertEquals("new@example.com", updatedUser.getEmail());

        // Verify that save was called with the user object that has the updated email only (name unchanged for USER role)
        verify(userRepository, times(1)).findByUsername(username);
        verify(userRepository, times(1)).save(argThat(userArg ->
                userArg.getName().equals("Old Name") &&
                userArg.getEmail().equals("new@example.com")
        ));
    }

    @Test
    @DisplayName("현재 사용자 프로필 업데이트 실패 - 사용자 없음")
    void updateCurrentUser_fail_user_not_found() {
        // Given
        String username = "nonexistent";
        UserUpdateRequest request = new UserUpdateRequest();
        when(userRepository.findByUsername(username)).thenReturn(Optional.empty());

        // When & Then
        CustomException exception = assertThrows(CustomException.class, () -> userService.updateCurrentUser(username, request));
        assertEquals(ErrorCode.USER_NOT_FOUND, exception.getErrorCode());
        verify(userRepository, times(1)).findByUsername(username);
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("비밀번호 변경 성공")
    void changePassword_success() {
        // Given
        String username = "testuser";
        String oldPassword = "oldPassword";
        String newPassword = "newPassword";
        User user = User.builder().id(1L).username(username).password("encodedOldPassword").build();
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setOldPassword(oldPassword);
        request.setNewPassword(newPassword);

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(oldPassword, "encodedOldPassword")).thenReturn(true);
        when(passwordEncoder.encode(newPassword)).thenReturn("encodedNewPassword");
        when(userRepository.save(any(User.class))).thenReturn(user);

        // When
        userService.changePassword(username, request);

        // Then
        verify(userRepository, times(1)).findByUsername(username);
        verify(passwordEncoder, times(1)).matches(oldPassword, "encodedOldPassword");
        verify(passwordEncoder, times(1)).encode(newPassword);
        verify(userRepository, times(1)).save(user);
        assertEquals("encodedNewPassword", user.getPassword()); // Verify password was updated on the user object
    }

    @Test
    @DisplayName("비밀번호 변경 실패 - 사용자 없음")
    void changePassword_fail_user_not_found() {
        // Given
        String username = "nonexistent";
        ChangePasswordRequest request = new ChangePasswordRequest();
        when(userRepository.findByUsername(username)).thenReturn(Optional.empty());

        // When & Then
        CustomException exception = assertThrows(CustomException.class, () -> userService.changePassword(username, request));
        assertEquals(ErrorCode.USER_NOT_FOUND, exception.getErrorCode());
        verify(userRepository, times(1)).findByUsername(username);
        verify(passwordEncoder, never()).matches(anyString(), anyString());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("비밀번호 변경 실패 - 이전 비밀번호 불일치")
    void changePassword_fail_old_password_mismatch() {
        // Given
        String username = "testuser";
        String oldPassword = "wrongPassword";
        String newPassword = "newPassword";
        User user = User.builder().id(1L).username(username).password("encodedOldPassword").build();
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setOldPassword(oldPassword);
        request.setNewPassword(newPassword);

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(oldPassword, "encodedOldPassword")).thenReturn(false);

        // When & Then
        CustomException exception = assertThrows(CustomException.class, () -> userService.changePassword(username, request));
        assertEquals(ErrorCode.INVALID_PASSWORD, exception.getErrorCode());
        verify(userRepository, times(1)).findByUsername(username);
        verify(passwordEncoder, times(1)).matches(oldPassword, "encodedOldPassword");
        verify(passwordEncoder, never()).encode(anyString());
        verify(userRepository, never()).save(any(User.class));
    }
}
