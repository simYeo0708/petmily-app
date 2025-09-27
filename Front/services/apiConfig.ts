import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API 기본 설정
const API_BASE_URL = __DEV__
  ? 'http://localhost:8080/api'  // 개발 환경
  : 'https://api.petmily.com/api';  // 프로덕션 환경

// Axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor - JWT 토큰 자동 포함
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('토큰 조회 실패:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor - 토큰 만료 처리
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken: refreshToken,
          });

          const newAccessToken = response.data.accessToken;
          await AsyncStorage.setItem('access_token', newAccessToken);

          // 원래 요청을 새로운 토큰으로 재시도
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // 리프레시 토큰도 만료된 경우 로그아웃 처리
        await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
        // 로그인 화면으로 리다이렉트 (네비게이션 로직 추가 필요)
        console.error('토큰 갱신 실패, 재로그인 필요', refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API 엔드포인트 상수
export const API_ENDPOINTS = {
  // 인증 관련
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/signup',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/reissue',
    PROFILE: '/auth/profile',
  },

  // 사용자 관련
  USERS: {
    PROFILE: '/users/me',
    UPDATE: '/users/me',
    GET_BY_ID: (id: number) => `/users/${id}`,
    ALL: '/users/all',
    CHANGE_PASSWORD: '/users/me/password',
  },

  // 워커 관련
  WALKERS: {
    LIST: '/walkers',
    REGISTER: '/walkers',
    PROFILE: (walkerId: number) => `/walkers/${walkerId}`,
    MY_PROFILE: '/walkers/me',
    UPDATE_PROFILE: '/walkers/me',
    REVIEWS: (walkerId: number) => `/walkers/${walkerId}/reviews`,
    FAVORITES: '/walkers/favorites',
    ADD_FAVORITE: (walkerId: number) => `/walkers/${walkerId}/favorite`,
    REMOVE_FAVORITE: (walkerId: number) => `/walkers/${walkerId}/favorite`,
    CHECK_FAVORITE: (walkerId: number) => `/walkers/${walkerId}/favorite/check`,
  },

  // 반려동물 관련
  PETS: {
    LIST: '/pets/my',
    CREATE: '/pets',
    DETAIL: (petId: number) => `/pets/${petId}`,
    UPDATE: (petId: number) => `/pets/${petId}`,
    DELETE: (petId: number) => `/pets/${petId}`,
    SEARCH: '/pets/search',
    ALL: '/pets/all',
    UPDATE_PHOTO: (petId: number) => `/pets/${petId}/photo`,
    ONBOARDING: (userId: number) => `/pets/onboarding/${userId}`,
    FITTING_INFO: (petId: number) => `/pets/${petId}/fitting-info`,
    WALK_PROFILE: (petId: number) => `/pets/${petId}/walk-profile`,
  },

  // 산책 예약 관련 (WalkerBooking)
  WALKER_BOOKINGS: {
    CREATE: '/walker/bookings',
    USER_BOOKINGS: '/walker/bookings/user',
    WALKER_BOOKINGS: '/walker/bookings/walker',
    DETAIL: (bookingId: number) => `/walker/bookings/${bookingId}`,
    UPDATE_STATUS: (bookingId: number) => `/walker/bookings/${bookingId}/status`,
    CANCEL: (bookingId: number) => `/walker/bookings/${bookingId}`,

    // 오픈 요청 관련
    OPEN_REQUESTS: '/walker/bookings/open-requests',
    APPLY_TO_REQUEST: (openRequestId: number) => `/walker/bookings/open-requests/${openRequestId}/apply`,
    WALKER_APPLICATIONS: (openRequestId: number) => `/walker/bookings/${openRequestId}/applications`,
    RESPOND_APPLICATION: (applicationId: number) => `/walker/bookings/applications/${applicationId}/respond`,

    // 예약 변경 요청 관련
    CHANGE_REQUESTS: (bookingId: number) => `/walker/bookings/${bookingId}/change-requests`,
    RESPOND_CHANGE: (requestId: number) => `/walker/bookings/change-requests/${requestId}/respond`,
    PENDING_CHANGES_WALKER: '/walker/bookings/walker/pending-change-requests',
  },

  // 산책 관련
  WALKING: {
    START: (bookingId: number) => `/walking/${bookingId}/start`,
    COMPLETE: (bookingId: number) => `/walking/${bookingId}/complete`,
    TRACK: (bookingId: number) => `/walking/${bookingId}/track`,
    PATH: (bookingId: number) => `/walking/${bookingId}/path`,
    REALTIME: (bookingId: number) => `/walking/${bookingId}/realtime`,
    UPDATE_LOCATION: (bookingId: number) => `/walking/${bookingId}/location`,
    UPLOAD_PHOTO: (bookingId: number) => `/walking/${bookingId}/photos`,
    EMERGENCY_CALL: (bookingId: number) => `/walking/${bookingId}/emergency-call`,
    REQUEST_TERMINATION: (bookingId: number) => `/walking/${bookingId}/request-termination`,
  },

  // 채팅 관련
  CHAT: {
    ROOMS: '/chat/rooms',
    ROOM: (roomId: number) => `/chat/rooms/${roomId}`,
    MESSAGES: (roomId: number) => `/chat/rooms/${roomId}/messages`,
  },

  // 상품 관련
  PRODUCTS: {
    LIST: '/products',
    DETAIL: (productId: number) => `/products/${productId}`,
    SEARCH: '/products/search',
    BY_CATEGORY: (categoryId: number) => `/products/category/${categoryId}`,
    CREATE: '/products',
    UPDATE: (productId: number) => `/products/${productId}`,
    DELETE: (productId: number) => `/products/${productId}`,

    // 상품 리뷰 관련
    REVIEWS: (productId: number) => `/products/${productId}/reviews`,
    REVIEW_STATS: (productId: number) => `/products/${productId}/reviews/stats`,
    REVIEWS_BY_RATING: (productId: number, rating: number) => `/products/${productId}/reviews/rating/${rating}`,
    REVIEWS_WITH_IMAGES: (productId: number) => `/products/${productId}/reviews/with-images`,
    REVIEWS_BY_HELPFUL: (productId: number) => `/products/${productId}/reviews/helpful`,
  },

  // 카테고리 관련
  CATEGORIES: {
    LIST: '/categories',
    DETAIL: (categoryId: number) => `/categories/${categoryId}`,
    CHILDREN: (categoryId: number) => `/categories/${categoryId}/children`,
    CREATE: '/categories',
    UPDATE: (categoryId: number) => `/categories/${categoryId}`,
    DELETE: (categoryId: number) => `/categories/${categoryId}`,
  },

  // 장바구니 관련
  CART: {
    GET: '/carts',
    ADD_ITEM: '/carts/items',
    UPDATE_ITEM: (itemId: number) => `/carts/items/${itemId}`,
    REMOVE_ITEM: (itemId: number) => `/carts/items/${itemId}`,
    TOGGLE_SELECT: (itemId: number) => `/carts/items/${itemId}/select`,
    CLEAR: '/carts',
    REMOVE_SELECTED: '/carts/items',
  },

  // 주문 관련
  ORDERS: {
    LIST: '/orders',
    CREATE: '/orders',
    DETAIL: (orderId: number) => `/orders/${orderId}`,
    CANCEL: (orderId: number) => `/orders/${orderId}/cancel`,
    CONFIRM: (orderId: number) => `/orders/${orderId}/confirm`,
    TRACKING: (orderId: number) => `/orders/${orderId}/tracking`,

    // 반품 관련
    RETURNS: (orderId: number) => `/orders/${orderId}/returns`,
    RETURN_DETAIL: (orderId: number, returnId: number) => `/orders/${orderId}/returns/${returnId}`,
    CREATE_RETURN: (orderId: number) => `/orders/${orderId}/returns`,
    CANCEL_RETURN: (orderId: number, returnId: number) => `/orders/${orderId}/returns/${returnId}`,
    APPROVE_RETURN: (orderId: number, returnId: number) => `/orders/${orderId}/returns/${returnId}/approve`,
    REJECT_RETURN: (orderId: number, returnId: number) => `/orders/${orderId}/returns/${returnId}/reject`,
    COLLECT_RETURN: (orderId: number, returnId: number) => `/orders/${orderId}/returns/${returnId}/collect`,
    INSPECT_RETURN: (orderId: number, returnId: number) => `/orders/${orderId}/returns/${returnId}/inspect`,
    REFUND_RETURN: (orderId: number, returnId: number) => `/orders/${orderId}/returns/${returnId}/refund`,

    // 리뷰 관련
    REVIEW: (orderId: number) => `/orders/${orderId}/review`,
    CREATE_REVIEW: (orderId: number) => `/orders/${orderId}/review`,
    UPDATE_REVIEW: (orderId: number) => `/orders/${orderId}/review`,
    DELETE_REVIEW: (orderId: number) => `/orders/${orderId}/review`,
    ADD_HELPFUL: (orderId: number) => `/orders/${orderId}/review/helpful`,
    REMOVE_HELPFUL: (orderId: number) => `/orders/${orderId}/review/helpful`,
  },

  // 정기배송 관련
  SUBSCRIPTIONS: {
    LIST: '/subscriptions',
    CREATE: '/subscriptions',
    DETAIL: (subscriptionId: number) => `/subscriptions/${subscriptionId}`,
    UPDATE: (subscriptionId: number) => `/subscriptions/${subscriptionId}`,
    PAUSE: (subscriptionId: number) => `/subscriptions/${subscriptionId}/pause`,
    RESUME: (subscriptionId: number) => `/subscriptions/${subscriptionId}/resume`,
    CANCEL: (subscriptionId: number) => `/subscriptions/${subscriptionId}`,
    HISTORY: (subscriptionId: number) => `/subscriptions/${subscriptionId}/history`,
  },

  // 알림 관련
  NOTIFICATIONS: {
    SETTINGS: '/notifications/settings',
    PUSH_TOKEN_REGISTER: '/notifications/push-token',
    PUSH_TOKEN_UNREGISTER: '/notifications/push-token',
    PUSH_SEND: '/notifications/push/send',
    HISTORY: '/notifications/history',
    WALK_HISTORY: (bookingId: number) => `/notifications/history/${bookingId}`,
    ANNOUNCEMENT_ALL: '/notifications/announcement/all',
    ANNOUNCEMENT_WALKERS: '/notifications/announcement/walkers',
    CUSTOM: (userId: number) => `/notifications/custom/${userId}`,
    EMERGENCY: (userId: number) => `/notifications/emergency/${userId}`,
    TEST: '/notifications/test',
    SYNC: '/notifications/sync',
  },
} as const;

export default apiClient;