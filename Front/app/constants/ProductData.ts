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
  favoriteCount: number;
}

export const PRODUCT_DATA: Product[] = [
  // 강아지 사료 카테고리
  {
    id: "1",
    name: "로얄캐닌 독 미니 어덜트",
    price: 89000,
    originalPrice: 95000,
    category: "강아지 사료",
    image: "@dog_food.png",
    rating: 4.8,
    reviewCount: 1234,
    description: "소형견을 위한 프리미엄 사료",
    brand: "로얄캐닌",
    discount: 6,
    favoriteCount: 15200,
  },
  {
    id: "2",
    name: "힐스 사이언스 다이어트",
    price: 75000,
    category: "강아지 사료",
    image: "@dog_food.png",
    rating: 4.6,
    reviewCount: 892,
    description: "성견용 건강 관리 사료",
    brand: "힐스",
    favoriteCount: 8900,
  },
  {
    id: "3",
    name: "오리젠 어덜트 독",
    price: 120000,
    originalPrice: 135000,
    category: "강아지 사료",
    image: "@dog_food.png",
    rating: 4.9,
    reviewCount: 567,
    description: "자연 원료 프리미엄 사료",
    brand: "오리젠",
    discount: 11,
    favoriteCount: 23400,
  },

  // 강아지 간식 카테고리
  {
    id: "4",
    name: "덴탈케어 츄잉스틱",
    price: 15000,
    originalPrice: 18000,
    category: "강아지 간식",
    image: "@dog_snack.png",
    rating: 4.7,
    reviewCount: 2156,
    description: "치석 제거와 구강 건강을 위한 간식",
    brand: "펫보케어",
    discount: 17,
    favoriteCount: 31500,
  },
  {
    id: "5",
    name: "연어 트리츠",
    price: 8000,
    category: "강아지 간식",
    image: "@dog_snack.png",
    rating: 4.5,
    reviewCount: 1423,
    description: "신선한 연어로 만든 건강 간식",
    brand: "네이처펫",
    favoriteCount: 12800,
  },
  {
    id: "6",
    name: "동결건조 닭가슴살",
    price: 12000,
    category: "강아지 간식",
    image: "@dog_snack.png",
    rating: 4.8,
    reviewCount: 987,
    description: "100% 자연 원료 프리미엄 간식",
    brand: "퓨어바이트",
    favoriteCount: 18900,
  },

  // 고양이 사료 카테고리
  {
    id: "7",
    name: "로얄캐닌 피라인 어덜트",
    price: 85000,
    originalPrice: 92000,
    category: "고양이 사료",
    image: "@cat_food.png",
    rating: 4.7,
    reviewCount: 1089,
    description: "성묘를 위한 균형 잡힌 영양 사료",
    brand: "로얄캐닌",
    discount: 8,
    favoriteCount: 14300,
  },
  {
    id: "8",
    name: "힐스 고양이 사료",
    price: 68000,
    category: "고양이 사료",
    image: "@cat_food.png",
    rating: 4.6,
    reviewCount: 756,
    description: "건강한 소화를 위한 프리미엄 사료",
    brand: "힐스",
    favoriteCount: 9200,
  },

  // 고양이 간식 카테고리
  {
    id: "9",
    name: "츄르 참치맛",
    price: 12000,
    originalPrice: 15000,
    category: "고양이 간식",
    image: "@cat_snack.png",
    rating: 4.9,
    reviewCount: 3421,
    description: "고양이가 사랑하는 크리미한 간식",
    brand: "챠오",
    discount: 20,
    favoriteCount: 45600,
  },
  {
    id: "10",
    name: "동결건조 연어큐브",
    price: 18000,
    category: "고양이 간식",
    image: "@cat_snack.png",
    rating: 4.7,
    reviewCount: 892,
    description: "100% 연어로 만든 영양 간식",
    brand: "네이처펫",
    favoriteCount: 11200,
  },

  // 장난감 카테고리
  {
    id: "11",
    name: "로프 터그 토이",
    price: 8500,
    originalPrice: 12000,
    category: "장난감",
    image: "@toy.png",
    rating: 4.4,
    reviewCount: 756,
    description: "튼튼한 면 로프로 만든 놀이 장난감",
    brand: "플레이독",
    discount: 29,
    favoriteCount: 7800,
  },
  {
    id: "12",
    name: "스마트 볼 장난감",
    price: 35000,
    category: "장난감",
    image: "@toy.png",
    rating: 4.6,
    reviewCount: 432,
    description: "자동으로 움직이는 인터랙티브 볼",
    brand: "스마트펫",
    favoriteCount: 5600,
  },
  {
    id: "13",
    name: "퍼즐 트리츠 디스펜서",
    price: 25000,
    originalPrice: 30000,
    category: "장난감",
    image: "@toy.png",
    rating: 4.7,
    reviewCount: 623,
    description: "지능 발달을 위한 퍼즐 장난감",
    brand: "브레인게임",
    discount: 17,
    favoriteCount: 9400,
  },

  // 배변용품 카테고리
  {
    id: "14",
    name: "자동 고양이 화장실",
    price: 385000,
    originalPrice: 420000,
    category: "배변용품",
    image: "@toilet.png",
    rating: 4.8,
    reviewCount: 234,
    description: "자동 청소 기능의 스마트 화장실",
    brand: "캣지니",
    discount: 8,
    favoriteCount: 3200,
  },
  {
    id: "15",
    name: "강아지 배변패드 100매",
    price: 28000,
    category: "배변용품",
    image: "@toilet.png",
    rating: 4.5,
    reviewCount: 1567,
    description: "흡수력 좋은 대용량 배변패드",
    brand: "퓨어펫",
    favoriteCount: 22100,
  },

  // 미용 용품 카테고리
  {
    id: "16",
    name: "프리미엄 브러쉬 세트",
    price: 45000,
    originalPrice: 52000,
    category: "미용 용품",
    image: "@grooming.png",
    rating: 4.6,
    reviewCount: 432,
    description: "털 빠짐 감소를 위한 전문가용 브러쉬",
    brand: "그루밍프로",
    discount: 13,
    favoriteCount: 6700,
  },
  {
    id: "17",
    name: "무자극 샴푸",
    price: 22000,
    category: "미용 용품",
    image: "@grooming.png",
    rating: 4.7,
    reviewCount: 892,
    description: "민감한 피부를 위한 천연 샴푸",
    brand: "네이처클린",
    favoriteCount: 13500,
  },

  // 의류 카테고리
  {
    id: "18",
    name: "겨울용 패딩 점퍼",
    price: 38000,
    originalPrice: 45000,
    category: "의류",
    image: "@clothing.png",
    rating: 4.8,
    reviewCount: 567,
    description: "따뜻한 겨울용 강아지 외투",
    brand: "펫패션",
    discount: 16,
    favoriteCount: 8900,
  },
  {
    id: "19",
    name: "레인코트",
    price: 18000,
    category: "의류",
    image: "@clothing.png",
    rating: 4.5,
    reviewCount: 345,
    description: "비오는 날 필수 방수 레인코트",
    brand: "레이니독",
    favoriteCount: 4200,
  },

  // 외출 용품 카테고리
  {
    id: "20",
    name: "자동 리드줄",
    price: 35000,
    originalPrice: 42000,
    category: "외출 용품",
    image: "@outdoor.png",
    rating: 4.7,
    reviewCount: 1234,
    description: "5m 자동 감김 리드줄",
    brand: "플렉시리드",
    discount: 17,
    favoriteCount: 16800,
  },
  {
    id: "21",
    name: "이동가방 백팩",
    price: 68000,
    category: "외출 용품",
    image: "@outdoor.png",
    rating: 4.6,
    reviewCount: 456,
    description: "통풍이 잘되는 편안한 이동가방",
    brand: "트래블펫",
    favoriteCount: 7300,
  },

  // 하우스/침대 카테고리
  {
    id: "22",
    name: "메모리폼 침대",
    price: 85000,
    originalPrice: 98000,
    category: "하우스/침대",
    image: "@house.png",
    rating: 4.8,
    reviewCount: 789,
    description: "관절 보호 메모리폼 펫 침대",
    brand: "컴포트하우스",
    discount: 13,
    favoriteCount: 11900,
  },
  {
    id: "23",
    name: "실내 하우스",
    price: 125000,
    category: "하우스/침대",
    image: "@house.png",
    rating: 4.7,
    reviewCount: 345,
    description: "아늑한 나만의 공간 펫 하우스",
    brand: "코지홈",
    favoriteCount: 5400,
  },
];

export const getProductsByCategory = (category: string): Product[] => {
  if (category === "전체") {
    return PRODUCT_DATA;
  }
  return PRODUCT_DATA.filter((product) => product.category === category);
};

export default PRODUCT_DATA;
