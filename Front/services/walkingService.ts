import { apiClient, API_ENDPOINTS } from './apiConfig';

// 타입 정의
export interface LocationTrackRequest {
  latitude: number;
  longitude: number;
  timestamp?: string;
  accuracy?: number;
  trackType?: 'WALKING' | 'RUNNING' | 'STATIONARY';
  speed?: number;
  altitude?: number;
}

export interface WalkingEndRequest {
  specialNotes?: string;
}

export interface LocationUpdateRequest {
  latitude: number;
  longitude: number;
  location?: string;
}

export interface PhotoUploadRequest {
  photoUrl: string;
  photoType: 'START' | 'MIDDLE' | 'END';
  location?: string;
}

export interface EmergencyCallRequest {
  emergencyType: 'POLICE_112' | 'FIRE_119' | 'EMERGENCY_CONTACT';
  location: string;
  description: string;
}

export interface WalkTerminationRequest {
  requestedBy: 'WALKER' | 'USER';
  reason: string;
}

export interface WalkerBookingResponse {
  id: number;
  status: string;
  walkDate: string;
  duration: number;
  price: number;
  notes?: string;
  actualStartTime?: string;
  actualEndTime?: string;
  walkerLocation?: string;
  walkStartLocation?: string;
  walkEndLocation?: string;
  startPhotoUrl?: string;
  middlePhotoUrl?: string;
  endPhotoUrl?: string;
}

export interface WalkingTrackResponse {
  id: number;
  bookingId: number;
  latitude: number;
  longitude: number;
  timestamp: string;
  accuracy?: number;
  trackType: string;
  speed?: number;
  altitude?: number;
}

export interface WalkingPathResponse {
  bookingId: number;
  trackPoints: WalkingTrackResponse[];
  statistics: {
    totalDistance: number;
    totalDuration: number;
    averageSpeed: number;
    maxSpeed: number;
    startTime: string;
    endTime: string;
    totalPoints: number;
    walkingRoute: string;
  };
}

// 워커용 산책 관리 API
export const walkingService = {
  // 산책 시작
  async startWalk(bookingId: number): Promise<WalkerBookingResponse> {
    const response = await apiClient.post(API_ENDPOINTS.WALKING.START(bookingId));
    return response.data;
  },

  // 산책 완료
  async completeWalk(bookingId: number, request: WalkingEndRequest): Promise<WalkerBookingResponse> {
    const response = await apiClient.post(API_ENDPOINTS.WALKING.COMPLETE(bookingId), request);
    return response.data;
  },

  // 위치 추적 저장
  async saveWalkingTrack(bookingId: number, request: LocationTrackRequest): Promise<WalkingTrackResponse> {
    const response = await apiClient.post(API_ENDPOINTS.WALKING.TRACK(bookingId), request);
    return response.data;
  },

  // 워커 위치 업데이트
  async updateLocation(bookingId: number, request: LocationUpdateRequest): Promise<WalkerBookingResponse> {
    const response = await apiClient.put(API_ENDPOINTS.WALKING.UPDATE_LOCATION(bookingId), request);
    return response.data;
  },

  // 사진 업로드
  async uploadPhoto(bookingId: number, request: PhotoUploadRequest): Promise<WalkerBookingResponse> {
    const response = await apiClient.put(API_ENDPOINTS.WALKING.UPLOAD_PHOTO(bookingId), request);
    return response.data;
  },

  // 긴급호출
  async initiateEmergencyCall(bookingId: number, request: EmergencyCallRequest): Promise<string> {
    const response = await apiClient.post(API_ENDPOINTS.WALKING.EMERGENCY_CALL(bookingId), request);
    return response.data;
  },

  // 산책 종료 요청
  async requestWalkTermination(bookingId: number, request: WalkTerminationRequest): Promise<WalkerBookingResponse> {
    const response = await apiClient.post(API_ENDPOINTS.WALKING.REQUEST_TERMINATION(bookingId), request);
    return response.data;
  },
};

// 사용자용 산책 모니터링 API
export const walkingMonitorService = {
  // 산책 경로 조회
  async getWalkingPath(bookingId: number): Promise<WalkingPathResponse> {
    const response = await apiClient.get(API_ENDPOINTS.WALKING.PATH(bookingId));
    return response.data;
  },

  // 실시간 위치 조회
  async getRealtimeLocation(bookingId: number, afterTime?: string): Promise<WalkingTrackResponse[]> {
    const params = afterTime ? { afterTime } : {};
    const response = await apiClient.get(API_ENDPOINTS.WALKING.REALTIME(bookingId), { params });
    return response.data;
  },
};

export default { ...walkingService, ...walkingMonitorService };