package com.petmily.backend.api.auth.service;

import com.petmily.backend.domain.user.entity.User;
import com.petmily.backend.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        System.out.println("🔍 CustomUserDetailsService.loadUserByUsername called with: " + username);
        
        // username 또는 email로 사용자 찾기
        User user = userRepository.findByUsername(username)
                .or(() -> userRepository.findByEmail(username))
                .orElseThrow(() -> {
                    System.err.println("❌ User not found with username or email: " + username);
                    return new UsernameNotFoundException("User not found with username or email: " + username);
                });

        System.out.println("✅ User found: id=" + user.getId() + ", username=" + user.getUsername() + ", email=" + user.getEmail());
        System.out.println("✅ Password hash: " + (user.getPassword() != null ? user.getPassword().substring(0, Math.min(20, user.getPassword().length())) + "..." : "null"));
        System.out.println("✅ Role: " + user.getRole());
        
        // Spring Security UserDetails 반환 - username을 그대로 사용
        // 이 username은 Authentication.getName()으로 반환됩니다
        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword() != null ? user.getPassword() : "",
                Collections.singletonList(new SimpleGrantedAuthority(user.getRole().getAuthority()))
        );
    }
}

