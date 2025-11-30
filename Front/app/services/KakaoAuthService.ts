import * as WebBrowser from 'expo-web-browser';
import { API_BASE_URL } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthService from './AuthService';

// WebBrowser를 완료 처리
WebBrowser.maybeCompleteAuthSession();

interface KakaoAuthResponse {
  accessToken: string;
  refreshToken?: string;
  userId: number;
  username: string;
  email: string;
  name?: string;
}

const KakaoAuthService = {
  /**
   * 카카오 OAuth 로그인 시작
   * 백엔드의 OAuth2 엔드포인트로 리다이렉트
   */
  async loginWithKakao(): Promise<KakaoAuthResponse | null> {
    try {
      // ngrok URL 사용 (개발 환경)
      // 프로덕션에서는 실제 도메인 사용
      const ngrokUrl = process.env.EXPO_PUBLIC_NGROK_URL || 'https://superoccipital-nonsolubly-lelah.ngrok-free.dev';
      const backendUrl = ngrokUrl;
      // 백엔드의 OAuth2 엔드포인트로 리다이렉트
      const oauthUrl = `${backendUrl}/oauth2/authorization/kakao`;
      
      console.log('🔐 Kakao OAuth - Backend URL:', backendUrl);
      console.log('🔐 Kakao OAuth - OAuth URL:', oauthUrl);
      
      // WebBrowser로 OAuth 페이지 열기
      const result = await WebBrowser.openAuthSessionAsync(
        oauthUrl,
        'petmily://oauth2/redirect'
      );
      
      console.log('🔐 Kakao OAuth - Result type:', result.type);
      console.log('🔐 Kakao OAuth - Result URL:', result.url);

      if (result.type === 'success' && result.url) {
        // Deep link URL 파싱
        let accessToken: string | null = null;
        
        try {
          if (result.url.startsWith('petmily://')) {
            const urlObj = new URL(result.url.replace('petmily://', 'http://'));
            accessToken = urlObj.searchParams.get('accessToken');
          } else {
            const urlObj = new URL(result.url);
            accessToken = urlObj.searchParams.get('accessToken');
          }
        } catch (error) {
          // 수동으로 파싱 시도
          const tokenMatch = result.url.match(/[?&]accessToken=([^&]+)/);
          if (tokenMatch) {
            accessToken = decodeURIComponent(tokenMatch[1]);
          }
        }
        
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
      console.error('🔐 Kakao login error:', error);
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
      return null;
    }
  },
};

export default KakaoAuthService;

