import AsyncStorage from '@react-native-async-storage/async-storage';

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
  // ⚠️ Expo에서는 localhost 대신 Mac의 IP 주소 사용
  // 학교 10.50.202.43, 
  // 집 192.168.219.158
  private baseUrl = 'http://192.168.219.105:8080/api/pets';  // TODO: 본인의 Mac IP로 변경

  async getAuthToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      if (!token) {
        console.warn('인증 토큰 없음 - 로그인이 필요합니다');
        return null;
      }
      
      console.log('Using auth token:', token.substring(0, 20) + '...');
      return token;
    } catch (error) {
      console.error('Failed to get auth token:', error);
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
      console.log('Creating pet with data:', petData);
      const headers = await this.getHeaders();
      console.log('Request headers:', headers);
      
      const response = await fetch(`${this.baseUrl}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(petData),
      });

      console.log('Response status:', response.status);
      
      if (response.status === 401) {
        console.log('인증 실패 - 로컬에만 저장합니다');
        await this.savePetToLocal(petData);
        return petData;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        console.log('서버 오류 - 로컬에만 저장합니다');
        await this.savePetToLocal(petData);
        return petData;
      }

      const result = await response.json() as PetInfo;
      console.log('Pet created successfully:', result);
      
      // 로컬 저장소에도 저장
      await this.savePetToLocal(result);
      
      return result;
    } catch (error) {
      console.error('Failed to create pet:', error);
      console.log('네트워크 오류 - 로컬에만 저장합니다');
      await this.savePetToLocal(petData);
      return petData;
    }
  }

  async updatePet(petId: number, petData: PetInfo): Promise<PetInfo> {
    try {
      console.log('Updating pet with ID:', petId, 'Data:', petData);
      const headers = await this.getHeaders();
      console.log('Request headers:', headers);
      
      const response = await fetch(`${this.baseUrl}/${petId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(petData),
      });

      console.log('Update response status:', response.status);
      
      if (response.status === 401) {
        console.log('인증 실패 - 로컬에만 저장합니다');
        await this.savePetToLocal(petData);
        return petData;
      }

      if (!response.ok) {
        console.log('서버 오류 - 로컬에만 저장합니다');
        await this.savePetToLocal(petData);
        return petData;
      }

      const result = await response.json() as PetInfo;
      console.log('Update successful:', result);
      
      // 로컬 저장소에도 저장
      await this.savePetToLocal(result);
      
      return result;
    } catch (error) {
      console.error('Failed to update pet:', error);
      console.log('네트워크 오류 - 로컬에만 저장합니다');
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
      console.error('Failed to get pet:', error);
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
      console.error('Failed to get pets:', error);
      throw error;
    }
  }

  async getPrimaryPet(): Promise<PetInfo | null> {
    try {
      console.log('Getting primary pet...');
      
      // 먼저 공개 API로 시도
      try {
        const response = await fetch(`${this.baseUrl}/public/primary`, {
          method: 'GET',
        });

        if (response.ok) {
          const data = await response.json() as PetInfo | null;
          console.log('Primary pet data from public API:', data);
          return data;
        }
      } catch (publicError) {
        console.log('Public API failed, trying authenticated API:', publicError);
      }
      
      // 공개 API 실패 시 인증된 API 시도
      try {
        const headers = await this.getHeaders();
        const response = await fetch(`${this.baseUrl}/primary`, {
          method: 'GET',
          headers,
        });

        if (response.status === 404) {
          console.log('Primary pet not found, using local data');
          return await this.getPetFromLocal();
        }

        if (response.ok) {
          const data = await response.json() as PetInfo | null;
          console.log('Primary pet data from authenticated API:', data);
          return data;
        }
      } catch (authError) {
        console.log('Authenticated API failed:', authError);
      }

      // 모든 API 실패 시 로컬 데이터 사용
      console.log('All APIs failed, using local data');
      return await this.getPetFromLocal();
    } catch (error) {
      console.error('Failed to get primary pet:', error);
      console.log('네트워크 오류로 인해 로컬 데이터 사용');
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
      console.error('Failed to delete pet:', error);
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
      console.error('Failed to save pet to local storage:', error);
    }
  }

  async removePetFromLocal(petId: number): Promise<void> {
    try {
      await AsyncStorage.removeItem('petInfo');
      await AsyncStorage.removeItem('photoUri');
      await AsyncStorage.removeItem('hasPhoto');
      await AsyncStorage.removeItem('temperaments');
    } catch (error) {
      console.error('Failed to remove pet from local storage:', error);
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
      console.error('Failed to get pet from local storage:', error);
      return null;
    }
  }
}

export const PetService = new PetServiceClass();
