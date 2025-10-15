import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * 개발용 유틸리티 함수들
 * 실제 배포 시에는 제거해야 합니다
 */

const API_BASE_URL = 'http://10.50.235.215:8080/api';

/**
 * 테스트용 JWT 토큰을 받아서 AsyncStorage에 저장
 */
export const setupTestAuth = async (): Promise<boolean> => {
  try {
    console.log('[DEV] 테스트 인증 설정 시작...');
    
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

    const data = await response.json() as any;
    console.log('[DEV] 테스트 토큰 받음:', data.accessToken.substring(0, 30) + '...');
    
    // 2. 토큰을 AsyncStorage에 저장
    await AsyncStorage.setItem('authToken', data.accessToken);
    if (data.refreshToken) {
      await AsyncStorage.setItem('refreshToken', data.refreshToken);
    }
    await AsyncStorage.setItem('userId', '1'); // 테스트 사용자 ID
    await AsyncStorage.setItem('username', 'testuser');
    
    console.log('[DEV] ✅ 테스트 인증 설정 완료!');
    console.log('[DEV] Username: testuser');
    console.log('[DEV] Password: asdf');
    console.log('[DEV] JWT 토큰이 AsyncStorage에 저장되었습니다.');
    
    return true;
  } catch (error) {
    console.error('[DEV] ❌ 테스트 인증 설정 실패:', error);
    return false;
  }
};

/**
 * asdf 계정으로 직접 로그인하여 JWT 토큰 받기
 */
export const loginAsAsdf = async (): Promise<boolean> => {
  try {
    console.log('[DEV] asdf 계정으로 로그인 시도...');
    console.log('[DEV] API URL:', `${API_BASE_URL}/auth/login`);
    
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

    console.log('[DEV] 응답 상태:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[DEV] 로그인 실패 응답:', errorText);
      throw new Error(`로그인 실패: ${response.status}`);
    }

    const data = await response.json() as any;
    console.log('[DEV] asdf 계정 로그인 성공!');
    console.log('[DEV] 응답 데이터:', data);
    
    // 토큰을 AsyncStorage에 저장
    await AsyncStorage.setItem('authToken', data.accessToken);
    if (data.refreshToken) {
      await AsyncStorage.setItem('refreshToken', data.refreshToken);
    }
    await AsyncStorage.setItem('userId', data.userId?.toString() || '1');
    await AsyncStorage.setItem('username', data.username || 'asdf');
    
    console.log('[DEV] ✅ JWT 토큰이 저장되었습니다.');
    console.log('[DEV] 토큰:', data.accessToken.substring(0, 30) + '...');
    
    return true;
  } catch (error) {
    console.error('[DEV] ❌ asdf 로그인 실패:', error);
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
    
    console.log('[DEV] === 현재 인증 상태 ===');
    console.log('[DEV] Token:', token ? token.substring(0, 30) + '...' : 'None');
    console.log('[DEV] User ID:', userId || 'None');
    console.log('[DEV] Username:', username || 'None');
    console.log('[DEV] =====================');
  } catch (error) {
    console.error('[DEV] 인증 상태 확인 실패:', error);
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
    console.log('[DEV] ✅ 인증 정보가 삭제되었습니다.');
  } catch (error) {
    console.error('[DEV] 인증 정보 삭제 실패:', error);
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

