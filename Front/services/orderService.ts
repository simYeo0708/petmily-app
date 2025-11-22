import { apiClient, API_ENDPOINTS } from './apiConfig';

export interface OrderItemRequest {
  productId: number;
  quantity: number;
  price: number;
}

export interface OrderCreateRequest {
  items: OrderItemRequest[];
  shippingAddress: string;
  paymentMethod: string;
  totalAmount: number;
  useCoupon?: boolean;
  couponCode?: string;
  deliveryRequest?: string;
}

export interface OrderItemResponse {
  id: number;
  productId: number;
  productName?: string;
  productImageUrl?: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

export interface OrderResponse {
  id: number;
  userId: number;
  orderNumber?: string;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';
  items: OrderItemResponse[];
  shippingAddress: string;
  paymentMethod: string;
  totalAmount: number;
  shippingCost?: number;
  discountAmount?: number;
  finalAmount?: number;
  orderDate: string;
  deliveredDate?: string;
  trackingNumber?: string;
  deliveryRequest?: string;
}

export interface OrderDetailResponse {
  id: number;
  userId: number;
  orderNumber?: string;
  status: string;
  items: OrderItemResponse[];
  shippingAddress: string;
  paymentMethod: string;
  totalAmount: number;
  shippingCost?: number;
  discountAmount?: number;
  finalAmount?: number;
  orderDate: string;
  deliveredDate?: string;
  trackingNumber?: string;
  deliveryRequest?: string;
  statusHistory?: OrderStatusHistory[];
}

export interface OrderStatusHistory {
  id: number;
  orderId: number;
  status: string;
  changedAt: string;
  note?: string;
}

export interface OrderListResponse {
  orders: OrderResponse[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ReturnRequest {
  itemId: number;
  quantity: number;
  reason: string;
  description?: string;
  imageUrls?: string[];
}

export interface ReturnCreateRequest {
  items: ReturnRequest[];
  reason: string;
  description?: string;
}

export interface ReturnResponse {
  id: number;
  orderId: number;
  orderItemId: number;
  quantity: number;
  reason: string;
  description?: string;
  status: 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'COLLECTED' | 'INSPECTED' | 'REFUNDED';
  requestedAt: string;
  processedAt?: string;
  refundAmount?: number;
  adminNote?: string;
}

export interface ReviewCreateRequest {
  rating: number;
  title?: string;
  content: string;
  imageUrls?: string[];
}

export interface ReviewResponse {
  id: number;
  orderId: number;
  userId: number;
  productId: number;
  rating: number;
  title?: string;
  content: string;
  imageUrls?: string[];
  helpfulCount: number;
  isHelpful?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
}

class OrderService {
  async getOrders(pagination?: PaginationParams): Promise<OrderListResponse> {
    try {
      const params = pagination || {};
      const response = await apiClient.get(API_ENDPOINTS.ORDERS.LIST, { params });
      return response.data;
    } catch (error: any) {
      console.error('Get orders failed:', error);
      throw new Error(error.response?.data?.message || '주문 목록을 불러올 수 없습니다.');
    }
  }

  async createOrder(request: OrderCreateRequest): Promise<OrderResponse> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.ORDERS.CREATE, request);
      return response.data;
    } catch (error: any) {
      console.error('Create order failed:', error);
      throw new Error(error.response?.data?.message || '주문 생성에 실패했습니다.');
    }
  }

  async getOrder(orderId: number): Promise<OrderDetailResponse> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ORDERS.DETAIL(orderId));
      return response.data;
    } catch (error: any) {
      console.error('Get order failed:', error);
      throw new Error(error.response?.data?.message || '주문 정보를 불러올 수 없습니다.');
    }
  }

  async cancelOrder(orderId: number): Promise<void> {
    try {
      await apiClient.put(API_ENDPOINTS.ORDERS.CANCEL(orderId));
    } catch (error: any) {
      console.error('Cancel order failed:', error);
      throw new Error(error.response?.data?.message || '주문 취소에 실패했습니다.');
    }
  }

  async confirmOrder(orderId: number): Promise<OrderResponse> {
    try {
      const response = await apiClient.put(API_ENDPOINTS.ORDERS.CONFIRM(orderId));
      return response.data;
    } catch (error: any) {
      console.error('Confirm order failed:', error);
      throw new Error(error.response?.data?.message || '주문 확인에 실패했습니다.');
    }
  }

  async trackOrder(orderId: number): Promise<any> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ORDERS.TRACKING(orderId));
      return response.data;
    } catch (error: any) {
      console.error('Track order failed:', error);
      throw new Error(error.response?.data?.message || '주문 추적에 실패했습니다.');
    }
  }

  async getOrderReturns(orderId: number): Promise<ReturnResponse[]> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ORDERS.RETURNS(orderId));
      return response.data;
    } catch (error: any) {
      console.error('Get order returns failed:', error);
      throw new Error(error.response?.data?.message || '반품 정보를 불러올 수 없습니다.');
    }
  }

  async getReturnDetail(orderId: number, returnId: number): Promise<ReturnResponse> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ORDERS.RETURN_DETAIL(orderId, returnId));
      return response.data;
    } catch (error: any) {
      console.error('Get return detail failed:', error);
      throw new Error(error.response?.data?.message || '반품 상세 정보를 불러올 수 없습니다.');
    }
  }

  async createReturn(orderId: number, request: ReturnCreateRequest): Promise<ReturnResponse> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.ORDERS.CREATE_RETURN(orderId), request);
      return response.data;
    } catch (error: any) {
      console.error('Create return failed:', error);
      throw new Error(error.response?.data?.message || '반품 신청에 실패했습니다.');
    }
  }

  async cancelReturn(orderId: number, returnId: number): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.ORDERS.CANCEL_RETURN(orderId, returnId));
    } catch (error: any) {
      console.error('Cancel return failed:', error);
      throw new Error(error.response?.data?.message || '반품 취소에 실패했습니다.');
    }
  }

  async approveReturn(orderId: number, returnId: number): Promise<ReturnResponse> {
    try {
      const response = await apiClient.put(API_ENDPOINTS.ORDERS.APPROVE_RETURN(orderId, returnId));
      return response.data;
    } catch (error: any) {
      console.error('Approve return failed:', error);
      throw new Error(error.response?.data?.message || '반품 승인에 실패했습니다.');
    }
  }

  async rejectReturn(orderId: number, returnId: number): Promise<ReturnResponse> {
    try {
      const response = await apiClient.put(API_ENDPOINTS.ORDERS.REJECT_RETURN(orderId, returnId));
      return response.data;
    } catch (error: any) {
      console.error('Reject return failed:', error);
      throw new Error(error.response?.data?.message || '반품 거절에 실패했습니다.');
    }
  }

  async collectReturn(orderId: number, returnId: number): Promise<ReturnResponse> {
    try {
      const response = await apiClient.put(API_ENDPOINTS.ORDERS.COLLECT_RETURN(orderId, returnId));
      return response.data;
    } catch (error: any) {
      console.error('Collect return failed:', error);
      throw new Error(error.response?.data?.message || '반품 수거에 실패했습니다.');
    }
  }

  async inspectReturn(orderId: number, returnId: number): Promise<ReturnResponse> {
    try {
      const response = await apiClient.put(API_ENDPOINTS.ORDERS.INSPECT_RETURN(orderId, returnId));
      return response.data;
    } catch (error: any) {
      console.error('Inspect return failed:', error);
      throw new Error(error.response?.data?.message || '반품 검수에 실패했습니다.');
    }
  }

  async refundReturn(orderId: number, returnId: number): Promise<ReturnResponse> {
    try {
      const response = await apiClient.put(API_ENDPOINTS.ORDERS.REFUND_RETURN(orderId, returnId));
      return response.data;
    } catch (error: any) {
      console.error('Refund return failed:', error);
      throw new Error(error.response?.data?.message || '반품 환불에 실패했습니다.');
    }
  }

  async getOrderReview(orderId: number): Promise<ReviewResponse> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ORDERS.REVIEW(orderId));
      return response.data;
    } catch (error: any) {
      console.error('Get order review failed:', error);
      throw new Error(error.response?.data?.message || '리뷰 정보를 불러올 수 없습니다.');
    }
  }

  async createOrderReview(orderId: number, request: ReviewCreateRequest): Promise<ReviewResponse> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.ORDERS.CREATE_REVIEW(orderId), request);
      return response.data;
    } catch (error: any) {
      console.error('Create order review failed:', error);
      throw new Error(error.response?.data?.message || '리뷰 작성에 실패했습니다.');
    }
  }

  async updateOrderReview(orderId: number, request: ReviewCreateRequest): Promise<ReviewResponse> {
    try {
      const response = await apiClient.put(API_ENDPOINTS.ORDERS.UPDATE_REVIEW(orderId), request);
      return response.data;
    } catch (error: any) {
      console.error('Update order review failed:', error);
      throw new Error(error.response?.data?.message || '리뷰 수정에 실패했습니다.');
    }
  }

  async deleteOrderReview(orderId: number): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.ORDERS.DELETE_REVIEW(orderId));
    } catch (error: any) {
      console.error('Delete order review failed:', error);
      throw new Error(error.response?.data?.message || '리뷰 삭제에 실패했습니다.');
    }
  }

  async addReviewHelpful(orderId: number): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.ORDERS.ADD_HELPFUL(orderId));
    } catch (error: any) {
      console.error('Add review helpful failed:', error);
      throw new Error(error.response?.data?.message || '리뷰 도움 표시에 실패했습니다.');
    }
  }

  async removeReviewHelpful(orderId: number): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.ORDERS.REMOVE_HELPFUL(orderId));
    } catch (error: any) {
      console.error('Remove review helpful failed:', error);
      throw new Error(error.response?.data?.message || '리뷰 도움 취소에 실패했습니다.');
    }
  }

  async getOrdersByStatus(status: string, pagination?: PaginationParams): Promise<OrderListResponse> {
    try {
      const params = { status, ...pagination };
      const response = await apiClient.get(API_ENDPOINTS.ORDERS.LIST, { params });
      return response.data;
    } catch (error: any) {
      console.error('Get orders by status failed:', error);
      throw new Error(error.response?.data?.message || '상태별 주문을 불러올 수 없습니다.');
    }
  }

  async getPendingOrders(pagination?: PaginationParams): Promise<OrderListResponse> {
    return this.getOrdersByStatus('PENDING', pagination);
  }

  async getConfirmedOrders(pagination?: PaginationParams): Promise<OrderListResponse> {
    return this.getOrdersByStatus('CONFIRMED', pagination);
  }

  async getShippedOrders(pagination?: PaginationParams): Promise<OrderListResponse> {
    return this.getOrdersByStatus('SHIPPED', pagination);
  }

  async getDeliveredOrders(pagination?: PaginationParams): Promise<OrderListResponse> {
    return this.getOrdersByStatus('DELIVERED', pagination);
  }

  async getCancelledOrders(pagination?: PaginationParams): Promise<OrderListResponse> {
    return this.getOrdersByStatus('CANCELLED', pagination);
  }

  async getOrdersOrderByLatest(pagination?: PaginationParams): Promise<OrderListResponse> {
    const params = { sort: 'orderDate,desc', ...pagination };
    try {
      const response = await apiClient.get(API_ENDPOINTS.ORDERS.LIST, { params });
      return response.data;
    } catch (error: any) {
      console.error('Get orders order by latest failed:', error);
      throw new Error(error.response?.data?.message || '최신 주문을 불러올 수 없습니다.');
    }
  }

  async getOrdersByDateRange(startDate: string, endDate: string, pagination?: PaginationParams): Promise<OrderListResponse> {
    const params = { startDate, endDate, ...pagination };
    try {
      const response = await apiClient.get(API_ENDPOINTS.ORDERS.LIST, { params });
      return response.data;
    } catch (error: any) {
      console.error('Get orders by date range failed:', error);
      throw new Error(error.response?.data?.message || '기간별 주문을 불러올 수 없습니다.');
    }
  }
}

export const orderService = new OrderService();