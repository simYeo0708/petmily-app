import { apiClient, API_ENDPOINTS } from './apiConfig';

export interface CartItemRequest {
  productId: number;
  quantity: number;
}

export interface CartItemUpdateRequest {
  quantity: number;
}

export interface CartItemResponse {
  id: number;
  productId: number;
  productName?: string;
  productImageUrl?: string;
  productPrice?: number;
  quantity: number;
  totalPrice: number;
  isSelected: boolean;
  isAvailable?: boolean;
  stock?: number;
}

export interface CartResponse {
  id: number;
  userId: number;
  items: CartItemResponse[];
  totalItems: number;
  totalSelectedItems: number;
  totalPrice: number;
  totalSelectedPrice: number;
  updatedAt: string;
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
  async getCart(): Promise<CartResponse> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CART.GET);
      return response.data;
    } catch (error: any) {
      console.error('Get cart failed:', error);
      throw new Error(error.response?.data?.message || '장바구니를 불러올 수 없습니다.');
    }
  }

  async addItemToCart(request: CartItemRequest): Promise<CartResponse> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.CART.ADD_ITEM, request);
      return response.data;
    } catch (error: any) {
      console.error('Add item to cart failed:', error);
      throw new Error(error.response?.data?.message || '상품을 장바구니에 추가할 수 없습니다.');
    }
  }

  async updateCartItem(itemId: number, request: CartItemUpdateRequest): Promise<CartResponse> {
    try {
      const response = await apiClient.put(API_ENDPOINTS.CART.UPDATE_ITEM(itemId), request);
      return response.data;
    } catch (error: any) {
      console.error('Update cart item failed:', error);
      throw new Error(error.response?.data?.message || '장바구니 상품을 수정할 수 없습니다.');
    }
  }

  async removeCartItem(itemId: number): Promise<CartResponse> {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.CART.REMOVE_ITEM(itemId));
      return response.data;
    } catch (error: any) {
      console.error('Remove cart item failed:', error);
      throw new Error(error.response?.data?.message || '장바구니에서 상품을 제거할 수 없습니다.');
    }
  }

  async toggleItemSelection(itemId: number): Promise<CartResponse> {
    try {
      const response = await apiClient.put(API_ENDPOINTS.CART.TOGGLE_SELECT(itemId));
      return response.data;
    } catch (error: any) {
      console.error('Toggle item selection failed:', error);
      throw new Error(error.response?.data?.message || '상품 선택을 변경할 수 없습니다.');
    }
  }

  async clearCart(): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.CART.CLEAR);
    } catch (error: any) {
      console.error('Clear cart failed:', error);
      throw new Error(error.response?.data?.message || '장바구니를 비울 수 없습니다.');
    }
  }

  async removeSelectedItems(): Promise<CartResponse> {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.CART.REMOVE_SELECTED);
      return response.data;
    } catch (error: any) {
      console.error('Remove selected items failed:', error);
      throw new Error(error.response?.data?.message || '선택한 상품들을 제거할 수 없습니다.');
    }
  }

  async increaseItemQuantity(itemId: number): Promise<CartResponse> {
    try {
      const cart = await this.getCart();
      const item = cart.items.find(item => item.id === itemId);
      if (!item) {
        throw new Error('상품을 찾을 수 없습니다.');
      }
      return this.updateCartItem(itemId, { quantity: item.quantity + 1 });
    } catch (error: any) {
      console.error('Increase item quantity failed:', error);
      throw new Error(error.response?.data?.message || '상품 수량을 증가시킬 수 없습니다.');
    }
  }

  async decreaseItemQuantity(itemId: number): Promise<CartResponse> {
    try {
      const cart = await this.getCart();
      const item = cart.items.find(item => item.id === itemId);
      if (!item) {
        throw new Error('상품을 찾을 수 없습니다.');
      }
      if (item.quantity <= 1) {
        return this.removeCartItem(itemId);
      }
      return this.updateCartItem(itemId, { quantity: item.quantity - 1 });
    } catch (error: any) {
      console.error('Decrease item quantity failed:', error);
      throw new Error(error.response?.data?.message || '상품 수량을 감소시킬 수 없습니다.');
    }
  }

  async setItemQuantity(itemId: number, quantity: number): Promise<CartResponse> {
    if (quantity <= 0) {
      return this.removeCartItem(itemId);
    }
    return this.updateCartItem(itemId, { quantity });
  }

  async selectAllItems(): Promise<CartResponse> {
    try {
      const cart = await this.getCart();
      let updatedCart = cart;

      for (const item of cart.items) {
        if (!item.isSelected && item.isAvailable) {
          updatedCart = await this.toggleItemSelection(item.id);
        }
      }

      return updatedCart;
    } catch (error: any) {
      console.error('Select all items failed:', error);
      throw new Error('모든 상품을 선택할 수 없습니다.');
    }
  }

  async deselectAllItems(): Promise<CartResponse> {
    try {
      const cart = await this.getCart();
      let updatedCart = cart;

      for (const item of cart.items) {
        if (item.isSelected) {
          updatedCart = await this.toggleItemSelection(item.id);
        }
      }

      return updatedCart;
    } catch (error: any) {
      console.error('Deselect all items failed:', error);
      throw new Error('모든 상품 선택을 해제할 수 없습니다.');
    }
  }

  async getCartSummary(): Promise<CartSummary> {
    try {
      const cart = await this.getCart();

      const totalItems = cart.items.length;
      const totalSelectedItems = cart.items.filter(item => item.isSelected).length;
      const totalPrice = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
      const totalSelectedPrice = cart.items
        .filter(item => item.isSelected)
        .reduce((sum, item) => sum + item.totalPrice, 0);

      const shippingCost = totalSelectedPrice >= 50000 ? 0 : 3000;
      const finalPrice = totalSelectedPrice + shippingCost;

      const availableForCheckout = totalSelectedItems > 0 &&
        cart.items.filter(item => item.isSelected).every(item => item.isAvailable);

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
      console.error('Get cart summary failed:', error);
      throw new Error('장바구니 요약 정보를 계산할 수 없습니다.');
    }
  }

  async getSelectedItems(): Promise<CartItemResponse[]> {
    try {
      const cart = await this.getCart();
      return cart.items.filter(item => item.isSelected);
    } catch (error: any) {
      console.error('Get selected items failed:', error);
      throw new Error('선택한 상품들을 불러올 수 없습니다.');
    }
  }

  async hasItemInCart(productId: number): Promise<boolean> {
    try {
      const cart = await this.getCart();
      return cart.items.some(item => item.productId === productId);
    } catch (error: any) {
      console.error('Check item in cart failed:', error);
      return false;
    }
  }

  async getCartItemCount(): Promise<number> {
    try {
      const cart = await this.getCart();
      return cart.totalItems;
    } catch (error: any) {
      console.error('Get cart item count failed:', error);
      return 0;
    }
  }

  async addMultipleItems(items: CartItemRequest[]): Promise<CartResponse> {
    try {
      let cart = await this.getCart();

      for (const item of items) {
        cart = await this.addItemToCart(item);
      }

      return cart;
    } catch (error: any) {
      console.error('Add multiple items failed:', error);
      throw new Error('여러 상품을 장바구니에 추가할 수 없습니다.');
    }
  }

  async validateCartItems(): Promise<{ valid: boolean; invalidItems: CartItemResponse[] }> {
    try {
      const cart = await this.getCart();
      const invalidItems = cart.items.filter(item => !item.isAvailable || (item.stock && item.quantity > item.stock));

      return {
        valid: invalidItems.length === 0,
        invalidItems
      };
    } catch (error: any) {
      console.error('Validate cart items failed:', error);
      throw new Error('장바구니 상품 유효성을 확인할 수 없습니다.');
    }
  }

  async syncCartWithServer(): Promise<CartResponse> {
    try {
      return await this.getCart();
    } catch (error: any) {
      console.error('Sync cart with server failed:', error);
      throw new Error('장바구니 동기화에 실패했습니다.');
    }
  }
}

export const cartService = new CartService();