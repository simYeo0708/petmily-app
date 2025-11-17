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

export default MapService;
