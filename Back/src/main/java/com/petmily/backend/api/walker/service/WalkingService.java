package com.petmily.backend.api.walker.service;

import com.petmily.backend.api.exception.CustomException;
import com.petmily.backend.api.exception.ErrorCode;
import com.petmily.backend.api.walker.controller.WalkingWebSocketController;
import com.petmily.backend.api.walker.dto.walkerBooking.*;
import com.petmily.backend.api.walker.dto.walking.*;
import com.petmily.backend.api.walker.service.notification.WalkNotificationService;
import com.petmily.backend.domain.walker.entity.WalkingTrack;
import com.petmily.backend.domain.walker.repository.WalkingTrackRepository;
import com.petmily.backend.domain.walker.entity.WalkerBooking;
import com.petmily.backend.domain.walker.repository.WalkerBookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class WalkingService {

    private final WalkingTrackRepository walkingTrackRepository;
    private final WalkerBookingRepository walkerBookingRepository;
    private final WalkingValidationService validationService;
    private final LocationValidationService locationValidationService;
    private final WalkNotificationService notificationService;
    private final WalkingWebSocketController walkingWebSocketController;

    @Transactional
    public WalkerBookingResponse startWalk(Long bookingId, String username) {
        WalkingValidationService.WalkerBookingValidation validation = validationService.validateWalkerBooking(bookingId, username);
        
        if (validation.booking.getStatus() != WalkerBooking.BookingStatus.CONFIRMED) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "Can only start confirmed bookings");
        }

        validation.booking.setStatus(WalkerBooking.BookingStatus.IN_PROGRESS);
        validation.booking.setActualStartTime(LocalDateTime.now());

        WalkerBooking updatedBooking = walkerBookingRepository.save(validation.booking);
        
        try {
            String petName = getPetName(updatedBooking);
            String ownerContact = getOwnerContact(updatedBooking);
            notificationService.sendWalkStartNotification(updatedBooking, petName, ownerContact);
        } catch (Exception e) {
            log.warn("산책 시작 알림 발송 실패 - Booking ID: {}", updatedBooking.getId(), e);
        }

        try{
            walkingWebSocketController.broadcastWalkingStatus(bookingId, "STARTED", updatedBooking);
        } catch(Exception e){
            log.warn("산책 시작 상태 브로드캐스트 실패 - Booking ID: {}", bookingId, e);
        }

        return WalkerBookingResponse.from(updatedBooking);
    }


    @Transactional
    public WalkerBookingResponse completeWalk(Long bookingId, WalkingEndRequest request, String username) {
        WalkingValidationService.WalkerBookingValidation validation = validationService.validateWalkerBooking(bookingId, username);

        if (validation.booking.getStatus() != WalkerBooking.BookingStatus.IN_PROGRESS) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "Can only complete walks in progress");
        }

        validation.booking.setStatus(WalkerBooking.BookingStatus.COMPLETED);
        if (validation.booking.getActualStartTime() == null) {
            validation.booking.setActualStartTime(LocalDateTime.now().minusMinutes(validation.booking.getDuration()));
        }
        validation.booking.setActualEndTime(LocalDateTime.now());

        // 워커의 특이사항 및 메모 저장
        if (request.getSpecialNotes() != null) {
            String existingNotes = validation.booking.getNotes() != null ? validation.booking.getNotes() : "";
            validation.booking.setNotes(existingNotes + "\n[워커 메모] " + request.getSpecialNotes());
        }

        WalkerBooking updatedBooking = walkerBookingRepository.save(validation.booking);

        try {
            String petName = getPetName(updatedBooking);
            String ownerContact = getOwnerContact(updatedBooking);
            notificationService.sendWalkCompleteNotification(updatedBooking, petName, ownerContact);
        } catch (Exception e) {
            log.warn("산책 완료 알림 발송 실패 - Booking ID: {}", updatedBooking.getId(), e);
        }

        try{
            walkingWebSocketController.broadcastWalkingStatus(bookingId, "COMPLETED", updatedBooking);
        } catch(Exception e){
            log.warn("산책 완료 상태 브로드캐스트 실패 - Booking ID: {}", bookingId, e);
        }

        return WalkerBookingResponse.from(updatedBooking);
    }

    public String initiateEmergencyCall(Long bookingId, EmergencyCallRequest request, String username) {
        WalkingValidationService.WalkerBookingValidation validation = validationService.validateWalkerBooking(bookingId, username);

        String contactNumber;
        switch (request.getEmergencyType()) {
            case POLICE_112:
                contactNumber = "112";
                break;
            case FIRE_119:
                contactNumber = "119";
                break;
            case EMERGENCY_CONTACT:
                contactNumber = validation.booking.getEmergencyContact();
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
    public WalkerBookingResponse requestWalkTermination(Long bookingId, WalkTerminationRequest request, String username) {
        WalkingValidationService.WalkerBookingValidation validation = validationService.validateWalkerBooking(bookingId, username);

        if (validation.booking.getStatus() != WalkerBooking.BookingStatus.IN_PROGRESS) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "Can only request termination for walks in progress");
        }

        // 종료 요청 로그 추가
        String terminationLog = "[" + LocalDateTime.now() + "] 종료 요청 - 요청자: " + request.getRequestedBy() +
                               ", 사유: " + request.getReason();

        String existingNotes = validation.booking.getNotes() != null ? validation.booking.getNotes() : "";
        validation.booking.setNotes(existingNotes + "\n" + terminationLog);

        WalkerBooking updatedBooking = walkerBookingRepository.save(validation.booking);

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

        return WalkerBookingResponse.from(updatedBooking);
    }

    @Transactional
    public WalkingTrackResponse saveWalkingTrack(Long bookingId, LocationTrackRequest request, String username) {
        WalkingValidationService.WalkerBookingValidation validation = validationService.validateWalkerBooking(bookingId, username);
        
        if (validation.booking.getStatus() != WalkerBooking.BookingStatus.IN_PROGRESS) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "Can only track location during active walk");
        }

        locationValidationService.requireLocation(request.getLatitude(), request.getLongitude(), "위치 추적");
        locationValidationService.validateLocationChange(bookingId, request.getLatitude(), request.getLongitude());
        
        if (locationValidationService.isProbablyFakeLocation(bookingId, request.getLatitude(), request.getLongitude())) {
            log.warn("의심스러운 위치 패턴 감지 - Booking ID: {}, 좌표: {}, {}", 
                     bookingId, request.getLatitude(), request.getLongitude());
        }

        WalkingTrack walkingTrack = WalkingTrack.builder()
                .bookingId(bookingId)
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .timestamp(request.getTimestamp() != null ? request.getTimestamp() : LocalDateTime.now())
                .accuracy(request.getAccuracy())
                .trackType(request.getTrackType() != null ? request.getTrackType() : WalkingTrack.TrackType.WALKING)
                .speed(request.getSpeed())
                .altitude(request.getAltitude())
                .build();

        WalkingTrack savedTrack = walkingTrackRepository.save(walkingTrack);
        WalkingTrackResponse response = WalkingTrackResponse.from(savedTrack);

        try{
            walkingWebSocketController.broadcastLocationUpdate(bookingId, response);
        } catch(Exception e){
            log.warn("실시간 위치 브로드캐스트 실패 - Booking ID: {}", bookingId, e);
        }

        return response;

    }

    public WalkingPathResponse getWalkingPath(Long bookingId, String username) {
        WalkingValidationService.UserBookingValidation validation = validationService.validateUserBooking(bookingId, username);

        List<WalkingTrack> tracks = walkingTrackRepository.findByBookingIdOrderByTimestampAsc(bookingId);
        List<WalkingTrackResponse> trackResponses = tracks.stream()
                .map(WalkingTrackResponse::from)
                .collect(Collectors.toList());

        WalkingPathResponse.WalkingStatistics statistics = calculateWalkingStatistics(tracks);

        return WalkingPathResponse.builder()
                .bookingId(bookingId)
                .trackPoints(trackResponses)
                .statistics(statistics)
                .build();
    }

    public List<WalkingTrackResponse> getRealtimeLocation(Long bookingId, LocalDateTime afterTime, String username) {
        WalkingValidationService.UserBookingValidation validation = validationService.validateUserBooking(bookingId, username);

        List<WalkingTrack> tracks = walkingTrackRepository.findByBookingIdAndTimestampAfter(bookingId, afterTime);
        return tracks.stream()
                .map(WalkingTrackResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public WalkerBookingResponse updateLocation(Long bookingId, LocationUpdateRequest request, String username) {
        WalkingValidationService.WalkerBookingValidation validation = validationService.validateWalkerBooking(bookingId, username);

        locationValidationService.requireLocation(request.getLatitude(), request.getLongitude(), "위치 업데이트");
        locationValidationService.validateLocationChange(bookingId, request.getLatitude(), request.getLongitude());

        validation.booking.setWalkerLocation(request.getFormattedLocation());

        if (validation.booking.getStatus() == WalkerBooking.BookingStatus.IN_PROGRESS && validation.booking.getWalkStartLocation() == null) {
            validation.booking.setWalkStartLocation(request.getFormattedLocation());
        } else if (validation.booking.getStatus() == WalkerBooking.BookingStatus.COMPLETED) {
            validation.booking.setWalkEndLocation(request.getFormattedLocation());
        }

        WalkerBooking updatedBooking = walkerBookingRepository.save(validation.booking);
        return WalkerBookingResponse.from(updatedBooking);
    }

    @Transactional
    public WalkerBookingResponse uploadPhoto(Long bookingId, PhotoUploadRequest request, String username) {
        WalkingValidationService.WalkerBookingValidation validation = validationService.validateWalkerBooking(bookingId, username);

        switch (request.getPhotoType().toUpperCase()) {
            case "START":
                validation.booking.setStartPhotoUrl(request.getPhotoUrl());
                if (validation.booking.getWalkStartLocation() == null && request.getLocation() != null) {
                    validation.booking.setWalkStartLocation(request.getLocation());
                }
                break;
            case "MIDDLE":
                validation.booking.setMiddlePhotoUrl(request.getPhotoUrl());
                break;
            case "END":
                validation.booking.setEndPhotoUrl(request.getPhotoUrl());
                if (validation.booking.getWalkEndLocation() == null && request.getLocation() != null) {
                    validation.booking.setWalkEndLocation(request.getLocation());
                }
                break;
            default:
                throw new CustomException(ErrorCode.INVALID_REQUEST, "Invalid photo type. Must be START, MIDDLE, or END");
        }

        WalkerBooking updatedBooking = walkerBookingRepository.save(validation.booking);
        return WalkerBookingResponse.from(updatedBooking);
    }


    private WalkingPathResponse.WalkingStatistics calculateWalkingStatistics(List<WalkingTrack> tracks) {
        if (tracks.isEmpty()) {
            return WalkingPathResponse.WalkingStatistics.builder()
                    .totalDistance(0.0)
                    .totalDuration(0L)
                    .averageSpeed(0.0)
                    .maxSpeed(0.0)
                    .totalPoints(0)
                    .walkingRoute("산책 데이터가 없습니다")
                    .build();
        }

        double totalDistance = calculateTotalDistance(tracks);
        LocalDateTime startTime = tracks.get(0).getTimestamp();
        LocalDateTime endTime = tracks.get(tracks.size() - 1).getTimestamp();
        long totalDurationMinutes = java.time.Duration.between(startTime, endTime).toMinutes();
        
        double maxSpeed = tracks.stream()
                .filter(track -> track.getSpeed() != null)
                .mapToDouble(WalkingTrack::getSpeed)
                .max()
                .orElse(0.0);

        double averageSpeed = totalDurationMinutes > 0 ? (totalDistance / (totalDurationMinutes / 60.0)) : 0.0;

        String walkingRoute = generateWalkingRouteSummary(tracks);

        return WalkingPathResponse.WalkingStatistics.builder()
                .totalDistance(totalDistance)
                .totalDuration(totalDurationMinutes)
                .averageSpeed(averageSpeed)
                .maxSpeed(maxSpeed)
                .startTime(startTime)
                .endTime(endTime)
                .totalPoints(tracks.size())
                .walkingRoute(walkingRoute)
                .build();
    }

    private double calculateTotalDistance(List<WalkingTrack> tracks) {
        double totalDistance = 0.0;
        
        for (int i = 1; i < tracks.size(); i++) {
            WalkingTrack prev = tracks.get(i - 1);
            WalkingTrack current = tracks.get(i);
            
            if (prev.getLatitude() != null && prev.getLongitude() != null &&
                current.getLatitude() != null && current.getLongitude() != null) {
                double distance = calculateHaversineDistance(
                    prev.getLatitude(), prev.getLongitude(),
                    current.getLatitude(), current.getLongitude()
                );
                totalDistance += distance;
            }
        }
        
        return totalDistance;
    }

    private double calculateHaversineDistance(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371; // Earth's radius in km

        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private String generateWalkingRouteSummary(List<WalkingTrack> tracks) {
        if (tracks.size() < 2) {
            return "짧은 산책";
        }

        WalkingTrack start = tracks.get(0);
        WalkingTrack end = tracks.get(tracks.size() - 1);
        
        double distance = calculateHaversineDistance(
            start.getLatitude(), start.getLongitude(),
            end.getLatitude(), end.getLongitude()
        );

        if (distance < 0.1) {
            return "근거리 원형 산책";
        } else if (distance < 0.5) {
            return "중거리 산책 경로";
        } else {
            return "장거리 산책 경로";
        }
    }

    private String getPetName(WalkerBooking booking) {
        if (booking.getPet() != null && booking.getPet().getName() != null) {
            return booking.getPet().getName();
        }
        return "반려동물";
    }


    private String getOwnerContact(WalkerBooking booking) {
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