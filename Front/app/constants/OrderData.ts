// 주문 상태 타입
export type OrderStatus = 
  | "payment_pending"    // 결제 대기
  | "payment_complete"   // 결제 완료
  | "preparing"          // 상품 준비중
  | "shipping"           // 배송중
  | "delivered"          // 배송 완료
  | "cancelled";         // 취소됨

// 주문 아이템 인터페이스
export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  brand: string;
  quantity: number;
  price: number;
  options?: string;
}

// 주문 인터페이스
export interface Order {
  id: string;
  orderNumber: string;
  orderDate: string;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  deliveryFee: number;
  finalAmount: number;
  recipientName: string;
  recipientPhone: string;
  deliveryAddress: string;
  deliveryRequest?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

// 주문 상태 한글 변환
export const getOrderStatusText = (status: OrderStatus): string => {
  const statusMap: Record<OrderStatus, string> = {
    payment_pending: "결제 대기",
    payment_complete: "결제 완료",
    preparing: "상품 준비중",
    shipping: "배송중",
    delivered: "배송 완료",
    cancelled: "취소됨",
  };
  return statusMap[status];
};

// 주문 상태 색상
export const getOrderStatusColor = (status: OrderStatus): string => {
  const colorMap: Record<OrderStatus, string> = {
    payment_pending: "#FFA500",
    payment_complete: "#4A90E2",
    preparing: "#9B59B6",
    shipping: "#E67E22",
    delivered: "#27AE60",
    cancelled: "#999",
  };
  return colorMap[status];
};

// 목 데이터
export const ORDER_DATA: Order[] = [
  {
    id: "1",
    orderNumber: "20241019001",
    orderDate: "2024.10.19",
    status: "shipping",
    items: [
      {
        productId: "1",
        productName: "로얄캐닌 독 미니 어덜트",
        productImage: "@dog_food.png",
        brand: "로얄캐닌",
        quantity: 1,
        price: 89000,
      },
      {
        productId: "4",
        productName: "덴탈케어 츄잉스틱",
        productImage: "@dog_snack.png",
        brand: "펫보케어",
        quantity: 2,
        price: 15000,
      },
    ],
    totalAmount: 119000,
    deliveryFee: 0,
    finalAmount: 119000,
    recipientName: "홍길동",
    recipientPhone: "010-1234-5678",
    deliveryAddress: "서울시 강남구 테헤란로 123, 101동 101호",
    deliveryRequest: "문 앞에 놓아주세요",
    trackingNumber: "123456789012",
    estimatedDelivery: "2024.10.20 도착 예정",
  },
  {
    id: "2",
    orderNumber: "20241018001",
    orderDate: "2024.10.18",
    status: "delivered",
    items: [
      {
        productId: "11",
        productName: "로프 터그 토이",
        productImage: "@toy.png",
        brand: "플레이독",
        quantity: 1,
        price: 8500,
      },
    ],
    totalAmount: 8500,
    deliveryFee: 3000,
    finalAmount: 11500,
    recipientName: "홍길동",
    recipientPhone: "010-1234-5678",
    deliveryAddress: "서울시 강남구 테헤란로 123, 101동 101호",
    trackingNumber: "987654321098",
    estimatedDelivery: "배송 완료",
  },
  {
    id: "3",
    orderNumber: "20241015001",
    orderDate: "2024.10.15",
    status: "delivered",
    items: [
      {
        productId: "7",
        productName: "로얄캐닌 피라인 어덜트",
        productImage: "@cat_food.png",
        brand: "로얄캐닌",
        quantity: 1,
        price: 85000,
      },
      {
        productId: "9",
        productName: "츄르 참치맛",
        productImage: "@cat_snack.png",
        brand: "챠오",
        quantity: 3,
        price: 12000,
      },
    ],
    totalAmount: 121000,
    deliveryFee: 0,
    finalAmount: 121000,
    recipientName: "홍길동",
    recipientPhone: "010-1234-5678",
    deliveryAddress: "서울시 강남구 테헤란로 123, 101동 101호",
    trackingNumber: "456789123456",
    estimatedDelivery: "배송 완료",
  },
  {
    id: "4",
    orderNumber: "20241010001",
    orderDate: "2024.10.10",
    status: "preparing",
    items: [
      {
        productId: "18",
        productName: "겨울용 패딩 점퍼",
        productImage: "@clothing.png",
        brand: "펫패션",
        quantity: 1,
        price: 38000,
        options: "사이즈: M",
      },
    ],
    totalAmount: 38000,
    deliveryFee: 0,
    finalAmount: 38000,
    recipientName: "홍길동",
    recipientPhone: "010-1234-5678",
    deliveryAddress: "서울시 강남구 테헤란로 123, 101동 101호",
    estimatedDelivery: "2024.10.21 도착 예정",
  },
  {
    id: "5",
    orderNumber: "20241005001",
    orderDate: "2024.10.05",
    status: "cancelled",
    items: [
      {
        productId: "20",
        productName: "자동 리드줄",
        productImage: "@outdoor.png",
        brand: "플렉시리드",
        quantity: 1,
        price: 35000,
      },
    ],
    totalAmount: 35000,
    deliveryFee: 3000,
    finalAmount: 38000,
    recipientName: "홍길동",
    recipientPhone: "010-1234-5678",
    deliveryAddress: "서울시 강남구 테헤란로 123, 101동 101호",
    deliveryRequest: "배송 전 연락주세요",
  },
];

export default ORDER_DATA;

