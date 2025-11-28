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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined' && error.response?.status === 401) {
      // Clear authentication data
      localStorage.removeItem('petmily_token');
      localStorage.removeItem('petmily_user');
      
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        // Use a more gentle approach - dispatch a custom event
        window.dispatchEvent(new CustomEvent('auth:logout'));
        
        // Fallback to redirect after a short delay
        setTimeout(() => {
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }, 100);
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


