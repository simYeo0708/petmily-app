import { apiClient, API_ENDPOINTS } from './apiConfig';

// WalkerBooking 관련 타입 정의
export interface WalkerBookingRequest {
  walkerId?: number; // 워커 선택형에서만 필요
  petId: number;
  date: string; // ISO 8601 format
  duration: number; // 분 단위
  notes?: string;
  emergencyContact?: string;

  // Booking method
  bookingMethod?: 'WALKER_SELECTION' | 'OPEN_REQUEST';

  // For open requests
  pickupLocation?: string; // 위도,경도 형태
  pickupAddress?: string; // 실제 주소

  // Optional dropoff location (null if same as pickup)
  dropoffLocation?: string; // 위도,경도 형태
  dropoffAddress?: string; // 실제 주소

  // Regular package fields
  isRegularPackage?: boolean;
  packageFrequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
}

export interface WalkerBookingResponse {
  id: number;
  userId: number;
  walkerId?: number;
  petId: number;
  date: string;
  duration: number;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  totalPrice?: number;
  notes?: string;

  // Location and tracking
  walkerLocation?: string;
  walkStartLocation?: string;
  walkEndLocation?: string;

  // Photo verification
  startPhotoUrl?: string;
  middlePhotoUrl?: string;
  endPhotoUrl?: string;

  // Walk timing
  actualStartTime?: string;
  actualEndTime?: string;

  // Insurance and safety
  insuranceCovered?: boolean;
  emergencyContact?: string;

  // Regular package
  isRegularPackage?: boolean;
  packageFrequency?: string;

  // Booking method and locations
  bookingMethod?: 'WALKER_SELECTION' | 'OPEN_REQUEST';
  pickupLocation?: string;
  pickupAddress?: string;
  dropoffLocation?: string;
  dropoffAddress?: string;

  // Walker info
  walkerUsername?: string;
  walkerName?: string;

  // User info
  username?: string;
  userName?: string;
}

export interface WalkerApplicationRequest {
  openRequestId: number; // 오픈 요청 ID
  message: string; // 워커가 보내는 메시지
  proposedPrice?: number; // 제안 가격 (선택사항)
}

export interface WalkerApplicationResponse {
  bookingId: number;
  walkerId: number;
  walkerName?: string;
  walkerProfileImage?: string;
  walkerRating?: number;
  walkerExperience?: string;
  message?: string;
  proposedPrice?: number;
  appliedAt: string;
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

export interface BookingChangeRequest {
  newDate?: string;
  newDuration?: number;
  newPrice?: number;
  newPickupLocation?: string;
  newPickupAddress?: string;
  newDropoffLocation?: string;
  newDropoffAddress?: string;
  newNotes?: string;
  newInsuranceCovered?: boolean;
  newEmergencyContact?: string;
  changeReason?: string;
}

export interface BookingChangeResponse {
  id: number;
  bookingId: number;
  requestedByUserId: number;
  newDate?: string;
  newDuration?: number;
  newPrice?: number;
  newPickupLocation?: string;
  newPickupAddress?: string;
  newDropoffLocation?: string;
  newDropoffAddress?: string;
  newNotes?: string;
  newInsuranceCovered?: boolean;
  newEmergencyContact?: string;
  changeReason?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  walkerResponse?: string;
  respondedAt?: string;
  requestedAt: string;
}

export interface ChangeRequestDecisionRequest {
  accept: boolean;
  response: string;
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

class WalkerBookingService {
  // 산책 예약 생성
  async createBooking(request: WalkerBookingRequest): Promise<WalkerBookingResponse> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.WALKER_BOOKINGS.CREATE, request);
      return response.data;
    } catch (error: any) {
      console.error('Create booking failed:', error);
      throw new Error(error.response?.data?.message || '예약 생성에 실패했습니다.');
    }
  }

  // 사용자의 예약 목록 조회
  async getUserBookings(): Promise<WalkerBookingResponse[]> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.WALKER_BOOKINGS.USER_BOOKINGS);
      return response.data;
    } catch (error: any) {
      console.error('Get user bookings failed:', error);
      throw new Error(error.response?.data?.message || '예약 목록을 불러올 수 없습니다.');
    }
  }

  // 워커의 예약 목록 조회
  async getWalkerBookings(): Promise<WalkerBookingResponse[]> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.WALKER_BOOKINGS.WALKER_BOOKINGS);
      return response.data;
    } catch (error: any) {
      console.error('Get walker bookings failed:', error);
      throw new Error(error.response?.data?.message || '워커 예약 목록을 불러올 수 없습니다.');
    }
  }

  // 특정 예약 조회
  async getBooking(bookingId: number): Promise<WalkerBookingResponse> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.WALKER_BOOKINGS.DETAIL(bookingId));
      return response.data;
    } catch (error: any) {
      console.error('Get booking failed:', error);
      throw new Error(error.response?.data?.message || '예약 정보를 불러올 수 없습니다.');
    }
  }

  // 예약 상태 변경
  async updateBookingStatus(bookingId: number, status: BookingStatus): Promise<WalkerBookingResponse> {
    try {
      const response = await apiClient.put(
        `${API_ENDPOINTS.WALKER_BOOKINGS.UPDATE_STATUS(bookingId)}?status=${status}`
      );
      return response.data;
    } catch (error: any) {
      console.error('Update booking status failed:', error);
      throw new Error(error.response?.data?.message || '예약 상태 변경에 실패했습니다.');
    }
  }

  // 예약 취소
  async cancelBooking(bookingId: number): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.WALKER_BOOKINGS.CANCEL(bookingId));
    } catch (error: any) {
      console.error('Cancel booking failed:', error);
      throw new Error(error.response?.data?.message || '예약 취소에 실패했습니다.');
    }
  }

  // 오픈 요청 목록 조회 (워커들이 지원할 수 있는 요청들)
  async getOpenRequests(): Promise<WalkerBookingResponse[]> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.WALKER_BOOKINGS.OPEN_REQUESTS);
      return response.data;
    } catch (error: any) {
      console.error('Get open requests failed:', error);
      throw new Error(error.response?.data?.message || '오픈 요청 목록을 불러올 수 없습니다.');
    }
  }

  // 워커가 오픈 요청에 지원
  async applyToOpenRequest(openRequestId: number, request: WalkerApplicationRequest): Promise<WalkerBookingResponse> {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.WALKER_BOOKINGS.APPLY_TO_REQUEST(openRequestId),
        request
      );
      return response.data;
    } catch (error: any) {
      console.error('Apply to open request failed:', error);
      throw new Error(error.response?.data?.message || '오픈 요청 지원에 실패했습니다.');
    }
  }

  // 사용자가 자신의 오픈 요청에 대한 워커 지원자 목록 조회
  async getWalkerApplications(openRequestId: number): Promise<WalkerApplicationResponse[]> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.WALKER_BOOKINGS.WALKER_APPLICATIONS(openRequestId));
      return response.data;
    } catch (error: any) {
      console.error('Get walker applications failed:', error);
      throw new Error(error.response?.data?.message || '워커 지원자 목록을 불러올 수 없습니다.');
    }
  }

  // 사용자가 워커 지원을 수락/거절
  async respondToWalkerApplication(applicationId: number, accept: boolean): Promise<WalkerBookingResponse> {
    try {
      const response = await apiClient.put(
        `${API_ENDPOINTS.WALKER_BOOKINGS.RESPOND_APPLICATION(applicationId)}?accept=${accept}`
      );
      return response.data;
    } catch (error: any) {
      console.error('Respond to walker application failed:', error);
      throw new Error(error.response?.data?.message || '워커 지원 응답에 실패했습니다.');
    }
  }

  // 예약 변경 요청 (사용자가 요청)
  async requestBookingChange(bookingId: number, request: BookingChangeRequest): Promise<BookingChangeResponse> {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.WALKER_BOOKINGS.CHANGE_REQUESTS(bookingId),
        request
      );
      return response.data;
    } catch (error: any) {
      console.error('Request booking change failed:', error);
      throw new Error(error.response?.data?.message || '예약 변경 요청에 실패했습니다.');
    }
  }

  // 예약 변경 요청에 대한 워커의 응답
  async respondToChangeRequest(requestId: number, decision: ChangeRequestDecisionRequest): Promise<BookingChangeResponse> {
    try {
      const response = await apiClient.put(
        API_ENDPOINTS.WALKER_BOOKINGS.RESPOND_CHANGE(requestId),
        decision
      );
      return response.data;
    } catch (error: any) {
      console.error('Respond to change request failed:', error);
      throw new Error(error.response?.data?.message || '변경 요청 응답에 실패했습니다.');
    }
  }

  // 특정 예약에 대한 변경 요청 목록 조회
  async getBookingChangeRequests(bookingId: number): Promise<BookingChangeResponse[]> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.WALKER_BOOKINGS.CHANGE_REQUESTS(bookingId));
      return response.data;
    } catch (error: any) {
      console.error('Get booking change requests failed:', error);
      throw new Error(error.response?.data?.message || '변경 요청 목록을 불러올 수 없습니다.');
    }
  }

  // 워커의 대기중인 변경 요청 목록 조회
  async getPendingChangeRequestsForWalker(): Promise<BookingChangeResponse[]> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.WALKER_BOOKINGS.PENDING_CHANGES_WALKER);
      return response.data;
    } catch (error: any) {
      console.error('Get pending change requests for walker failed:', error);
      throw new Error(error.response?.data?.message || '대기중인 변경 요청을 불러올 수 없습니다.');
    }
  }

  // 편의 메서드들

  // 예약 확정
  async confirmBooking(bookingId: number): Promise<WalkerBookingResponse> {
    return this.updateBookingStatus(bookingId, 'CONFIRMED');
  }

  // 산책 시작
  async startWalk(bookingId: number): Promise<WalkerBookingResponse> {
    return this.updateBookingStatus(bookingId, 'IN_PROGRESS');
  }

  // 산책 완료
  async completeWalk(bookingId: number): Promise<WalkerBookingResponse> {
    return this.updateBookingStatus(bookingId, 'COMPLETED');
  }

  // 워커 지원 수락
  async acceptWalkerApplication(applicationId: number): Promise<WalkerBookingResponse> {
    return this.respondToWalkerApplication(applicationId, true);
  }

  // 워커 지원 거절
  async rejectWalkerApplication(applicationId: number): Promise<WalkerBookingResponse> {
    return this.respondToWalkerApplication(applicationId, false);
  }

  // 변경 요청 수락
  async acceptChangeRequest(requestId: number, response: string): Promise<BookingChangeResponse> {
    return this.respondToChangeRequest(requestId, { accept: true, response });
  }

  // 변경 요청 거절
  async rejectChangeRequest(requestId: number, response: string): Promise<BookingChangeResponse> {
    return this.respondToChangeRequest(requestId, { accept: false, response });
  }
}

export const walkerBookingService = new WalkerBookingService();