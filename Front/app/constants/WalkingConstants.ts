import { TimeSlot, Duration } from '../types/WalkingRequestScreen';

export const TIME_SLOTS: TimeSlot[] = [
  { value: '06:00-08:00', label: '06:00-08:00', available: true },
  { value: '08:00-10:00', label: '08:00-10:00', available: true },
  { value: '10:00-12:00', label: '10:00-12:00', available: true },
  { value: '12:00-14:00', label: '12:00-14:00', available: true },
  { value: '14:00-16:00', label: '14:00-16:00', available: true },
  { value: '16:00-18:00', label: '16:00-18:00', available: true },
  { value: '18:00-20:00', label: '18:00-20:00', available: true },
  { value: '20:00-22:00', label: '20:00-22:00', available: true },
];

export const DURATION_OPTIONS: Duration[] = [
  { value: '30', label: '30분' },
  { value: '60', label: '1시간' },
  { value: '90', label: '1시간 30분' },
  { value: '120', label: '2시간' },
  { value: '180', label: '3시간' },
];

export const SPECIAL_INSTRUCTIONS_PLACEHOLDER = '특별한 요청사항이 있다면 입력해주세요.\n예: 산책 중 다른 강아지와 만나지 않도록 해주세요.';

export const ADDRESS_PLACEHOLDER = '산책할 주소를 입력해주세요';

export const VALIDATION_MESSAGES = {
  TIME_SLOT_REQUIRED: '시간대를 선택해주세요.',
  ADDRESS_REQUIRED: '주소를 입력해주세요.',
  PET_REQUIRED: '반려동물을 선택해주세요.',
  DURATION_REQUIRED: '산책 시간을 선택해주세요.',
} as const;
