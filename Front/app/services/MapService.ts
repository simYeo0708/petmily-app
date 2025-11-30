import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

export interface LocationRequest {
  latitude: number;
  longitude: number;
  timestamp: number;
  userId: string;
  walkSessionId?: number;
  accuracy?: number;
  speed?: number;
  altitude?: number;
}

export interface LocationResponse {
  latitude: number;
  longitude: number;
  timestamp: number;
  userId: string;
  petProfileImage?: string;
  petName?: string;
  petSpecies?: string;
}

export interface MapConfigResponse {
  kakaoMapApiKey: string;
  mapCenterLat: string;
  mapCenterLon: string;
  mapZoomLevel: number;
}

class MapService {
  private static instance: MapService;
  private mapConfig: MapConfigResponse | null = null;

  static getInstance(): MapService {
    if (!MapService.instance) {
      MapService.instance = new MapService();
    }
    return MapService.instance;
  }

  async getMapConfig(): Promise<MapConfigResponse> {
    if (this.mapConfig) {
      return this.mapConfig;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/map/config`);
      if (!response.ok) {
        throw new Error('Failed to fetch map config');
      }
      const config = await response.json() as MapConfigResponse;
      this.mapConfig = config;
      return config;
    } catch (error) {
      // Fallback config
      return {
        kakaoMapApiKey: 'dummy-key-for-development',
        mapCenterLat: '37.5665',
        mapCenterLon: '126.9780',
        mapZoomLevel: 15
      };
    }
  }

  async updateUserLocation(location: LocationRequest): Promise<LocationResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/map/location`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(location),
      });

      if (!response.ok) {
        throw new Error('Failed to update location');
      }

      return await response.json() as LocationResponse;
    } catch (error) {
      // Return mock data
      return {
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: location.timestamp,
        userId: location.userId,
        petProfileImage: 'https://via.placeholder.com/50',
        petName: '멍멍이',
        petSpecies: 'dog'
      };
    }
  }

  async getActiveUserLocations(): Promise<LocationResponse[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/map/locations`);
      if (!response.ok) {
        throw new Error('Failed to fetch locations');
      }
      return await response.json() as LocationResponse[];
    } catch (error) {
      return [];
    }
  }

  async getCurrentUserId(): Promise<string> {
    try {
      const userInfo = await AsyncStorage.getItem('userInfo');
      if (userInfo) {
        const parsed = JSON.parse(userInfo);
        return parsed.email || 'anonymous';
      }
      return 'anonymous';
    } catch (error) {
      return 'anonymous';
    }
  }

  async getAuthToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem('token');
      return token;
    } catch (error) {
      return null;
    }
  }

  async createWalkSession(startLatitude: number, startLongitude: number, bookingId?: number): Promise<WalkSessionResponse> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${API_BASE_URL}/map/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          bookingId,
          startLatitude,
          startLongitude,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create walk session');
      }

      return await response.json() as WalkSessionResponse;
    } catch (error) {
      throw error;
    }
  }

  async endWalkSession(
    walkSessionId: number,
    endLatitude: number,
    endLongitude: number,
    totalDistance: number,
    durationSeconds: number
  ): Promise<WalkSessionResponse> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${API_BASE_URL}/map/sessions/${walkSessionId}/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          endLatitude,
          endLongitude,
          totalDistance,
          durationSeconds,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to end walk session');
      }

      return await response.json() as WalkSessionResponse;
    } catch (error) {
      throw error;
    }
  }

  async getWalkRoute(walkSessionId: number): Promise<RouteResponse> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${API_BASE_URL}/map/routes/${walkSessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get walk route');
      }

      return await response.json() as RouteResponse;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 좌표 -> 주소 변환 (역지오코딩)
   * @param latitude 위도
   * @param longitude 경도
   * @returns 주소 정보
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<AddressInfo | null> {
    try {
      // 좌표 유효성 검사
      if (isNaN(latitude) || isNaN(longitude)) {
        throw new Error('유효하지 않은 좌표입니다.');
      }

      if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        throw new Error('좌표 범위가 유효하지 않습니다.');
      }

      const response = await fetch(
        `${API_BASE_URL}/map/reverse-geocode?lat=${latitude}&lng=${longitude}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        let errorMessage = `역지오코딩 실패: ${response.status}`;
        
        if (response.status === 400) {
          errorMessage = '잘못된 좌표입니다.';
        } else if (response.status === 404) {
          errorMessage = '해당 좌표의 주소를 찾을 수 없습니다.';
        } else if (response.status === 500) {
          errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json() as AddressInfo;
      
      // 응답 데이터 유효성 검사
      if (!data || (!data.roadAddress && !data.jibunAddress && !data.region2depth)) {
        throw new Error('주소 정보를 찾을 수 없습니다.');
      }
      
      return data;
    } catch (error: any) {
      // 에러를 다시 throw하여 호출자가 처리할 수 있도록 함
      throw error;
    }
  }

  /**
   * 주소 -> 좌표 변환 (지오코딩)
   * @param address 주소 문자열
   * @returns 좌표 정보 (latitude, longitude)
   */
  async geocodeAddress(address: string): Promise<{ latitude: number; longitude: number } | null> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/map/geocode?address=${encodeURIComponent(address)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`지오코딩 실패: ${response.status}`);
      }

      const data = await response.json() as { latitude: number; longitude: number };
      return data;
    } catch (error) {
      // 에러는 UI로만 처리 (콘솔 로그 없이)
      return null;
    }
  }
}

export interface WalkSessionResponse {
  id: number;
  userId: number;
  bookingId?: number;
  startTime: string;
  endTime?: string;
  totalDistance?: number;
  durationSeconds?: number;
  status: string;
  startLatitude?: number;
  startLongitude?: number;
  endLatitude?: number;
  endLongitude?: number;
}

export interface RouteResponse {
  walkSessionId: number;
  points: RoutePoint[];
  totalDistance?: number;
  durationSeconds?: number;
  startTime: string;
  endTime?: string;
}

export interface RoutePoint {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy?: number;
  speed?: number;
  altitude?: number;
}

export interface AddressInfo {
  roadAddress?: string;      // 도로명 주소
  jibunAddress?: string;     // 지번 주소
  region1depth?: string;     // 시 도
  region2depth?: string;     // 시 군 구
  region3depth?: string;     // 읍 면 동
  buildingName?: string;     // 건물명
}

export default MapService;
