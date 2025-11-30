import { apiClient, API_ENDPOINTS } from './apiConfig';

export interface ReviewCreateRequest {
  productId: number;
  orderItemId: number;
  rating: number;
  title?: string;
  content: string;
  imageUrls?: string[];
}

export interface ReviewUpdateRequest {
  rating?: number;
  title?: string;
  content?: string;
  imageUrls?: string[];
}

export interface ReviewHelpfulRequest {
  type: 'HELPFUL' | 'UNHELPFUL';
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
  helpfulCount: number;
  unhelpfulCount?: number;
  helpfulnessScore?: number;
  isHelpful?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewSummaryResponse {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    [key: number]: number; // rating: count
  };
  totalWithImages: number;
  totalHelpful: number;
}

export interface ReviewListResponse {
  content: ReviewResponse[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
}

class ReviewService {
  // 리뷰 작성
  async createReview(request: ReviewCreateRequest): Promise<ReviewResponse> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.REVIEWS.CREATE, request);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '리뷰 작성에 실패했습니다.');
    }
  }

  // 리뷰 수정
  async updateReview(reviewId: number, request: ReviewUpdateRequest): Promise<ReviewResponse> {
    try {
      const response = await apiClient.put(API_ENDPOINTS.REVIEWS.UPDATE(reviewId), request);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '리뷰 수정에 실패했습니다.');
    }
  }

  // 리뷰 삭제
  async deleteReview(reviewId: number): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.REVIEWS.DELETE(reviewId));
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '리뷰 삭제에 실패했습니다.');
    }
  }

  // 상품 리뷰 목록 조회
  async getProductReviews(
    productId: number,
    sort: string = 'latest',
    pagination?: PaginationParams
  ): Promise<ReviewListResponse> {
    try {
      const params = { sort, ...pagination };
      const response = await apiClient.get(API_ENDPOINTS.REVIEWS.GET_PRODUCT_REVIEWS(productId), { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '상품 리뷰를 불러올 수 없습니다.');
    }
  }

  // 내 리뷰 목록 조회
  async getMyReviews(pagination?: PaginationParams): Promise<ReviewListResponse> {
    try {
      const params = pagination || {};
      const response = await apiClient.get(API_ENDPOINTS.REVIEWS.GET_MY_REVIEWS, { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '내 리뷰를 불러올 수 없습니다.');
    }
  }

  // 리뷰 요약 정보 조회
  async getReviewSummary(productId: number): Promise<ReviewSummaryResponse> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.REVIEWS.GET_REVIEW_SUMMARY(productId));
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '리뷰 요약 정보를 불러올 수 없습니다.');
    }
  }

  // 리뷰 도움이 됨 투표
  async voteHelpful(reviewId: number, request: ReviewHelpfulRequest): Promise<ReviewResponse> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.REVIEWS.VOTE_HELPFUL(reviewId), request);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '리뷰 투표에 실패했습니다.');
    }
  }

  // 도움이 됨 투표
  async markAsHelpful(reviewId: number): Promise<ReviewResponse> {
    return this.voteHelpful(reviewId, { type: 'HELPFUL' });
  }

  // 도움이 안 됨 투표
  async markAsUnhelpful(reviewId: number): Promise<ReviewResponse> {
    return this.voteHelpful(reviewId, { type: 'UNHELPFUL' });
  }

  // 최신순 리뷰 조회
  async getProductReviewsByLatest(
    productId: number,
    pagination?: PaginationParams
  ): Promise<ReviewListResponse> {
    return this.getProductReviews(productId, 'latest', pagination);
  }

  // 도움이 된 순 리뷰 조회
  async getProductReviewsByHelpful(
    productId: number,
    pagination?: PaginationParams
  ): Promise<ReviewListResponse> {
    return this.getProductReviews(productId, 'helpful', pagination);
  }
}

export const reviewService = new ReviewService();

