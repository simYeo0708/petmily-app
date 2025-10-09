import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient, API_ENDPOINTS } from './apiConfig';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  accessToken: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

class AuthService {
  async login(request: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, request, {
        withCredentials: true, // 쿠키 포함
      });
      const authData = response.data;

      // AccessToken만 저장 (RefreshToken은 HttpOnly 쿠키로 자동 관리됨)
      await AsyncStorage.setItem('access_token', authData.accessToken);

      return authData;
    } catch (error: any) {
      console.error('Login failed:', error);
      throw new Error(error.response?.data?.message || '로그인에 실패했습니다.');
    }
  }

  async signup(request: SignupRequest): Promise<User> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, request);
      return response.data;
    } catch (error: any) {
      console.error('Signup failed:', error);
      throw new Error(error.response?.data?.message || '회원가입에 실패했습니다.');
    }
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, {}, {
        withCredentials: true, // RefreshToken 쿠키 포함
      });
    } catch (error) {
      console.error('Logout API failed:', error);
    } finally {
      // AccessToken만 삭제 (RefreshToken은 서버에서 쿠키 삭제)
      await AsyncStorage.removeItem('access_token');
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.USERS.PROFILE);
      return response.data;
    } catch (error: any) {
      console.error('Get current user failed:', error);
      throw new Error(error.response?.data?.message || '사용자 정보를 불러올 수 없습니다.');
    }
  }

  async isLoggedIn(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('access_token');
      return token !== null;
    } catch (error) {
      console.error('Failed to check login status:', error);
      return false;
    }
  }

  async getAccessToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('access_token');
    } catch (error) {
      console.error('Failed to get access token:', error);
      return null;
    }
  }
}

export const authService = new AuthService();