import api from './api';

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

export const dashboardAPI = {
  getDashboard: () => api.get<{ data: DashboardResponse }>('/dashboard'),
  
  getDashboardSummary: () => api.get<{ data: DashboardResponse['overallStats'] }>('/dashboard/summary'),
  
  getUserInfo: () => api.get<{ data: DashboardResponse['userInfo'] }>('/dashboard/user-info'),
  
  getPetStats: () => api.get<{ data: DashboardResponse['petStats'] }>('/dashboard/pets'),
  
  getWalkingStats: () => api.get<{ data: DashboardResponse['walkingStats'] }>('/dashboard/walking'),
  
  getShoppingOverview: () => api.get<{ data: DashboardResponse['shoppingOverview'] }>('/dashboard/shopping'),
  
  getChatOverview: () => api.get<{ data: DashboardResponse['chatOverview'] }>('/dashboard/chat'),
  
  refreshDashboard: () => api.post<{ data: DashboardResponse }>('/dashboard/refresh'),
};

