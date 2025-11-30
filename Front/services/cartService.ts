import { apiClient, API_ENDPOINTS } from './apiConfig';

export interface CartItemRequest {
  productId: number;
  quantity: number;
}

export interface CartItemResponse {
  id: number;
  product: {
    id: number;
    name: string;
    price: number;
    imageUrl?: string;
    stockQuantity?: number;
    status?: string;
  };
  quantity: number;
  totalPrice: number;
  // 프론트엔드에서 사용하는 추가 필드
  isSelected?: boolean;
  isAvailable?: boolean;
}

export interface CartSummary {
  totalItems: number;
  totalSelectedItems: number;
  totalPrice: number;
  totalSelectedPrice: number;
  shippingCost: number;
  finalPrice: number;
  availableForCheckout: boolean;
}

class CartService {
  async getCart(): Promise<CartItemResponse[]> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CART.GET);
      return response.data; // 백엔드는 List<CartResponse> 반환
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '장바구니를 불러올 수 없습니다.');
    }
  }

  async addItemToCart(request: CartItemRequest): Promise<CartItemResponse> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.CART.ADD_ITEM, request);
      return response.data; // 백엔드는 CartResponse 반환
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '상품을 장바구니에 추가할 수 없습니다.');
    }
  }

  async updateCartItem(itemId: number, quantity: number): Promise<CartItemResponse> {
    try {
      const response = await apiClient.put(API_ENDPOINTS.CART.UPDATE_ITEM(itemId), null, {
        params: { quantity }
      });
      return response.data; // 백엔드는 CartResponse 반환
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '장바구니 상품을 수정할 수 없습니다.');
    }
  }

  async removeCartItem(itemId: number): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.CART.REMOVE_ITEM(itemId));
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '장바구니에서 상품을 제거할 수 없습니다.');
    }
  }

  async clearCart(): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.CART.CLEAR);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '장바구니를 비울 수 없습니다.');
    }
  }

  async increaseItemQuantity(itemId: number): Promise<CartItemResponse> {
    try {
      const cart = await this.getCart();
      const item = cart.find(item => item.id === itemId);
      if (!item) {
        throw new Error('상품을 찾을 수 없습니다.');
      }
      return this.updateCartItem(itemId, item.quantity + 1);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '상품 수량을 증가시킬 수 없습니다.');
    }
  }

  async decreaseItemQuantity(itemId: number): Promise<CartItemResponse | void> {
    try {
      const cart = await this.getCart();
      const item = cart.find(item => item.id === itemId);
      if (!item) {
        throw new Error('상품을 찾을 수 없습니다.');
      }
      if (item.quantity <= 1) {
        return this.removeCartItem(itemId);
      }
      return this.updateCartItem(itemId, item.quantity - 1);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '상품 수량을 감소시킬 수 없습니다.');
    }
  }

  async setItemQuantity(itemId: number, quantity: number): Promise<CartItemResponse | void> {
    if (quantity <= 0) {
      return this.removeCartItem(itemId);
    }
    return this.updateCartItem(itemId, quantity);
  }

  async getCartSummary(): Promise<CartSummary> {
    try {
      const cart = await this.getCart();

      const totalItems = cart.length;
      const totalSelectedItems = cart.filter(item => item.isSelected).length;
      const totalPrice = cart.reduce((sum, item) => sum + item.totalPrice, 0);
      const totalSelectedPrice = cart
        .filter(item => item.isSelected)
        .reduce((sum, item) => sum + item.totalPrice, 0);

      const shippingCost = totalSelectedPrice >= 50000 ? 0 : 3000;
      const finalPrice = totalSelectedPrice + shippingCost;

      const availableForCheckout = totalSelectedItems > 0 &&
        cart.filter(item => item.isSelected).every(item => item.isAvailable);

      return {
        totalItems,
        totalSelectedItems,
        totalPrice,
        totalSelectedPrice,
        shippingCost,
        finalPrice,
        availableForCheckout
      };
    } catch (error: any) {
      throw new Error('장바구니 요약 정보를 계산할 수 없습니다.');
    }
  }

  async getSelectedItems(): Promise<CartItemResponse[]> {
    try {
      const cart = await this.getCart();
      return cart.filter(item => item.isSelected);
    } catch (error: any) {
      throw new Error('선택한 상품들을 불러올 수 없습니다.');
    }
  }

  async hasItemInCart(productId: number): Promise<boolean> {
    try {
      const cart = await this.getCart();
      return cart.some(item => item.productId === productId);
    } catch (error: any) {
      return false;
    }
  }

  async getCartItemCount(): Promise<number> {
    try {
      const cart = await this.getCart();
      return cart.length;
    } catch (error: any) {
      return 0;
    }
  }

  async addMultipleItems(items: CartItemRequest[]): Promise<CartItemResponse[]> {
    try {
      for (const item of items) {
        await this.addItemToCart(item);
      }
      return await this.getCart();
    } catch (error: any) {
      throw new Error('여러 상품을 장바구니에 추가할 수 없습니다.');
    }
  }

  async validateCartItems(): Promise<{ valid: boolean; invalidItems: CartItemResponse[] }> {
    try {
      const cart = await this.getCart();
      const invalidItems = cart.filter(item => !item.isAvailable || (item.stock && item.quantity > item.stock));

      return {
        valid: invalidItems.length === 0,
        invalidItems
      };
    } catch (error: any) {
      throw new Error('장바구니 상품 유효성을 확인할 수 없습니다.');
    }
  }

  async syncCartWithServer(): Promise<CartItemResponse[]> {
    try {
      return await this.getCart();
    } catch (error: any) {
      throw new Error('장바구니 동기화에 실패했습니다.');
    }
  }
}

export const cartService = new CartService();