package com.petmily.backend.api.walker.service;

import com.petmily.backend.api.common.util.SecurityUtils;
import com.petmily.backend.api.exception.CustomException;
import com.petmily.backend.api.exception.ErrorCode;
import com.petmily.backend.api.map.dto.Coord;
import com.petmily.backend.api.map.service.KakaoMapService;
import com.petmily.backend.api.walker.dto.walkerProfile.WalkerProfileResponse;
import com.petmily.backend.api.walker.dto.walkerProfile.WalkerSearchRequest;
import com.petmily.backend.domain.user.entity.User;
import com.petmily.backend.domain.user.repository.UserRepository;
import com.petmily.backend.domain.walker.entity.FavoriteWalker;
import com.petmily.backend.domain.walker.entity.WalkerProfile;
import com.petmily.backend.domain.walker.entity.WalkerStatus;
import com.petmily.backend.domain.walker.repository.FavoriteWalkerRepository;
import com.petmily.backend.domain.walker.repository.WalkerProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class WalkerSearchService {

    private final UserRepository userRepository;
    private final WalkerProfileRepository walkerProfileRepository;
    private final FavoriteWalkerRepository favoriteWalkerRepository;
    private final KakaoMapService kakaoMapService;

    private static final double EARTH_RADIUS_KM = 6371.0;
    private static final double DEFAULT_MAX_DISTANCE_KM = 30.0;

    /**
     * 고급 워커 검색
     */
    public Page<WalkerProfileResponse> searchWalkers(WalkerSearchRequest request, Authentication authentication) {
        // 1. SecurityUtils로 현재 사용자 정보 가져오기
        User currentUser = SecurityUtils.getUser(authentication);

        // 최신 주소 정보가 필요한 경우만 DB에서 다시 조회
        if (request.getUserLatitude() == null && request.getUserLongitude() == null) {
            currentUser = userRepository.findById(currentUser.getId())
                    .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND, "사용자를 찾을 수 없습니다."));
        }

        Coord userCoord = getUserCoordinates(currentUser, request);

        // 2. 기본 워커 리스트 가져오기
        List<WalkerProfile> walkers = getBaseWalkerList(request, currentUser);

        // 3. 필터링 적용
        List<WalkerProfile> filteredWalkers = applyFilters(walkers, request, userCoord);

        // 4. 정렬 적용
        List<WalkerProfile> sortedWalkers = applySorting(filteredWalkers, request, userCoord);

        // 5. 페이징 적용
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize());
        return applyPagination(sortedWalkers, pageable, currentUser.getId());
    }

    /**
     * 사용자 좌표 확인
     */
    private Coord getUserCoordinates(User user, WalkerSearchRequest request) {
        // 요청에 좌표가 있으면 사용
        if (request.getUserLatitude() != null && request.getUserLongitude() != null) {
            return new Coord(request.getUserLatitude(), request.getUserLongitude());
        }

        // 사용자 주소에서 좌표 추출
        if (user.getAddress() == null || user.getAddress().getRoadAddress() == null ||
            user.getAddress().getRoadAddress().isEmpty()) {
            throw new CustomException(ErrorCode.INVALID_REQUEST,
                "위치 기반 검색을 위한 사용자 주소 정보가 필요합니다.");
        }

        return kakaoMapService.geocodeAddress(user.getAddress().getRoadAddress());
    }

    /**
     * 기본 워커 리스트 가져오기
     */
    private List<WalkerProfile> getBaseWalkerList(WalkerSearchRequest request, User currentUser) {
        if (request.isFavoritesOnly()) {
            // 즐겨찾기 워커만
            List<FavoriteWalker> favoriteWalkers = favoriteWalkerRepository
                    .findByUserIdAndIsActiveTrueOrderByCreateTimeDesc(currentUser.getId());

            if (favoriteWalkers.isEmpty()) {
                return new ArrayList<>();
            }

            List<Long> favoriteWalkerIds = favoriteWalkers.stream()
                    .map(FavoriteWalker::getWalkerId)
                    .collect(Collectors.toList());

            return walkerProfileRepository.findByIdInAndStatus(
                    favoriteWalkerIds, WalkerStatus.ACTIVE);
        } else {
            // 모든 활성 워커
            return walkerProfileRepository.findByStatus(WalkerStatus.ACTIVE);
        }
    }

    /**
     * 필터링 적용
     */
    private List<WalkerProfile> applyFilters(List<WalkerProfile> walkers,
                                           WalkerSearchRequest request,
                                           Coord userCoord) {
        return walkers.stream()
                .filter(walker -> applyDistanceFilter(walker, request, userCoord))
                .filter(walker -> applyKeywordFilter(walker, request))
                .filter(walker -> applyRatingFilter(walker, request))
                .filter(walker -> applyHourlyRateFilter(walker, request))
                .filter(walker -> applyServiceAreaFilter(walker, request))
                .filter(walker -> applyPetTypesFilter(walker, request))
                .filter(walker -> applyCertificationsFilter(walker, request))
                .filter(walker -> applyInstantBookingFilter(walker, request))
                .filter(walker -> applyWeekendAvailableFilter(walker, request))
                .collect(Collectors.toList());
    }

    // 개별 필터 메소드들
    private boolean applyDistanceFilter(WalkerProfile walker, WalkerSearchRequest request, Coord userCoord) {
        if (walker.getCoordinates() == null) return false;

        try {
            String[] coords = walker.getCoordinates().split(",");
            double walkerLat = Double.parseDouble(coords[0]);
            double walkerLon = Double.parseDouble(coords[1]);

            double distance = calculateDistance(userCoord.getLatitude(), userCoord.getLongitude(),
                                              walkerLat, walkerLon);

            double maxDistance = request.getMaxDistanceKm() != null ?
                                request.getMaxDistanceKm() : DEFAULT_MAX_DISTANCE_KM;

            return distance <= maxDistance;
        } catch (Exception e) {
            log.warn("워커 위치 파싱 실패: {}", walker.getId());
            return false;
        }
    }

    private boolean applyKeywordFilter(WalkerProfile walker, WalkerSearchRequest request) {
        if (request.getKeyword() == null || request.getKeyword().trim().isEmpty()) {
            return true;
        }

        String keyword = request.getKeyword().toLowerCase();
        String userName = walker.getUser() != null && walker.getUser().getName() != null ?
                         walker.getUser().getName().toLowerCase() : "";
        String introduction = walker.getIntroduction() != null ?
                             walker.getIntroduction().toLowerCase() : "";

        return userName.contains(keyword) || introduction.contains(keyword);
    }

    private boolean applyRatingFilter(WalkerProfile walker, WalkerSearchRequest request) {
        if (request.getMinRating() != null &&
            (walker.getRating() == null || walker.getRating() < request.getMinRating())) {
            return false;
        }

        if (request.getMaxRating() != null &&
            (walker.getRating() == null || walker.getRating() > request.getMaxRating())) {
            return false;
        }

        return true;
    }

    private boolean applyHourlyRateFilter(WalkerProfile walker, WalkerSearchRequest request) {
        if (request.getMinHourlyRate() != null &&
            (walker.getHourlyRate() == null || walker.getHourlyRate().compareTo(request.getMinHourlyRate()) < 0)) {
            return false;
        }

        if (request.getMaxHourlyRate() != null &&
            (walker.getHourlyRate() == null || walker.getHourlyRate().compareTo(request.getMaxHourlyRate()) > 0)) {
            return false;
        }

        return true;
    }

    private boolean applyServiceAreaFilter(WalkerProfile walker, WalkerSearchRequest request) {
        if (request.getServiceArea() == null || request.getServiceArea().trim().isEmpty()) {
            return true;
        }

        return walker.getServiceArea() != null &&
               walker.getServiceArea().toLowerCase().contains(request.getServiceArea().toLowerCase());
    }

    private boolean applyPetTypesFilter(WalkerProfile walker, WalkerSearchRequest request) {
        if (request.getPetTypes() == null || request.getPetTypes().isEmpty()) {
            return true;
        }

        // Walker가 처리 가능한 펫 타입 중 하나라도 요청에 포함되어 있으면 통과
        if (walker.getPetTypes() == null || walker.getPetTypes().trim().isEmpty()) {
            return false;
        }

        List<String> walkerPetTypes = Arrays.asList(walker.getPetTypes().split(","));
        return walkerPetTypes.stream()
                .anyMatch(petType -> request.getPetTypes().contains(petType.trim()));
    }

    private boolean applyCertificationsFilter(WalkerProfile walker, WalkerSearchRequest request) {
        if (request.getCertifications() == null || request.getCertifications().isEmpty()) {
            return true;
        }

        if (walker.getCertifications() == null || walker.getCertifications().trim().isEmpty()) {
            return false;
        }

        List<String> walkerCertifications = Arrays.asList(walker.getCertifications().split(","));
        return walkerCertifications.stream()
                .anyMatch(cert -> request.getCertifications().contains(cert.trim()));
    }

    private boolean applyInstantBookingFilter(WalkerProfile walker, WalkerSearchRequest request) {
        if (request.getInstantBooking() == null) {
            return true;
        }

        return Objects.equals(walker.getInstantBooking(), request.getInstantBooking());
    }

    private boolean applyWeekendAvailableFilter(WalkerProfile walker, WalkerSearchRequest request) {
        if (request.getWeekendAvailable() == null) {
            return true;
        }

        return Objects.equals(walker.getWeekendAvailable(), request.getWeekendAvailable());
    }

    /**
     * 정렬 적용
     */
    private List<WalkerProfile> applySorting(List<WalkerProfile> walkers,
                                           WalkerSearchRequest request,
                                           Coord userCoord) {
        Comparator<WalkerProfile> comparator = getComparator(request, userCoord);

        if (request.getSortDirection() == WalkerSearchRequest.SortDirection.DESC) {
            comparator = comparator.reversed();
        }

        return walkers.stream()
                .sorted(comparator)
                .collect(Collectors.toList());
    }

    private Comparator<WalkerProfile> getComparator(WalkerSearchRequest request, Coord userCoord) {
        switch (request.getSortBy()) {
            case DISTANCE:
                return Comparator.comparingDouble(walker -> calculateWalkerDistance(walker, userCoord));
            case RATING:
                return Comparator.comparing(WalkerProfile::getRating, Comparator.nullsLast(Double::compareTo));
            case HOURLY_RATE:
                return Comparator.comparing(WalkerProfile::getHourlyRate, Comparator.nullsLast(BigDecimal::compareTo));
            case REVIEWS_COUNT:
                return Comparator.comparing(WalkerProfile::getReviewsCount, Comparator.nullsLast(Integer::compareTo));
            case EXPERIENCE:
                return Comparator.comparing(WalkerProfile::getExperienceYears, Comparator.nullsLast(Integer::compareTo));
            case CREATED_DATE:
                return Comparator.comparing(WalkerProfile::getCreateTime, Comparator.nullsLast(LocalDateTime::compareTo));
            default:
                return Comparator.comparingDouble(walker -> calculateWalkerDistance(walker, userCoord));
        }
    }

    private double calculateWalkerDistance(WalkerProfile walker, Coord userCoord) {
        if (walker.getCoordinates() == null) return Double.MAX_VALUE;

        try {
            String[] coords = walker.getCoordinates().split(",");
            double walkerLat = Double.parseDouble(coords[0]);
            double walkerLon = Double.parseDouble(coords[1]);

            return calculateDistance(userCoord.getLatitude(), userCoord.getLongitude(),
                                   walkerLat, walkerLon);
        } catch (Exception e) {
            return Double.MAX_VALUE;
        }
    }

    /**
     * 페이징 적용
     */
    private Page<WalkerProfileResponse> applyPagination(List<WalkerProfile> walkers,
                                                       Pageable pageable,
                                                       Long currentUserId) {
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), walkers.size());

        if (start >= walkers.size()) {
            return new PageImpl<>(new ArrayList<>(), pageable, walkers.size());
        }

        List<WalkerProfile> pageContent = walkers.subList(start, end);
        List<WalkerProfileResponse> responses = pageContent.stream()
                .map(walker -> WalkerProfileResponse.from(walker, isFavoriteWalker(walker.getId(), currentUserId)))
                .collect(Collectors.toList());

        return new PageImpl<>(responses, pageable, walkers.size());
    }

    private boolean isFavoriteWalker(Long walkerId, Long userId) {
        return favoriteWalkerRepository.findByUserIdAndWalkerIdAndIsActiveTrue(userId, walkerId).isPresent();
    }

    /**
     * 거리 계산 (Haversine 공식)
     */
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS_KM * c;
    }
}