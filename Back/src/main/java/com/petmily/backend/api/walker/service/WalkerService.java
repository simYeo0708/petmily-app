package com.petmily.backend.api.walker.service;

import com.petmily.backend.api.common.service.LocationValidationService;

import com.petmily.backend.api.exception.CustomException;
import com.petmily.backend.api.exception.ErrorCode;
import com.petmily.backend.api.map.dto.Coord;
import com.petmily.backend.api.map.service.KakaoMapService;
import com.petmily.backend.api.walker.dto.walker.WalkerCreateRequest;
import com.petmily.backend.api.walker.dto.walker.WalkerResponse;
import com.petmily.backend.api.walker.dto.walker.WalkerUpdateRequest;
import com.petmily.backend.api.walker.dto.walker.WalkerSearchRequest;
import com.petmily.backend.domain.user.entity.User;
import com.petmily.backend.domain.user.repository.UserRepository;
import com.petmily.backend.domain.walker.entity.FavoriteWalker;
import com.petmily.backend.domain.walker.entity.Walker;
import com.petmily.backend.domain.walker.entity.WalkerStatus;
import com.petmily.backend.domain.walker.repository.FavoriteWalkerRepository;
import com.petmily.backend.domain.walker.repository.WalkerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WalkerService {

    private final UserRepository userRepository;
    private final WalkerRepository walkerRepository;
    private final FavoriteWalkerRepository favoriteWalkerRepository;
    private final KakaoMapService kakaoMapService;

    // Earth's radius in kilometers
    private static final double EARTH_RADIUS_KM = 6371.0;
    private static final double MAX_DISTANCE_KM = 30.0; // 30km radius

    private User findUserById(Long userId){
        return userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
    }

    private Walker findWalkerById(Long walkerId){
        return walkerRepository.findById(walkerId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "Walker not found"));
    }

    @Transactional
    public WalkerResponse registerWalker(Long userId, WalkerCreateRequest request) {
        User user = findUserById(userId);

        if (walkerRepository.findByUserId(user.getId()).isPresent()) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "User is already registered as a walker.");
        }

        Walker walker = Walker.builder()
                .userId(user.getId())
                .detailDescription(request.getDetailDescription())
                .status(WalkerStatus.PENDING)
                .coordinates(request.getServiceArea())
                .user(user)
                .build();

        walkerRepository.save(walker);
        return WalkerResponse.from(walker);
    }

    public WalkerResponse getWalkerProfile(Long walkerId) {
        Walker walker = findWalkerById(walkerId);
        return WalkerResponse.from(walker);
    }

    public List<WalkerResponse> getAllWalkers(Long userId, WalkerSearchRequest request) {
        // Get current authenticated user's address
        User currentUser = findUserById(userId);

        if (currentUser.getAddress() == null || currentUser.getAddress().getRoadAddress() == null || currentUser.getAddress().getRoadAddress().isEmpty()) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "User address not found for location-based search.");
        }

        Coord userCoord = kakaoMapService.geocodeAddress(currentUser.getAddress().getRoadAddress());
        double userLat = userCoord.getLatitude();
        double userLon = userCoord.getLongitude();

        List<Walker> allWalkers;

        // 즐겨찾기 워커만 보기 필터
        if (request != null && request.isFavoritesOnly()) {
            List<FavoriteWalker> favoriteWalkers = favoriteWalkerRepository.findByUserIdAndIsActiveTrueOrderByCreatedAtDesc(currentUser.getId());
            List<Long> favoriteWalkerIds = favoriteWalkers.stream()
                    .map(FavoriteWalker::getWalkerId)
                    .collect(Collectors.toList());

            if (favoriteWalkerIds.isEmpty()) {
                return new ArrayList<>();
            }

            allWalkers = walkerRepository.findByIdInAndStatus(
                    favoriteWalkerIds, WalkerStatus.ACTIVE);
        } else {
            allWalkers = walkerRepository.findAll();
        }

        return allWalkers.stream()
                .filter(walker -> {
                    try {
                        // Assuming walker.getLocation() returns "latitude,longitude"
                        String[] coords = walker.getCoordinates().split(",");
                        double walkerLat = Double.parseDouble(coords[0]);
                        double walkerLon = Double.parseDouble(coords[1]);
                        return LocationValidationService.calculateDistance(userLat, userLon, walkerLat, walkerLon) <= MAX_DISTANCE_KM;
                    } catch (NumberFormatException | NullPointerException | ArrayIndexOutOfBoundsException e) {
                        // Handle cases where walker location string is malformed or null
                        return false;
                    }
                })
                .map(walker -> {
                    boolean isFavorite = favoriteWalkerRepository.existsByUserIdAndWalkerIdAndIsActiveTrue(
                            currentUser.getId(), walker.getId());

                    // Builder 패턴으로 즐겨찾기 여부 포함해서 생성
                    User user = walker.getUser();
                    return WalkerResponse.builder()
                            .id(walker.getId())
                            .userId(walker.getUserId())
                            .username(user != null ? user.getUsername() : null)
                            .name(user != null ? user.getName() : null)
                            .email(user != null ? user.getEmail() : null)
                            .detailDescription(walker.getDetailDescription())
                            .rating(walker.getRating())
                            .hourlyRate(walker.getHourlyRate())
                            .status(walker.getStatus())
                            .coordinates(walker.getCoordinates())
                            .isFavorite(isFavorite)
                            .build();
                })
                .collect(Collectors.toList());
    }

    public WalkerResponse getWalkerByUserId(Long userId) {
        User user = findUserById(userId);
        Walker walker = findWalkerById(user.getId());
        return WalkerResponse.from(walker);
    }

    @Transactional
    public WalkerResponse updateCurrentWalkerProfile(Long userId, WalkerUpdateRequest request) {
        User user = findUserById(userId);
        Walker walker = findWalkerById(user.getId());

        walker.setDetailDescription(request.getDetailDescription());
        walker.setCoordinates(request.getServiceArea());
        // Update other fields as needed

        walkerRepository.save(walker);
        return WalkerResponse.from(walker);
    }

    @Transactional
    public WalkerResponse updateWalkerStatus(Long walkerId, WalkerStatus status) {
        Walker walker = findWalkerById(walkerId);
        walker.setStatus(status);

        walkerRepository.save(walker);
        return WalkerResponse.from(walker);
    }

    @Transactional
    public void addFavoriteWalker(Long walkerId, Long userId) {
        User user = findUserById(userId);

        if (favoriteWalkerRepository.existsByUserIdAndWalkerIdAndIsActiveTrue(user.getId(), walkerId)) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "Walker already in favorites");
        }

        FavoriteWalker favorite = FavoriteWalker.builder()
                .userId(user.getId())
                .walkerId(walkerId)
                .isActive(true)
                .build();

        favoriteWalkerRepository.save(favorite);
    }

    @Transactional
    public void removeFavoriteWalker(Long walkerId, Long userId) {
        User user = findUserById(userId);

        FavoriteWalker favorite = favoriteWalkerRepository.findByUserIdAndWalkerIdAndIsActiveTrue(user.getId(), walkerId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "Favorite walker not found"));

        favorite.setIsActive(false);
        favoriteWalkerRepository.save(favorite);
    }

    public List<WalkerResponse> getFavoriteWalkers(Long userId) {
        User user = findUserById(userId);

        List<FavoriteWalker> favorites = favoriteWalkerRepository.findByUserIdAndIsActiveTrueOrderByCreatedAtDesc(user.getId());

        return favorites.stream()
                .map(favorite -> {
                    Walker walker = walkerRepository.findById(favorite.getWalkerId()).orElse(null);
                    return walker != null ? WalkerResponse.from(walker) : null;
                })
                .filter(response -> response != null)
                .collect(Collectors.toList());
    }

    public boolean isFavoriteWalker(Long walkerId, Long userId) {
        User user = findUserById(userId);

        return favoriteWalkerRepository.existsByUserIdAndWalkerIdAndIsActiveTrue(user.getId(), walkerId);
    }

}