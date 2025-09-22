//mock data
export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  rating: number;
  reviewCount: number;
  description: string;
  brand: string;
  discount?: number;
}

export const PRODUCT_DATA: Product[] = [
  // 사료 카테고리
  {
    id: "1",
    name: "로얄캐닌 독 미니 어덜트",
    price: 89000,
    originalPrice: 95000,
    category: "사료",
    image: "🥘",
    rating: 4.8,
    reviewCount: 1234,
    description: "소형견을 위한 프리미엄 사료",
    brand: "로얄캐닌",
    discount: 6,
  },
  {
    id: "2",
    name: "힐스 사이언스 다이어트",
    price: 75000,
    category: "사료",
    image: "🥘",
    rating: 4.6,
    reviewCount: 892,
    description: "성견용 건강 관리 사료",
    brand: "힐스",
  },
  {
    id: "3",
    name: "오리젠 어덜트 독",
    price: 120000,
    originalPrice: 135000,
    category: "사료",
    image: "🥘",
    rating: 4.9,
    reviewCount: 567,
    description: "자연 원료 프리미엄 사료",
    brand: "오리젠",
    discount: 11,
  },

  // 간식 카테고리
  {
    id: "4",
    name: "덴탈케어 츄잉스틱",
    price: 15000,
    originalPrice: 18000,
    category: "간식",
    image: "🦴",
    rating: 4.7,
    reviewCount: 2156,
    description: "치석 제거와 구강 건강을 위한 간식",
    brand: "펫보케어",
    discount: 17,
  },
  {
    id: "5",
    name: "연어 트리츠",
    price: 8000,
    category: "간식",
    image: "🦴",
    rating: 4.5,
    reviewCount: 1423,
    description: "신선한 연어로 만든 건강 간식",
    brand: "네이처펫",
  },
  {
    id: "6",
    name: "동결건조 닭가슴살",
    price: 12000,
    category: "간식",
    image: "🦴",
    rating: 4.8,
    reviewCount: 987,
    description: "100% 자연 원료 프리미엄 간식",
    brand: "퓨어바이트",
  },

  // 장난감 카테고리
  {
    id: "7",
    name: "로프 터그 토이",
    price: 8500,
    originalPrice: 12000,
    category: "장난감",
    image: "🧸",
    rating: 4.4,
    reviewCount: 756,
    description: "튼튼한 면 로프로 만든 놀이 장난감",
    brand: "플레이독",
    discount: 29,
  },
  {
    id: "8",
    name: "스마트 볼 장난감",
    price: 35000,
    category: "장난감",
    image: "🧸",
    rating: 4.6,
    reviewCount: 432,
    description: "자동으로 움직이는 인터랙티브 볼",
    brand: "스마트펫",
  },
  {
    id: "9",
    name: "퍼즐 트리츠 디스펜서",
    price: 25000,
    originalPrice: 30000,
    category: "장난감",
    image: "🧸",
    rating: 4.7,
    reviewCount: 623,
    description: "지능 발달을 위한 퍼즐 장난감",
    brand: "브레인게임",
    discount: 17,
  },

  // 용품 카테고리
  {
    id: "10",
    name: "스테인리스 급수기",
    price: 45000,
    originalPrice: 52000,
    category: "용품",
    image: "🎾",
    rating: 4.5,
    reviewCount: 1089,
    description: "자동 순환 정수 급수기",
    brand: "펫세이프",
    discount: 13,
  },
  {
    id: "11",
    name: "메모리폼 쿠션 방석",
    price: 68000,
    category: "용품",
    image: "🎾",
    rating: 4.8,
    reviewCount: 654,
    description: "관절 보호를 위한 메모리폼 방석",
    brand: "컴포트펫",
  },
  {
    id: "12",
    name: "LED 안전 목걸이",
    price: 18000,
    originalPrice: 23000,
    category: "용품",
    image: "🎾",
    rating: 4.3,
    reviewCount: 892,
    description: "야간 산책용 LED 안전 목걸이",
    brand: "세이프워크",
    discount: 22,
  },
];

export const getProductsByCategory = (category: string): Product[] => {
  if (category === "전체") {
    return PRODUCT_DATA;
  }
  return PRODUCT_DATA.filter((product) => product.category === category);
};

export default PRODUCT_DATA;
