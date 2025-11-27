package com.petmily.backend.api.map.service;

import com.petmily.backend.api.map.dto.*;
import com.petmily.backend.api.common.util.SecurityUtils;
import com.petmily.backend.domain.user.entity.User;
import com.petmily.backend.domain.user.repository.UserRepository;
import com.petmily.backend.domain.pet.entity.Pet;
import com.petmily.backend.domain.pet.repository.PetRepository;
import com.petmily.backend.domain.walker.entity.WalkSession;
import com.petmily.backend.domain.walk.entity.WalkingTrack;
import com.petmily.backend.domain.walker.repository.WalkSessionRepository;
import com.petmily.backend.domain.walk.repository.WalkTrackRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MapService {
    
    private final UserRepository userRepository;
    private final PetRepository petRepository;
    private final WalkSessionRepository walkSessionRepository;
    private final WalkTrackRepository walkTrackRepository;
    
    @Value("${kakao.map.api.key}")
    private String kakaoMapApiKey;
    
    public MapService(UserRepository userRepository, PetRepository petRepository,
                     WalkSessionRepository walkSessionRepository,
                     WalkTrackRepository walkTrackRepository) {
        this.userRepository = userRepository;
        this.petRepository = petRepository;
        this.walkSessionRepository = walkSessionRepository;
        this.walkTrackRepository = walkTrackRepository;
    }
    
    public MapConfigResponse getMapConfig() {
        MapConfigResponse config = new MapConfigResponse();
        config.setKakaoMapApiKey(kakaoMapApiKey);
        config.setMapCenterLat("37.5665"); // 서울 중심
        config.setMapCenterLon("126.9780");
        config.setMapZoomLevel(15);
        return config;
    }
    
    @Transactional
    public LocationResponse updateUserLocation(LocationRequest request, UserDetails userDetails) {
        // 사용자 정보 조회
        User user = userRepository.findByEmail(request.getUserId()).orElse(null);
        if (user == null) {
            // 익명 사용자도 허용하되, 세션 ID가 없으면 저장하지 않음
            LocationResponse response = new LocationResponse();
            response.setLatitude(request.getLatitude());
            response.setLongitude(request.getLongitude());
            response.setTimestamp(request.getTimestamp());
            response.setUserId(request.getUserId());
            return response;
        }

        Long userId = user.getId();
        Long walkSessionId = request.getWalkSessionId();

        // 세션 ID가 제공된 경우에만 DB에 저장
        if (walkSessionId != null) {
            WalkSession session = walkSessionRepository.findById(walkSessionId)
                    .orElseThrow(() -> new RuntimeException("Walk session not found: " + walkSessionId));

            // 세션 소유자 확인
            if (!session.getUserId().equals(userId)) {
                throw new RuntimeException("User does not own this walk session");
            }

            // 위치 데이터 저장
            LocalDateTime timestamp = LocalDateTime.ofInstant(
                    Instant.ofEpochMilli(request.getTimestamp()),
                    ZoneId.systemDefault()
            );

            WalkingTrack track = WalkingTrack.builder()
                    .walkSessionId(walkSessionId)
                    .latitude(request.getLatitude())
                    .longitude(request.getLongitude())
                    .timestamp(timestamp)
                    .accuracy(request.getAccuracy())
                    .speed(request.getSpeed())
                    .altitude(request.getAltitude())
                    .trackType(WalkingTrack.TrackType.WALKING)
                    .build();

            walkTrackRepository.save(track);
        }

        // 응답 생성
        LocationResponse response = new LocationResponse();
        response.setLatitude(request.getLatitude());
        response.setLongitude(request.getLongitude());
        response.setTimestamp(request.getTimestamp());
        response.setUserId(request.getUserId());

        // 반려동물 정보 조회
        List<Pet> pets = petRepository.findByUserId(userId);
        if (!pets.isEmpty()) {
            Pet pet = pets.get(0);
            response.setPetProfileImage(pet.getPhotoUri());
            response.setPetName(pet.getName());
            response.setPetSpecies(pet.getSpecies());
        }

        return response;
    }

    @Transactional
    public WalkSessionResponse createWalkSession(WalkSessionRequest request, UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);

        WalkSession session = WalkSession.builder()
                .userId(userId)
                .bookingId(request.getBookingId())
                .startTime(LocalDateTime.now())
                .startLatitude(request.getStartLatitude())
                .startLongitude(request.getStartLongitude())
                .status(WalkSession.WalkSessionStatus.IN_PROGRESS)
                .build();

        session = walkSessionRepository.save(session);

        // 시작점 위치 데이터 저장
        if (request.getStartLatitude() != null && request.getStartLongitude() != null) {
            WalkingTrack startTrack = WalkingTrack.builder()
                    .walkSessionId(session.getId())
                    .latitude(request.getStartLatitude())
                    .longitude(request.getStartLongitude())
                    .timestamp(session.getStartTime())
                    .trackType(WalkingTrack.TrackType.START)
                    .build();
            walkTrackRepository.save(startTrack);
        }

        return convertToResponse(session);
    }

    @Transactional
    public WalkSessionResponse endWalkSession(Long walkSessionId, Double endLatitude, Double endLongitude,
                                              Double totalDistance, Long durationSeconds, UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);

        WalkSession session = walkSessionRepository.findById(walkSessionId)
                .orElseThrow(() -> new RuntimeException("Walk session not found: " + walkSessionId));

        if (!session.getUserId().equals(userId)) {
            throw new RuntimeException("User does not own this walk session");
        }

        // 종료점 위치 데이터 저장
        if (endLatitude != null && endLongitude != null) {
            WalkingTrack endTrack = WalkingTrack.builder()
                    .walkSessionId(walkSessionId)
                    .latitude(endLatitude)
                    .longitude(endLongitude)
                    .timestamp(LocalDateTime.now())
                    .trackType(WalkingTrack.TrackType.END)
                    .build();
            walkTrackRepository.save(endTrack);
        }

        session.complete(LocalDateTime.now(), endLatitude, endLongitude, totalDistance, durationSeconds);
        session = walkSessionRepository.save(session);

        return convertToResponse(session);
    }

    public RouteResponse getWalkRoute(Long walkSessionId, UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);

        WalkSession session = walkSessionRepository.findById(walkSessionId)
                .orElseThrow(() -> new RuntimeException("Walk session not found: " + walkSessionId));

        if (!session.getUserId().equals(userId)) {
            throw new RuntimeException("User does not own this walk session");
        }

        List<WalkingTrack> tracks = walkTrackRepository.findPathPointsByWalkSessionId(walkSessionId);

        List<RouteResponse.RoutePoint> points = tracks.stream()
                .map(track -> RouteResponse.RoutePoint.builder()
                        .latitude(track.getLatitude())
                        .longitude(track.getLongitude())
                        .timestamp(track.getTimestamp().atZone(ZoneId.systemDefault()).toInstant().toEpochMilli())
                        .accuracy(track.getAccuracy())
                        .speed(track.getSpeed())
                        .altitude(track.getAltitude())
                        .build())
                .collect(Collectors.toList());

        return RouteResponse.builder()
                .walkSessionId(walkSessionId)
                .points(points)
                .totalDistance(session.getTotalDistance())
                .durationSeconds(session.getDurationSeconds())
                .startTime(session.getStartTime())
                .endTime(session.getEndTime())
                .build();
    }

    private WalkSessionResponse convertToResponse(WalkSession session) {
        return WalkSessionResponse.builder()
                .id(session.getId())
                .userId(session.getUserId())
                .bookingId(session.getBookingId())
                .startTime(session.getStartTime())
                .endTime(session.getEndTime())
                .totalDistance(session.getTotalDistance())
                .durationSeconds(session.getDurationSeconds())
                .status(session.getStatus().name())
                .startLatitude(session.getStartLatitude())
                .startLongitude(session.getStartLongitude())
                .endLatitude(session.getEndLatitude())
                .endLongitude(session.getEndLongitude())
                .build();
    }
    
    public List<LocationResponse> getActiveUserLocations() {
        // 실제 구현에서는 활성 사용자들의 위치 정보를 반환
        // 여기서는 샘플 데이터 반환
        return List.of();
    }
}
