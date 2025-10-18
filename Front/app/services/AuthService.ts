import AsyncStorage from '@react-native-async-storage/async-storage';

// Expo에서는 localhost 대신 Mac의 IP 주소를 사용해야 합니다
// Mac의 IP 주소를 확인하려면: 시스템 환경설정 → 네트워크
// 또는 터미널에서: ipconfig getifaddr en0
// 
// ⚠️ 아래 IP 주소를 본인의 Mac IP 주소로 변경하세요!
const API_BASE_URL = 'http://10.50.235.215:8080/api';

interface LoginRequest {
  username: string;
  password: string;
}

interface SignupRequest {
  username: string;
  password: string;
  email: string;
  name: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  userId: number;
  username: string;
  email: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  name: string;
}

const AuthService = {
  async login(username: string, password: string): Promise<AuthResponse> {
    try {
      console.log('로그인 시도:', { username });
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as any;
        throw new Error(errorData.message || '로그인 실패');
      }

      const data = await response.json() as AuthResponse;
      console.log('로그인 성공:', { userId: data.userId, username: data.username });
      
      // 토큰 저장
      await AsyncStorage.setItem('authToken', data.accessToken);
      await AsyncStorage.setItem('userId', data.userId.toString());
      await AsyncStorage.setItem('username', data.username);
      if (data.refreshToken) {
        await AsyncStorage.setItem('refreshToken', data.refreshToken);
      }
      
      return data;
    } catch (error) {
      console.error('로그인 에러:', error);
      throw error;
    }
  },

  /**
   * 회원가입
   */
  async signup(signupData: SignupRequest): Promise<AuthResponse> {
    try {
      console.log('회원가입 시도:', { username: signupData.username, email: signupData.email });
      
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as any;
        throw new Error(errorData.message || '회원가입 실패');
      }

      const data = await response.json() as AuthResponse;
      console.log('회원가입 성공:', { userId: data.userId, username: data.username });
      
      // 토큰 저장
      await AsyncStorage.setItem('authToken', data.accessToken);
      await AsyncStorage.setItem('userId', data.userId.toString());
      await AsyncStorage.setItem('username', data.username);
      if (data.refreshToken) {
        await AsyncStorage.setItem('refreshToken', data.refreshToken);
      }
      
      return data;
    } catch (error) {
      console.error('회원가입 에러:', error);
      throw error;
    }
  },

  /**
   * 로그아웃
   */
  async logout(): Promise<void> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      if (token) {
        // 서버에 로그아웃 요청
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
      
      // 로컬 저장소 클리어
      await AsyncStorage.multiRemove([
        'authToken',
        'refreshToken',
        'userId',
        'username',
      ]);
      
      console.log('로그아웃 완료');
    } catch (error) {
      console.error('로그아웃 에러:', error);
      // 에러가 발생해도 로컬 데이터는 삭제
      await AsyncStorage.multiRemove([
        'authToken',
        'refreshToken',
        'userId',
        'username',
      ]);
    }
  },

  /**
   * 현재 로그인 상태 확인
   */
  async isLoggedIn(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      return !!token;
    } catch (error) {
      console.error('로그인 상태 확인 에러:', error);
      return false;
    }
  },

  /**
   * 저장된 토큰 가져오기
   */
  async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('토큰 가져오기 에러:', error);
      return null;
    }
  },

  /**
   * 현재 사용자 정보 가져오기
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        return null;
      }

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('사용자 정보 조회 실패');
      }

      const user = await response.json() as User;
      return user;
    } catch (error) {
      console.error('사용자 정보 조회 에러:', error);
      return null;
    }
  },

  /**
   * 토큰 갱신
   */
  async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('Refresh token not found');
      }

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('토큰 갱신 실패');
      }

      const data = await response.json() as AuthResponse;
      
      // 새 토큰 저장
      await AsyncStorage.setItem('authToken', data.accessToken);
      if (data.refreshToken) {
        await AsyncStorage.setItem('refreshToken', data.refreshToken);
      }
      
      return data.accessToken;
    } catch (error) {
      console.error('토큰 갱신 에러:', error);
      return null;
    }
  },
};

export default AuthService;

