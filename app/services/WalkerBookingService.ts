import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ Expo에서는 localhost 대신 Mac의 IP 주소 사용
// 학교 10.50.202.43, 
// 집 192.168.219.158
const API_BASE_URL = 'http://192.168.219.105:8080/api';  // TODO: 본인의 Mac IP로 변경

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
  date: string;
  duration: number;
  status: string;
  pickupAddress: string;
  notes?: string;
}

const getAuthToken = async (): Promise<string> => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    if (token) return token;
    
    // 개발용 하드코딩된 테스트 토큰
    return 'test-token-for-user-1';
  } catch (error) {
    console.error('토큰 가져오기 실패:', error);
    return 'test-token-for-user-1';
  }
};

const WalkerBookingService = {
  async createBooking(bookingData: WalkingBookingRequest): Promise<WalkingBookingResponse> {
    try {
      const token = await getAuthToken();
      console.log('산책 예약 요청:', bookingData);
      
      const response = await fetch(`${API_BASE_URL}/walker-bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        throw new Error(`산책 예약 실패: ${response.status}`);
      }

      const data = await response.json() as WalkingBookingResponse;
      console.log('산책 예약 성공:', data);
      return data;
    } catch (error) {
      console.error('산책 예약 에러:', error);
      
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
      console.error('예약 목록 조회 에러:', error);
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
      console.error('예약 조회 에러:', error);
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
      console.error('예약 취소 에러:', error);
      return false;
    }
  },
};

export default WalkerBookingService;

