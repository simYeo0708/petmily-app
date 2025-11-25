import { apiClient, API_ENDPOINTS } from './apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface NotificationSettings {
  userId: number;
  departureAlertEnabled: boolean;
  departureDistanceThreshold: number;
  delayAlertEnabled: boolean;
  delayTimeThreshold: number;
  walkStartNotification: boolean;
  walkCompleteNotification: boolean;
  emergencyNotification: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  emailEnabled: boolean;
}

export interface InAppNotification {
  id: string;
  type: 'walk_start' | 'walk_progress' | 'walk_complete' | 'emergency' | 'booking' | 'order' | 'chat' | 'system';
  title: string;
  message: string;
  data?: Record<string, any>;
  timestamp: string;
  isRead: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  category: 'walking' | 'shopping' | 'chat' | 'system' | 'booking';
  actionUrl?: string;
  imageUrl?: string;
}

export interface PushNotificationRequest {
  title: string;
  body: string;
  data?: Record<string, any>;
  userId?: number;
  tokens?: string[];
  topic?: string;
  condition?: string;
}

export interface NotificationHistory {
  bookingId: number;
  notifications: {
    type: string;
    timestamp: string;
  }[];
}

class NotificationService {
  private notificationListeners: ((notification: InAppNotification) => void)[] = [];
  private inAppNotifications: InAppNotification[] = [];

  // === 인앱 알림 관리 ===

  async getInAppNotifications(): Promise<InAppNotification[]> {
    try {
      const stored = await AsyncStorage.getItem('inapp_notifications');
      if (stored) {
        this.inAppNotifications = JSON.parse(stored);
      }
      return this.inAppNotifications.sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    } catch (error) {
      console.error('Get in-app notifications failed:', error);
      return [];
    }
  }

  async addInAppNotification(notification: Omit<InAppNotification, 'id' | 'timestamp' | 'isRead'>): Promise<void> {
    const newNotification: InAppNotification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      isRead: false
    };

    this.inAppNotifications.unshift(newNotification);

    // 최대 100개 유지
    if (this.inAppNotifications.length > 100) {
      this.inAppNotifications = this.inAppNotifications.slice(0, 100);
    }

    await this.saveInAppNotifications();
    this.notifyListeners(newNotification);
  }

  async markAsRead(notificationId: string): Promise<void> {
    const notification = this.inAppNotifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
      await this.saveInAppNotifications();
    }
  }

  async markAllAsRead(): Promise<void> {
    this.inAppNotifications.forEach(n => n.isRead = true);
    await this.saveInAppNotifications();
  }

  async deleteNotification(notificationId: string): Promise<void> {
    this.inAppNotifications = this.inAppNotifications.filter(n => n.id !== notificationId);
    await this.saveInAppNotifications();
  }

  async clearAllNotifications(): Promise<void> {
    this.inAppNotifications = [];
    await this.saveInAppNotifications();
  }

  getUnreadCount(): number {
    return this.inAppNotifications.filter(n => !n.isRead).length;
  }

  getNotificationsByCategory(category: string): InAppNotification[] {
    return this.inAppNotifications.filter(n => n.category === category);
  }

  getNotificationsByType(type: string): InAppNotification[] {
    return this.inAppNotifications.filter(n => n.type === type);
  }

  // === 푸시 알림 관리 ===

  async registerPushToken(token: string): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.NOTIFICATIONS.PUSH_TOKEN_REGISTER, { token });
      await AsyncStorage.setItem('push_token', token);
    } catch (error: any) {
      console.error('Register push token failed:', error);
      throw new Error('푸시 알림 토큰 등록에 실패했습니다.');
    }
  }

  async unregisterPushToken(): Promise<void> {
    try {
      const token = await AsyncStorage.getItem('push_token');
      if (token) {
        await apiClient.delete(API_ENDPOINTS.NOTIFICATIONS.PUSH_TOKEN_UNREGISTER, { data: { token } });
        await AsyncStorage.removeItem('push_token');
      }
    } catch (error: any) {
      console.error('Unregister push token failed:', error);
      throw new Error('푸시 알림 토큰 해제에 실패했습니다.');
    }
  }

  async sendPushNotification(request: PushNotificationRequest): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.NOTIFICATIONS.PUSH_SEND, request);
    } catch (error: any) {
      console.error('Send push notification failed:', error);
      throw new Error('푸시 알림 전송에 실패했습니다.');
    }
  }

  // === 알림 설정 관리 ===

  async getNotificationSettings(): Promise<NotificationSettings> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.NOTIFICATIONS.SETTINGS);
      return response.data;
    } catch (error: any) {
      console.error('Get notification settings failed:', error);
      // 기본 설정 반환
      return {
        userId: 0,
        departureAlertEnabled: true,
        departureDistanceThreshold: 200,
        delayAlertEnabled: true,
        delayTimeThreshold: 10,
        walkStartNotification: true,
        walkCompleteNotification: true,
        emergencyNotification: true,
        smsEnabled: true,
        pushEnabled: true,
        emailEnabled: false
      };
    }
  }

  async updateNotificationSettings(settings: Partial<NotificationSettings>): Promise<NotificationSettings> {
    try {
      const response = await apiClient.put(API_ENDPOINTS.NOTIFICATIONS.SETTINGS, settings);
      return response.data;
    } catch (error: any) {
      console.error('Update notification settings failed:', error);
      throw new Error('알림 설정 업데이트에 실패했습니다.');
    }
  }

  // === 산책 알림 (기존 백엔드와 연동) ===

  async getNotificationHistory(bookingId: number): Promise<NotificationHistory> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.NOTIFICATIONS.WALK_HISTORY(bookingId));
      return response.data;
    } catch (error: any) {
      console.error('Get notification history failed:', error);
      throw new Error('알림 기록을 불러올 수 없습니다.');
    }
  }

  // === 테스트 및 디버깅 ===

  async sendTestNotification(): Promise<void> {
    await this.addInAppNotification({
      type: 'system',
      title: '테스트 알림',
      message: '알림 시스템이 정상적으로 작동합니다.',
      priority: 'normal',
      category: 'system'
    });
  }

  // === 리스너 관리 ===

  addNotificationListener(listener: (notification: InAppNotification) => void): void {
    this.notificationListeners.push(listener);
  }

  removeNotificationListener(listener: (notification: InAppNotification) => void): void {
    this.notificationListeners = this.notificationListeners.filter(l => l !== listener);
  }

  private notifyListeners(notification: InAppNotification): void {
    this.notificationListeners.forEach(listener => {
      try {
        listener(notification);
      } catch (error) {
        console.error('Notification listener error:', error);
      }
    });
  }

  // === 특정 상황별 알림 생성 ===

  async notifyWalkStart(petName: string, walkerName: string, bookingId: number): Promise<void> {
    await this.addInAppNotification({
      type: 'walk_start',
      title: '산책 시작',
      message: `${petName}의 산책이 ${walkerName} 워커와 함께 시작되었습니다.`,
      data: { bookingId, petName, walkerName },
      priority: 'normal',
      category: 'walking',
      actionUrl: `/walking/${bookingId}`
    });
  }

  async notifyWalkComplete(petName: string, duration: number, bookingId: number): Promise<void> {
    await this.addInAppNotification({
      type: 'walk_complete',
      title: '산책 완료',
      message: `${petName}의 산책이 완료되었습니다. (${Math.round(duration / 60)}분)`,
      data: { bookingId, petName, duration },
      priority: 'normal',
      category: 'walking',
      actionUrl: `/walking/${bookingId}/summary`
    });
  }

  async notifyEmergency(petName: string, emergencyType: string, location: string): Promise<void> {
    await this.addInAppNotification({
      type: 'emergency',
      title: '긴급상황 발생',
      message: `${petName}: ${emergencyType} - ${location}`,
      data: { petName, emergencyType, location },
      priority: 'urgent',
      category: 'walking'
    });
  }

  async notifyNewOrder(orderNumber: string, totalAmount: number): Promise<void> {
    await this.addInAppNotification({
      type: 'order',
      title: '새 주문',
      message: `주문이 완료되었습니다. (${orderNumber} - ${totalAmount.toLocaleString()}원)`,
      data: { orderNumber, totalAmount },
      priority: 'normal',
      category: 'shopping',
      actionUrl: `/orders/${orderNumber}`
    });
  }

  async notifyNewMessage(senderName: string, roomId: string): Promise<void> {
    await this.addInAppNotification({
      type: 'chat',
      title: '새 메시지',
      message: `${senderName}님으로부터 새 메시지가 도착했습니다.`,
      data: { senderName, roomId },
      priority: 'normal',
      category: 'chat',
      actionUrl: `/chat/${roomId}`
    });
  }

  async notifyBookingConfirmed(petName: string, date: string, bookingId: number): Promise<void> {
    await this.addInAppNotification({
      type: 'booking',
      title: '예약 확정',
      message: `${petName}의 산책 예약이 확정되었습니다. (${date})`,
      data: { petName, date, bookingId },
      priority: 'normal',
      category: 'booking',
      actionUrl: `/bookings/${bookingId}`
    });
  }

  // === 배치 작업 ===

  async scheduleLocalNotifications(): Promise<void> {
    // React Native에서 로컬 알림 스케줄링
    // 예: 산책 시간 30분 전 알림, 사료 주문 알림 등
  }

  async syncWithServer(): Promise<void> {
    // 서버와 알림 상태 동기화
    try {
      const response = await apiClient.get(API_ENDPOINTS.NOTIFICATIONS.SYNC);
      const serverNotifications = response.data;

      // 서버의 새로운 알림들을 로컬에 추가
      for (const notification of serverNotifications) {
        if (!this.inAppNotifications.find(n => n.id === notification.id)) {
          this.inAppNotifications.push(notification);
        }
      }

      await this.saveInAppNotifications();
    } catch (error) {
      console.error('Sync with server failed:', error);
    }
  }

  // === 유틸리티 ===

  private async saveInAppNotifications(): Promise<void> {
    try {
      await AsyncStorage.setItem('inapp_notifications', JSON.stringify(this.inAppNotifications));
    } catch (error) {
      console.error('Save in-app notifications failed:', error);
    }
  }

  formatNotificationTime(timestamp: string): string {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffMs = now.getTime() - notificationTime.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return '방금 전';
    if (diffMinutes < 60) return `${diffMinutes}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;

    return notificationTime.toLocaleDateString();
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'urgent': return '#FF4444';
      case 'high': return '#FF8800';
      case 'normal': return '#4CAF50';
      case 'low': return '#9E9E9E';
      default: return '#4CAF50';
    }
  }

  getPriorityIcon(priority: string): string {
    switch (priority) {
      case 'urgent': return '🚨';
      case 'high': return '⚠️';
      case 'normal': return '📱';
      case 'low': return '💬';
      default: return '📱';
    }
  }
}

export const notificationService = new NotificationService();