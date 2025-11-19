import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, USE_MOCK_DATA } from '../config/api';

type AuthTokenResponse = {
  accessToken?: string;
  refreshToken?: string;
  userId?: number;
  username?: string;
  email?: string;
};

/**
 * 개발용 유틸리티 함수들
 * 실제 배포 시에는 제거해야 합니다
 */

/**
 * Mock 데이터 모드 확인
 */
export const isMockMode = (): boolean => {
  return USE_MOCK_DATA;
};

/**
 * Mock 모드용 가짜 토큰 생성
 */
export const setupMockAuth = async (): Promise<boolean> => {
  try {
    const mockToken = 'mock-jwt-token-for-development';
    const mockUserId = '999';
    const mockUsername = 'Mock User';
    const mockEmail = 'mock@petmily.com';

    await AsyncStorage.setItem('authToken', mockToken);
    await AsyncStorage.setItem('userId', mockUserId);
    await AsyncStorage.setItem('username', mockUsername);
    await AsyncStorage.setItem('email', mockEmail);

    console.log('✅ Mock 인증 설정 완료');
    return true;
  } catch (error) {
    console.error('❌ Mock 인증 설정 실패:', error);
    return false;
  }
};

/**
 * 테스트용 JWT 토큰을 받아서 AsyncStorage에 저장
 * Mock 모드일 경우 Mock 인증 사용
 */
export const setupTestAuth = async (): Promise<boolean> => {
  // Mock 모드일 경우 Mock 인증 사용
  if (USE_MOCK_DATA) {
    return setupMockAuth();
  }

  try {
    
    // 1. 백엔드의 테스트 엔드포인트 호출
    const response = await fetch(`${API_BASE_URL}/auth/test/setup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('테스트 사용자 생성 실패');
    }

    const data = await response.json() as AuthTokenResponse;

    if (!data?.accessToken) {
      throw new Error('액세스 토큰을 발급받지 못했습니다.');
    }

    // 2. 토큰을 AsyncStorage에 저장
    await AsyncStorage.setItem('authToken', data.accessToken);
    if (data.refreshToken) {
      await AsyncStorage.setItem('refreshToken', data.refreshToken);
    }
    if (typeof data.userId !== 'undefined') {
      await AsyncStorage.setItem('userId', String(data.userId));
    }
    if (data.username) {
      await AsyncStorage.setItem('username', data.username);
    }
    if (data.email) {
      await AsyncStorage.setItem('userEmail', data.email);
    }
    
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * asdf 계정으로 직접 로그인하여 JWT 토큰 받기
 * Mock 모드일 경우 Mock 인증 사용
 */
export const loginAsAsdf = async (): Promise<boolean> => {
  // Mock 모드일 경우 Mock 인증 사용
  if (USE_MOCK_DATA) {
    console.log('🎭 Mock 모드: asdf 계정으로 로그인');
    return setupMockAuth();
  }

  try {
    
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'asdf',
        password: 'asdf',
      }),
    });

    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`로그인 실패: ${response.status}`);
    }

    const data = await response.json() as any;
    
    // 토큰을 AsyncStorage에 저장
    await AsyncStorage.setItem('authToken', data.accessToken);
    if (data.refreshToken) {
      await AsyncStorage.setItem('refreshToken', data.refreshToken);
    }
    await AsyncStorage.setItem('userId', data.userId?.toString() || '1');
    await AsyncStorage.setItem('username', data.username || 'asdf');
    
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * 현재 저장된 인증 정보 확인
 */
export const checkAuthStatus = async (): Promise<void> => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    const userId = await AsyncStorage.getItem('userId');
    const username = await AsyncStorage.getItem('username');
  } catch (error) {
  }
};

/**
 * 저장된 인증 정보 삭제
 */
export const clearAuth = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      'authToken',
      'refreshToken',
      'userId',
      'username',
    ]);
  } catch (error) {
  }
};

/**
 * 개발용 디버그 패널
 */
export const DevTools = {
  setupTestAuth,
  loginAsAsdf,
  checkAuthStatus,
  clearAuth,
};

export default DevTools;

