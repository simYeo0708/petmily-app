import { API_BASE_URL } from '../config/api';
import AuthService from './AuthService';

export interface ProductRecommendation {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  averageRating: number;
  likeCount: number;
  salesCount: number;
  imageUrl?: string;
  reason: string; // 추천 이유
  ingredients?: string[]; // 상품 성분 목록
  allergyIngredients?: string[]; // 알레르기 성분 목록 (사용자 반려동물의 알레르기와 매칭된 것)
}

/**
 * 사용자 조회 이력 개수 확인
 */
export const getViewHistoryCount = async (): Promise<{ count: number; hasEnoughHistory: boolean } | null> => {
  try {
    const token = await AuthService.getAuthToken();
    if (!token) {
      return null;
    }
    
    const response = await fetch(`${API_BASE_URL}/products/recommendations/user/view-history-count`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json() as { count: number; hasEnoughHistory: boolean };
    return data;
  } catch (error) {
    return null;
  }
};

/**
 * 사용자 행동 기반 상품 추천 (구매 이력, 좋아요, 장바구니 활용)
 */
export const getProductRecommendations = async (): Promise<ProductRecommendation[]> => {
  try {
    const token = await AuthService.getAuthToken();
    if (!token) {
      return [];
    }
    
    const response = await fetch(`${API_BASE_URL}/products/recommendations/user`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json() as ProductRecommendation[];
    return data || [];
  } catch (error) {
    return [];
  }
};

