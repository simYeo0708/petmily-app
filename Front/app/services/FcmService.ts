import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { API_BASE_URL } from '../config/api';
import AuthService from './AuthService';

// 알림 핸들러 설정
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class FcmService {
  private static instance: FcmService;
  private fcmToken: string | null = null;

  static getInstance(): FcmService {
    if (!FcmService.instance) {
      FcmService.instance = new FcmService();
    }
    return FcmService.instance;
  }

  /**
   * 알림 권한 요청
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('푸시 알림 권한이 거부되었습니다.');
        return false;
      }

      return true;
    } catch (error) {
      console.error('알림 권한 요청 실패:', error);
      return false;
    }
  }

  /**
   * FCM 토큰 등록
   */
  async registerToken(): Promise<string | null> {
    try {
      // 권한 확인
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return null;
      }

      // Expo Push Token 가져오기
      // Expo Go에서는 원격 푸시 알림이 제한적이므로, 개발 빌드 사용 권장
      let tokenData;
      try {
        // app.json의 extra.eas.projectId 또는 환경변수에서 projectId 가져오기
        const projectId = process.env.EXPO_PUBLIC_PROJECT_ID || 
                         (require('../app.json').expo?.extra?.eas?.projectId);
        
        if (projectId) {
          tokenData = await Notifications.getExpoPushTokenAsync({
            projectId: projectId,
          });
        } else {
          // projectId가 없으면 기본 방식 시도 (Expo Go에서는 실패할 수 있음)
          tokenData = await Notifications.getExpoPushTokenAsync();
        }
      } catch (error: any) {
        // Expo Go에서는 원격 푸시 알림이 제한적임
        if (error.message?.includes('projectId') || error.message?.includes('Expo Go')) {
          console.warn('⚠️ Expo Go에서는 원격 푸시 알림이 제한적입니다. 개발 빌드를 사용하세요.');
          console.warn('📱 실제 기기에서 개발 빌드를 사용하거나, 로컬 알림만 사용할 수 있습니다.');
          return null;
        }
        throw error;
      }

      const token = tokenData.data;
      this.fcmToken = token;

      // 로컬에 저장
      await AsyncStorage.setItem('fcmToken', token);

      // 백엔드에 토큰 전송
      try {
        const authToken = await AuthService.getAuthToken();
        if (authToken) {
          const response = await fetch(`${API_BASE_URL}/auth/fcm-token`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ fcmToken: token }),
          });

          if (response.ok) {
            console.log('✅ FCM 토큰이 백엔드에 등록되었습니다.');
          } else {
            console.warn('⚠️ FCM 토큰 등록 실패:', response.status);
          }
        } else {
          console.warn('⚠️ 인증 토큰이 없어 FCM 토큰을 백엔드에 등록할 수 없습니다.');
        }
      } catch (error) {
        console.error('❌ 백엔드 FCM 토큰 등록 실패:', error);
      }

      return token;
    } catch (error) {
      console.error('FCM 토큰 등록 실패:', error);
      return null;
    }
  }

  /**
   * 저장된 FCM 토큰 가져오기
   */
  async getToken(): Promise<string | null> {
    if (this.fcmToken) {
      return this.fcmToken;
    }

    try {
      const token = await AsyncStorage.getItem('fcmToken');
      this.fcmToken = token;
      return token;
    } catch (error) {
      console.error('FCM 토큰 조회 실패:', error);
      return null;
    }
  }

  /**
   * 알림 수신 리스너 설정
   */
  setupNotificationListeners() {
    // 포그라운드 알림 수신
    Notifications.addNotificationReceivedListener(notification => {
      console.log('알림 수신:', notification);
    });

    // 알림 탭 리스너
    Notifications.addNotificationResponseReceivedListener(response => {
      console.log('알림 탭:', response);
      // 여기서 알림 탭 시 특정 화면으로 이동하는 로직 추가 가능
    });
  }
}

export default FcmService.getInstance();

