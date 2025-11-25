package com.petmily.backend.api.walk.service.walk;

import com.petmily.backend.api.common.service.LocationValidationService;
import com.petmily.backend.api.exception.CustomException;
import com.petmily.backend.api.exception.ErrorCode;
import com.petmily.backend.api.map.dto.AddressInfo;
import com.petmily.backend.api.map.service.KakaoMapService;
import com.petmily.backend.api.walk.controller.walk.WalkWebSocketController;
import com.petmily.backend.api.walk.dto.booking.response.WalkBookingResponse;
import com.petmily.backend.api.walk.dto.tracking.request.*;
import com.petmily.backend.api.walk.dto.tracking.response.*;
import com.petmily.backend.api.walk.service.notification.WalkNotificationService;
import com.petmily.backend.api.walk.service.validation.ValidationService;
import com.petmily.backend.domain.walk.entity.WalkTrack;
import com.petmily.backend.domain.walk.repository.WalkTrackRepository;
import com.petmily.backend.domain.walk.entity.WalkBooking;
import com.petmily.backend.domain.walk.entity.WalkDetail;
import com.petmily.backend.domain.walk.repository.WalkBookingRepository;
import com.petmily.backend.domain.walk.repository.WalkDetailRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class WalkService {

    private final WalkTrackRepository walkTrackRepository;
    private final WalkBookingRepository walkBookingRepository;
    private final WalkDetailRepository walkDetailRepository;
    private final ValidationService validationService;
    private final LocationValidationService locationValidationService;
    private final WalkNotificationService notificationService;
    private final WalkWebSocketController walkWebSocketController;
    private final KakaoMapService kakaoMapService;

    @Transactional
    public WalkSessionResponse startWalk(Long bookingId, Long userId) {
        ValidationService.WalkBookingValidation validation = validationService.validateWalkBooking(bookingId, userId);

        if (validation.booking.getStatus() != WalkBooking.BookingStatus.CONFIRMED) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "Can only start confirmed bookings");
        }

        validation.booking.setStatus(WalkBooking.BookingStatus.IN_PROGRESS);

        // Create or update WalkDetail for timing information
        WalkDetail walkDetail = walkDetailRepository.findByBookingId(bookingId)
                .orElse(WalkDetail.builder()
                        .bookingId(bookingId)
                        .walkStatus(WalkDetail.WalkStatus.IN_PROGRESS)
                        .build());
        walkDetail.setActualStartTime(LocalDateTime.now());
        walkDetail.setWalkStatus(WalkDetail.WalkStatus.IN_PROGRESS);
        WalkDetail savedWalkDetail = walkDetailRepository.save(walkDetail);

        WalkBooking updatedBooking = walkBookingRepository.save(validation.booking);

        try {
            String petName = getPetName(updatedBooking);
            String ownerContact = getOwnerContact(updatedBooking);
            notificationService.sendWalkStartNotification(updatedBooking, petName, ownerContact);
        } catch (Exception e) {
            log.warn("산책 시작 알림 발송 실패 - Booking ID: {}", updatedBooking.getId(), e);
        }

        try{
            walkWebSocketController.broadcastWalkStatus(bookingId, "STARTED", updatedBooking);
        } catch(Exception e){
            log.warn("산책 시작 상태 브로드캐스트 실패 - Booking ID: {}", bookingId, e);
        }

        return WalkSessionResponse.of(
                WalkBookingResponse.from(updatedBooking),
                WalkDetailResponse.from(savedWalkDetail)
        );
    }


    @Transactional
    public WalkCompletionResponse completeWalk(Long bookingId, WalkEndRequest request, Long userId) {
        ValidationService.WalkBookingValidation validation = validationService.validateWalkBooking(bookingId, userId);

        if (validation.booking.getStatus() != WalkBooking.BookingStatus.IN_PROGRESS) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "Can only complete walks in progress");
        }

        validation.booking.setStatus(WalkBooking.BookingStatus.COMPLETED);

        // Update WalkDetail with completion information
        WalkDetail walkDetail = walkDetailRepository.findByBookingId(bookingId)
                .orElse(WalkDetail.builder()
                        .bookingId(bookingId)
                        .build());

        if (walkDetail.getActualStartTime() == null) {
            walkDetail.setActualStartTime(LocalDateTime.now().minusMinutes(validation.booking.getDuration()));
        }
        walkDetail.setActualEndTime(LocalDateTime.now());
        walkDetail.setWalkStatus(WalkDetail.WalkStatus.COMPLETED);

        // 워커의 특이사항 메모를 WalkDetail에 저장
        if (request.getSpecialNotes() != null) {
            walkDetail.setSpecialIncidents(request.getSpecialNotes());
        }

        // 총 거리 계산 및 저장
        List<WalkTrack> tracks = walkTrackRepository.findByBookingIdOrderByTimestampAsc(bookingId);
        WalkPathResponse.WalkStatistics statistics = calculateWalkStatistics(tracks);
        walkDetail.setTotalDistance(statistics.getTotalDistance());

        WalkDetail savedWalkDetail = walkDetailRepository.save(walkDetail);

        WalkBooking updatedBooking = walkBookingRepository.save(validation.booking);

        try {
            String petName = getPetName(updatedBooking);
            String ownerContact = getOwnerContact(updatedBooking);
            notificationService.sendWalkCompleteNotification(updatedBooking, petName, ownerContact);
        } catch (Exception e) {
            log.warn("산책 완료 알림 발송 실패 - Booking ID: {}", updatedBooking.getId(), e);
        }

        try{
            walkWebSocketController.broadcastWalkStatus(bookingId, "COMPLETED", updatedBooking);
        } catch(Exception e){
            log.warn("산책 완료 상태 브로드캐스트 실패 - Booking ID: {}", bookingId, e);
        }

        return WalkCompletionResponse.of(
                WalkBookingResponse.from(updatedBooking),
                WalkDetailResponse.from(savedWalkDetail),
                statistics
        );
    }

    public String initiateEmergencyCall(Long bookingId, EmergencyCallRequest request, Long userId) {
        ValidationService.WalkBookingValidation validation = validationService.validateWalkBooking(bookingId, userId);

        String contactNumber;
        switch (request.getEmergencyType()) {
            case POLICE_112:
                contactNumber = "112";
                break;
            case FIRE_119:
                contactNumber = "119";
                break;
            case EMERGENCY_CONTACT:
                contactNumber = validation.booking.getUser() != null ? validation.booking.getUser().getEmergencyContactPhone() : null;
                if (contactNumber == null || contactNumber.trim().isEmpty()) {
                    throw new CustomException(ErrorCode.INVALID_REQUEST, "Emergency contact not set for this booking");
                }
                break;
            default:
                throw new CustomException(ErrorCode.INVALID_REQUEST, "Invalid emergency type");
        }

        // 112나 119 호출 시 사용자에게 알림 발송
        if (request.getEmergencyType() == EmergencyCallRequest.EmergencyType.POLICE_112 ||
            request.getEmergencyType() == EmergencyCallRequest.EmergencyType.FIRE_119) {
            try {
                String petName = getPetName(validation.booking);
                notificationService.sendEmergencyNotification(
                    validation.booking,
                    petName,
                    request.getEmergencyType().getDisplayName(),
                    request.getLocation(),
                    request.getDescription()
                );
            } catch (Exception e) {
                log.warn("긴급상황 알림 발송 실패 - Booking ID: {}", validation.booking.getId(), e);
            }
        }

        log.info("긴급호출 요청 - Booking ID: {}, Type: {}, Location: {}",
                 bookingId, request.getEmergencyType(), request.getLocation());

        return contactNumber;
    }

    @Transactional
    public WalkBookingResponse requestWalkTermination(Long bookingId, WalkTerminationRequest request, Long userId) {
        ValidationService.WalkBookingValidation validation = validationService.validateWalkBooking(bookingId, userId);

        if (validation.booking.getStatus() != WalkBooking.BookingStatus.IN_PROGRESS) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "Can only request termination for walks in progress");
        }

        // 종료 요청 로그 추가
        String terminationLog = "[" + LocalDateTime.now() + "] 종료 요청 - 요청자: " + request.getRequestedBy() +
                               ", 사유: " + request.getReason();

        String existingNotes = validation.booking.getNotes() != null ? validation.booking.getNotes() : "";
        validation.booking.setNotes(existingNotes + "\n" + terminationLog);

        WalkBooking updatedBooking = walkBookingRepository.save(validation.booking);

        // 상대방에게 종료 요청 알림 발송
        try {
            String petName = getPetName(updatedBooking);
            notificationService.sendWalkTerminationRequest(
                updatedBooking,
                petName,
                request.getRequestedBy(),
                request.getReason()
            );
        } catch (Exception e) {
            log.warn("산책 종료 요청 알림 발송 실패 - Booking ID: {}", updatedBooking.getId(), e);
        }

        return WalkBookingResponse.from(updatedBooking);
    }

    @Transactional
    public WalkTrackResponse saveWalkTrack(Long bookingId, LocationTrackRequest request, Long userId) {
        ValidationService.WalkBookingValidation validation = validationService.validateWalkBooking(bookingId, userId);
        
        if (validation.booking.getStatus() != WalkBooking.BookingStatus.IN_PROGRESS) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "Can only track location during active walk");
        }

        locationValidationService.requireLocation(request.getLatitude(), request.getLongitude(), "위치 추적");
        locationValidationService.validateLocationChange(bookingId, request.getLatitude(), request.getLongitude());
        
        if (locationValidationService.isProbablyFakeLocation(bookingId, request.getLatitude(), request.getLongitude())) {
            log.warn("의심스러운 위치 패턴 감지 - Booking ID: {}, 좌표: {}, {}", 
                     bookingId, request.getLatitude(), request.getLongitude());
        }

        WalkTrack walkTrack = WalkTrack.builder()
                .bookingId(bookingId)
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .timestamp(request.getTimestamp() != null ? request.getTimestamp() : LocalDateTime.now())
                .accuracy(request.getAccuracy())
                .trackType(request.getTrackType() != null ? request.getTrackType() : WalkTrack.TrackType.WALKING)
                .speed(request.getSpeed())
                .altitude(request.getAltitude())
                .build();

        WalkTrack savedTrack = walkTrackRepository.save(walkTrack);
        WalkTrackResponse response = WalkTrackResponse.from(savedTrack);

        try{
            walkWebSocketController.broadcastLocationUpdate(bookingId, response);
        } catch(Exception e){
            log.warn("실시간 위치 브로드캐스트 실패 - Booking ID: {}", bookingId, e);
        }

        return response;

    }

    public WalkPathResponse getWalkPath(Long bookingId, Long userId) {
        ValidationService.UserBookingValidation validation = validationService.validateUserBooking(bookingId, userId);

        List<WalkTrack> tracks = walkTrackRepository.findByBookingIdOrderByTimestampAsc(bookingId);
        List<WalkTrackResponse> trackResponses = tracks.stream()
                .map(WalkTrackResponse::from)
                .collect(Collectors.toList());

        WalkPathResponse.WalkStatistics statistics = calculateWalkStatistics(tracks);

        return WalkPathResponse.builder()
                .bookingId(bookingId)
                .trackPoints(trackResponses)
                .statistics(statistics)
                .build();
    }

    public List<WalkTrackResponse> getRealtimeLocation(Long bookingId, LocalDateTime afterTime, Long userId) {
        ValidationService.UserBookingValidation validation = validationService.validateUserBooking(bookingId, userId);

        List<WalkTrack> tracks = walkTrackRepository.findByBookingIdAndTimestampAfter(bookingId, afterTime);
        return tracks.stream()
                .map(WalkTrackResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public WalkDetailResponse uploadPhoto(Long bookingId, PhotoUploadRequest request, Long userId) {
        ValidationService.WalkBookingValidation validation = validationService.validateWalkBooking(bookingId, userId);

        if (validation.booking.getStatus() != WalkBooking.BookingStatus.IN_PROGRESS) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "Can only upload photos during active walk");
        }

        // Get or create WalkDetail
        WalkDetail walkDetail = walkDetailRepository.findByBookingId(bookingId)
                .orElse(WalkDetail.builder()
                        .bookingId(bookingId)
                        .walkStatus(WalkDetail.WalkStatus.IN_PROGRESS)
                        .build());

        // Save photo URL based on type
        switch (request.getPhotoType().toUpperCase()) {
            case "START":
                walkDetail.setStartPhotoUrl(request.getPhotoUrl());
                break;
            case "MIDDLE":
                walkDetail.setMiddlePhotoUrl(request.getPhotoUrl());
                break;
            case "END":
                walkDetail.setEndPhotoUrl(request.getPhotoUrl());
                break;
            default:
                throw new CustomException(ErrorCode.INVALID_REQUEST, "Invalid photo type. Must be START, MIDDLE, or END");
        }

        WalkDetail savedWalkDetail = walkDetailRepository.save(walkDetail);

        log.info("사진 업로드 완료 - Booking ID: {}, Photo Type: {}, URL: {}",
                bookingId, request.getPhotoType(), request.getPhotoUrl());

        return WalkDetailResponse.from(savedWalkDetail);
    }

    public AddressInfo getWalkerCurrentAddress(Long bookingId){
        WalkTrack lastestTrack = walkTrackRepository
                .findTopByBookingIdOrderByTimestampDesc(bookingId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND));

        AddressInfo addressInfo = kakaoMapService.reverseGeocode(
                lastestTrack.getLatitude(),
                lastestTrack.getLongitude()
        );

        return addressInfo;
    }

    public WalkStatusResponse getWalkStatus(Long bookingId, Long userId){
        ValidationService.UserBookingValidation validation = validationService.validateUserBooking(bookingId, userId);

        WalkDetail walkDetail = walkDetailRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND,
                        "산책 상세 정보를 찾을 수 없습니다."));

        // 전체 경로
        List<WalkTrack> tracks = walkTrackRepository.findByBookingIdOrderByTimestampAsc(bookingId);

        if(tracks.isEmpty()){
            throw new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "산책 경로 정보가 없습니다.");
        }

        // 현재 위치
        WalkTrack lastestTrack = tracks.get(tracks.size() - 1);
        WalkTrackResponse currentLocation = WalkTrackResponse.from(lastestTrack);

        // 현재 주소
        AddressInfo currentAddress = getWalkerCurrentAddress(bookingId);

        // 경과 시간
        LocalDateTime now = LocalDateTime.now();
        long elapsedMinutes = walkDetail.getActualStartTime() != null
                ? Duration.between(walkDetail.getActualStartTime(), now).toMinutes() : 0L;

        // 예상 종료 시간
        LocalDateTime estimatedEndTime = validation.booking.getWalkDetail().getActualEndTime().plusMinutes(validation.booking.getDuration());

        // 남은 시간
        long remainingMinutes = validation.booking.getDuration() - elapsedMinutes;
        if (remainingMinutes < 0) remainingMinutes = 0;

        // 거리 계산
        double totalDistanceKm = calculateTotalDistance(tracks);

        // 평균 속도 계산
        double averageSpeed = elapsedMinutes > 0 ? (totalDistanceKm / (elapsedMinutes / 60.0)) : 0.0;

        // 현재 속도
        Double currentSpeed = lastestTrack.getSpeed();

        // 전체 경로 변환
        List<WalkTrackResponse> path = tracks.stream()
                .map(WalkTrackResponse::from)
                .collect(Collectors.toList());

        String petName = getPetName(validation.booking);
        String walkerName = validation.booking.getWalker() != null && validation.booking.getWalker().getUser() != null
                ? validation.booking.getWalker().getUser().getName() : "워커";

        return WalkStatusResponse.builder()
                .bookingId(bookingId)
                .petName(petName)
                .walkerName(walkerName)
                .currentLocation(currentLocation)
                .currentAddress(currentAddress)
                .currentSpeed(currentSpeed)
                .startTime(walkDetail.getActualStartTime())
                .estimatedEndTime(estimatedEndTime)
                .elapsedMinutes(elapsedMinutes)
                .remainingMinutes(remainingMinutes)
                .totalDistanceKm(totalDistanceKm)
                .averageSpeed(averageSpeed)
                .walkStatus(walkDetail.getWalkStatus())
                .path(path)
                .totalPathPoints(path.size())
                .build();
    }


    private WalkPathResponse.WalkStatistics calculateWalkStatistics(List<WalkTrack> tracks) {
        if (tracks.isEmpty()) {
            return WalkPathResponse.WalkStatistics.builder()
                    .totalDistance(0.0)
                    .totalDuration(0L)
                    .averageSpeed(0.0)
                    .maxSpeed(0.0)
                    .totalPoints(0)
                    .build();
        }

        double totalDistance = calculateTotalDistance(tracks);
        LocalDateTime startTime = tracks.get(0).getTimestamp();
        LocalDateTime endTime = tracks.get(tracks.size() - 1).getTimestamp();
        long totalDurationMinutes = java.time.Duration.between(startTime, endTime).toMinutes();
        
        double maxSpeed = tracks.stream()
                .filter(track -> track.getSpeed() != null)
                .mapToDouble(WalkTrack::getSpeed)
                .max()
                .orElse(0.0);

        double averageSpeed = totalDurationMinutes > 0 ? (totalDistance / (totalDurationMinutes / 60.0)) : 0.0;

        return WalkPathResponse.WalkStatistics.builder()
                .totalDistance(totalDistance)
                .totalDuration(totalDurationMinutes)
                .averageSpeed(averageSpeed)
                .maxSpeed(maxSpeed)
                .startTime(startTime)
                .endTime(endTime)
                .totalPoints(tracks.size())
                .build();
    }

    private double calculateTotalDistance(List<WalkTrack> tracks) {
        double totalDistance = 0.0;

        for (int i = 1; i < tracks.size(); i++) {
            WalkTrack prev = tracks.get(i - 1);
            WalkTrack current = tracks.get(i);

            if (prev.getLatitude() != null && prev.getLongitude() != null &&
                current.getLatitude() != null && current.getLongitude() != null) {
                double distance = LocationValidationService.calculateDistance(
                    prev.getLatitude(), prev.getLongitude(),
                    current.getLatitude(), current.getLongitude()
                );
                totalDistance += distance;
            }
        }

        return totalDistance;
    }

    private String getPetName(WalkBooking booking) {
        if (booking.getPet() != null && booking.getPet().getName() != null) {
            return booking.getPet().getName();
        }
        return "반려동물";
    }


    private String getOwnerContact(WalkBooking booking) {
        if (booking.getUser() != null) {
            if (booking.getUser().getPhone() != null && !booking.getUser().getPhone().trim().isEmpty()) {
                return booking.getUser().getPhone();
            } else if (booking.getUser().getEmail() != null && !booking.getUser().getEmail().trim().isEmpty()) {
                return booking.getUser().getEmail();
            }
        }
        return "연락처 없음";
    }

}