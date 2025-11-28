import { API_BASE_URL } from '../config/api';

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
}

const getAuthToken = async (): Promise<string> => {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const token = await AsyncStorage.getItem('authToken');
    return token || 'test-token-for-user-1';
  } catch (error) {
    return 'test-token-for-user-1';
  }
};

export const getProductRecommendations = async (petId: number): Promise<ProductRecommendation[]> => {
  try {
    const token = await getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/products/recommendations/pet/${petId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('상품 추천 조회 실패:', response.status);
      return [];
    }

    const data = await response.json() as ProductRecommendation[];
    return data || [];
  } catch (error) {
    console.error('상품 추천 조회 중 오류:', error);
    return [];
  }
};

