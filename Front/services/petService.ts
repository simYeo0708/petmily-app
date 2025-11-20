import { apiClient, API_ENDPOINTS } from './apiConfig';

// Pet 관련 타입 정의
export interface PetCreateRequest {
  name: string;
  species: string; // 개, 고양이 등
  breed: string; // 품종
  age: number;
  gender: string; // 수컷, 암컷
  personality?: string; // 성격
  imageUrl?: string;

  // Weight and size information
  weight?: number; // kg
  size?: 'SMALL' | 'MEDIUM' | 'LARGE';

  // Health and medical information
  isVaccinated?: boolean;
  medicalConditions?: string; // 알러지, 질병 등
  specialNotes?: string; // 특별 주의사항

  // Activity level and preferences
  activityLevel?: 'LOW' | 'MODERATE' | 'HIGH';
  favoriteActivities?: string; // 좋아하는 활동들

  // Social behavior
  goodWithChildren?: boolean;
  goodWithOtherPets?: boolean;
  isNeutered?: boolean;
}

export interface PetUpdateRequest {
  name?: string;
  species?: string;
  breed?: string;
  age?: number;
  gender?: string;
  personality?: string;
  imageUrl?: string;
  weight?: number;
  size?: 'SMALL' | 'MEDIUM' | 'LARGE';
  isVaccinated?: boolean;
  medicalConditions?: string;
  specialNotes?: string;
  activityLevel?: 'LOW' | 'MODERATE' | 'HIGH';
  favoriteActivities?: string;
  goodWithChildren?: boolean;
  goodWithOtherPets?: boolean;
  isNeutered?: boolean;
}

export interface PetResponse {
  id: number;
  name: string;
  species: string;
  breed: string;
  age: number;
  gender: string;
  personality?: string;
  imageUrl?: string;
  userId: number;

  // Weight and size information
  weight?: number;
  size?: 'SMALL' | 'MEDIUM' | 'LARGE';

  // Health and medical information
  isVaccinated?: boolean;
  medicalConditions?: string;
  specialNotes?: string;

  // Activity level and preferences
  activityLevel?: 'LOW' | 'MODERATE' | 'HIGH';
  favoriteActivities?: string;

  // Social behavior
  goodWithChildren?: boolean;
  goodWithOtherPets?: boolean;
  isNeutered?: boolean;

  // Timestamps
  createdAt: string;
  updatedAt: string;

  // Owner information
  ownerUsername?: string;
  ownerName?: string;
}

export interface PetSearchRequest {
  species?: string;
  breed?: string;
  size?: 'SMALL' | 'MEDIUM' | 'LARGE';
  activityLevel?: 'LOW' | 'MODERATE' | 'HIGH';
  goodWithChildren?: boolean;
  goodWithOtherPets?: boolean;
  isVaccinated?: boolean;
  ageMin?: number;
  ageMax?: number;
  weightMin?: number;
  weightMax?: number;
}

class PetService {
  // 반려동물 생성
  async createPet(request: PetCreateRequest): Promise<PetResponse> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.PETS.CREATE, request);
      return response.data;
    } catch (error: any) {
      console.error('Pet creation failed:', error);
      throw new Error(error.response?.data?.message || '반려동물 등록에 실패했습니다.');
    }
  }

  // 내 반려동물 목록 조회
  async getMyPets(): Promise<PetResponse[]> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PETS.LIST);
      return response.data;
    } catch (error: any) {
      console.error('Get my pets failed:', error);
      throw new Error(error.response?.data?.message || '반려동물 목록을 불러올 수 없습니다.');
    }
  }

  // 반려동물 상세 정보 조회
  async getPet(petId: number): Promise<PetResponse> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PETS.DETAIL(petId));
      return response.data;
    } catch (error: any) {
      console.error('Get pet failed:', error);
      throw new Error(error.response?.data?.message || '반려동물 정보를 불러올 수 없습니다.');
    }
  }

  // 반려동물 정보 수정
  async updatePet(petId: number, request: PetUpdateRequest): Promise<PetResponse> {
    try {
      const response = await apiClient.put(API_ENDPOINTS.PETS.UPDATE(petId), request);
      return response.data;
    } catch (error: any) {
      console.error('Pet update failed:', error);
      throw new Error(error.response?.data?.message || '반려동물 정보 수정에 실패했습니다.');
    }
  }

  // 반려동물 삭제
  async deletePet(petId: number): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.PETS.DELETE(petId));
    } catch (error: any) {
      console.error('Pet deletion failed:', error);
      throw new Error(error.response?.data?.message || '반려동물 삭제에 실패했습니다.');
    }
  }

  // 반려동물 검색
  async searchPets(searchRequest: PetSearchRequest, page: number = 0, size: number = 20): Promise<PetResponse[]> {
    try {
      const params = { ...searchRequest, page, size };
      const response = await apiClient.get(API_ENDPOINTS.PETS.SEARCH, { params });
      return response.data;
    } catch (error: any) {
      console.error('Pet search failed:', error);
      throw new Error(error.response?.data?.message || '반려동물 검색에 실패했습니다.');
    }
  }

  // 모든 반려동물 조회
  async getAllPets(page: number = 0, size: number = 20): Promise<PetResponse[]> {
    try {
      const params = { page, size };
      const response = await apiClient.get(API_ENDPOINTS.PETS.ALL, { params });
      return response.data;
    } catch (error: any) {
      console.error('Get all pets failed:', error);
      throw new Error(error.response?.data?.message || '반려동물 목록을 불러올 수 없습니다.');
    }
  }

  // 반려동물 사진 업데이트
  async updatePetPhoto(petId: number, imageUrl: string): Promise<PetResponse> {
    try {
      const response = await apiClient.put(API_ENDPOINTS.PETS.UPDATE_PHOTO(petId), imageUrl);
      return response.data;
    } catch (error: any) {
      console.error('Pet photo update failed:', error);
      throw new Error(error.response?.data?.message || '반려동물 사진 업데이트에 실패했습니다.');
    }
  }

  // 온보딩용 반려동물 생성
  async createOnboardingPet(userId: number, request: PetCreateRequest): Promise<PetResponse> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.PETS.ONBOARDING(userId), request);
      return response.data;
    } catch (error: any) {
      console.error('Onboarding pet creation failed:', error);
      throw new Error(error.response?.data?.message || '반려동물 등록에 실패했습니다.');
    }
  }

  // 반려동물 피팅 정보 조회 (AI 서비스용)
  async getPetFittingInfo(petId: number): Promise<PetResponse> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PETS.FITTING_INFO(petId));
      return response.data;
    } catch (error: any) {
      console.error('Get pet fitting info failed:', error);
      throw new Error(error.response?.data?.message || '반려동물 피팅 정보를 불러올 수 없습니다.');
    }
  }

  // 산책 매칭용 반려동물 정보 조회
  async getPetWalkProfile(petId: number): Promise<PetResponse> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PETS.WALK_PROFILE(petId));
      return response.data;
    } catch (error: any) {
      console.error('Get pet walk profile failed:', error);
      throw new Error(error.response?.data?.message || '반려동물 산책 프로필을 불러올 수 없습니다.');
    }
  }
}

export const petService = new PetService();