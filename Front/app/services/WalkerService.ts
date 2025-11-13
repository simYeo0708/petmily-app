import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

interface WalkerResponse {
  id: number;
  name: string;
  profileImage?: string;
  rating: number;
  experience: number;
  specialties: string[];
  introduction: string;
  hourlyRate: number;
  available: boolean;
  distance?: number;
  isPreviousWalker?: boolean;
  walkCount?: number;
  lastWalkDate?: string;
}

interface Walker {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  profileImage: string;
  bio: string;
  experience: string;
  hourlyRate: number;
  isAvailable: boolean;
  location: string;
  distance?: number;
  specialties?: string[];
}

const getAuthToken = async (): Promise<string> => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    if (token) return token;
    return 'test-token-for-user-1';
  } catch (error) {
    console.error('토큰 가져오기 실패:', error);
    return 'test-token-for-user-1';
  }
};

const WalkerService = {
  async getAllWalkers(latitude?: number, longitude?: number): Promise<Walker[]> {
    try {
      const token = await getAuthToken();
      const url = latitude && longitude 
        ? `${API_BASE_URL}/walkers?lat=${latitude}&lng=${longitude}`
        : `${API_BASE_URL}/walkers`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`워커 목록 조회 실패: ${response.status}`);
      }

      const data = await response.json() as WalkerResponse[];
      
      // 백엔드 응답을 프론트엔드 Walker 타입으로 변환
      return data.map(walker => ({
        id: walker.id.toString(),
        name: walker.name,
        rating: walker.rating,
        reviewCount: Math.floor(walker.rating * 10), // 임시
        profileImage: walker.profileImage || 'https://via.placeholder.com/100',
        bio: walker.introduction,
        experience: `${walker.experience}년`,
        hourlyRate: walker.hourlyRate,
        isAvailable: walker.available,
        location: '서울시', // 임시
        distance: walker.distance,
        specialties: walker.specialties,
      }));
    } catch (error) {
      console.error('워커 목록 조회 에러:', error);
      
      // Fallback: 샘플 데이터
      return [
        {
          id: '1',
          name: '김워커',
          profileImage: 'https://via.placeholder.com/100',
          rating: 4.8,
          reviewCount: 48,
          bio: '안녕하세요! 3년 경력의 워커입니다.',
          experience: '3년',
          specialties: ['대형견', '산책 훈련'],
          hourlyRate: 15000,
          isAvailable: true,
          location: '서울시 강남구',
          distance: 1.2,
        },
        {
          id: '2',
          name: '이워커',
          profileImage: 'https://via.placeholder.com/100',
          rating: 4.9,
          reviewCount: 95,
          bio: '사랑으로 돌보겠습니다!',
          experience: '5년',
          specialties: ['소형견', '노견 케어'],
          hourlyRate: 20000,
          isAvailable: true,
          location: '서울시 서초구',
          distance: 0.8,
        },
      ];
    }
  },

  async getWalkerById(id: number): Promise<Walker | null> {
    try {
      const token = await getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/walkers/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`워커 조회 실패: ${response.status}`);
      }

      const data = await response.json() as Walker;
      return data;
    } catch (error) {
      console.error('워커 조회 에러:', error);
      return null;
    }
  },
};

export default WalkerService;

