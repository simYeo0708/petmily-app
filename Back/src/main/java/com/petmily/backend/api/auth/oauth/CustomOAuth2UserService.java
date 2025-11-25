package com.petmily.backend.api.auth.oauth;

import com.petmily.backend.api.auth.oauth.info.GoogleOAuth2UserInfo;
import com.petmily.backend.api.auth.oauth.info.KakaoOAuth2UserInfo;
import com.petmily.backend.api.auth.oauth.info.NaverOAuth2UserInfo;
import com.petmily.backend.api.auth.oauth.info.OAuth2UserInfo;
import com.petmily.backend.domain.user.entity.Role;
import com.petmily.backend.domain.user.entity.User;
import com.petmily.backend.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        OAuth2UserInfo oAuth2UserInfo = getOAuth2UserInfo(registrationId, oAuth2User.getAttributes());

        String providerId = oAuth2UserInfo.getProviderId();
        String email = oAuth2UserInfo.getEmail();
        String name = oAuth2UserInfo.getName();
        String profileImage = oAuth2UserInfo.getProfileImage();
        String provider = oAuth2UserInfo.getProvider();

        User user = userRepository.findByEmail(email)
                .map(entity -> entity.update(name, profileImage))
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .username(email) // Use email as username for OAuth2 users
                            .email(email)
                            .name(name)
                            .profile(profileImage)
                            .role(Role.USER)
                            .provider(provider)
                            .providerId(providerId)
                            .build();
                    return userRepository.save(newUser);
                });

        return new CustomOAuth2User(user, oAuth2User.getAttributes());
    }

    private OAuth2UserInfo getOAuth2UserInfo(String registrationId, Map<String, Object> attributes) {
        if ("google".equals(registrationId)) {
            return new GoogleOAuth2UserInfo(attributes);
        } else if ("kakao".equals(registrationId)) {
            return new KakaoOAuth2UserInfo(attributes);
        } else if ("naver".equals(registrationId)) {
            return new NaverOAuth2UserInfo(attributes);
        } else {
            throw new OAuth2AuthenticationException("Unsupported social login: " + registrationId);
        }
    }
}