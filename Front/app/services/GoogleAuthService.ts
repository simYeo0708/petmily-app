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
      // API_BASE_URL에서 /api를 제거하여 백엔드 기본 URL 얻기
      const backendUrl = API_BASE_URL.replace('/api', '');
      // 백엔드의 OAuth2 엔드포인트로 리다이렉트
      // 백엔드가 구글 OAuth를 처리하고 모바일 앱으로 리다이렉트
      const oauthUrl = `${backendUrl}/oauth2/authorization/google`;
      
      console.log('🔐 Starting Google OAuth');
      console.log('🔐 API_BASE_URL:', API_BASE_URL);
      console.log('🔐 Backend URL:', backendUrl);
      console.log('🔐 OAuth URL:', oauthUrl);
      
      // WebBrowser로 OAuth 페이지 열기
      // redirectUrl은 백엔드가 리다이렉트할 URL (deep link)
      const result = await WebBrowser.openAuthSessionAsync(
        oauthUrl,
        'petmily://oauth2/redirect'
      );
      
      console.log('🔐 OAuth result type:', result.type);
      console.log('🔐 OAuth result URL:', result.url);

      if (result.type === 'success' && result.url) {
        console.log('🔐 Parsing OAuth callback URL:', result.url);
        
        // Deep link URL 파싱 (petmily://oauth2/redirect?accessToken=...)
        let accessToken: string | null = null;
        
        try {
          // URL이 deep link 형식인 경우
          if (result.url.startsWith('petmily://')) {
            const urlObj = new URL(result.url.replace('petmily://', 'http://'));
            accessToken = urlObj.searchParams.get('accessToken');
          } else {
            // 일반 URL 형식인 경우
            const urlObj = new URL(result.url);
            accessToken = urlObj.searchParams.get('accessToken');
          }
        } catch (error) {
          console.error('🔐 URL parsing error:', error);
          // 수동으로 파싱 시도
          const tokenMatch = result.url.match(/[?&]accessToken=([^&]+)/);
          if (tokenMatch) {
            accessToken = decodeURIComponent(tokenMatch[1]);
          }
        }
        
        console.log('🔐 Extracted accessToken:', accessToken ? 'Found' : 'Not found');
        
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
            
            console.log('🔐 Google login successful');
            return {
              accessToken,
              refreshToken: userInfo.refreshToken,
              userId: userInfo.userId,
              username: userInfo.username,
              email: userInfo.email,
              name: userInfo.name,
            };
          } else {
            console.error('🔐 Failed to get user info');
          }
        } else {
          console.error('🔐 No accessToken in callback URL');
        }
      } else if (result.type === 'cancel') {
        console.log('🔐 OAuth cancelled by user');
      } else if (result.type === 'dismiss') {
        console.log('🔐 OAuth dismissed');
      } else {
        console.error('🔐 OAuth failed:', result.type);
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

