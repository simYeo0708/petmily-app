package com.petmily.backend.api.auth.service;

import com.petmily.backend.domain.user.entity.Role;
import com.petmily.backend.domain.user.entity.User;
import com.petmily.backend.domain.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
@DisplayName("CustomUserDetailsService 테스트")
class CustomUserDetailsServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CustomUserDetailsService customUserDetailsService;

    private User testUser;
    private String testUsername;
    private String testPassword;

    @BeforeEach
    void setUp() {
        testUsername = "testuser";
        testPassword = "password123";

        testUser = User.builder()
                .id(1L)
                .username(testUsername)
                .password(testPassword)
                .email("test@example.com")
                .name("Test User")
                .phone("010-1234-5678")
                .role(Role.USER)
                .build();
    }

    @Test
    @DisplayName("사용자 이름으로 사용자를 성공적으로 로드한다")
    void loadUserByUsername_Success() {
        // given
        given(userRepository.findByUsername(testUsername))
                .willReturn(Optional.of(testUser));

        // when
        UserDetails userDetails = customUserDetailsService.loadUserByUsername(testUsername);

        // then
        assertThat(userDetails).isNotNull();
        assertThat(userDetails.getUsername()).isEqualTo(testUsername);
        assertThat(userDetails.getPassword()).isEqualTo(testPassword);
        assertThat(userDetails.getAuthorities()).hasSize(1);
        assertThat(userDetails.getAuthorities())
                .extracting(GrantedAuthority::getAuthority)
                .containsExactly("ROLE_USER");

        verify(userRepository).findByUsername(testUsername);
    }

    @Test
    @DisplayName("WALKER 역할을 가진 사용자를 성공적으로 로드한다")
    void loadUserByUsername_WithWalkerRole_Success() {
        // given
        User walkerUser = User.builder()
                .id(2L)
                .username("walker")
                .password("walkerpass")
                .email("walker@example.com")
                .name("Walker User")
                .phone("010-9876-5432")
                .role(Role.WALKER)
                .build();

        given(userRepository.findByUsername("walker"))
                .willReturn(Optional.of(walkerUser));

        // when
        UserDetails userDetails = customUserDetailsService.loadUserByUsername("walker");

        // then
        assertThat(userDetails).isNotNull();
        assertThat(userDetails.getUsername()).isEqualTo("walker");
        assertThat(userDetails.getPassword()).isEqualTo("walkerpass");
        assertThat(userDetails.getAuthorities()).hasSize(1);
        assertThat(userDetails.getAuthorities())
                .extracting(GrantedAuthority::getAuthority)
                .containsExactly("ROLE_WALKER");

        verify(userRepository).findByUsername("walker");
    }

    @Test
    @DisplayName("ADMIN 역할을 가진 사용자를 성공적으로 로드한다")
    void loadUserByUsername_WithAdminRole_Success() {
        // given
        User adminUser = User.builder()
                .id(3L)
                .username("admin")
                .password("adminpass")
                .email("admin@example.com")
                .name("Admin User")
                .phone("010-1111-2222")
                .role(Role.ADMIN)
                .build();

        given(userRepository.findByUsername("admin"))
                .willReturn(Optional.of(adminUser));

        // when
        UserDetails userDetails = customUserDetailsService.loadUserByUsername("admin");

        // then
        assertThat(userDetails).isNotNull();
        assertThat(userDetails.getUsername()).isEqualTo("admin");
        assertThat(userDetails.getPassword()).isEqualTo("adminpass");
        assertThat(userDetails.getAuthorities()).hasSize(1);
        assertThat(userDetails.getAuthorities())
                .extracting(GrantedAuthority::getAuthority)
                .containsExactly("ROLE_ADMIN");

        verify(userRepository).findByUsername("admin");
    }

    @Test
    @DisplayName("존재하지 않는 사용자 이름으로 조회 시 UsernameNotFoundException이 발생한다")
    void loadUserByUsername_UserNotFound_ThrowsException() {
        // given
        String nonExistentUsername = "nonexistent";
        given(userRepository.findByUsername(nonExistentUsername))
                .willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> customUserDetailsService.loadUserByUsername(nonExistentUsername))
                .isInstanceOf(UsernameNotFoundException.class)
                .hasMessage("User not found with username: " + nonExistentUsername);

        verify(userRepository).findByUsername(nonExistentUsername);
    }

    @Test
    @DisplayName("빈 사용자 이름으로 조회 시 UsernameNotFoundException이 발생한다")
    void loadUserByUsername_EmptyUsername_ThrowsException() {
        // given
        String emptyUsername = "";
        given(userRepository.findByUsername(emptyUsername))
                .willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> customUserDetailsService.loadUserByUsername(emptyUsername))
                .isInstanceOf(UsernameNotFoundException.class)
                .hasMessage("User not found with username: " + emptyUsername);

        verify(userRepository).findByUsername(emptyUsername);
    }

    @Test
    @DisplayName("null 사용자 이름으로 조회 시 UsernameNotFoundException이 발생한다")
    void loadUserByUsername_NullUsername_ThrowsException() {
        // given
        String nullUsername = null;
        given(userRepository.findByUsername(nullUsername))
                .willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> customUserDetailsService.loadUserByUsername(nullUsername))
                .isInstanceOf(UsernameNotFoundException.class)
                .hasMessage("User not found with username: " + nullUsername);

        verify(userRepository).findByUsername(nullUsername);
    }

    @Test
    @DisplayName("비밀번호가 null인 사용자도 성공적으로 로드한다")
    void loadUserByUsername_WithNullPassword_Success() {
        // given
        User userWithNullPassword = User.builder()
                .id(4L)
                .username("oauth_user")
                .password(null) // OAuth users might have null password
                .email("oauth@example.com")
                .name("OAuth User")
                .phone("010-3333-4444")
                .role(Role.USER)
                .provider("google")
                .providerId("google123")
                .build();

        given(userRepository.findByUsername("oauth_user"))
                .willReturn(Optional.of(userWithNullPassword));

        // when
        UserDetails userDetails = customUserDetailsService.loadUserByUsername("oauth_user");

        // then
        assertThat(userDetails).isNotNull();
        assertThat(userDetails.getUsername()).isEqualTo("oauth_user");
        assertThat(userDetails.getPassword()).isEqualTo("");
        assertThat(userDetails.getAuthorities()).hasSize(1);
        assertThat(userDetails.getAuthorities())
                .extracting(GrantedAuthority::getAuthority)
                .containsExactly("ROLE_USER");

        verify(userRepository).findByUsername("oauth_user");
    }

    @Test
    @DisplayName("UserDetails 객체의 기본 속성들이 올바르게 설정된다")
    void loadUserByUsername_UserDetailsProperties() {
        // given
        given(userRepository.findByUsername(testUsername))
                .willReturn(Optional.of(testUser));

        // when
        UserDetails userDetails = customUserDetailsService.loadUserByUsername(testUsername);

        // then
        assertThat(userDetails.isAccountNonExpired()).isTrue();
        assertThat(userDetails.isAccountNonLocked()).isTrue();
        assertThat(userDetails.isCredentialsNonExpired()).isTrue();
        assertThat(userDetails.isEnabled()).isTrue();
    }

    @Test
    @DisplayName("대소문자를 구분하는 사용자 이름 검색이 정확히 동작한다")
    void loadUserByUsername_CaseSensitive() {
        // given
        String upperCaseUsername = "TESTUSER";
        given(userRepository.findByUsername(upperCaseUsername))
                .willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> customUserDetailsService.loadUserByUsername(upperCaseUsername))
                .isInstanceOf(UsernameNotFoundException.class)
                .hasMessage("User not found with username: " + upperCaseUsername);

        verify(userRepository).findByUsername(upperCaseUsername);
    }
}