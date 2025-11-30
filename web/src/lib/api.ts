import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8083/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('petmily_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and refresh tokens
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 에러이고, 아직 재시도하지 않은 요청인 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // 이미 refresh 중이면 대기열에 추가
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('petmily_refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        // Refresh token으로 새 access token 요청
        const response = await api.post('/auth/refresh', { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // 새 토큰 저장
        localStorage.setItem('petmily_token', accessToken);
        if (newRefreshToken) {
          localStorage.setItem('petmily_refresh_token', newRefreshToken);
        }

        // 대기 중인 요청들 처리
        processQueue(null, accessToken);

        // 원래 요청 재시도
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh 실패 시 로그아웃 처리
        processQueue(refreshError, null);
        localStorage.removeItem('petmily_token');
        localStorage.removeItem('petmily_refresh_token');
        localStorage.removeItem('petmily_user');

        if (window.location.pathname !== '/login') {
          window.dispatchEvent(new CustomEvent('auth:logout'));
          setTimeout(() => {
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
          }, 100);
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData: {
    username: string;
    email: string;
    password: string;
    name: string;
    phone?: string;
  }) => api.post('/auth/signup', userData),
  
  login: (credentials: { username: string; password: string }) =>
    api.post('/auth/login', credentials),
  
  getCurrentUser: () => api.get('/auth/me'),
  
  logout: () => api.post('/auth/logout'),
  
  refreshToken: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }),
};

// Pet API
export const petAPI = {
  createPet: (petData: {
    name: string;
    species: string;
    breed?: string;
    age: string;
    gender: string;
    weight?: string;
    isNeutered?: boolean;
    temperaments?: string[];
    specialNotes?: string;
  }) => api.post('/pets', petData),
  
  getPetsByUser: () => api.get('/pets'),
  
  getPet: (id: number) => api.get(`/pets/${id}`),
  
  getPrimaryPet: () => api.get('/pets/primary'),
  
  updatePet: (id: number, petData: {
    name?: string;
    species?: string;
    breed?: string;
    age?: string;
    gender?: string;
    weight?: string;
    isNeutered?: boolean;
    temperaments?: string[];
    specialNotes?: string;
  }) => api.put(`/pets/${id}`, petData),
  
  deletePet: (id: number) => api.delete(`/pets/${id}`),
};

// Product API
export const productAPI = {
  getAllProducts: () => api.get('/products'),
  
  getProduct: (id: number) => api.get(`/products/${id}`),
  
  getProductsByCategory: (categoryId: number) => api.get(`/products?categoryId=${categoryId}`),
  
  searchProducts: (keyword: string) => api.get(`/products?keyword=${keyword}`),
  
  getAvailableProducts: () => api.get('/products'),
  
  getAiRecommendations: (petId: number) => api.get(`/products/recommendations/pet/${petId}`),
  
  createProduct: (productData: Record<string, unknown>) => api.post('/products', productData),
  
  updateProduct: (id: number, productData: Record<string, unknown>) => api.put(`/products/${id}`, productData),
  
  deleteProduct: (id: number) => api.delete(`/products/${id}`),
};

// Walker API
export const walkerAPI = {
  getAvailableWalkers: (searchParams?: { location?: string; maxRate?: number }) => {
    const params = new URLSearchParams();
    if (searchParams?.location) params.append('location', searchParams.location);
    if (searchParams?.maxRate) params.append('maxRate', searchParams.maxRate.toString());
    return api.get(`/walkers?${params.toString()}`);
  },
  
  getWalker: (id: number) => api.get(`/walkers/${id}`),
  
  getCurrentWalker: () => api.get('/walkers/me'),
  
  createWalkerProfile: (profileData: Record<string, unknown>) => api.post('/walkers', profileData),
  
  updateWalkerProfile: (profileData: Record<string, unknown>) => api.put('/walkers/me', profileData),
  
  createBooking: (bookingData: {
    walkerId?: number;
    petId: number;
    date: string;
    duration: number;
    notes?: string;
    pickupAddress: string;
    dropoffAddress?: string;
  }) => api.post('/walker-bookings', bookingData),
  
  getUserBookings: () => api.get('/walker-bookings/user'),
  
  getWalkerBookings: () => api.get('/walker-bookings/walker'),
  
  getBooking: (bookingId: number) => api.get(`/walker-bookings/${bookingId}`),
  
  updateBookingStatus: (bookingId: number, status: string) =>
    api.put(`/walker-bookings/${bookingId}`, { status }),
  
  createReview: (reviewData: {
    walkerId: number;
    bookingId: number;
    rating: number;
    comment?: string;
  }) => api.post('/walker/reviews', reviewData),
  
  getWalkerReviews: (walkerId: number) => api.get(`/walker/reviews/walker/${walkerId}`),
};

export default api;


