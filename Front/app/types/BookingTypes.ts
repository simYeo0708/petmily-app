// 예약 관련 타입 정의

export interface Walker {
  id: string;
  name: string;
  distance: string;
  rating: number;
  reviewCount: number;
  experience: string;
  introduction: string;
  profileImage: string;
  availableTimes: string[];
  reviews: WalkerReview[];
}

export interface WalkerReview {
  id: string;
  rating: number;
  comment: string;
  date: string;
  author: string;
}

export interface PetInfo {
  name: string;
  breed: string;
  age: string;
  weight: string;
  temperament: string;
  medicalInfo?: string;
}

export interface NotificationSettings {
  departure: boolean;
  delay: boolean;
  completion: boolean;
}

export interface PricingInfo {
  basePrice: number;
  discountAmount: number;
  finalPrice: number;
}

export interface BookingData {
  // Step 1: 기본 정보
  walkType?: "single" | "package";
  duration?: number;
  date?: string;
  time?: string;
  address?: string;

  // Step 2: 워커 선택
  selectedWalker?: Walker;

  // Step 3: 산책 설정
  petInfo?: PetInfo;
  cautionTemplates?: string[];
  customNotes?: string;
  emergencyContact?: string;
  notifications?: NotificationSettings;

  // Step 4: 결제
  paymentMethod?: "card" | "kakao" | "naver" | "toss";
  insuranceAgreed?: boolean;
  pricing?: PricingInfo;
}

export interface StepProps {
  bookingData: BookingData;
  onUpdate: (data: BookingData) => void;
}

export interface WalkType {
  value: "single" | "package";
  label: string;
  description: string;
}

export interface DurationOption {
  value: number;
  label: string;
}

export interface PaymentMethod {
  id: "card" | "kakao" | "naver" | "toss";
  name: string;
  icon: string;
  description: string;
}

export interface CautionTemplate {
  id: string;
  title: string;
  description: string;
}
