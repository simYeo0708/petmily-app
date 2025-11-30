import { API_BASE_URL } from '../config/api';
import AuthService from './AuthService';
import * as Location from 'expo-location';
import { calculateDistance } from '../utils/WalkerUtils';

export interface WalkerSearchRequest {
  keyword?: string;
  minRating?: number;
  maxRating?: number;
  minHourlyRate?: number;
  maxHourlyRate?: number;
  maxDistanceKm?: number;
  serviceArea?: string;
  sortBy?: 'DISTANCE' | 'RATING' | 'HOURLY_RATE' | 'REVIEWS_COUNT' | 'EXPERIENCE' | 'CREATED_DATE';
  sortDirection?: 'ASC' | 'DESC';
  page?: number;
  size?: number;
  userLatitude?: number;
  userLongitude?: number;
}

export interface WalkerSearchResponse {
  content: Walker[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface Walker {
  id: number;
  name: string;
  rating: number;
  reviewCount: number;
  profileImage?: string;
  introduction?: string;
  hourlyRate: number;
  distance?: number;
  experience?: number;
  isFavorite?: boolean;
  specialties?: string[];
  serviceArea?: string;
  isAvailable?: boolean;
  location?: string;
}

const WalkerSearchService = {
  async searchWalkers(request: WalkerSearchRequest): Promise<WalkerSearchResponse> {
    try {
      const token = await AuthService.getAuthToken();
      
      // 사용자 위치 가져오기
      let userLat: number | undefined;
      let userLon: number | undefined;
      
      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        userLat = location.coords.latitude;
        userLon = location.coords.longitude;
      } catch (error) {
        // 위치 권한이 없거나 가져올 수 없는 경우 무시
      }

      // 쿼리 파라미터 구성
      const params = new URLSearchParams();
      if (request.keyword) params.append('keyword', request.keyword);
      if (request.minRating !== undefined) params.append('minRating', request.minRating.toString());
      if (request.maxRating !== undefined) params.append('maxRating', request.maxRating.toString());
      if (request.minHourlyRate !== undefined) params.append('minHourlyRate', request.minHourlyRate.toString());
      if (request.maxHourlyRate !== undefined) params.append('maxHourlyRate', request.maxHourlyRate.toString());
      if (request.maxDistanceKm !== undefined) params.append('maxDistanceKm', request.maxDistanceKm.toString());
      if (request.serviceArea) params.append('serviceArea', request.serviceArea);
      if (request.sortBy) params.append('sortBy', request.sortBy);
      if (request.sortDirection) params.append('sortDirection', request.sortDirection);
      if (request.page !== undefined) params.append('page', request.page.toString());
      if (request.size !== undefined) params.append('size', request.size.toString());
      if (userLat !== undefined) params.append('userLatitude', userLat.toString());
      if (userLon !== undefined) params.append('userLongitude', userLon.toString());

      const response = await fetch(`${API_BASE_URL}/walkers/search?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`워커 검색 실패: ${response.status}`);
      }

      const data = await response.json();
      
      // 백엔드 응답을 프론트엔드 형식으로 변환
      if (data.content && Array.isArray(data.content)) {
        const transformedContent = data.content.map((walker: any) => {
          // hourlyRate가 BigDecimal인 경우 number로 변환
          const hourlyRate = typeof walker.hourlyRate === 'object' && walker.hourlyRate !== null
            ? parseFloat(walker.hourlyRate.toString())
            : (walker.hourlyRate || 0);
          
          // 거리 계산 (사용자 위치와 워커 좌표가 있는 경우)
          let distance: number | undefined = undefined;
          if (userLat !== undefined && userLon !== undefined && walker.coordinates) {
            try {
              const [walkerLat, walkerLon] = walker.coordinates.split(',').map(parseFloat);
              if (!isNaN(walkerLat) && !isNaN(walkerLon)) {
                distance = calculateDistance(userLat, userLon, walkerLat, walkerLon);
              }
            } catch (error) {
              // 거리 계산 실패 시 무시
            }
          }
          
          return {
            id: walker.id,
            name: walker.name || '이름 없음',
            rating: walker.rating || 0,
            reviewCount: walker.reviewsCount || 0,
            profileImage: walker.profileImageUrl || undefined,
            introduction: walker.detailDescription || '',
            hourlyRate: hourlyRate,
            distance: distance,
            experience: walker.experienceYears || 0,
            isFavorite: walker.isFavorite || false,
            specialties: [],
            serviceArea: walker.serviceArea || '',
            isAvailable: walker.status === 'ACTIVE',
            location: walker.serviceArea || '',
          };
        });
        
        return {
          ...data,
          content: transformedContent,
        };
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },
};

export default WalkerSearchService;

