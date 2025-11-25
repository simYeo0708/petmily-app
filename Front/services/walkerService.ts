import { apiClient, API_ENDPOINTS } from './apiConfig';

// Walker 관련 타입 정의
export interface WalkerCreateRequest {
  bio: string; // 자기소개
  experience: string; // 반려동물 경험 세부사항
  availableTime?: string; // 예: "Mon-Fri 9-5"
  serviceArea?: string; // 예: "강남구"
}

export interface WalkerUpdateRequest {
  isAvailable?: boolean;
  bio?: string;
  experience?: string;
  availableTime?: string;
  serviceArea?: string;
}

export interface WalkerResponse {
  id: number;
  userId: number;
  username?: string;
  name?: string;
  email?: string;
  bio?: string;
  experience?: string;
  rating?: number;
  hourlyRate?: number;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  isAvailable: boolean;
  location?: string;
  isFavorite?: boolean; // 즐겨찾기 여부
}

export interface WalkerSearchRequest {
  serviceArea?: string;
  experienceLevel?: string;
  minRating?: number;
  userLatitude?: number;
  userLongitude?: number;
  favoritesOnly?: boolean; // 즐겨찾기 워커만 보기
}

class WalkerService {
  // 워커 등록
  async registerWalker(request: WalkerCreateRequest): Promise<WalkerResponse> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.WALKERS.REGISTER, request);
      return response.data;
    } catch (error: any) {
      console.error('Walker registration failed:', error);
      throw new Error(error.response?.data?.message || '워커 등록에 실패했습니다.');
    }
  }

  // 워커 프로필 조회 (ID로)
  async getWalkerProfile(walkerId: number): Promise<WalkerResponse> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.WALKERS.PROFILE(walkerId));
      return response.data;
    } catch (error: any) {
      console.error('Get walker profile failed:', error);
      throw new Error(error.response?.data?.message || '워커 정보를 불러올 수 없습니다.');
    }
  }

  // 모든 워커 조회 (검색 포함)
  async getAllWalkers(searchRequest?: WalkerSearchRequest): Promise<WalkerResponse[]> {
    try {
      const params = searchRequest || {};
      const response = await apiClient.get(API_ENDPOINTS.WALKERS.LIST, { params });
      return response.data;
    } catch (error: any) {
      console.error('Get all walkers failed:', error);
      throw new Error(error.response?.data?.message || '워커 목록을 불러올 수 없습니다.');
    }
  }

  // 현재 사용자의 워커 프로필 조회
  async getCurrentWalkerProfile(): Promise<WalkerResponse> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.WALKERS.MY_PROFILE);
      return response.data;
    } catch (error: any) {
      console.error('Get current walker profile failed:', error);
      throw new Error(error.response?.data?.message || '내 워커 정보를 불러올 수 없습니다.');
    }
  }

  // 현재 사용자의 워커 프로필 수정
  async updateCurrentWalkerProfile(request: WalkerUpdateRequest): Promise<WalkerResponse> {
    try {
      const response = await apiClient.put(API_ENDPOINTS.WALKERS.UPDATE_PROFILE, request);
      return response.data;
    } catch (error: any) {
      console.error('Update walker profile failed:', error);
      throw new Error(error.response?.data?.message || '워커 정보 수정에 실패했습니다.');
    }
  }

  // 즐겨찾기 워커 추가
  async addFavoriteWalker(walkerId: number): Promise<WalkerResponse> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.WALKERS.ADD_FAVORITE(walkerId));
      return response.data;
    } catch (error: any) {
      console.error('Add favorite walker failed:', error);
      throw new Error(error.response?.data?.message || '즐겨찾기 추가에 실패했습니다.');
    }
  }

  // 즐겨찾기 워커 제거
  async removeFavoriteWalker(walkerId: number): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.WALKERS.REMOVE_FAVORITE(walkerId));
    } catch (error: any) {
      console.error('Remove favorite walker failed:', error);
      throw new Error(error.response?.data?.message || '즐겨찾기 제거에 실패했습니다.');
    }
  }

  // 즐겨찾기 워커 목록 조회
  async getFavoriteWalkers(): Promise<WalkerResponse[]> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.WALKERS.FAVORITES);
      return response.data;
    } catch (error: any) {
      console.error('Get favorite walkers failed:', error);
      throw new Error(error.response?.data?.message || '즐겨찾기 목록을 불러올 수 없습니다.');
    }
  }

  // 워커가 즐겨찾기에 있는지 확인
  async isFavoriteWalker(walkerId: number): Promise<boolean> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.WALKERS.CHECK_FAVORITE(walkerId));
      return response.data;
    } catch (error: any) {
      console.error('Check favorite walker failed:', error);
      throw new Error(error.response?.data?.message || '즐겨찾기 확인에 실패했습니다.');
    }
  }

  // 워커 검색 (지역, 평점 등으로 필터링)
  async searchWalkers(searchRequest: WalkerSearchRequest): Promise<WalkerResponse[]> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.WALKERS.LIST, {
        params: searchRequest
      });
      return response.data;
    } catch (error: any) {
      console.error('Search walkers failed:', error);
      throw new Error(error.response?.data?.message || '워커 검색에 실패했습니다.');
    }
  }

  // 즐겨찾기 워커만 조회
  async getFavoriteWalkersOnly(): Promise<WalkerResponse[]> {
    try {
      const searchRequest: WalkerSearchRequest = { favoritesOnly: true };
      const response = await apiClient.get(API_ENDPOINTS.WALKERS.LIST, {
        params: searchRequest
      });
      return response.data;
    } catch (error: any) {
      console.error('Get favorite walkers only failed:', error);
      throw new Error(error.response?.data?.message || '즐겨찾기 워커를 불러올 수 없습니다.');
    }
  }

  // 근처 워커 검색
  async getNearbyWalkers(latitude: number, longitude: number, radius?: number): Promise<WalkerResponse[]> {
    try {
      const searchRequest: WalkerSearchRequest = {
        userLatitude: latitude,
        userLongitude: longitude,
      };
      const response = await apiClient.get(API_ENDPOINTS.WALKERS.LIST, {
        params: searchRequest
      });
      return response.data;
    } catch (error: any) {
      console.error('Get nearby walkers failed:', error);
      throw new Error(error.response?.data?.message || '근처 워커를 찾을 수 없습니다.');
    }
  }

  // 평점으로 워커 필터링
  async getWalkersByRating(minRating: number): Promise<WalkerResponse[]> {
    try {
      const searchRequest: WalkerSearchRequest = { minRating };
      const response = await apiClient.get(API_ENDPOINTS.WALKERS.LIST, {
        params: searchRequest
      });
      return response.data;
    } catch (error: any) {
      console.error('Get walkers by rating failed:', error);
      throw new Error(error.response?.data?.message || '워커 평점 검색에 실패했습니다.');
    }
  }
}

export const walkerService = new WalkerService();