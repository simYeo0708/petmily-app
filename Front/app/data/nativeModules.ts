/**
 * 네이티브 모듈 관련 설정 및 타입 정의
 * 
 * KakaoMaps SDK를 React Native에서 사용하기 위한
 * 네이티브 브릿지 모듈 정보
 */

export interface KakaoMapConfig {
  apiKey: string;
  defaultLatitude: number;
  defaultLongitude: number;
  defaultZoomLevel: number;
}

export const DEFAULT_MAP_CONFIG: KakaoMapConfig = {
  apiKey: 'dummy-key-for-development',
  defaultLatitude: 37.5665, // 서울 시청
  defaultLongitude: 126.9780,
  defaultZoomLevel: 15,
};

/**
 * 네이티브 모듈 사용 가이드:
 * 
 * 1. iOS - KakaoMapsSDK 설치됨
 * 2. Android - 향후 추가 예정
 * 
 * 사용 예시:
 * ```typescript
 * import KakaoMapView from '@/app/components/KakaoMapView';
 * 
 * <KakaoMapView
 *   apiKey="your-api-key"
 *   latitude={37.5665}
 *   longitude={126.9780}
 *   zoomLevel={15}
 *   style={{ flex: 1 }}
 * />
 * ```
 */





