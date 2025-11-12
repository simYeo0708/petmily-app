export interface BookingData {
  timeSlot: string;
  address: string;
  date: string;
  duration: number;
  notes?: string;
  emergencyContact?: string;
  isRegularPackage?: boolean;
  packageFrequency?: string;
  insuranceCovered?: boolean;
  time?: string;
  walkType?: WalkType;
  pricing?: PricingInfo;
  selectedWalker?: Walker;
  petInfo?: PetInfo;
  cautionTemplates?: string[];
  customNotes?: string;
  notifications?: NotificationSettings;
  paymentMethod?: PaymentMethod;
  insuranceAgreed?: boolean;
}

export interface Walker {
  id: number;
  name: string;
  rating: number;
  reviewCount: number;
  profileImage?: string;
  bio?: string;
  experience?: string;
  specialties?: string[];
  hourlyRate?: number;
  isAvailable?: boolean;
  distance?: number;
  reviews?: WalkerReview[];
  introduction?: string;
  availableTimes?: TimeSlot[];
}

export interface WalkerReview {
  id: number;
  rating: number;
  comment: string;
  userName: string;
  createdAt: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  walkerId?: number;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'kakao' | 'naver' | 'toss';
  name: string;
  number?: string;
  isDefault?: boolean;
  icon?: string;
  description?: string;
}

export interface BookingStep {
  step: number;
  title: string;
  completed: boolean;
}

export interface BookingState {
  currentStep: number;
  bookingData: BookingData;
  selectedWalker?: Walker;
  selectedTimeSlot?: TimeSlot;
  paymentMethod?: PaymentMethod;
  totalPrice: number;
  steps: BookingStep[];
}

export interface StepProps {
  onNext: () => void;
  onPrev: () => void;
  bookingData: BookingData;
  setBookingData: (data: BookingData) => void;
  onUpdate?: (data: Partial<BookingData>) => void;
}

export interface DurationOption {
  value: number;
  label: string;
  price: number;
}

export interface WalkType {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  value?: number;
  label?: string;
}

export interface CautionTemplate {
  id: string;
  title: string;
  content: string;
  description?: string;
}

export interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  departure?: boolean;
  delay?: boolean;
  completion?: boolean;
}

export interface PetInfo {
  name: string;
  species: string;
  breed: string;
  age: string;
  weight: string;
  gender: string;
  isNeutered: boolean;
  description: string;
  photoUri?: string;
  temperament?: string;
}

export interface PricingInfo {
  basePrice: number;
  durationPrice: number;
  serviceFee: number;
  totalPrice: number;
  discountAmount?: number;
  finalPrice?: number;
}

// Walker 인터페이스 확장
export interface WalkerExtended extends Walker {
  introduction?: string;
  availableTimes?: TimeSlot[];
  reviews?: WalkerReview[];
}

// BookingData 인터페이스 확장
export interface BookingDataExtended extends BookingData {
  time?: string;
  walkType?: WalkType;
  pricing?: PricingInfo;
  selectedWalker?: Walker;
  petInfo?: PetInfo;
}

// PaymentMethod 인터페이스 확장
export interface PaymentMethodExtended extends PaymentMethod {
  icon?: string;
  description?: string;
}
