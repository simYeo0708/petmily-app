/**
 * 웹 대시보드 및 리뷰 샘플 데이터
 * 앱의 HelperDashboardScreen과 동일한 구조의 샘플 데이터
 */

export interface DashboardEarningsInfo {
  totalEarnings: number;
  thisMonthEarnings: number;
  thisWeekEarnings: number;
  todayEarnings: number;
  growthRate: number;
  nextPayoutDate: string;
}

export interface DashboardStatisticsInfo {
  totalWalks: number;
  completedWalks: number;
  pendingWalks: number;
  averageRating: number;
  totalReviews: number;
  repeatRate: number;
}

export interface DashboardReview {
  id: number;
  reviewerName: string;
  rating: number;
  comment: string;
  reviewDate: string;
  petName: string;
}

export interface DashboardUpcomingBooking {
  id: number;
  date: string;
  petName: string;
  petBreed: string;
  notes: string | null;
  status: string;
  address: string;
  timeSlot: string;
}

export interface WeeklyEarnings {
  weekLabel: string;
  earnings: number;
}

// 대시보드 샘플 데이터
export const SAMPLE_DASHBOARD_DATA = {
  earningsInfo: {
    totalEarnings: 1250000,
    thisMonthEarnings: 320000,
    thisWeekEarnings: 85000,
    todayEarnings: 15000,
    growthRate: 12.4,
    nextPayoutDate: "2025년 4월 28일",
  } as DashboardEarningsInfo,
  
  statisticsInfo: {
    totalWalks: 156,
    completedWalks: 142,
    pendingWalks: 3,
    averageRating: 4.8,
    totalReviews: 127,
    repeatRate: 68.5,
  } as DashboardStatisticsInfo,
  
  recentReviews: [
    {
      id: 1,
      reviewerName: "박민수",
      rating: 5,
      comment: "정말 친절하고 꼼꼼하게 산책해주셨어요! 우리 강아지가 너무 좋아했어요.",
      reviewDate: "2024-09-20",
      petName: "뽀삐",
    },
    {
      id: 2,
      reviewerName: "이지은",
      rating: 5,
      comment: "항상 시간 약속을 잘 지키시고, 반려동물을 정말 사랑하는 모습이 보여요.",
      reviewDate: "2024-09-18",
      petName: "코코",
    },
    {
      id: 3,
      reviewerName: "최수진",
      rating: 4,
      comment: "대형견도 잘 다뤄주시고 안전하게 산책시켜주셔서 감사합니다.",
      reviewDate: "2024-09-17",
      petName: "루이",
    },
  ] as DashboardReview[],
  
  upcomingBookings: [
    {
      id: 1,
      date: "2024-09-25T10:00:00",
      petName: "뽀삐",
      petBreed: "골든 리트리버",
      notes: "산책 중 물을 자주 마시는 편이에요",
      status: "CONFIRMED",
      address: "서울시 강남구 테헤란로 123",
      timeSlot: "10:00 - 11:00",
    },
    {
      id: 2,
      date: "2024-09-26T14:00:00",
      petName: "코코",
      petBreed: "비글",
      notes: null,
      status: "PENDING",
      address: "서울시 서초구 서초대로 456",
      timeSlot: "14:00 - 15:30",
    },
    {
      id: 3,
      date: "2024-09-27T16:00:00",
      petName: "루이",
      petBreed: "래브라도 리트리버",
      notes: "다른 강아지와 만나면 짖을 수 있어요",
      status: "CONFIRMED",
      address: "서울시 송파구 올림픽로 789",
      timeSlot: "16:00 - 17:00",
    },
  ] as DashboardUpcomingBooking[],
  
  weeklyEarnings: [
    { weekLabel: "4주전", earnings: 120000 },
    { weekLabel: "3주전", earnings: 140000 },
    { weekLabel: "2주전", earnings: 160000 },
    { weekLabel: "지난주", earnings: 190000 },
    { weekLabel: "이번주", earnings: 210000 },
  ] as WeeklyEarnings[],
};

// 워커 리뷰 샘플 데이터 (리뷰 섹션용)
export const SAMPLE_WALKER_REVIEWS = [
  {
    id: 1,
    reviewerName: "박민수",
    rating: 5,
    comment: "정말 친절하고 꼼꼼하게 산책해주셨어요! 우리 강아지가 너무 좋아했어요. 다음에도 꼭 부탁드리고 싶어요.",
    reviewDate: "2024-09-20",
    petName: "뽀삐",
    walkerName: "김민지 워커",
  },
  {
    id: 2,
    reviewerName: "이지은",
    rating: 5,
    comment: "항상 시간 약속을 잘 지키시고, 반려동물을 정말 사랑하는 모습이 보여요. 안전하게 산책시켜주셔서 감사합니다.",
    reviewDate: "2024-09-18",
    petName: "코코",
    walkerName: "김민지 워커",
  },
  {
    id: 3,
    reviewerName: "최수진",
    rating: 4,
    comment: "대형견도 잘 다뤄주시고 안전하게 산책시켜주셔서 감사합니다. 다음에도 부탁드릴게요!",
    reviewDate: "2024-09-17",
    petName: "루이",
    walkerName: "이준호 워커",
  },
  {
    id: 4,
    reviewerName: "김영희",
    rating: 5,
    comment: "최고의 워커님! 우리 강아지가 워커님을 정말 좋아해요. 항상 친절하고 책임감 있게 산책시켜주세요.",
    reviewDate: "2024-09-15",
    petName: "멍멍이",
    walkerName: "박서연 워커",
  },
  {
    id: 5,
    reviewerName: "정대현",
    rating: 5,
    comment: "소형견 전문이라고 하셨는데 정말 잘 다뤄주시네요. 우리 강아지가 워커님을 만나면 너무 좋아해요!",
    reviewDate: "2024-09-14",
    petName: "초코",
    walkerName: "박서연 워커",
  },
  {
    id: 6,
    reviewerName: "한소영",
    rating: 4,
    comment: "시간 약속을 정확히 지키시고, 산책 중 사진도 보내주셔서 안심이 되었어요. 감사합니다!",
    reviewDate: "2024-09-12",
    petName: "별이",
    walkerName: "김민지 워커",
  },
];

