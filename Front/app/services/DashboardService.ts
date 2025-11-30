import { API_BASE_URL } from '../config/api';
import AuthService from './AuthService';

export interface DashboardResponse {
  userInfo: {
    name: string;
    email: string;
    profileImageUrl: string | null;
    membershipLevel: string;
  };
  myPets: Array<{
    id: number;
    name: string;
    species: string;
    breed: string;
    age: string;
    photoUrl: string | null;
  }>;
  petStats: {
    totalPets: number;
    mostRecentPetName: string | null;
    petsNeedingWalk: number;
  };
  recentBookings: Array<{
    id: number;
    date: string;
    petName: string;
    petBreed: string;
    notes: string | null;
    status: string;
    address: string;
  }>;
  upcomingBookings: Array<{
    id: number;
    date: string;
    petName: string;
    petBreed: string;
    notes: string | null;
    status: string;
    address: string;
  }>;
  walkingStats: {
    totalCompletedWalks: number;
    upcomingWalks: number;
    walkingHoursThisMonth: number;
    totalAmountSpent: number;
    averageRating: number;
  };
  recommendedWalkers: Array<{
    id: number;
    name: string;
    rating: number;
    reviewCount: number;
    pricePerHour: number;
    profileImageUrl: string | null;
  }>;
  favoriteWalkers: Array<{
    id: number;
    name: string;
    rating: number;
    reviewCount: number;
    pricePerHour: number;
    profileImageUrl: string | null;
  }>;
  shoppingOverview: {
    totalOrders: number;
    pendingOrders: number;
    totalSpent: number;
    activeSubscriptions: number;
    cartItemCount: number;
    lastOrderDate: string | null;
  };
  chatOverview: {
    totalChatRooms: number;
    unreadMessages: number;
    activeChatRooms: number;
    lastMessageTime: string | null;
  };
  overallStats: {
    memberSince: string;
    totalActivities: number;
    preferredActivityType: string;
    satisfactionScore: number;
  };
}

const DashboardService = {
  async getDashboard(): Promise<DashboardResponse | null> {
    try {
      const token = await AuthService.getAuthToken();
      if (!token) {
        return null;
      }

      const response = await fetch(`${API_BASE_URL}/dashboard`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // 토큰 만료 시 refresh 시도
          const newToken = await AuthService.refreshToken();
          if (newToken) {
            // 재시도
            const retryResponse = await fetch(`${API_BASE_URL}/dashboard`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${newToken}`,
                'Content-Type': 'application/json',
              },
            });
            if (retryResponse.ok) {
              const data = await retryResponse.json();
              return data.data || data;
            }
          }
        }
        return null;
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      return null;
    }
  },

  async getDashboardSummary() {
    try {
      const token = await AuthService.getAuthToken();
      if (!token) {
        return null;
      }

      const response = await fetch(`${API_BASE_URL}/dashboard/summary`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      return null;
    }
  },
};

export default DashboardService;

