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

const WalkerDashboardService = {
  async getDashboard(): Promise<WalkerDashboardResponse | null> {
    try {
      const token = await AuthService.getAuthToken();
      if (!token) {
        throw new Error('인증 토큰이 없습니다.');
      }
      
      const response = await fetch(`${API_BASE_URL}/walkers/me/dashboard`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`워커 대시보드 조회 실패: ${response.status}`);
      }

      const data = await response.json() as WalkerDashboardResponse;
      return data;
    } catch (error) {
      console.error('워커 대시보드 조회 실패:', error);
      return null;
    }
  },
};

export default WalkerDashboardService;

