import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { API_BASE_URL } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthService from './AuthService';

// WebBrowser를 완료 처리
WebBrowser.maybeCompleteAuthSession();

interface GoogleAuthResponse {
  accessToken: string;
  refreshToken?: string;
  userId: number;
  username: string;
  email: string;
  name?: string;
}

const GoogleAuthService = {
  /**
   * 구글 OAuth 로그인 시작
   * 백엔드의 OAuth2 엔드포인트로 리다이렉트
   */
  async loginWithGoogle(): Promise<GoogleAuthResponse | null> {
    try {
      const backendUrl = API_BASE_URL.replace('/api', '');
      const oauthUrl = `${backendUrl}/oauth2/authorization/google`;
      
      // WebBrowser로 OAuth 페이지 열기
      const result = await WebBrowser.openAuthSessionAsync(
        oauthUrl,
        'petmily://oauth2/redirect'
      );

      if (result.type === 'success' && result.url) {
        // URL에서 accessToken 추출
        const url = new URL(result.url);
        const accessToken = url.searchParams.get('accessToken');
        
        if (accessToken) {
          // 토큰 저장
          await AsyncStorage.setItem('authToken', accessToken);
          
          // 사용자 정보 가져오기
          const userInfo = await this.getUserInfo(accessToken);
          
          if (userInfo) {
            await AsyncStorage.setItem('userId', userInfo.userId.toString());
            await AsyncStorage.setItem('username', userInfo.username);
            await AsyncStorage.setItem('email', userInfo.email);
            if (userInfo.name) {
              await AsyncStorage.setItem('name', userInfo.name);
            }
            
            return {
              accessToken,
              refreshToken: userInfo.refreshToken,
              userId: userInfo.userId,
              username: userInfo.username,
              email: userInfo.email,
              name: userInfo.name,
            };
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('Google login error:', error);
      return null;
    }
  },

  /**
   * AccessToken으로 사용자 정보 가져오기
   */
  async getUserInfo(accessToken: string): Promise<{
    userId: number;
    username: string;
    email: string;
    name?: string;
    refreshToken?: string;
  } | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get user info');
      }

      const data = await response.json();
      return {
        userId: data.id || data.userId,
        username: data.username,
        email: data.email,
        name: data.name,
      };
    } catch (error) {
      console.error('Get user info error:', error);
      return null;
    }
  },
};

export default GoogleAuthService;

