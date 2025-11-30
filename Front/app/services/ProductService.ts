import { API_BASE_URL } from '../config/api';
import AuthService from './AuthService';

export interface Product {
  id: string;
  name: string;
  brand: string;
  image: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  favoriteCount: number;
  discount?: number;
}

/**
 * 상품 상세 정보 조회 (조회 이력 자동 저장)
 */
export const getProductById = async (productId: string | number): Promise<any> => {
  try {
    const token = await AuthService.getAuthToken();
    if (!token) {
      return null;
    }
    
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
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
    return data;
  } catch (error) {
    console.error('상품 조회 실패:', error);
    return null;
  }
};

