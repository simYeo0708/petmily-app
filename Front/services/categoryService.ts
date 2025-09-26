import { apiClient, API_ENDPOINTS } from './apiConfig';

// Category 관련 타입 정의
export interface CategorySummary {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  iconUrl?: string;
  isActive?: boolean;
  sortOrder?: number;
  parentId?: number;
  children?: CategorySummary[];
  productCount: number;
}

export interface CategoryDetailResponse {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  iconUrl?: string;
  isActive?: boolean;
  sortOrder?: number;
  parentId?: number;
  parentName?: string;
  children?: CategorySummary[];
  productCount: number;
  createTime: string;
  updateTime: string;
}

export interface CategoryListResponse {
  categories: CategorySummary[];
  totalCount: number;
}

export interface CategoryCreateRequest {
  name: string;
  description?: string;
  imageUrl?: string;
  iconUrl?: string;
  isActive?: boolean;
  sortOrder?: number;
  parentId?: number;
}

export interface CategoryUpdateRequest {
  name?: string;
  description?: string;
  imageUrl?: string;
  iconUrl?: string;
  isActive?: boolean;
  sortOrder?: number;
  parentId?: number;
}

class CategoryService {
  // 카테고리 목록 조회
  async getCategories(): Promise<CategoryListResponse> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CATEGORIES.LIST);
      return response.data;
    } catch (error: any) {
      console.error('Get categories failed:', error);
      throw new Error(error.response?.data?.message || '카테고리 목록을 불러올 수 없습니다.');
    }
  }

  // 카테고리 상세 조회
  async getCategory(categoryId: number): Promise<CategoryDetailResponse> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CATEGORIES.DETAIL(categoryId));
      return response.data;
    } catch (error: any) {
      console.error('Get category failed:', error);
      throw new Error(error.response?.data?.message || '카테고리 정보를 불러올 수 없습니다.');
    }
  }

  // 하위 카테고리 목록 조회
  async getCategoryChildren(categoryId: number): Promise<CategoryListResponse> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CATEGORIES.CHILDREN(categoryId));
      return response.data;
    } catch (error: any) {
      console.error('Get category children failed:', error);
      throw new Error(error.response?.data?.message || '하위 카테고리를 불러올 수 없습니다.');
    }
  }

  // 카테고리 생성 (관리자 전용)
  async createCategory(request: CategoryCreateRequest): Promise<CategoryDetailResponse> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.CATEGORIES.CREATE, request);
      return response.data;
    } catch (error: any) {
      console.error('Create category failed:', error);
      throw new Error(error.response?.data?.message || '카테고리 생성에 실패했습니다.');
    }
  }

  // 카테고리 수정 (관리자 전용)
  async updateCategory(categoryId: number, request: CategoryUpdateRequest): Promise<CategoryDetailResponse> {
    try {
      const response = await apiClient.put(API_ENDPOINTS.CATEGORIES.UPDATE(categoryId), request);
      return response.data;
    } catch (error: any) {
      console.error('Update category failed:', error);
      throw new Error(error.response?.data?.message || '카테고리 수정에 실패했습니다.');
    }
  }

  // 카테고리 삭제 (관리자 전용)
  async deleteCategory(categoryId: number): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.CATEGORIES.DELETE(categoryId));
    } catch (error: any) {
      console.error('Delete category failed:', error);
      throw new Error(error.response?.data?.message || '카테고리 삭제에 실패했습니다.');
    }
  }

  // 편의 메서드들

  // 최상위 카테고리만 조회
  async getRootCategories(): Promise<CategorySummary[]> {
    try {
      const response = await this.getCategories();
      return response.categories.filter(category => !category.parentId);
    } catch (error: any) {
      console.error('Get root categories failed:', error);
      throw new Error(error.response?.data?.message || '최상위 카테고리를 불러올 수 없습니다.');
    }
  }

  // 활성 카테고리만 조회
  async getActiveCategories(): Promise<CategorySummary[]> {
    try {
      const response = await this.getCategories();
      return response.categories.filter(category => category.isActive);
    } catch (error: any) {
      console.error('Get active categories failed:', error);
      throw new Error(error.response?.data?.message || '활성 카테고리를 불러올 수 없습니다.');
    }
  }

  // 정렬 순서대로 카테고리 조회
  async getCategoriesOrderBySortOrder(): Promise<CategorySummary[]> {
    try {
      const response = await this.getCategories();
      return response.categories.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    } catch (error: any) {
      console.error('Get categories order by sort order failed:', error);
      throw new Error(error.response?.data?.message || '정렬된 카테고리를 불러올 수 없습니다.');
    }
  }

  // 상품 수가 많은 순으로 카테고리 조회
  async getCategoriesOrderByProductCount(): Promise<CategorySummary[]> {
    try {
      const response = await this.getCategories();
      return response.categories.sort((a, b) => b.productCount - a.productCount);
    } catch (error: any) {
      console.error('Get categories order by product count failed:', error);
      throw new Error(error.response?.data?.message || '인기 카테고리를 불러올 수 없습니다.');
    }
  }

  // 카테고리 트리 구조로 조회
  async getCategoryTree(): Promise<CategorySummary[]> {
    try {
      const response = await this.getCategories();
      const categories = response.categories;

      // 부모-자식 관계 맵핑
      const rootCategories: CategorySummary[] = [];
      const categoryMap = new Map<number, CategorySummary>();

      // 모든 카테고리를 맵에 저장
      categories.forEach(category => {
        categoryMap.set(category.id, { ...category, children: [] });
      });

      // 트리 구조 생성
      categories.forEach(category => {
        const categoryWithChildren = categoryMap.get(category.id)!;

        if (category.parentId) {
          const parent = categoryMap.get(category.parentId);
          if (parent) {
            parent.children = parent.children || [];
            parent.children.push(categoryWithChildren);
          }
        } else {
          rootCategories.push(categoryWithChildren);
        }
      });

      // 정렬 순서대로 정렬
      const sortCategories = (categories: CategorySummary[]) => {
        categories.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        categories.forEach(category => {
          if (category.children && category.children.length > 0) {
            sortCategories(category.children);
          }
        });
      };

      sortCategories(rootCategories);
      return rootCategories;
    } catch (error: any) {
      console.error('Get category tree failed:', error);
      throw new Error(error.response?.data?.message || '카테고리 트리를 불러올 수 없습니다.');
    }
  }

  // 카테고리 검색 (이름으로)
  async searchCategoriesByName(name: string): Promise<CategorySummary[]> {
    try {
      const response = await this.getCategories();
      return response.categories.filter(category =>
        category.name.toLowerCase().includes(name.toLowerCase())
      );
    } catch (error: any) {
      console.error('Search categories by name failed:', error);
      throw new Error(error.response?.data?.message || '카테고리 검색에 실패했습니다.');
    }
  }
}

export const categoryService = new CategoryService();