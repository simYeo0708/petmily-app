package com.petmily.backend.api.walker.service;

import com.petmily.backend.api.exception.CustomException;
import com.petmily.backend.api.exception.ErrorCode;
import com.petmily.backend.api.map.dto.Coord;
import com.petmily.backend.api.map.service.KakaoMapService;
import com.petmily.backend.api.walker.dto.walker.WalkerCreateRequest;
import com.petmily.backend.api.walker.dto.walker.WalkerResponse;
import com.petmily.backend.api.walker.dto.walker.WalkerUpdateRequest;
import com.petmily.backend.api.walker.dto.walker.WalkerSearchRequest;
import com.petmily.backend.domain.walker.entity.WalkerStatus;
import com.petmily.backend.domain.user.entity.User;
import com.petmily.backend.domain.user.repository.UserRepository;
import com.petmily.backend.domain.walker.entity.Walker;
import com.petmily.backend.domain.walker.repository.WalkerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WalkerService {

    private final UserRepository userRepository;
    private final WalkerRepository walkerRepository;
    private final KakaoMapService kakaoMapService;

    // Earth's radius in kilometers
    private static final double EARTH_RADIUS_KM = 6371.0;
    private static final double MAX_DISTANCE_KM = 30.0; // 30km radius

    @Transactional
    public WalkerResponse registerWalker(Long userId, WalkerCreateRequest request) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

            if (walkerRepository.findByUserId(user.getId()).isPresent()) {
                throw new CustomException(ErrorCode.INVALID_REQUEST, "User is already registered as a walker.");
            }

            // 입력값 검증
            if (request.getDetailDescription() == null || request.getDetailDescription().trim().isEmpty()) {
                throw new CustomException(ErrorCode.INVALID_REQUEST, "자기소개를 입력해주세요.");
            }
            if (request.getServiceArea() == null || request.getServiceArea().trim().isEmpty()) {
                throw new CustomException(ErrorCode.INVALID_REQUEST, "서비스 지역을 입력해주세요.");
            }

            // 빌더로 객체 생성
            Walker walker = Walker.builder()
                    .userId(user.getId())
                    .detailDescription(request.getDetailDescription().trim())
                    .status(WalkerStatus.PENDING)
                    .serviceArea(request.getServiceArea().trim())
                    .user(user)
                    .build();
            
            // hourlyRate는 빌더 후 명시적으로 설정 (빌더의 @Builder.Default가 제대로 작동하지 않을 수 있음)
            walker.setHourlyRate(java.math.BigDecimal.valueOf(15000));
            
            // 검증: hourlyRate가 null이 아니고 양수인지 확인
            if (walker.getHourlyRate() == null || walker.getHourlyRate().compareTo(java.math.BigDecimal.ZERO) <= 0) {
                throw new CustomException(ErrorCode.INVALID_REQUEST, "시간당 요금이 올바르지 않습니다.");
            }

            walker = walkerRepository.save(walker);
            
            // 저장 후 user 관계를 명시적으로 로드하여 LazyInitializationException 방지
            if (walker.getUser() == null) {
                // user가 로드되지 않은 경우 다시 조회
                walker = walkerRepository.findById(walker.getId())
                        .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "워커 정보를 찾을 수 없습니다."));
            }
            
            return WalkerResponse.from(walker);
        } catch (CustomException e) {
            throw e;
        } catch (Exception e) {
            // 예상치 못한 예외를 CustomException으로 변환하여 더 명확한 에러 메시지 제공
            throw new CustomException(ErrorCode.INVALID_REQUEST, "워커 등록 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    @Transactional
    public WalkerResponse registerWalker(String username, WalkerCreateRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        return registerWalker(user.getId(), request);
    }

    public WalkerResponse getWalkerProfile(long walkerId) {
        Walker walker = walkerRepository.findById(walkerId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "Walker profile not found."));
        return WalkerResponse.from(walker);
    }

    public WalkerResponse getWalkerProfileByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        Walker walker = walkerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "Walker profile not found for this user."));
        return WalkerResponse.from(walker);
    }

    public List<WalkerResponse> getAllWalkers(Long userId, WalkerSearchRequest searchRequest) {
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND, "Authenticated user not found."));

        if (currentUser.getAddress() == null || currentUser.getAddress().getRoadAddress() == null || currentUser.getAddress().getRoadAddress().isEmpty()) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "User address not found for location-based search.");
        }

        Coord userCoord = kakaoMapService.geocodeAddress(currentUser.getAddress().getRoadAddress());
        double userLat = userCoord.getLatitude();
        double userLon = userCoord.getLongitude();

        List<Walker> allWalkers = walkerRepository.findAll();

        return allWalkers.stream()
                .filter(walker -> {
                    // Only show available walkers (status is ACTIVE)
                    if (walker.getStatus() != WalkerStatus.ACTIVE) {
                        return false;
                    }
                    
                    try {
                        // Assuming walker.getCoordinates() returns "latitude,longitude"
                        String[] coords = walker.getCoordinates().split(",");
                        double walkerLat = Double.parseDouble(coords[0]);
                        double walkerLon = Double.parseDouble(coords[1]);
                        return calculateDistance(userLat, userLon, walkerLat, walkerLon) <= MAX_DISTANCE_KM;
                    } catch (NumberFormatException | NullPointerException | ArrayIndexOutOfBoundsException e) {
                        // Handle cases where walker location string is malformed or null
                        return false;
                    }
                })
                .sorted((w1, w2) -> {
                    // Sort by rating (highest first), then by distance
                    try {
                        String[] coords1 = w1.getCoordinates().split(",");
                        String[] coords2 = w2.getCoordinates().split(",");
                        double walker1Lat = Double.parseDouble(coords1[0]);
                        double walker1Lon = Double.parseDouble(coords1[1]);
                        double walker2Lat = Double.parseDouble(coords2[0]);
                        double walker2Lon = Double.parseDouble(coords2[1]);
                        
                        double distance1 = calculateDistance(userLat, userLon, walker1Lat, walker1Lon);
                        double distance2 = calculateDistance(userLat, userLon, walker2Lat, walker2Lon);
                        
                        // First sort by rating (descending), then by distance (ascending)
                        int ratingComparison = Double.compare(w2.getRating(), w1.getRating());
                        if (ratingComparison != 0) {
                            return ratingComparison;
                        }
                        return Double.compare(distance1, distance2);
                    } catch (Exception e) {
                        return 0;
                    }
                })
                .map(WalkerResponse::from)
                .collect(Collectors.toList());
    }

    public WalkerResponse getWalkerByUserId(Long userId) {
        Walker walker = walkerRepository.findByUserId(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "Walker profile not found for this user."));
        return WalkerResponse.from(walker);
    }

    @Transactional
    public WalkerResponse updateCurrentWalkerProfile(Long userId, WalkerUpdateRequest request) {
        Walker walker = walkerRepository.findByUserId(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "Walker profile not found for this user."));

        walker.setDetailDescription(request.getDetailDescription());
        walker.setServiceArea(request.getServiceArea());
        // Update other fields as needed

        walkerRepository.save(walker);
        return WalkerResponse.from(walker);
    }

    @Transactional
    public WalkerResponse updateWalkerProfile(String username, WalkerUpdateRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        return updateCurrentWalkerProfile(user.getId(), request);
    }

    // 즐겨찾기 기능 (향후 구현 예정)
    @Transactional
    public void addFavoriteWalker(Long walkerId, Long userId) {
        // TODO: 즐겨찾기 기능 구현
    }

    @Transactional
    public void removeFavoriteWalker(Long walkerId, Long userId) {
        // TODO: 즐겨찾기 기능 구현
    }

    public List<WalkerResponse> getFavoriteWalkers(Long userId) {
        // TODO: 즐겨찾기 기능 구현
        return List.of();
    }

    public boolean isFavoriteWalker(Long walkerId, Long userId) {
        // TODO: 즐겨찾기 기능 구현
        return false;
    }

    @Transactional
    /**
     * PENDING 상태의 워커 목록 조회 (관리자 전용)
     */
    public List<WalkerResponse> getPendingWalkers() {
        List<Walker> pendingWalkers = walkerRepository.findByStatus(WalkerStatus.PENDING);
        return pendingWalkers.stream()
                .map(WalkerResponse::from)
                .collect(Collectors.toList());
    }

    public WalkerResponse updateWalkerStatus(long walkerId, WalkerStatus status) {
        Walker walker = walkerRepository.findById(walkerId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "Walker profile not found."));

        walker.setStatus(status);

        walkerRepository.save(walker);
        return WalkerResponse.from(walker);
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