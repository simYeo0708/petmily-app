import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';
import AuthService from './AuthService';

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
    // 
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
      // 
      return null;
    }
  },

  async getCurrentWalker(): Promise<Walker | null> {
    try {
      const token = await getAuthToken();
      
      // 현재 사용자의 워커 프로필 조회
      const response = await fetch(`${API_BASE_URL}/walkers/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // 404면 워커가 등록되지 않은 것
        if (response.status === 404) {
          return null;
        }
        throw new Error(`현재 워커 조회 실패: ${response.status}`);
      }

      const data = await response.json() as Walker;
      return data;
    } catch (error) {
      // 에러는 UI로만 처리 (콘솔 로그 없이)
      return null;
    }
  },

  async registerWalker(request: {
    detailDescription: string;
    serviceArea: string;
  }): Promise<WalkerResponse> {
    try {
      // 토큰 가져오기
      const token = await AuthService.getAuthToken();
      
      if (!token) {
        throw new Error('인증에 실패하였습니다. 다시 로그인해주세요.');
      }

      // API 호출
      let response = await fetch(`${API_BASE_URL}/walkers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      // 401 에러인 경우 토큰 갱신 시도
      if (response.status === 401) {
        const newToken = await AuthService.refreshToken();
        if (newToken) {
          // 재시도
          response = await fetch(`${API_BASE_URL}/walkers`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${newToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
          });
        } else {
          throw new Error('인증에 실패하였습니다. 다시 로그인해주세요.');
        }
      }

      if (!response.ok) {
        let errorData: any = {};
        let errorMessage = `워커 등록 실패: ${response.status}`;
        
        try {
          const responseText = await response.text();
          if (responseText) {
            try {
              errorData = JSON.parse(responseText);
              
              // ApiResponse 형식인 경우 (success: false, message: "...")
              if (errorData.message) {
                // 메시지가 깨져있을 수 있으므로 429 에러는 우리가 정의한 메시지 사용
                if (response.status === 429) {
                  errorMessage = '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
                } else {
                  errorMessage = errorData.message;
                  
                  // "already registered" 또는 "이미 등록" 관련 메시지 감지
                  const messageLower = errorMessage.toLowerCase();
                  if (messageLower.includes('already registered') || 
                      messageLower.includes('이미 등록') ||
                      messageLower.includes('already registered as a walker')) {
                    errorMessage = '이미 워커로 등록되어 있습니다.';
                  }
                }
              } else if (errorData.error) {
                errorMessage = errorData.error;
              }
            } catch (jsonError) {
              // JSON 파싱 실패 시 텍스트 그대로 사용 (인코딩 문제일 수 있음)
              if (response.status === 429) {
                errorMessage = '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
              }
            }
          }
        } catch (parseError) {
          // 응답 읽기 실패 시 기본 메시지 사용
          errorMessage = `서버 오류가 발생했습니다. (${response.status})`;
        }
        
        // HTTP 상태 코드별 에러 메시지 개선 (우선순위: 상태 코드 기반 메시지)
        if (response.status === 429) {
          // 429 Too Many Requests 에러 처리 (항상 우리가 정의한 메시지 사용)
          errorMessage = '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
        } else if (response.status === 401) {
          errorMessage = '인증에 실패하였습니다. 다시 로그인해주세요.';
        } else if (response.status === 403) {
          errorMessage = '권한이 없습니다.';
        } else if (response.status === 400) {
          // 400 에러는 백엔드 메시지를 그대로 사용하되, 없으면 기본 메시지
          if (!errorData.message && !errorData.error) {
            errorMessage = '입력 정보를 확인해주세요.';
          }
        } else if (response.status === 500) {
          // 500 에러는 백엔드 메시지를 사용하되, 없으면 기본 메시지
          if (!errorData.message && !errorData.error) {
            errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
          }
        }
        
        // 개발 환경에서 상세 에러 정보 로깅
        if (__DEV__) {
          console.error('워커 등록 실패:', {
            status: response.status,
            errorData,
            errorMessage,
          });
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json() as WalkerResponse;
      return data;
    } catch (error: any) {
      // 인증 실패 에러는 그대로 전달
      if (error.message === 'No authentication token' || error.message === 'Authentication failed') {
        throw new Error('인증에 실패하였습니다. 다시 로그인해주세요.');
      }
      throw new Error(error.message || '워커 등록 중 오류가 발생했습니다.');
    }
  },
};

export default WalkerService;

