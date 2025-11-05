import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

export interface Notification {
  id: number;
  title: string;
  content: string;
  type: string;
  priority: number;
  imageUrl?: string;
  actionUrl?: string;
}

export interface DismissNotificationRequest {
  notificationId: number;
  dismissType: 'never' | 'week' | 'day' | 'hour';
}

class NotificationService {
  private static instance: NotificationService;
  private baseUrl = `${API_BASE_URL}/notifications`;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * 사용자에게 표시할 알림 목록 조회
   */
  async getActiveNotifications(): Promise<Notification[]> {
    try {
      // TODO: 실제 API 호출로 대체
      const mockNotifications: Notification[] = [
        {
          id: 1,
          title: '워커로 활동 중입니다! 🚶‍♂️',
          content: '반려동물 산책 서비스의 워커로 활동해보세요. 유연한 시간에 수익을 창출할 수 있습니다!',
          type: 'WALKER_RECRUITMENT',
          priority: 10,
        },
        {
          id: 2,
          title: '새로운 기능이 추가되었습니다! 🎉',
          content: '산책 경로 추적 기능과 실시간 위치 공유 기능이 추가되었습니다.',
          type: 'FEATURE_UPDATE',
          priority: 5,
        },
      ];

      // 로컬에서 숨긴 알림 필터링
      const dismissedIds = await this.getDismissedNotificationIds();
      return mockNotifications.filter(notification => !dismissedIds.includes(notification.id));
    } catch (error) {
      console.error('알림 목록 조회 실패:', error);
      return [];
    }
  }

  /**
   * 알림 숨기기 처리
   */
  async dismissNotification(request: DismissNotificationRequest): Promise<boolean> {
    try {
      // 로컬 저장소에 저장
      await this.saveDismissedNotification(request.notificationId, request.dismissType);

      // TODO: 서버에 요청 전송
      // const response = await fetch(`${this.baseUrl}/dismiss`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${await this.getAuthToken()}`,
      //   },
      //   body: JSON.stringify(request),
      // });

      console.log(`알림 ${request.notificationId}을 ${request.dismissType}로 숨김`);
      return true;
    } catch (error) {
      console.error('알림 숨기기 실패:', error);
      return false;
    }
  }

  /**
   * 알림 숨기기 취소
   */
  async cancelDismissNotification(notificationId: number): Promise<boolean> {
    try {
      await this.removeDismissedNotification(notificationId);

      // TODO: 서버에 요청 전송
      // const response = await fetch(`${this.baseUrl}/dismiss/${notificationId}`, {
      //   method: 'DELETE',
      //   headers: {
      //     'Authorization': `Bearer ${await this.getAuthToken()}`,
      //   },
      // });

      console.log(`알림 ${notificationId}의 숨기기 취소`);
      return true;
    } catch (error) {
      console.error('알림 숨기기 취소 실패:', error);
      return false;
    }
  }

  /**
   * 숨긴 알림 ID 목록 조회
   */
  private async getDismissedNotificationIds(): Promise<number[]> {
    try {
      const dismissed = await AsyncStorage.getItem('dismissedNotifications');
      const dismissedIds = dismissed ? JSON.parse(dismissed) : [];
      
      // 만료된 숨기기 설정 제거
      const validIds = [];
      for (const id of dismissedIds) {
        const expiresAt = await AsyncStorage.getItem(`notification_${id}_expires`);
        if (!expiresAt || new Date() < new Date(expiresAt)) {
          validIds.push(id);
        } else {
          await AsyncStorage.removeItem(`notification_${id}_expires`);
        }
      }

      // 유효한 ID만 저장
      if (validIds.length !== dismissedIds.length) {
        await AsyncStorage.setItem('dismissedNotifications', JSON.stringify(validIds));
      }

      return validIds;
    } catch (error) {
      console.error('숨긴 알림 ID 조회 실패:', error);
      return [];
    }
  }

  /**
   * 숨긴 알림 저장
   */
  private async saveDismissedNotification(notificationId: number, dismissType: string): Promise<void> {
    try {
      const dismissedIds = await this.getDismissedNotificationIds();
      if (!dismissedIds.includes(notificationId)) {
        dismissedIds.push(notificationId);
        await AsyncStorage.setItem('dismissedNotifications', JSON.stringify(dismissedIds));
      }

      // 만료 시간 설정
      if (dismissType !== 'never') {
        const expiresAt = new Date();
        switch (dismissType) {
          case 'week':
            expiresAt.setDate(expiresAt.getDate() + 7);
            break;
          case 'day':
            expiresAt.setDate(expiresAt.getDate() + 1);
            break;
          case 'hour':
            expiresAt.setHours(expiresAt.getHours() + 1);
            break;
        }
        await AsyncStorage.setItem(`notification_${notificationId}_expires`, expiresAt.toISOString());
      }
    } catch (error) {
      console.error('숨긴 알림 저장 실패:', error);
    }
  }

  /**
   * 숨긴 알림 제거
   */
  private async removeDismissedNotification(notificationId: number): Promise<void> {
    try {
      const dismissedIds = await this.getDismissedNotificationIds();
      const filteredIds = dismissedIds.filter(id => id !== notificationId);
      await AsyncStorage.setItem('dismissedNotifications', JSON.stringify(filteredIds));
      await AsyncStorage.removeItem(`notification_${notificationId}_expires`);
    } catch (error) {
      console.error('숨긴 알림 제거 실패:', error);
    }
  }

  /**
   * 인증 토큰 조회 (TODO: 실제 구현)
   */
  private async getAuthToken(): Promise<string> {
    // TODO: 실제 토큰 조회 로직 구현
    return '';
  }
}

export default NotificationService;

