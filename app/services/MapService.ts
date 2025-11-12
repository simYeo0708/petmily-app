import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ Expo에서는 localhost 대신 Mac의 IP 주소 사용
// 학교 10.50.202.43, 
// 집 192.168.219.158
const API_BASE_URL = 'http://192.168.219.105:8080/api';  // TODO: 본인의 Mac IP로 변경

export interface LocationRequest {
  latitude: number;
  longitude: number;
  timestamp: number;
  userId: string;
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
      console.error('Error fetching map config:', error);
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
      console.error('Error updating location:', error);
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
      console.error('Error fetching locations:', error);
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
      console.error('Error getting user ID:', error);
      return 'anonymous';
    }
  }
}

export default MapService;
