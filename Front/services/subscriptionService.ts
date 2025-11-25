import { apiClient, API_ENDPOINTS } from './apiConfig';

export interface SubscriptionCreateRequest {
  productId: number;
  quantity: number;
  frequency: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
  deliveryDate: number;
  shippingAddress: string;
  paymentMethod: string;
  isActive?: boolean;
  specialInstructions?: string;
}

export interface SubscriptionUpdateRequest {
  quantity?: number;
  frequency?: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
  deliveryDate?: number;
  shippingAddress?: string;
  paymentMethod?: string;
  specialInstructions?: string;
}

export interface SubscriptionItemResponse {
  id: number;
  productId: number;
  productName?: string;
  productImageUrl?: string;
  productPrice?: number;
  quantity: number;
  totalPrice: number;
}

export interface SubscriptionResponse {
  id: number;
  userId: number;
  subscriptionNumber?: string;
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'PENDING' | 'EXPIRED';
  frequency: string;
  deliveryDate: number;
  nextDeliveryDate?: string;
  lastDeliveryDate?: string;
  shippingAddress: string;
  paymentMethod: string;
  totalAmount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  specialInstructions?: string;
  items: SubscriptionItemResponse[];
}

export interface SubscriptionDetailResponse {
  id: number;
  userId: number;
  subscriptionNumber?: string;
  status: string;
  frequency: string;
  deliveryDate: number;
  nextDeliveryDate?: string;
  lastDeliveryDate?: string;
  shippingAddress: string;
  paymentMethod: string;
  totalAmount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  specialInstructions?: string;
  items: SubscriptionItemResponse[];
  deliveryHistory?: SubscriptionDeliveryHistory[];
  upcomingDeliveries?: UpcomingDelivery[];
}

export interface SubscriptionDeliveryHistory {
  id: number;
  subscriptionId: number;
  deliveryDate: string;
  status: 'DELIVERED' | 'FAILED' | 'CANCELLED' | 'PENDING';
  trackingNumber?: string;
  deliveredAt?: string;
  items: SubscriptionItemResponse[];
}

export interface UpcomingDelivery {
  scheduledDate: string;
  items: SubscriptionItemResponse[];
  estimatedAmount: number;
}

export interface SubscriptionListResponse {
  subscriptions: SubscriptionResponse[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
}

class SubscriptionService {
  async getSubscriptions(pagination?: PaginationParams): Promise<SubscriptionListResponse> {
    try {
      const params = pagination || {};
      const response = await apiClient.get(API_ENDPOINTS.SUBSCRIPTIONS.LIST, { params });
      return response.data;
    } catch (error: any) {
      console.error('Get subscriptions failed:', error);
      throw new Error(error.response?.data?.message || '정기구독 목록을 불러올 수 없습니다.');
    }
  }

  async createSubscription(request: SubscriptionCreateRequest): Promise<SubscriptionResponse> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.SUBSCRIPTIONS.CREATE, request);
      return response.data;
    } catch (error: any) {
      console.error('Create subscription failed:', error);
      throw new Error(error.response?.data?.message || '정기구독 생성에 실패했습니다.');
    }
  }

  async getSubscription(subscriptionId: number): Promise<SubscriptionDetailResponse> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.SUBSCRIPTIONS.DETAIL(subscriptionId));
      return response.data;
    } catch (error: any) {
      console.error('Get subscription failed:', error);
      throw new Error(error.response?.data?.message || '정기구독 정보를 불러올 수 없습니다.');
    }
  }

  async updateSubscription(subscriptionId: number, request: SubscriptionUpdateRequest): Promise<SubscriptionResponse> {
    try {
      const response = await apiClient.put(API_ENDPOINTS.SUBSCRIPTIONS.UPDATE(subscriptionId), request);
      return response.data;
    } catch (error: any) {
      console.error('Update subscription failed:', error);
      throw new Error(error.response?.data?.message || '정기구독 수정에 실패했습니다.');
    }
  }

  async pauseSubscription(subscriptionId: number): Promise<SubscriptionResponse> {
    try {
      const response = await apiClient.put(API_ENDPOINTS.SUBSCRIPTIONS.PAUSE(subscriptionId));
      return response.data;
    } catch (error: any) {
      console.error('Pause subscription failed:', error);
      throw new Error(error.response?.data?.message || '정기구독 일시정지에 실패했습니다.');
    }
  }

  async resumeSubscription(subscriptionId: number): Promise<SubscriptionResponse> {
    try {
      const response = await apiClient.put(API_ENDPOINTS.SUBSCRIPTIONS.RESUME(subscriptionId));
      return response.data;
    } catch (error: any) {
      console.error('Resume subscription failed:', error);
      throw new Error(error.response?.data?.message || '정기구독 재개에 실패했습니다.');
    }
  }

  async cancelSubscription(subscriptionId: number): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.SUBSCRIPTIONS.CANCEL(subscriptionId));
    } catch (error: any) {
      console.error('Cancel subscription failed:', error);
      throw new Error(error.response?.data?.message || '정기구독 취소에 실패했습니다.');
    }
  }

  async getSubscriptionHistory(subscriptionId: number): Promise<SubscriptionDeliveryHistory[]> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.SUBSCRIPTIONS.HISTORY(subscriptionId));
      return response.data;
    } catch (error: any) {
      console.error('Get subscription history failed:', error);
      throw new Error(error.response?.data?.message || '정기구독 이력을 불러올 수 없습니다.');
    }
  }

  async getActiveSubscriptions(pagination?: PaginationParams): Promise<SubscriptionListResponse> {
    try {
      const params = { status: 'ACTIVE', ...pagination };
      const response = await apiClient.get(API_ENDPOINTS.SUBSCRIPTIONS.LIST, { params });
      return response.data;
    } catch (error: any) {
      console.error('Get active subscriptions failed:', error);
      throw new Error(error.response?.data?.message || '활성 정기구독을 불러올 수 없습니다.');
    }
  }

  async getPausedSubscriptions(pagination?: PaginationParams): Promise<SubscriptionListResponse> {
    try {
      const params = { status: 'PAUSED', ...pagination };
      const response = await apiClient.get(API_ENDPOINTS.SUBSCRIPTIONS.LIST, { params });
      return response.data;
    } catch (error: any) {
      console.error('Get paused subscriptions failed:', error);
      throw new Error(error.response?.data?.message || '일시정지된 정기구독을 불러올 수 없습니다.');
    }
  }

  async getCancelledSubscriptions(pagination?: PaginationParams): Promise<SubscriptionListResponse> {
    try {
      const params = { status: 'CANCELLED', ...pagination };
      const response = await apiClient.get(API_ENDPOINTS.SUBSCRIPTIONS.LIST, { params });
      return response.data;
    } catch (error: any) {
      console.error('Get cancelled subscriptions failed:', error);
      throw new Error(error.response?.data?.message || '취소된 정기구독을 불러올 수 없습니다.');
    }
  }

  async getSubscriptionsByFrequency(frequency: string, pagination?: PaginationParams): Promise<SubscriptionListResponse> {
    try {
      const params = { frequency, ...pagination };
      const response = await apiClient.get(API_ENDPOINTS.SUBSCRIPTIONS.LIST, { params });
      return response.data;
    } catch (error: any) {
      console.error('Get subscriptions by frequency failed:', error);
      throw new Error(error.response?.data?.message || '주기별 정기구독을 불러올 수 없습니다.');
    }
  }

  async getWeeklySubscriptions(pagination?: PaginationParams): Promise<SubscriptionListResponse> {
    return this.getSubscriptionsByFrequency('WEEKLY', pagination);
  }

  async getBiweeklySubscriptions(pagination?: PaginationParams): Promise<SubscriptionListResponse> {
    return this.getSubscriptionsByFrequency('BIWEEKLY', pagination);
  }

  async getMonthlySubscriptions(pagination?: PaginationParams): Promise<SubscriptionListResponse> {
    return this.getSubscriptionsByFrequency('MONTHLY', pagination);
  }

  async getUpcomingDeliveries(): Promise<UpcomingDelivery[]> {
    try {
      const activeSubscriptions = await this.getActiveSubscriptions();
      const upcomingDeliveries: UpcomingDelivery[] = [];

      for (const subscription of activeSubscriptions.subscriptions) {
        if (subscription.nextDeliveryDate) {
          upcomingDeliveries.push({
            scheduledDate: subscription.nextDeliveryDate,
            items: subscription.items,
            estimatedAmount: subscription.totalAmount
          });
        }
      }

      return upcomingDeliveries.sort((a, b) =>
        new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
      );
    } catch (error: any) {
      console.error('Get upcoming deliveries failed:', error);
      throw new Error('예정된 배송을 불러올 수 없습니다.');
    }
  }

  async changeDeliveryFrequency(subscriptionId: number, frequency: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY'): Promise<SubscriptionResponse> {
    return this.updateSubscription(subscriptionId, { frequency });
  }

  async changeDeliveryDate(subscriptionId: number, deliveryDate: number): Promise<SubscriptionResponse> {
    return this.updateSubscription(subscriptionId, { deliveryDate });
  }

  async changeQuantity(subscriptionId: number, quantity: number): Promise<SubscriptionResponse> {
    return this.updateSubscription(subscriptionId, { quantity });
  }

  async changeShippingAddress(subscriptionId: number, shippingAddress: string): Promise<SubscriptionResponse> {
    return this.updateSubscription(subscriptionId, { shippingAddress });
  }

  async changePaymentMethod(subscriptionId: number, paymentMethod: string): Promise<SubscriptionResponse> {
    return this.updateSubscription(subscriptionId, { paymentMethod });
  }

  async updateSpecialInstructions(subscriptionId: number, specialInstructions: string): Promise<SubscriptionResponse> {
    return this.updateSubscription(subscriptionId, { specialInstructions });
  }

  async getTotalSubscriptionValue(): Promise<number> {
    try {
      const activeSubscriptions = await this.getActiveSubscriptions();
      return activeSubscriptions.subscriptions.reduce((total, subscription) =>
        total + subscription.totalAmount, 0
      );
    } catch (error: any) {
      console.error('Get total subscription value failed:', error);
      throw new Error('정기구독 총 금액을 계산할 수 없습니다.');
    }
  }

  async getSubscriptionStats(): Promise<{
    totalActive: number;
    totalPaused: number;
    totalCancelled: number;
    totalValue: number;
  }> {
    try {
      const [active, paused, cancelled] = await Promise.all([
        this.getActiveSubscriptions({ size: 1 }),
        this.getPausedSubscriptions({ size: 1 }),
        this.getCancelledSubscriptions({ size: 1 })
      ]);

      const totalValue = await this.getTotalSubscriptionValue();

      return {
        totalActive: active.totalElements,
        totalPaused: paused.totalElements,
        totalCancelled: cancelled.totalElements,
        totalValue
      };
    } catch (error: any) {
      console.error('Get subscription stats failed:', error);
      throw new Error('정기구독 통계를 불러올 수 없습니다.');
    }
  }
}

export const subscriptionService = new SubscriptionService();