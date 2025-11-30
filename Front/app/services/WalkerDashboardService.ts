import { API_BASE_URL } from '../config/api';
import AuthService from './AuthService';

export interface WalkerDashboardResponse {
  earningsInfo: {
    totalEarnings: number;
    thisMonthEarnings: number;
    thisWeekEarnings: number;
    todayEarnings: number;
    growthRate: number;
    nextPayoutDate: string; // ISO date string
  };
  statisticsInfo: {
    totalWalks: number;
    completedWalks: number;
    pendingWalks: number;
    averageRating: number;
    totalReviews: number;
    repeatRate: number;
  };
  recentReviews: Array<{
    id: number;
    userName: string;
    rating: number;
    comment: string;
    createdAt: string; // ISO date string
    petName: string;
  }>;
  upcomingBookings: Array<{
    id: number;
    date: string; // ISO date string
    petName: string;
    petBreed: string;
    notes: string | null;
    status: string;
    address: string;
  }>;
  weeklyEarnings: Array<{
    weekLabel: string;
    earnings: number;
  }>;
}

export interface DashboardError {
  code: 'NOT_FOUND' | 'UNAUTHORIZED' | 'NETWORK_ERROR' | 'UNKNOWN';
  message: string;
  statusCode?: number;
}

const WalkerDashboardService = {
  async getDashboard(): Promise<{ data: WalkerDashboardResponse | null; error: DashboardError | null }> {
    try {
      const token = await AuthService.getAuthToken();
      if (!token) {
        return {
          data: null,
          error: {
            code: 'UNAUTHORIZED',
            message: '인증 토큰이 없습니다.',
          },
        };
      }
      
      const response = await fetch(`${API_BASE_URL}/walkers/me/dashboard`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // 404는 워커 프로필이 없는 경우
        if (response.status === 404) {
          return {
            data: null,
            error: {
              code: 'NOT_FOUND',
              message: '워커 프로필을 찾을 수 없습니다.',
              statusCode: 404,
            },
          };
        }
        
        // 401은 인증 실패
        if (response.status === 401) {
          return {
            data: null,
            error: {
              code: 'UNAUTHORIZED',
              message: '인증이 만료되었습니다.',
              statusCode: 401,
            },
          };
        }

        return {
          data: null,
          error: {
            code: 'UNKNOWN',
            message: `워커 대시보드 조회 실패: ${response.status}`,
            statusCode: response.status,
          },
        };
      }

      const data = await response.json() as WalkerDashboardResponse;
      return { data, error: null };
    } catch (error) {
      // 네트워크 오류는 UI로만 처리 (콘솔 로그 없이)
      return {
        data: null,
        error: {
          code: 'NETWORK_ERROR',
          message: '네트워크 오류가 발생했습니다.',
        },
      };
    }
  },
};

export default WalkerDashboardService;

