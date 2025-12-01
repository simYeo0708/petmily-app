import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

interface WalkingBookingRequest {
  petId?: number;
  date: string;
  duration: number;
  notes?: string;
  emergencyContact?: string;
  pickupLocation?: string;
  pickupAddress: string;
  dropoffLocation?: string;
  dropoffAddress?: string;
  isRegularPackage?: boolean;
  packageFrequency?: string;
}

interface WalkingBookingResponse {
  id: number;
  petId: number;
  walkerId?: number;
  userId?: number;
  date: string;
  duration: number;
  status: string;
  pickupAddress: string;
  notes?: string;
  walkerName?: string;
  walkerUsername?: string;
  username?: string;
  walkerLocation?: string;
  actualStartTime?: string;
  actualEndTime?: string;
}

const getAuthToken = async (): Promise<string> => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    if (token) return token;
    
    // 개발용 하드코딩된 테스트 토큰
    return 'test-token-for-user-1';
  } catch (error) {
    return 'test-token-for-user-1';
  }
};

const WalkerBookingService = {
  async createBooking(bookingData: WalkingBookingRequest): Promise<WalkingBookingResponse> {
    try {
      const token = await getAuthToken();
      // 
      
      const response = await fetch(`${API_BASE_URL}/walker-bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        // throw new Error(`산책 예약 실패: ${response.status}`);
      }

      const data = await response.json() as WalkingBookingResponse;
      // 
      return data;
    } catch (error) {
      // 
      
      // 로컬 저장소에 fallback
      const localBooking: WalkingBookingResponse = {
        id: Date.now(),
        petId: 1,
        date: bookingData.date,
        duration: bookingData.duration,
        status: 'PENDING',
        pickupAddress: bookingData.pickupAddress,
        notes: bookingData.notes,
      };
      
      await AsyncStorage.setItem(`booking_${localBooking.id}`, JSON.stringify(localBooking));
      return localBooking;
    }
  },

  async getMyBookings(): Promise<WalkingBookingResponse[]> {
    try {
      const token = await getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/walker-bookings/my-bookings`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`예약 목록 조회 실패: ${response.status}`);
      }

      const data = await response.json() as WalkingBookingResponse[];
      return data;
    } catch (error) {
      // 
      return [];
    }
  },

  async getBookingById(id: number): Promise<WalkingBookingResponse | null> {
    try {
      const token = await getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/walker-bookings/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`예약 조회 실패: ${response.status}`);
      }

      const data = await response.json() as WalkingBookingResponse;
      return data;
    } catch (error) {
      // 
      return null;
    }
  },

  async cancelBooking(id: number): Promise<boolean> {
    try {
      const token = await getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/walker-bookings/${id}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`예약 취소 실패: ${response.status}`);
      }

      return true;
    } catch (error) {
      // 
      return false;
    }
  },

  async getWalkBookings(): Promise<WalkingBookingResponse[]> {
    try {
      const token = await getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/walker-bookings/walker`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`워커 예약 목록 조회 실패: ${response.status}`);
      }

      const data = await response.json() as WalkingBookingResponse[];
      return data;
    } catch (error) {
      // 에러는 UI로만 처리 (콘솔 로그 없이)
      return [];
    }
  },

  async getCurrentWalking(): Promise<WalkingBookingResponse | null> {
    try {
      const token = await getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/walker-bookings/current`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 204) {
        return null; // 현재 진행 중인 산책 없음
      }

      if (!response.ok) {
        throw new Error(`현재 산책 조회 실패: ${response.status}`);
      }

      const data = await response.json() as WalkingBookingResponse;
      return data;
    } catch (error) {
      return null;
    }
  },

  async getOpenRequests(): Promise<WalkingBookingResponse[]> {
    try {
      const token = await getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/walker-bookings/open-requests`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`오픈 요청 목록 조회 실패: ${response.status}`);
      }

      const data = await response.json() as WalkingBookingResponse[];
      return data;
    } catch (error) {
      return [];
    }
  },

  async getCompletedWalks(): Promise<WalkingBookingResponse[]> {
    try {
      const token = await getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/walker-bookings/my-bookings`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`완료된 산책 목록 조회 실패: ${response.status}`);
      }

      const data = await response.json() as WalkingBookingResponse[];
      // COMPLETED 상태인 예약만 필터링
      return data.filter(booking => booking.status === 'COMPLETED');
    } catch (error) {
      return [];
    }
  },
};

export default WalkerBookingService;

