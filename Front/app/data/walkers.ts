/**
 * 워커 관련 샘플 데이터
 * 워커 선택, 매칭 화면에서 사용되는 데이터
 */

export interface WalkerReview {
  id: string;
  rating: number;
  comment: string;
  date: string;
  author: string;
}

export interface Walker {
  id: string;
  name: string;
  distance?: string;
  rating: number;
  reviewCount: number;
  experience: string;
  introduction?: string;
  bio?: string;
  profileImage: string;
  availableTimes?: string[];
  reviews?: WalkerReview[];
  hourlyRate?: number;
  isAvailable?: boolean;
  location?: string;
  // 기타 확장 가능한 필드들
  [key: string]: any;
}

// 워커 선택 화면용 샘플 데이터
export const WALKER_SELECTION_DATA: Walker[] = [
  {
    id: "1",
    name: "김민지 워커",
    distance: "0.5km",
    rating: 4.8,
    reviewCount: 127,
    experience: "3년 경험",
    introduction: "안녕하세요! 반려동물을 사랑하는 김민지입니다. 3년간 다양한 견종의 산책을 도와드렸습니다.",
    profileImage: "👩‍🦰",
    availableTimes: ["09:00-12:00", "14:00-18:00"],
    reviews: [
      { id: "1", rating: 5, comment: "정말 친절하고 꼼꼼하게 산책해주셨어요!", date: "2024-09-20", author: "박**" },
      { id: "2", rating: 4, comment: "우리 강아지가 너무 좋아해요", date: "2024-09-18", author: "이**" },
    ],
  },
  {
    id: "2",
    name: "이준호 워커",
    distance: "0.8km",
    rating: 4.6,
    reviewCount: 89,
    experience: "2년 경험",
    introduction: "대형견 전문 워커입니다. 안전하고 즐거운 산책을 약속드려요!",
    profileImage: "👨‍💼",
    availableTimes: ["08:00-11:00", "15:00-19:00"],
    reviews: [
      { id: "3", rating: 5, comment: "대형견도 잘 다뤄주세요", date: "2024-09-19", author: "최**" },
    ],
  },
  {
    id: "3",
    name: "박서연 워커",
    distance: "1.2km",
    rating: 4.9,
    reviewCount: 203,
    experience: "5년 경험",
    introduction: "소형견부터 대형견까지 모든 견종 환영합니다!",
    profileImage: "👩‍💻",
    availableTimes: ["10:00-13:00", "16:00-20:00"],
    reviews: [
      { id: "4", rating: 5, comment: "항상 친절하고 믿음직스러워요", date: "2024-09-21", author: "김**" },
      { id: "5", rating: 5, comment: "최고의 워커님!", date: "2024-09-17", author: "정**" },
    ],
  },
];

// 워커 매칭 화면용 샘플 데이터
export const WALKER_MATCHING_DATA: Walker[] = [
  {
    id: '1',
    name: '김산책',
    rating: 4.8,
    reviewCount: 234,
    profileImage: 'https://via.placeholder.com/100',
    bio: '10년 경력의 전문 워커입니다. 모든 견종 환영합니다!',
    experience: '10년 경력',
    hourlyRate: 15000,
    isAvailable: true,
    location: '강남구',
  },
  {
    id: '2',
    name: '이돌봄',
    rating: 4.5,
    reviewCount: 189,
    profileImage: 'https://via.placeholder.com/100',
    bio: '사랑으로 돌봐드립니다.',
    experience: '5년 경력',
    hourlyRate: 13000,
    isAvailable: true,
    location: '서초구',
  },
  {
    id: '3',
    name: '박케어',
    rating: 4.7,
    reviewCount: 312,
    profileImage: 'https://via.placeholder.com/100',
    bio: '반려동물과 함께하는 즐거운 시간!',
    experience: '7년 경력',
    hourlyRate: 14000,
    isAvailable: true,
    location: '송파구',
  },
  {
    id: '4',
    name: '최도우미',
    rating: 4.6,
    reviewCount: 156,
    profileImage: 'https://via.placeholder.com/100',
    bio: '사랑과 정성으로 반려동물을 돌봐드립니다.',
    experience: '2년 경력',
    hourlyRate: 12000,
    isAvailable: true,
    location: '마포구',
  },
  {
    id: '5',
    name: '정산책러',
    rating: 4.9,
    reviewCount: 98,
    profileImage: 'https://via.placeholder.com/100',
    bio: '반려동물의 건강한 생활을 위한 전문 산책 서비스',
    experience: '4년 경력',
    hourlyRate: 16000,
    isAvailable: true,
    location: '용산구',
  },
  {
    id: '6',
    name: '한펫케어',
    rating: 4.8,
    reviewCount: 234,
    profileImage: 'https://via.placeholder.com/100',
    bio: '24시간 언제든지 반려동물을 돌봐드립니다.',
    experience: '6년 경력',
    hourlyRate: 17000,
    isAvailable: true,
    location: '영등포구',
  },
];

export default {
  WALKER_SELECTION_DATA,
  WALKER_MATCHING_DATA,
};

