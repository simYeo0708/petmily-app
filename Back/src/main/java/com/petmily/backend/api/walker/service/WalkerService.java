package com.petmily.backend.api.walker.service;

import com.petmily.backend.api.exception.CustomException;
import com.petmily.backend.api.exception.ErrorCode;
import com.petmily.backend.api.map.dto.Coord;
import com.petmily.backend.api.map.service.KakaoMapService;
import com.petmily.backend.api.walker.dto.walkerProfile.WalkerProfileCreateRequest;
import com.petmily.backend.api.walker.dto.walkerProfile.WalkerProfileResponse;
import com.petmily.backend.api.walker.dto.walkerProfile.WalkerProfileUpdateRequest;
import com.petmily.backend.api.walker.dto.walkerProfile.WalkerSearchRequest;
import com.petmily.backend.domain.walker.entity.WalkerStatus;
import com.petmily.backend.domain.user.entity.User;
import com.petmily.backend.domain.user.repository.UserRepository;
import com.petmily.backend.domain.walker.entity.WalkerProfile;
import com.petmily.backend.domain.walker.entity.FavoriteWalker;
import com.petmily.backend.domain.walker.repository.WalkerProfileRepository;
import com.petmily.backend.domain.walker.repository.FavoriteWalkerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WalkerService {

    private final UserRepository userRepository;
    private final WalkerProfileRepository walkerProfileRepository;
    private final FavoriteWalkerRepository favoriteWalkerRepository;
    private final KakaoMapService kakaoMapService;

    // Earth's radius in kilometers
    private static final double EARTH_RADIUS_KM = 6371.0;
    private static final double MAX_DISTANCE_KM = 30.0; // 30km radius

    @Transactional
    public WalkerProfileResponse registerWalker(String username, WalkerProfileCreateRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        if (walkerProfileRepository.findByUserId(user.getId()).isPresent()) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "User is already registered as a walker.");
        }

        WalkerProfile walkerProfile = WalkerProfile.builder()
                .userId(user.getId())
                .detailDescription(request.getDetailDescription())
                .status(WalkerStatus.PENDING)
                .coordinates(request.getServiceArea())
                .user(user)
                .build();

        walkerProfileRepository.save(walkerProfile);
        return WalkerProfileResponse.from(walkerProfile);
    }

    public WalkerProfileResponse getWalkerProfile(long walkerId) {
        WalkerProfile walkerProfile = walkerProfileRepository.findById(walkerId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "Walker profile not found."));
        return WalkerProfileResponse.from(walkerProfile);
    }

    public List<WalkerProfileResponse> getAllWalkers(WalkerSearchRequest request) {
        // Get current authenticated user's address
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND, "Authenticated user not found."));

        if (currentUser.getAddress() == null || currentUser.getAddress().getRoadAddress() == null || currentUser.getAddress().getRoadAddress().isEmpty()) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "User address not found for location-based search.");
        }

        Coord userCoord = kakaoMapService.geocodeAddress(currentUser.getAddress().getRoadAddress());
        double userLat = userCoord.getLatitude();
        double userLon = userCoord.getLongitude();

        List<WalkerProfile> allWalkers;

        // 즐겨찾기 워커만 보기 필터
        if (request != null && request.isFavoritesOnly()) {
            List<FavoriteWalker> favoriteWalkers = favoriteWalkerRepository.findByUserIdAndIsActiveTrueOrderByCreateTimeDesc(currentUser.getId());
            List<Long> favoriteWalkerIds = favoriteWalkers.stream()
                    .map(FavoriteWalker::getWalkerId)
                    .collect(Collectors.toList());

            if (favoriteWalkerIds.isEmpty()) {
                return new ArrayList<>();
            }

            allWalkers = walkerProfileRepository.findByIdInAndStatus(
                    favoriteWalkerIds, WalkerStatus.ACTIVE);
        } else {
            allWalkers = walkerProfileRepository.findAll();
        }

        return allWalkers.stream()
                .filter(walker -> {
                    try {
                        // Assuming walker.getLocation() returns "latitude,longitude"
                        String[] coords = walker.getCoordinates().split(",");
                        double walkerLat = Double.parseDouble(coords[0]);
                        double walkerLon = Double.parseDouble(coords[1]);
                        return calculateDistance(userLat, userLon, walkerLat, walkerLon) <= MAX_DISTANCE_KM;
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
                    return WalkerProfileResponse.builder()
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

    public WalkerProfileResponse getWalkerProfileByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        WalkerProfile walkerProfile = walkerProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "Walker profile not found."));
        return WalkerProfileResponse.from(walkerProfile);
    }

    @Transactional
    public WalkerProfileResponse updateWalkerProfile(String username, WalkerProfileUpdateRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        WalkerProfile walkerProfile = walkerProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "Walker profile not found."));

        walkerProfile.setDetailDescription(request.getDetailDescription());
        walkerProfile.setCoordinates(request.getServiceArea());
        // Update other fields as needed

        walkerProfileRepository.save(walkerProfile);
        return WalkerProfileResponse.from(walkerProfile);
    }

    @Transactional
    public WalkerProfileResponse updateWalkerStatus(long walkerId, WalkerStatus status) {
        WalkerProfile walkerProfile = walkerProfileRepository.findById(walkerId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "Walker profile not found."));

        walkerProfile.setStatus(status);

        walkerProfileRepository.save(walkerProfile);
        return WalkerProfileResponse.from(walkerProfile);
    }

    @Transactional
    public void addFavoriteWalker(Long walkerId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

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
    public void removeFavoriteWalker(Long walkerId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        FavoriteWalker favorite = favoriteWalkerRepository.findByUserIdAndWalkerIdAndIsActiveTrue(user.getId(), walkerId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "Favorite walker not found"));

        favorite.setIsActive(false);
        favoriteWalkerRepository.save(favorite);
    }

    public List<WalkerProfileResponse> getFavoriteWalkers(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        List<FavoriteWalker> favorites = favoriteWalkerRepository.findByUserIdAndIsActiveTrueOrderByCreateTimeDesc(user.getId());

        return favorites.stream()
                .map(favorite -> {
                    WalkerProfile walker = walkerProfileRepository.findById(favorite.getWalkerId()).orElse(null);
                    return walker != null ? WalkerProfileResponse.from(walker) : null;
                })
                .filter(response -> response != null)
                .collect(Collectors.toList());
    }

    public boolean isFavoriteWalker(Long walkerId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        return favoriteWalkerRepository.existsByUserIdAndWalkerIdAndIsActiveTrue(user.getId(), walkerId);
    }

    // Haversine formula to calculate distance between two points on Earth
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_KM * c; // distance in km
    }
}