package com.petmily.backend.api.walker.dto.walking;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WalkingNoticeTemplate {
    private String type; // DOOR_LOCK, ELEVATOR, SOCIABILITY, CUSTOM
    private String title;
    private String content;

    // 사전 정의된 템플릿
    public static WalkingNoticeTemplate getDoorLockTemplate() {
        return new WalkingNoticeTemplate(
            "DOOR_LOCK",
            "도어락 관련 주의사항",
            "집 나갈 때와 들어올 때 도어락을 꼭 확인해주세요. 비밀번호가 필요한 경우 미리 알려주시기 바랍니다."
        );
    }

    public static WalkingNoticeTemplate getElevatorTemplate() {
        return new WalkingNoticeTemplate(
            "ELEVATOR",
            "엘리베이터 이용 안내",
            "엘리베이터 이용 시 반려동물이 놀라지 않도록 주의해주세요. 다른 사람이 함께 타는 경우 양해를 구해주세요."
        );
    }

    public static WalkingNoticeTemplate getSociabilityTemplate() {
        return new WalkingNoticeTemplate(
            "SOCIABILITY",
            "사회성 관련 안내",
            "다른 반려동물이나 사람을 만날 때의 반응을 미리 알려주세요. 특별히 주의할 점이 있으면 꼭 말씀해주세요."
        );
    }

    public static WalkingNoticeTemplate getWeatherTemplate() {
        return new WalkingNoticeTemplate(
            "WEATHER",
            "날씨 관련 주의사항",
            "날씨가 좋지 않거나 기온이 극단적일 경우 산책 시간을 조절하거나 실내에서 대기할 수 있습니다. 비오는 날에는 우산과 수건을 준비해주세요."
        );
    }

    public static WalkingNoticeTemplate getHealthTemplate() {
        return new WalkingNoticeTemplate(
            "HEALTH",
            "건강 상태 확인",
            "반려동물의 최근 건강 상태나 특이사항이 있으면 미리 알려주세요. 약 복용 중이거나 특별한 관리가 필요한 경우도 말씀해주세요."
        );
    }

    public static WalkingNoticeTemplate getRouteTemplate() {
        return new WalkingNoticeTemplate(
            "ROUTE",
            "산책 경로 안내",
            "선호하는 산책 경로나 피해야 할 구역이 있으면 미리 말씀해주세요. 교통량이 많은 곳이나 위험한 지역은 피하도록 하겠습니다."
        );
    }

    public static WalkingNoticeTemplate getEmergencyTemplate() {
        return new WalkingNoticeTemplate(
            "EMERGENCY",
            "응급상황 대비",
            "응급상황 발생 시 즉시 연락드립니다. 평소 반려동물의 응급처치에 대한 특별한 요청사항이 있으면 미리 알려주세요."
        );
    }

    public static WalkingNoticeTemplate getBehaviorTemplate() {
        return new WalkingNoticeTemplate(
            "BEHAVIOR",
            "행동 특성 안내",
            "평소 산책 시 보이는 특별한 행동이나 습관이 있으면 알려주세요. 좋아하는 것과 싫어하는 것을 미리 파악하여 더 즐거운 산책이 되도록 하겠습니다."
        );
    }

    public static WalkingNoticeTemplate getFeedingTemplate() {
        return new WalkingNoticeTemplate(
            "FEEDING",
            "급식 관련 안내",
            "산책 중 간식이나 물을 줘야 하는 시간이 있으면 미리 알려주세요. 특별한 간식이나 주의사항이 있으면 말씀해주세요."
        );
    }

    public static WalkingNoticeTemplate getSecurityTemplate() {
        return new WalkingNoticeTemplate(
            "SECURITY",
            "보안 관련 주의사항",
            "집 보안에 관련된 특별한 주의사항이 있으면 알려주세요. CCTV 위치나 보안업체 연락처 등 필요한 정보를 미리 공유해주세요."
        );
    }
}