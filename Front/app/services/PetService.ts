import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

export interface PetInfo {
  id?: number;
  name: string;
  species: string;
  breed: string;
  age: string;
  weight: string;
  gender: string;
  isNeutered: boolean;
  description: string;
  photoUri?: string;
  hasPhoto?: boolean;
  temperaments?: string[];
  
  // 건강 및 알레르기 정보 (상품 추천에 활용)
  isVaccinated?: boolean;
  allergies?: string[];        // 알레르기 목록
  medications?: string[];      // 복용 중인 약물
  medicalConditions?: string;  // 기존 질병/건강 상태
  specialNotes?: string;       // 특별 주의사항
}

class PetServiceClass {
  private baseUrl = `${API_BASE_URL}/pets`;

  async getAuthToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      if (!token) {
        return null;
      }
      
      return token;
    } catch (error) {
      return null;
    }
  }

  async getHeaders(): Promise<Record<string, string>> {
    const token = await this.getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  async createPet(petData: PetInfo): Promise<PetInfo> {
    try {
      const headers = await this.getHeaders();
      
      const response = await fetch(`${this.baseUrl}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(petData),
      });
      
      if (response.status === 401) {
        await this.savePetToLocal(petData);
        return petData;
      }

      if (!response.ok) {
        const errorText = await response.clone().text();
        let errorMessage = errorText;
        try {
          const parsed = JSON.parse(errorText);
          if (parsed && typeof parsed.message === 'string') {
            errorMessage = parsed.message;
          }
        } catch (_) {
          // text가 JSON이 아닐 수 있음
        }
        await this.savePetToLocal(petData);
        return petData;
      }

      const result = await response.json() as PetInfo;
      
      // 로컬 저장소에도 저장
      await this.savePetToLocal(result);
      
      return result;
    } catch (error) {
      await this.savePetToLocal(petData);
      return petData;
    }
  }

  async updatePet(petId: number, petData: PetInfo): Promise<PetInfo> {
    try {
      const headers = await this.getHeaders();
      
      const response = await fetch(`${this.baseUrl}/${petId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(petData),
      });
      
      if (response.status === 401) {
        await this.savePetToLocal(petData);
        return petData;
      }

      if (!response.ok) {
        const errorText = await response.clone().text();
        let errorMessage = errorText;
        try {
          const parsed = JSON.parse(errorText);
          if (parsed && typeof parsed.message === 'string') {
            errorMessage = parsed.message;
          }
        } catch (_) {
          // ignore parse error
        }
        await this.savePetToLocal(petData);
        return petData;
      }

      const result = await response.json() as PetInfo;
      
      // 로컬 저장소에도 저장
      await this.savePetToLocal(result);
      
      return result;
    } catch (error) {
      await this.savePetToLocal(petData);
      return petData;
    }
  }

  async getPet(petId: number): Promise<PetInfo> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${this.baseUrl}/${petId}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as PetInfo;
      return data;
    } catch (error) {
      throw error;
    }
  }

  async getPets(): Promise<PetInfo[]> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${this.baseUrl}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as PetInfo[];
      return data;
    } catch (error) {
      throw error;
    }
  }

  async getPrimaryPet(): Promise<PetInfo | null> {
    try {
      // 1) 인증 토큰이 있으면 우선 사용자별(primary) API 호출
      const headers = await this.getHeaders();
      const hasAuth = Boolean(headers['Authorization']);

      if (hasAuth) {
        try {
          const response = await fetch(`${this.baseUrl}/primary`, {
            method: 'GET',
            headers,
          });

          if (response.status === 404) {
            return await this.getPetFromLocal();
          }

          if (response.ok) {
            const data = await response.json() as PetInfo | null;
            return data;
          }
        } catch (authError) {
          // 인증 API 실패
        }
      }

      // 2) 인증 정보가 없거나 실패한 경우 공개(primary) API 시도 (개발용)
      try {
        const response = await fetch(`${this.baseUrl}/public/primary`, {
          method: 'GET',
        });

        if (response.ok) {
          const data = await response.json() as PetInfo | null;
          return data;
        }
      } catch (publicError) {
        // 공개 API 실패
      }

      // 3) 모든 API 실패 시 로컬 데이터 사용
      return await this.getPetFromLocal();
    } catch (error) {
      return await this.getPetFromLocal();
    }
  }

  async deletePet(petId: number): Promise<void> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${this.baseUrl}/${petId}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // 로컬 저장소에서도 삭제
      await this.removePetFromLocal(petId);
    } catch (error) {
      throw error;
    }
  }

  // 로컬 저장소 관련 메서드들
  async savePetToLocal(petData: PetInfo): Promise<void> {
    try {
      await AsyncStorage.setItem('petInfo', JSON.stringify(petData));
      if (petData.photoUri) {
        await AsyncStorage.setItem('photoUri', petData.photoUri);
      }
      await AsyncStorage.setItem('hasPhoto', String(petData.hasPhoto || false));
      if (petData.temperaments) {
        await AsyncStorage.setItem('temperaments', JSON.stringify(petData.temperaments));
      }
    } catch (error) {
      // 로컬 저장 실패
    }
  }

  async removePetFromLocal(petId: number): Promise<void> {
    try {
      await AsyncStorage.removeItem('petInfo');
      await AsyncStorage.removeItem('photoUri');
      await AsyncStorage.removeItem('hasPhoto');
      await AsyncStorage.removeItem('temperaments');
    } catch (error) {
      // 로컬 삭제 실패
    }
  }

  async getPetFromLocal(): Promise<PetInfo | null> {
    try {
      const storedPetInfo = await AsyncStorage.getItem('petInfo');
      const storedPhotoUri = await AsyncStorage.getItem('photoUri');
      const storedHasPhoto = await AsyncStorage.getItem('hasPhoto');
      const storedTemperaments = await AsyncStorage.getItem('temperaments');

      if (storedPetInfo) {
        const parsedPetInfo = JSON.parse(storedPetInfo);
        return {
          ...parsedPetInfo,
          photoUri: storedPhotoUri || undefined,
          hasPhoto: storedHasPhoto === 'true',
          temperaments: storedTemperaments ? JSON.parse(storedTemperaments) : [],
        };
      }
      return null;
    } catch (error) {
      return null;
    }
  }
}

export const PetService = new PetServiceClass();
