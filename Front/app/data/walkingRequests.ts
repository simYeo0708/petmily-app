/**
 * 산책 요청 관련 샘플 데이터
 * PetWalkerContent, MatchingScreen에서 사용되는 데이터
 */

export interface WalkingRequestUser {
  name: string;
  profileImage?: string;
}

export interface WalkingRequestPet {
  name: string;
  species: 'dog' | 'cat' | 'other';
  breed: string;
  image?: string;
}

export interface WalkingRequest {
  id: string;
  user: WalkingRequestUser;
  pet: WalkingRequestPet;
  timeSlot: string;
  address: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed';
  createdAt: string;
  isMyRequest?: boolean;
}

export const WALKING_REQUESTS: WalkingRequest[] = [
  {
    id: '1',
    user: {
      name: '김철수',
      profileImage: 'https://via.placeholder.com/50',
    },
    pet: {
      name: '멍멍이',
      species: 'dog',
      breed: '골든 리트리버',
      image: 'https://via.placeholder.com/50',
    },
    timeSlot: '오후 2:00-4:00',
    address: '서울시 강남구 테헤란로 123',
    status: 'pending',
    createdAt: '2024-01-15 10:30',
    isMyRequest: false,
  },
  {
    id: '2',
    user: {
      name: '이영희',
      profileImage: 'https://via.placeholder.com/50',
    },
    pet: {
      name: '야옹이',
      species: 'cat',
      breed: '페르시안',
      image: 'https://via.placeholder.com/50',
    },
    timeSlot: '오전 10:00-12:00',
    address: '서울시 서초구 반포대로 456',
    status: 'pending',
    createdAt: '2024-01-15 11:15',
    isMyRequest: false,
  },
  {
    id: '3',
    user: {
      name: '박지민',
      profileImage: 'https://via.placeholder.com/50',
    },
    pet: {
      name: '초코',
      species: 'dog',
      breed: '푸들',
      image: 'https://via.placeholder.com/50',
    },
    timeSlot: '오후 3:00-5:00',
    address: '서울시 송파구 올림픽로 789',
    status: 'accepted',
    createdAt: '2024-01-15 09:45',
    isMyRequest: false,
  },
];

// 현재 진행 중인 산책 데이터
export interface WalkerInfo extends WalkingRequestUser {
  rating?: number;
  reviewCount?: number;
}

export interface CurrentWalking {
  id: string;
  walker: WalkerInfo;
  user: WalkingRequestUser;
  pet: WalkingRequestPet;
  startTime: string;
  estimatedEndTime?: string;
  duration: number; // 분 단위
  location: string; // 현재 위치
  distance: number; // km
  status: 'in_progress';
}

export const CURRENT_WALKING: CurrentWalking = {
  id: 'current-1',
  walker: {
    name: '김산책',
    profileImage: 'https://via.placeholder.com/50',
    rating: 4.8,
    reviewCount: 127,
  },
  user: {
    name: '홍길동',
    profileImage: 'https://via.placeholder.com/50',
  },
  pet: {
    name: '바둑이',
    species: 'dog',
    breed: '시바견',
    image: 'https://via.placeholder.com/50',
  },
  startTime: new Date().toISOString(), // 현재 시간
  duration: 120, // 2시간 (120분)
  location: '한강공원 근처',
  distance: 2.5, // 2.5km
  status: 'in_progress',
};

export default {
  WALKING_REQUESTS,
  CURRENT_WALKING,
};

