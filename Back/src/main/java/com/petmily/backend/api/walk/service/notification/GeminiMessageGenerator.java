package com.petmily.backend.api.walk.service.notification;

import com.petmily.backend.domain.walk.entity.WalkTrack;
import com.petmily.backend.domain.walk.entity.WalkBooking;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class GeminiMessageGenerator {

    private final ChatClient chatClient;

    public String generateWalkStartMessage(WalkBooking booking, String petName) {
        String prompt = String.format(
            "반려동물 산책 시작 알림 메시지를 생성해주세요. " +
            "다음 정보를 바탕으로 보호자에게 따뜻하고 안심할 수 있는 메시지를 작성해주세요.\n\n" +
            "- 반려동물 이름: %s\n" +
            "- 산책 예정 시간: %d분\n" +
            "- 시작 시간: %s\n\n" +
            "메시지는 50자 이내로 간결하게 작성하고, 이모지를 포함해주세요.",
            petName,
            booking.getDuration(),
            LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm"))
        );

        return generateMessage(prompt);
    }

    public String generateWalkProgressMessage(WalkBooking booking, List<WalkTrack> tracks, String petName) {
        if (tracks.isEmpty()) {
            return generateDefaultProgressMessage(petName);
        }

        WalkTrack latestTrack = tracks.get(tracks.size() - 1);
        double totalDistance = calculateTotalDistance(tracks);
        long walkingMinutes = calculateWalkingDuration(tracks);

        String prompt = String.format(
            "반려동물 산책 진행 상황 알림 메시지를 생성해주세요.\n\n" +
            "- 반려동물 이름: %s\n" +
            "- 현재까지 걸은 거리: %.2fkm\n" +
            "- 산책 시간: %d분\n" +
            "- 현재 속도: %.1fkm/h\n" +
            "- 현재 위치 상태: %s\n\n" +
            "보호자가 안심할 수 있도록 따뜻하고 긍정적인 톤으로 60자 이내로 작성해주세요. 이모지를 포함해주세요.",
            petName,
            totalDistance,
            walkingMinutes,
            latestTrack.getSpeed() != null ? latestTrack.getSpeed() : 0.0,
            getLocationDescription(latestTrack)
        );

        return generateMessage(prompt);
    }

    public String generateWalkCompleteMessage(WalkBooking booking, List<WalkTrack> tracks, String petName) {
        if (tracks.isEmpty()) {
            return generateDefaultCompleteMessage(petName);
        }

        double totalDistance = calculateTotalDistance(tracks);
        long totalMinutes = calculateWalkingDuration(tracks);

        String prompt = String.format(
            "반려동물 산책 완료 알림 메시지를 생성해주세요.\n\n" +
            "- 반려동물 이름: %s\n" +
            "- 총 거리: %.2fkm\n" +
            "- 총 시간: %d분\n" +
            "- 평균 속도: %.1fkm/h\n\n" +
            "산책이 성공적으로 완료되었음을 보호자에게 따뜻하게 전달하고, " +
            "반려동물이 즐거웠을 것이라는 메시지를 포함해주세요. 70자 이내로 작성하고 이모지를 포함해주세요.",
            petName,
            totalDistance,
            totalMinutes,
            totalMinutes > 0 ? (totalDistance / (totalMinutes / 60.0)) : 0.0
        );

        return generateMessage(prompt);
    }

    public String generateStationaryAlertMessage(String petName, int minutes) {
        String prompt = String.format(
            "반려동물이 %d분째 같은 장소에 머물고 있다는 알림 메시지를 생성해주세요.\n\n" +
            "- 반려동물 이름: %s\n" +
            "- 머문 시간: %d분\n\n" +
            "보호자가 걱정하지 않도록 자연스럽고 안심시키는 톤으로 작성해주세요. " +
            "휴식이나 냄새 탐지 등의 일반적인 행동일 수 있음을 암시해주세요. " +
            "60자 이내로 작성하고 이모지를 포함해주세요.",
            petName, minutes
        );

        return generateMessage(prompt);
    }

    private String generateMessage(String prompt) {
        try {
            return chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();
        } catch (Exception e) {
            log.error("Gemini API 호출 중 오류 발생", e);
            return "산책 알림 메시지 생성 중 오류가 발생했습니다.";
        }
    }

    private String generateDefaultProgressMessage(String petName) {
        return String.format("🐕 %s가 즐겁게 산책 중이에요!", petName);
    }

    private String generateDefaultCompleteMessage(String petName) {
        return String.format("✅ %s 산책이 완료되었습니다!", petName);
    }

    private double calculateTotalDistance(List<WalkTrack> tracks) {
        double totalDistance = 0.0;
        
        for (int i = 1; i < tracks.size(); i++) {
            WalkTrack prev = tracks.get(i - 1);
            WalkTrack current = tracks.get(i);
            
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

    private long calculateWalkingDuration(List<WalkTrack> tracks) {
        if (tracks.size() < 2) return 0;
        
        LocalDateTime startTime = tracks.get(0).getTimestamp();
        LocalDateTime endTime = tracks.get(tracks.size() - 1).getTimestamp();
        
        return java.time.Duration.between(startTime, endTime).toMinutes();
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

    private String getLocationDescription(WalkTrack track) {
        // 실제 구현에서는 역지오코딩 API를 사용하여 위치 정보를 변환
        // 여기서는 간단한 예시로 GPS 좌표 기반 추정
        if (track.getSpeed() != null && track.getSpeed() > 3.0) {
            return "활발하게 이동 중";
        } else if (track.getSpeed() != null && track.getSpeed() < 1.0) {
            return "휴식 중";
        } else {
            return "산책 중";
        }
    }
}