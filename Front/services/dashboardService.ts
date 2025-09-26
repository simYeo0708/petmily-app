import { apiClient, API_ENDPOINTS } from './apiConfig';

export interface UserInfo {
  name: string;
  email: string;
  profileImageUrl?: string;
  lastLoginTime?: string;
  membershipLevel: string;
}

export interface PetSummaryResponse {
  id: number;
  name: string;
  species: string;
  breed?: string;
  age?: number;
  imageUrl?: string;
}

export interface PetStats {
  totalPets: number;
  mostRecentPetName?: string;
  petsNeedingWalk: number;
}

export interface WalkerBookingResponse {
  id: number;
  userId: number;
  walkerId?: number;
  petId: number;
  date: string;
  duration: number;
  status: string;
  totalPrice?: number;
  walkerName?: string;
  petName?: string;
}

export interface WalkingStats {
  totalCompletedWalks: number;
  upcomingWalks: number;
  walkingHoursThisMonth: number;
  totalAmountSpent: number;
  averageRating: number;
}

export interface WalkerSummaryResponse {
  id: number;
  userId: number;
  name?: string;
  bio?: string;
  experience?: string;
  rating?: number;
  hourlyRate?: number;
  isAvailable: boolean;
  profileImageUrl?: string;
}

export interface ShoppingOverview {
  totalOrders: number;
  pendingOrders: number;
  totalSpent: number;
  activeSubscriptions: number;
  cartItemCount: number;
  lastOrderDate?: string;
}

export interface ChatOverview {
  totalChatRooms: number;
  unreadMessages: number;
  activeChatRooms: number;
  lastMessageTime?: string;
}

export interface OverallStats {
  memberSince: string;
  totalActivities: number;
  preferredActivityType: string;
  satisfactionScore: number;
}

export interface DashboardResponse {
  userInfo: UserInfo;
  myPets: PetSummaryResponse[];
  petStats: PetStats;
  recentBookings: WalkerBookingResponse[];
  upcomingBookings: WalkerBookingResponse[];
  walkingStats: WalkingStats;
  recommendedWalkers: WalkerSummaryResponse[];
  favoriteWalkers: WalkerSummaryResponse[];
  shoppingOverview: ShoppingOverview;
  chatOverview: ChatOverview;
  overallStats: OverallStats;
}

class DashboardService {
  async getDashboard(): Promise<DashboardResponse> {
    try {
      const response = await apiClient.get('/api/dashboard');
      return response.data;
    } catch (error: any) {
      console.error('Get dashboard failed:', error);
      throw new Error(error.response?.data?.message || '대시보드 데이터를 불러올 수 없습니다.');
    }
  }

  async getDashboardSummary(): Promise<OverallStats> {
    try {
      const response = await apiClient.get('/api/dashboard/summary');
      return response.data;
    } catch (error: any) {
      console.error('Get dashboard summary failed:', error);
      throw new Error(error.response?.data?.message || '대시보드 요약을 불러올 수 없습니다.');
    }
  }

  async getUserInfo(): Promise<UserInfo> {
    try {
      const response = await apiClient.get('/api/dashboard/user-info');
      return response.data;
    } catch (error: any) {
      console.error('Get user info failed:', error);
      throw new Error(error.response?.data?.message || '사용자 정보를 불러올 수 없습니다.');
    }
  }

  async getPetStats(): Promise<PetStats> {
    try {
      const response = await apiClient.get('/api/dashboard/pets');
      return response.data;
    } catch (error: any) {
      console.error('Get pet stats failed:', error);
      throw new Error(error.response?.data?.message || '반려동물 통계를 불러올 수 없습니다.');
    }
  }

  async getWalkingStats(): Promise<WalkingStats> {
    try {
      const response = await apiClient.get('/api/dashboard/walking');
      return response.data;
    } catch (error: any) {
      console.error('Get walking stats failed:', error);
      throw new Error(error.response?.data?.message || '산책 통계를 불러올 수 없습니다.');
    }
  }

  async getShoppingOverview(): Promise<ShoppingOverview> {
    try {
      const response = await apiClient.get('/api/dashboard/shopping');
      return response.data;
    } catch (error: any) {
      console.error('Get shopping overview failed:', error);
      throw new Error(error.response?.data?.message || '쇼핑 통계를 불러올 수 없습니다.');
    }
  }

  async getChatOverview(): Promise<ChatOverview> {
    try {
      const response = await apiClient.get('/api/dashboard/chat');
      return response.data;
    } catch (error: any) {
      console.error('Get chat overview failed:', error);
      throw new Error(error.response?.data?.message || '채팅 통계를 불러올 수 없습니다.');
    }
  }

  async refreshDashboard(): Promise<DashboardResponse> {
    try {
      const response = await apiClient.post('/api/dashboard/refresh');
      return response.data;
    } catch (error: any) {
      console.error('Refresh dashboard failed:', error);
      throw new Error(error.response?.data?.message || '대시보드 새로고침에 실패했습니다.');
    }
  }

  // 편의 메서드들

  async getQuickStats(): Promise<{
    totalPets: number;
    upcomingWalks: number;
    unreadMessages: number;
    pendingOrders: number;
  }> {
    try {
      const [petStats, walkingStats, chatOverview, shoppingOverview] = await Promise.all([
        this.getPetStats(),
        this.getWalkingStats(),
        this.getChatOverview(),
        this.getShoppingOverview()
      ]);

      return {
        totalPets: petStats.totalPets,
        upcomingWalks: walkingStats.upcomingWalks,
        unreadMessages: chatOverview.unreadMessages,
        pendingOrders: shoppingOverview.pendingOrders
      };
    } catch (error: any) {
      console.error('Get quick stats failed:', error);
      throw new Error('빠른 통계를 불러올 수 없습니다.');
    }
  }

  async getTodayActivities(): Promise<{
    scheduledWalks: WalkerBookingResponse[];
    urgentTasks: string[];
    notifications: string[];
  }> {
    try {
      const dashboard = await this.getDashboard();
      const today = new Date().toISOString().split('T')[0];

      const scheduledWalks = dashboard.upcomingBookings.filter(
        booking => booking.date.startsWith(today)
      );

      const urgentTasks: string[] = [];
      const notifications: string[] = [];

      // 산책이 필요한 반려동물 확인
      if (dashboard.petStats.petsNeedingWalk > 0) {
        urgentTasks.push(`${dashboard.petStats.petsNeedingWalk}마리의 반려동물이 산책이 필요합니다.`);
      }

      // 읽지 않은 메시지 확인
      if (dashboard.chatOverview.unreadMessages > 0) {
        notifications.push(`${dashboard.chatOverview.unreadMessages}개의 읽지 않은 메시지가 있습니다.`);
      }

      // 대기 중인 주문 확인
      if (dashboard.shoppingOverview.pendingOrders > 0) {
        notifications.push(`${dashboard.shoppingOverview.pendingOrders}개의 주문이 처리 중입니다.`);
      }

      return {
        scheduledWalks,
        urgentTasks,
        notifications
      };
    } catch (error: any) {
      console.error('Get today activities failed:', error);
      throw new Error('오늘의 활동을 불러올 수 없습니다.');
    }
  }

  async getWeeklyProgress(): Promise<{
    walksThisWeek: number;
    targetWalks: number;
    progressPercentage: number;
    spentThisWeek: number;
  }> {
    try {
      const walkingStats = await this.getWalkingStats();

      // 간단한 계산 (실제로는 더 정확한 주간 데이터가 필요)
      const walksThisWeek = Math.floor(walkingStats.walkingHoursThisMonth / 4); // 월간을 4주로 나눈 근사치
      const targetWalks = 7; // 주 7회 목표
      const progressPercentage = Math.min((walksThisWeek / targetWalks) * 100, 100);
      const spentThisWeek = walkingStats.totalAmountSpent * 0.25; // 월간의 25%로 근사치

      return {
        walksThisWeek,
        targetWalks,
        progressPercentage,
        spentThisWeek
      };
    } catch (error: any) {
      console.error('Get weekly progress failed:', error);
      throw new Error('주간 진행 상황을 불러올 수 없습니다.');
    }
  }

  async getRecommendedActions(): Promise<string[]> {
    try {
      const dashboard = await this.getDashboard();
      const recommendations: string[] = [];

      // 반려동물 관련 추천
      if (dashboard.petStats.petsNeedingWalk > 0) {
        recommendations.push('산책이 필요한 반려동물들을 위해 워커를 예약해보세요.');
      }

      // 워커 관련 추천
      if (dashboard.recommendedWalkers.length > 0) {
        const topWalker = dashboard.recommendedWalkers[0];
        recommendations.push(`평점 ${topWalker.rating}점의 ${topWalker.name} 워커를 확인해보세요.`);
      }

      // 쇼핑 관련 추천
      if (dashboard.shoppingOverview.cartItemCount > 0) {
        recommendations.push(`장바구니에 ${dashboard.shoppingOverview.cartItemCount}개의 상품이 있습니다. 주문을 완료해보세요.`);
      }

      // 채팅 관련 추천
      if (dashboard.chatOverview.unreadMessages > 0) {
        recommendations.push('읽지 않은 메시지를 확인해보세요.');
      }

      return recommendations.length > 0 ? recommendations : ['모든 활동이 최신 상태입니다! 🎉'];
    } catch (error: any) {
      console.error('Get recommended actions failed:', error);
      throw new Error('추천 작업을 불러올 수 없습니다.');
    }
  }

  async getDashboardHealth(): Promise<{
    overall: 'excellent' | 'good' | 'fair' | 'needs_attention';
    scores: {
      petCare: number;
      activity: number;
      engagement: number;
      satisfaction: number;
    };
    suggestions: string[];
  }> {
    try {
      const dashboard = await this.getDashboard();

      // 각 영역별 점수 계산 (0-100)
      const petCare = Math.max(0, 100 - (dashboard.petStats.petsNeedingWalk * 20));
      const activity = Math.min(100, dashboard.walkingStats.totalCompletedWalks * 2);
      const engagement = dashboard.chatOverview.activeChatRooms > 0 ? 80 : 40;
      const satisfaction = dashboard.overallStats.satisfactionScore * 20; // 5점 만점을 100점으로 변환

      const averageScore = (petCare + activity + engagement + satisfaction) / 4;

      let overall: 'excellent' | 'good' | 'fair' | 'needs_attention';
      if (averageScore >= 90) overall = 'excellent';
      else if (averageScore >= 70) overall = 'good';
      else if (averageScore >= 50) overall = 'fair';
      else overall = 'needs_attention';

      const suggestions: string[] = [];
      if (petCare < 70) suggestions.push('반려동물 케어에 더 신경써보세요.');
      if (activity < 50) suggestions.push('정기적인 산책을 늘려보세요.');
      if (engagement < 60) suggestions.push('워커들과 소통을 늘려보세요.');

      return {
        overall,
        scores: { petCare, activity, engagement, satisfaction },
        suggestions
      };
    } catch (error: any) {
      console.error('Get dashboard health failed:', error);
      throw new Error('대시보드 건강 상태를 확인할 수 없습니다.');
    }
  }
}

export const dashboardService = new DashboardService();