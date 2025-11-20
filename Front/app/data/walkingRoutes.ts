/**
 * 워커 이동 경로 시뮬레이션 데이터
 * 개발/테스트 목적으로 미리 정의된 경로를 따라 워커가 이동하는 것을 시뮬레이션합니다.
 */

export interface RoutePoint {
  latitude: number;
  longitude: number;
  timestamp?: number; // 경로 시작으로부터의 경과 시간 (초)
}

export interface WalkingRoute {
  id: string;
  name: string;
  description: string;
  points: RoutePoint[];
  estimatedDuration: number; // 예상 소요 시간 (초)
  estimatedDistance: number; // 예상 거리 (미터)
}

/**
 * 서울 강남구 산책 경로 (강남역 → 선릉역)
 * 실제 경로를 기반으로 더 세밀한 포인트 추가
 */
export const GANGNAM_WALKING_ROUTE: WalkingRoute = {
  id: 'gangnam-walk',
  name: '강남역 → 선릉역 산책 경로',
  description: '서울 강남구 테헤란로를 따라 강남역에서 선릉역까지 이동하는 경로',
  estimatedDuration: 900, // 15분
  estimatedDistance: 2000, // 약 2km
  points: [
    { latitude: 37.4980, longitude: 127.0276, timestamp: 0 }, // 강남역
    { latitude: 37.4985, longitude: 127.0280, timestamp: 60 }, // 1분
    { latitude: 37.4990, longitude: 127.0286, timestamp: 120 }, // 2분
    { latitude: 37.4995, longitude: 127.0292, timestamp: 180 }, // 3분
    { latitude: 37.5000, longitude: 127.0296, timestamp: 240 }, // 4분
    { latitude: 37.5005, longitude: 127.0300, timestamp: 300 }, // 5분
    { latitude: 37.5010, longitude: 127.0306, timestamp: 360 }, // 6분
    { latitude: 37.5015, longitude: 127.0311, timestamp: 420 }, // 7분
    { latitude: 37.5020, longitude: 127.0316, timestamp: 480 }, // 8분
    { latitude: 37.5025, longitude: 127.0321, timestamp: 540 }, // 9분
    { latitude: 37.5030, longitude: 127.0326, timestamp: 600 }, // 10분
    { latitude: 37.5035, longitude: 127.0331, timestamp: 660 }, // 11분
    { latitude: 37.5040, longitude: 127.0336, timestamp: 720 }, // 12분
    { latitude: 37.5042, longitude: 127.0341, timestamp: 780 }, // 13분
    { latitude: 37.5045, longitude: 127.0346, timestamp: 840 }, // 14분
    { latitude: 37.5045, longitude: 127.0418, timestamp: 870 }, // 14.5분
    { latitude: 37.5045, longitude: 127.0490, timestamp: 900 }, // 선릉역 (15분)
  ],
};

/**
 * 서울시청 주변 원형 산책 경로
 * 더 부드러운 원형 경로를 위해 포인트 추가
 */
export const CITY_HALL_CIRCULAR_ROUTE: WalkingRoute = {
  id: 'city-hall-circular',
  name: '서울시청 주변 원형 산책',
  description: '서울시청을 중심으로 한 원형 산책 경로',
  estimatedDuration: 1200, // 20분
  estimatedDistance: 3000, // 약 3km
  points: [
    { latitude: 37.5665, longitude: 126.9780, timestamp: 0 }, // 서울시청
    { latitude: 37.5670, longitude: 126.9785, timestamp: 75 }, // 1.25분
    { latitude: 37.5675, longitude: 126.9790, timestamp: 150 }, // 2.5분
    { latitude: 37.5680, longitude: 126.9795, timestamp: 225 }, // 3.75분
    { latitude: 37.5685, longitude: 126.9800, timestamp: 300 }, // 5분
    { latitude: 37.5690, longitude: 126.9805, timestamp: 375 }, // 6.25분
    { latitude: 37.5695, longitude: 126.9810, timestamp: 450 }, // 7.5분
    { latitude: 37.5698, longitude: 126.9800, timestamp: 525 }, // 8.75분
    { latitude: 37.5700, longitude: 126.9790, timestamp: 600 }, // 10분
    { latitude: 37.5698, longitude: 126.9780, timestamp: 675 }, // 11.25분
    { latitude: 37.5695, longitude: 126.9770, timestamp: 750 }, // 12.5분
    { latitude: 37.5690, longitude: 126.9760, timestamp: 825 }, // 13.75분
    { latitude: 37.5685, longitude: 126.9750, timestamp: 900 }, // 15분
    { latitude: 37.5680, longitude: 126.9755, timestamp: 975 }, // 16.25분
    { latitude: 37.5675, longitude: 126.9760, timestamp: 1050 }, // 17.5분
    { latitude: 37.5670, longitude: 126.9770, timestamp: 1125 }, // 18.75분
    { latitude: 37.5665, longitude: 126.9780, timestamp: 1200 }, // 시작점으로 복귀 (20분)
  ],
};

/**
 * 홍대입구역 → 상수역 산책 경로
 * 더 부드러운 경로를 위해 포인트 추가
 */
export const HONGDAE_WALKING_ROUTE: WalkingRoute = {
  id: 'hongdae-walk',
  name: '홍대입구역 → 상수역 산책 경로',
  description: '홍대입구역에서 상수역까지 이어지는 산책 경로',
  estimatedDuration: 600, // 10분
  estimatedDistance: 1500, // 약 1.5km
  points: [
    { latitude: 37.5567, longitude: 126.9230, timestamp: 0 }, // 홍대입구역
    { latitude: 37.5571, longitude: 126.9235, timestamp: 45 }, // 0.75분
    { latitude: 37.5575, longitude: 126.9240, timestamp: 90 }, // 1.5분
    { latitude: 37.5579, longitude: 126.9245, timestamp: 135 }, // 2.25분
    { latitude: 37.5583, longitude: 126.9250, timestamp: 180 }, // 3분
    { latitude: 37.5587, longitude: 126.9255, timestamp: 225 }, // 3.75분
    { latitude: 37.5591, longitude: 126.9260, timestamp: 270 }, // 4.5분
    { latitude: 37.5595, longitude: 126.9265, timestamp: 315 }, // 5.25분
    { latitude: 37.5599, longitude: 126.9270, timestamp: 360 }, // 6분
    { latitude: 37.5603, longitude: 126.9275, timestamp: 405 }, // 6.75분
    { latitude: 37.5607, longitude: 126.9280, timestamp: 450 }, // 7.5분
    { latitude: 37.5591, longitude: 126.9250, timestamp: 495 }, // 8.25분
    { latitude: 37.5475, longitude: 126.9220, timestamp: 540 }, // 9분
    { latitude: 37.5474, longitude: 126.9215, timestamp: 570 }, // 9.5분
    { latitude: 37.5474, longitude: 126.9210, timestamp: 600 }, // 상수역 (10분)
  ],
};

/**
 * 모든 시뮬레이션 경로 목록
 */
export const WALKING_ROUTES: WalkingRoute[] = [
  GANGNAM_WALKING_ROUTE,
  CITY_HALL_CIRCULAR_ROUTE,
  HONGDAE_WALKING_ROUTE,
];

/**
 * 경로 ID로 경로 찾기
 */
export const getRouteById = (routeId: string): WalkingRoute | undefined => {
  return WALKING_ROUTES.find(route => route.id === routeId);
};

/**
 * 기본 경로 반환 (테스트용)
 */
export const getDefaultRoute = (): WalkingRoute => {
  return GANGNAM_WALKING_ROUTE;
};

