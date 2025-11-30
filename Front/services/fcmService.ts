import { apiClient, API_ENDPOINTS } from './apiConfig';

export interface FcmSendRequest {
  token: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

export interface FcmResponse {
  success: boolean;
  messageId?: string;
  title: string;
  body: string;
  errorMessage?: string;
}

class FcmService {
  /**
   * FCM 푸시 메시지 전송
   */
  async sendPushMessage(request: FcmSendRequest): Promise<FcmResponse> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.FCM.SEND, request);
      return response.data.data; // ApiResponse 래퍼 제거
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '푸시 메시지 전송에 실패했습니다.');
    }
  }

  /**
   * FCM 테스트 메시지 전송
   */
  async sendTestMessage(token: string): Promise<FcmResponse> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.FCM.TEST, null, {
        params: { token }
      });
      return response.data.data; // ApiResponse 래퍼 제거
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '테스트 메시지 전송에 실패했습니다.');
    }
  }

  /**
   * 산책 시작 알림 전송
   */
  async sendWalkStartNotification(
    token: string,
    petName: string,
    walkerName: string,
    bookingId: number
  ): Promise<FcmResponse> {
    return this.sendPushMessage({
      token,
      title: '산책 시작',
      body: `${petName}의 산책이 ${walkerName} 워커와 함께 시작되었습니다.`,
      data: {
        type: 'walk_start',
        bookingId,
        petName,
        walkerName
      }
    });
  }

  /**
   * 산책 완료 알림 전송
   */
  async sendWalkCompleteNotification(
    token: string,
    petName: string,
    duration: number,
    bookingId: number
  ): Promise<FcmResponse> {
    return this.sendPushMessage({
      token,
      title: '산책 완료',
      body: `${petName}의 산책이 완료되었습니다. (${Math.round(duration / 60)}분)`,
      data: {
        type: 'walk_complete',
        bookingId,
        petName,
        duration
      }
    });
  }

  /**
   * 예약 확정 알림 전송
   */
  async sendBookingConfirmedNotification(
    token: string,
    petName: string,
    date: string,
    bookingId: number
  ): Promise<FcmResponse> {
    return this.sendPushMessage({
      token,
      title: '예약 확정',
      body: `${petName}의 산책 예약이 확정되었습니다. (${date})`,
      data: {
        type: 'booking_confirmed',
        bookingId,
        petName,
        date
      }
    });
  }

  /**
   * 새 채팅 메시지 알림 전송
   */
  async sendNewMessageNotification(
    token: string,
    senderName: string,
    message: string,
    roomId: string
  ): Promise<FcmResponse> {
    return this.sendPushMessage({
      token,
      title: `${senderName}님으로부터 새 메시지`,
      body: message,
      data: {
        type: 'chat_message',
        roomId,
        senderName
      }
    });
  }

  /**
   * 긴급상황 알림 전송
   */
  async sendEmergencyNotification(
    token: string,
    petName: string,
    emergencyType: string,
    location: string,
    bookingId: number
  ): Promise<FcmResponse> {
    return this.sendPushMessage({
      token,
      title: '긴급상황 발생',
      body: `${petName}: ${emergencyType} - ${location}`,
      data: {
        type: 'emergency',
        bookingId,
        petName,
        emergencyType,
        location
      }
    });
  }
}

export const fcmService = new FcmService();

