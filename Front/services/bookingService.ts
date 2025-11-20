import { apiClient, API_ENDPOINTS } from './apiConfig';

// 타입 정의
export interface BookingCreateRequest {
  walkerId: number;
  petId: number;
  walkDate: string;
  duration: number;
  price: number;
  meetingPoint: string;
  specialRequests?: string;
  emergencyContact?: string;
}

export interface BookingChangeRequest {
  newDate?: string;
  newDuration?: number;
  newPrice?: number;
  newMeetingPoint?: string;
  newSpecialRequests?: string;
  changeReason: string;
}

export interface ChangeRequestDecisionRequest {
  decision: 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
}

export interface BookingResponse {
  id: number;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  walkDate: string;
  duration: number;
  price: number;
  meetingPoint: string;
  specialRequests?: string;
  notes?: string;
  emergencyContact?: string;
  createdAt: string;
  walker: {
    id: number;
    name: string;
    profileImage?: string;
    rating: number;
  };
  pet: {
    id: number;
    name: string;
    species: string;
    breed?: string;
    age: number;
  };
}

export interface BookingChangeResponse {
  id: number;
  bookingId: number;
  changeType: 'DATE' | 'DURATION' | 'PRICE' | 'MEETING_POINT' | 'SPECIAL_REQUESTS' | 'MULTIPLE';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: string;
  respondedAt?: string;
  changeReason: string;
  rejectionReason?: string;
  newDate?: string;
  newDuration?: number;
  newPrice?: number;
  newMeetingPoint?: string;
  newSpecialRequests?: string;
}

export const bookingService = {
  // 예약 생성
  async createBooking(request: BookingCreateRequest): Promise<BookingResponse> {
    const response = await apiClient.post(API_ENDPOINTS.BOOKINGS.CREATE, request);
    return response.data;
  },

  // 예약 목록 조회
  async getBookings(status?: string): Promise<BookingResponse[]> {
    const params = status ? { status } : {};
    const response = await apiClient.get(API_ENDPOINTS.BOOKINGS.LIST, { params });
    return response.data;
  },

  // 예약 상세 조회
  async getBookingDetail(bookingId: number): Promise<BookingResponse> {
    const response = await apiClient.get(API_ENDPOINTS.BOOKINGS.DETAIL(bookingId));
    return response.data;
  },

  // 예약 상태 변경 (워커가 확정/취소)
  async updateBookingStatus(bookingId: number, status: 'CONFIRMED' | 'CANCELLED', rejectionReason?: string): Promise<BookingResponse> {
    const response = await apiClient.patch(API_ENDPOINTS.BOOKINGS.UPDATE_STATUS(bookingId), {
      status,
      rejectionReason
    });
    return response.data;
  },

  // 예약 변경 요청 (사용자가 요청)
  async requestBookingChange(bookingId: number, request: BookingChangeRequest): Promise<BookingChangeResponse> {
    const response = await apiClient.post(API_ENDPOINTS.BOOKINGS.CHANGE_REQUEST(bookingId), request);
    return response.data;
  },

  // 예약 변경 요청에 응답 (워커가 승인/거절)
  async respondToChangeRequest(requestId: number, decision: ChangeRequestDecisionRequest): Promise<BookingChangeResponse> {
    const response = await apiClient.post(API_ENDPOINTS.BOOKINGS.RESPOND_CHANGE(requestId), decision);
    return response.data;
  },

  // 나의 예약 목록 (역할별)
  async getMyBookings(role: 'USER' | 'WALKER', status?: string): Promise<BookingResponse[]> {
    const params = { role, ...(status ? { status } : {}) };
    const response = await apiClient.get(API_ENDPOINTS.BOOKINGS.LIST, { params });
    return response.data;
  },

  // 예약 변경 요청 목록 조회
  async getChangeRequests(bookingId?: number): Promise<BookingChangeResponse[]> {
    const params = bookingId ? { bookingId } : {};
    const response = await apiClient.get('/bookings/change-requests', { params });
    return response.data;
  }
};

export default bookingService;