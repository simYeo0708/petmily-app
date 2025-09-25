import { apiClient, API_ENDPOINTS } from './apiConfig';

export interface Category {
  id: number;
  name: string;
  description?: string;
  parentId?: number;
  children?: Category[];
}

export interface CategoryListResponse {
  categories: Category[];
  totalCount: number;
}

export interface CategoryDetailResponse {
  id: number;
  name: string;
  description?: string;
  parentId?: number;
  children?: Category[];
  parent?: Category;
}

class CategoryService {
  async getCategories(): Promise<CategoryListResponse> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PRODUCTS.CATEGORIES);
      return response.data;
    } catch (error: any) {
      console.error('Get categories failed:', error);
      throw new Error(error.response?.data?.message || '카테고리 목록을 불러올 수 없습니다.');
    }
  }

  async getCategory(id: number): Promise<CategoryDetailResponse> {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.PRODUCTS.CATEGORIES}/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Get category failed:', error);
      throw new Error(error.response?.data?.message || '카테고리 정보를 불러올 수 없습니다.');
    }
  }

  async getCategoryChildren(id: number): Promise<CategoryListResponse> {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.PRODUCTS.CATEGORIES}/${id}/children`);
      return response.data;
    } catch (error: any) {
      console.error('Get category children failed:', error);
      throw new Error(error.response?.data?.message || '하위 카테고리를 불러올 수 없습니다.');
    }
  }
}

export const categoryService = new CategoryService();