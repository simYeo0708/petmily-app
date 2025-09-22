package com.petmily.backend.api.user.service;

import com.petmily.backend.api.exception.CustomException;
import com.petmily.backend.api.exception.ErrorCode;
import com.petmily.backend.api.user.dto.ChangePasswordRequest;
import com.petmily.backend.api.user.dto.UserUpdateRequest;
import com.petmily.backend.domain.user.entity.Address;
import com.petmily.backend.domain.user.entity.User;
import com.petmily.backend.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public User getUserById(long id){
        return userRepository.findById(id).orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

    }

    public List<User> getAllUsers(){
        return userRepository.findAll();
    }

    @Transactional
    public User updateUser(UserUpdateRequest request, long id){
        User user = userRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        update(user, request);

        return userRepository.save(user);
    }

    public User getCurrentUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
    }

    @Transactional
    public User updateCurrentUser(String username, UserUpdateRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        update(user, request);

        return userRepository.save(user);
    }

    @Transactional
    public void changePassword(String username, ChangePasswordRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new CustomException(ErrorCode.INVALID_PASSWORD); // Or a more specific error
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    private void update(User user, UserUpdateRequest request) {
        switch(user.getRole()) {
            case ADMIN:
                user.setUsername(request.getUsername());
                user.setPassword(passwordEncoder.encode(request.getPassword()));
                user.setEmail(request.getEmail());
                user.setName(request.getName());
                user.setProfile(request.getProfile());
                user.setPhone(request.getPhone());
                user.setAddress(new Address(request.getRoadAddress(), request.getAddressDetail(), request.getZipCode()));
                break;

            case USER:
                user.setEmail(request.getEmail());
                user.setProfile(request.getProfile());
                user.setAddress(new Address(request.getRoadAddress(), request.getAddressDetail(), request.getZipCode()));
                break;

        }

    }
}
