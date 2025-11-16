import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * API 기본 URL 설정
 * - Android 에뮬레이터: 10.0.2.2:8080
 * - iOS 시뮬레이터: localhost:8080
 * - 실제 기기: 개발 서버의 실제 IP 주소 필요
 */
const getBaseUrl = (): string => {
  // 개발 환경에서는 환경 변수 또는 기본값 사용
  if (__DEV__) {
    if (Platform.OS === 'android') {
      // Android 에뮬레이터에서는 10.0.2.2가 호스트 머신을 가리킴
      return 'http://10.0.2.2:8080';
    } else if (Platform.OS === 'ios') {
      // iOS 시뮬레이터에서는 localhost 사용 가능
      return 'http://localhost:8080';
    } else {
      // Web이나 다른 플랫폼
      return 'http://localhost:8080';
    }
  }

  // 프로덕션 환경에서는 실제 서버 주소 사용
  return process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080';
};

export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  TIMEOUT: 10000, // 10초
  HEADERS: {
    'Content-Type': 'application/json',
  },
};

export default API_CONFIG;
