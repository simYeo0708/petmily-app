import Constants from 'expo-constants';
console.log(
  'KakaoMap API key (process.env)',
  process.env.EXPO_PUBLIC_KAKAO_MAP_API_KEY
);
console.log(
  'KakaoMap API key (extra)',
  Constants.expoConfig?.extra?.kakaoMapApiKey
);
/**
 * API 설정 관리
 * .env.local 파일의 EXPO_PUBLIC_API_HOST를 사용하여 IP 주소를 동적으로 관리합니다.
 * 
 * IP 주소 업데이트 방법:
 * 1. 터미널에서: npm run update-ip
 * 2. 또는 개발 시작 시: npm run dev (IP 자동 감지 + Expo 실행)
 */

// .env.local에서 환경 변수 읽기
const API_HOST = process.env.EXPO_PUBLIC_API_HOST || 
                 Constants.expoConfig?.extra?.apiHost || 
                 '192.168.0.78';  // 최근 감지된 IP (기본값)

const API_PORT = process.env.EXPO_PUBLIC_API_PORT || 
                 Constants.expoConfig?.extra?.apiPort || 
                 '8083';  // 기본값

/**
 * API Base URL
 * 환경에 따라 자동으로 설정됩니다:
 * - 개발: .env 파일의 IP 주소 사용
 * - 프로덕션: 실제 서버 도메인 사용
 */
export const API_BASE_URL = `http://${API_HOST}:${API_PORT}/api`;

/**
 * 현재 API 설정 정보 출력 (디버깅용)
 */
export const logApiConfig = () => {
  console.log('📡 API Configuration:');
  console.log(`  - Host: ${API_HOST}`);
  console.log(`  - Port: ${API_PORT}`);
  console.log(`  - Base URL: ${API_BASE_URL}`);
};

/**
 * API 연결 테스트
 */
export const testApiConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/test`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return response.ok;
  } catch (error) {
    console.error('❌ API 연결 실패:', error);
    return false;
  }
};

// 앱 시작 시 API 설정 로그 출력
if (__DEV__) {
  logApiConfig();
}

/**
 * Kakao Maps API Key
 * .env.local 파일에서 EXPO_PUBLIC_KAKAO_MAP_API_KEY로 관리
 * 
 * 발급 방법: KAKAO_MAP_SETUP.md 참고
 * 1. https://developers.kakao.com/ 접속
 * 2. 내 애플리케이션 > 애플리케이션 추가하기
 * 3. 앱 설정 > 플랫폼 설정에서 iOS 번들 ID 등록: com.petmily.app
 * 4. 제품 설정 > 지도 > 활성화 설정
 * 5. 앱 키 > Native App Key 복사하여 .env.local에 추가
 */
export const KAKAO_MAP_API_KEY = 
  process.env.EXPO_PUBLIC_KAKAO_MAP_API_KEY || 
  Constants.expoConfig?.extra?.kakaoMapApiKey || 
  'dummy-key-for-development';

