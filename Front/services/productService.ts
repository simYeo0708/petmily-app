import { apiClient, API_ENDPOINTS } from './apiConfig';

// Product 관련 타입 정의
export interface ProductSearchRequest {
  keyword?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  isActive?: boolean;
}

export interface ProductSummary {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;
  brand?: string;
  discountRate?: number;
  ratingAverage?: number;
  reviewCount?: number;
  stock?: number;
  categoryName?: string;
}

export interface CategoryInfo {
  id: number;
  name: string;
  description?: string;
}

export interface ProductDetailResponse {
  id: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  brand?: string;
  weight?: number;
  dimensions?: string;
  stock?: number;
  discountRate?: number;
  ratingAverage?: number;
  reviewCount?: number;
  isActive?: boolean;
  category?: CategoryInfo;
  createTime: string;
  updateTime: string;
}

export interface ProductListResponse {
  products: ProductSummary[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ProductCreateRequest {
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  brand?: string;
  weight?: number;
  dimensions?: string;
  stock: number;
  discountRate?: number;
  categoryId: number;
  isActive?: boolean;
}

export interface ProductUpdateRequest {
  name?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  brand?: string;
  weight?: number;
  dimensions?: string;
  stock?: number;
  discountRate?: number;
  categoryId?: number;
  isActive?: boolean;
}

export interface ProductReviewStatsResponse {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    [key: number]: number; // rating: count
  };
  totalWithImages: number;
  totalHelpful: number;
}

export interface ReviewResponse {
  id: number;
  userId: number;
  username: string;
  productId: number;
  orderItemId: number;
  rating: number;
  title?: string;
  content: string;
  imageUrls?: string[];
  isHelpful?: boolean;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewListResponse {
  reviews: ReviewResponse[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Pagination 타입 정의
export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
}

class ProductService {
  // 상품 목록 조회
  async getProducts(searchRequest?: ProductSearchRequest, pagination?: PaginationParams): Promise<ProductListResponse> {
    try {
      const params = { ...searchRequest, ...pagination };
      const response = await apiClient.get(API_ENDPOINTS.PRODUCTS.LIST, { params });
      return response.data;
    } catch (error: any) {
      console.error('Get products failed:', error);
      throw new Error(error.response?.data?.message || '상품 목록을 불러올 수 없습니다.');
    }
  }

  // 상품 상세 조회
  async getProduct(productId: number): Promise<ProductDetailResponse> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PRODUCTS.DETAIL(productId));
      return response.data;
    } catch (error: any) {
      console.error('Get product failed:', error);
      throw new Error(error.response?.data?.message || '상품 정보를 불러올 수 없습니다.');
    }
  }

  // 카테고리별 상품 조회
  async getProductsByCategory(categoryId: number, pagination?: PaginationParams): Promise<ProductListResponse> {
    try {
      const params = pagination || {};
      const response = await apiClient.get(API_ENDPOINTS.PRODUCTS.BY_CATEGORY(categoryId), { params });
      return response.data;
    } catch (error: any) {
      console.error('Get products by category failed:', error);
      throw new Error(error.response?.data?.message || '카테고리별 상품을 불러올 수 없습니다.');
    }
  }

  // 상품 검색
  async searchProducts(searchRequest: ProductSearchRequest, pagination?: PaginationParams): Promise<ProductListResponse> {
    try {
      const params = { ...searchRequest, ...pagination };
      const response = await apiClient.get(API_ENDPOINTS.PRODUCTS.SEARCH, { params });
      return response.data;
    } catch (error: any) {
      console.error('Search products failed:', error);
      throw new Error(error.response?.data?.message || '상품 검색에 실패했습니다.');
    }
  }

  // 상품 생성 (관리자 전용)
  async createProduct(request: ProductCreateRequest): Promise<ProductDetailResponse> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.PRODUCTS.CREATE, request);
      return response.data;
    } catch (error: any) {
      console.error('Create product failed:', error);
      throw new Error(error.response?.data?.message || '상품 생성에 실패했습니다.');
    }
  }

  // 상품 수정 (관리자 전용)
  async updateProduct(productId: number, request: ProductUpdateRequest): Promise<ProductDetailResponse> {
    try {
      const response = await apiClient.put(API_ENDPOINTS.PRODUCTS.UPDATE(productId), request);
      return response.data;
    } catch (error: any) {
      console.error('Update product failed:', error);
      throw new Error(error.response?.data?.message || '상품 수정에 실패했습니다.');
    }
  }

  // 상품 삭제 (관리자 전용)
  async deleteProduct(productId: number): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.PRODUCTS.DELETE(productId));
    } catch (error: any) {
      console.error('Delete product failed:', error);
      throw new Error(error.response?.data?.message || '상품 삭제에 실패했습니다.');
    }
  }

  // 상품 리뷰 목록 조회
  async getProductReviews(productId: number, pagination?: PaginationParams): Promise<ReviewListResponse> {
    try {
      const params = pagination || {};
      const response = await apiClient.get(API_ENDPOINTS.PRODUCTS.REVIEWS(productId), { params });
      return response.data;
    } catch (error: any) {
      console.error('Get product reviews failed:', error);
      throw new Error(error.response?.data?.message || '상품 리뷰를 불러올 수 없습니다.');
    }
  }

  // 상품 리뷰 통계 조회
  async getProductReviewStats(productId: number): Promise<ProductReviewStatsResponse> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PRODUCTS.REVIEW_STATS(productId));
      return response.data;
    } catch (error: any) {
      console.error('Get product review stats failed:', error);
      throw new Error(error.response?.data?.message || '리뷰 통계를 불러올 수 없습니다.');
    }
  }

  // 특정 평점의 리뷰 조회
  async getProductReviewsByRating(productId: number, rating: number, pagination?: PaginationParams): Promise<ReviewListResponse> {
    try {
      const params = pagination || {};
      const response = await apiClient.get(API_ENDPOINTS.PRODUCTS.REVIEWS_BY_RATING(productId, rating), { params });
      return response.data;
    } catch (error: any) {
      console.error('Get product reviews by rating failed:', error);
      throw new Error(error.response?.data?.message || '평점별 리뷰를 불러올 수 없습니다.');
    }
  }

  // 이미지가 포함된 리뷰 조회
  async getProductReviewsWithImages(productId: number, pagination?: PaginationParams): Promise<ReviewListResponse> {
    try {
      const params = pagination || {};
      const response = await apiClient.get(API_ENDPOINTS.PRODUCTS.REVIEWS_WITH_IMAGES(productId), { params });
      return response.data;
    } catch (error: any) {
      console.error('Get product reviews with images failed:', error);
      throw new Error(error.response?.data?.message || '이미지 리뷰를 불러올 수 없습니다.');
    }
  }

  // 도움이 된 리뷰 조회
  async getProductReviewsByHelpful(productId: number, pagination?: PaginationParams): Promise<ReviewListResponse> {
    try {
      const params = pagination || {};
      const response = await apiClient.get(API_ENDPOINTS.PRODUCTS.REVIEWS_BY_HELPFUL(productId), { params });
      return response.data;
    } catch (error: any) {
      console.error('Get product reviews by helpful failed:', error);
      throw new Error(error.response?.data?.message || '인기 리뷰를 불러올 수 없습니다.');
    }
  }

  // 편의 메서드들

  // 키워드로 상품 검색
  async searchByKeyword(keyword: string, pagination?: PaginationParams): Promise<ProductListResponse> {
    return this.searchProducts({ keyword }, pagination);
  }

  // 브랜드별 상품 검색
  async searchByBrand(brand: string, pagination?: PaginationParams): Promise<ProductListResponse> {
    return this.searchProducts({ brand }, pagination);
  }

  // 가격 범위로 상품 검색
  async searchByPriceRange(minPrice: number, maxPrice: number, pagination?: PaginationParams): Promise<ProductListResponse> {
    return this.searchProducts({ minPrice, maxPrice }, pagination);
  }

  // 최신순으로 상품 조회
  async getProductsOrderByLatest(pagination?: PaginationParams): Promise<ProductListResponse> {
    const searchRequest: ProductSearchRequest = {
      sortBy: 'createTime',
      sortDirection: 'desc'
    };
    return this.getProducts(searchRequest, pagination);
  }

  // 인기순으로 상품 조회 (평점 높은 순)
  async getProductsOrderByPopularity(pagination?: PaginationParams): Promise<ProductListResponse> {
    const searchRequest: ProductSearchRequest = {
      sortBy: 'ratingAverage',
      sortDirection: 'desc'
    };
    return this.getProducts(searchRequest, pagination);
  }

  // 낮은 가격순으로 상품 조회
  async getProductsOrderByPriceLow(pagination?: PaginationParams): Promise<ProductListResponse> {
    const searchRequest: ProductSearchRequest = {
      sortBy: 'price',
      sortDirection: 'asc'
    };
    return this.getProducts(searchRequest, pagination);
  }

  // 높은 가격순으로 상품 조회
  async getProductsOrderByPriceHigh(pagination?: PaginationParams): Promise<ProductListResponse> {
    const searchRequest: ProductSearchRequest = {
      sortBy: 'price',
      sortDirection: 'desc'
    };
    return this.getProducts(searchRequest, pagination);
  }
}

export const productService = new ProductService();