import { API_BASE_URL } from '../config/api';
import AuthService from './AuthService';

export interface ReviewCreateRequest {
  productId: number;
  orderId: number;
  rating: number;
  content: string;
  imageUrls?: string[];
}

export interface ReviewResponse {
  id: number;
  userId: number;
  userName: string;
  userProfileImage?: string;
  productId: number;
  productName: string;
  orderId: number;
  rating: number;
  content: string;
  imageUrls?: string[];
  helpfulCount: number;
  unhelpfulCount: number;
  helpfulnessScore?: number;
  isVerifiedPurchase: boolean;
  myVote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewSummaryResponse {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    [key: number]: number;
  };
  totalWithImages: number;
  totalHelpful: number;
}

export interface ReviewListResponse {
  content: ReviewResponse[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

/**
 * 리뷰 작성
 */
export const createReview = async (request: ReviewCreateRequest): Promise<ReviewResponse> => {
  try {
    const token = await AuthService.getAuthToken();
    if (!token) {
      throw new Error('인증이 필요합니다. 로그인 후 다시 시도해주세요.');
    }
    
    // authenticatedFetch를 사용하여 자동 토큰 갱신 처리
    const response = await AuthService.authenticatedFetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.error || '리뷰 작성에 실패했습니다.';
      
      if (response.status === 401) {
        throw new Error('인증에 실패했습니다. 다시 로그인해주세요.');
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json() as ReviewResponse;
    return data;
  } catch (error: any) {
    // 에러 메시지가 이미 있는 경우 그대로 전달
    if (error.message) {
      throw error;
    }
    throw new Error('리뷰 작성 중 오류가 발생했습니다.');
  }
};

/**
 * 상품 리뷰 목록 조회
 */
export const getProductReviews = async (
  productId: number,
  sort: string = 'latest',
  page: number = 0,
  size: number = 10
): Promise<ReviewListResponse> => {
  try {
    const token = await AuthService.getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(
      `${API_BASE_URL}/reviews/products/${productId}?sort=${sort}&page=${page}&size=${size}`,
      {
        method: 'GET',
        headers,
      }
    );

    if (!response.ok) {
      throw new Error('리뷰를 불러올 수 없습니다.');
    }

    const data = await response.json() as ReviewListResponse;
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * 리뷰 요약 정보 조회
 */
export const getReviewSummary = async (productId: number): Promise<ReviewSummaryResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews/products/${productId}/summary`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('리뷰 요약 정보를 불러올 수 없습니다.');
    }

    const data = await response.json() as ReviewSummaryResponse;
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * 내 리뷰 목록 조회
 */
export const getMyReviews = async (
  page: number = 0,
  size: number = 10
): Promise<ReviewListResponse> => {
  try {
    const token = await AuthService.getAuthToken();
    if (!token) {
      throw new Error('인증이 필요합니다.');
    }
    
    const response = await fetch(
      `${API_BASE_URL}/reviews/my?page=${page}&size=${size}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('내 리뷰를 불러올 수 없습니다.');
    }

    const data = await response.json() as ReviewListResponse;
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * 리뷰 도움이 됨 투표
 */
export const voteReviewHelpful = async (
  reviewId: number,
  type: 'HELPFUL' | 'UNHELPFUL'
): Promise<ReviewResponse> => {
  try {
    const token = await AuthService.getAuthToken();
    if (!token) {
      throw new Error('인증이 필요합니다.');
    }
    
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}/helpful`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type }),
    });

    if (!response.ok) {
      throw new Error('투표에 실패했습니다.');
    }

    const data = await response.json() as ReviewResponse;
    return data;
  } catch (error) {
    throw error;
  }
};

