import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

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
      
      // 토큰 저장
      await AsyncStorage.setItem('authToken', data.accessToken);
      await AsyncStorage.setItem('userId', data.userId.toString());
      await AsyncStorage.setItem('username', data.username);
      if (data.refreshToken) {
        await AsyncStorage.setItem('refreshToken', data.refreshToken);
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 회원가입
   */
  async signup(signupData: SignupRequest): Promise<AuthResponse> {
    try {
      
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
      // 
      
      // 토큰 저장
      await AsyncStorage.setItem('authToken', data.accessToken);
      await AsyncStorage.setItem('userId', data.userId.toString());
      await AsyncStorage.setItem('username', data.username);
      if (data.refreshToken) {
        await AsyncStorage.setItem('refreshToken', data.refreshToken);
      }
      
      return data;
    } catch (error) {
      // 
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
      
      // 
    } catch (error) {
      // 
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
      // 
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
      // 
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
      // 
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
      // 
      return null;
    }
  },
};

export default AuthService;

