/**
 * 광고 배너 샘플 데이터
 * AdBanner 컴포넌트에서 사용되는 광고 데이터
 */

import { Ionicons } from '@expo/vector-icons';

export interface Advertisement {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  colors: [string, string];
}

export const ADVERTISEMENTS: Advertisement[] = [
  {
    id: '1',
    title: '신규 회원 할인',
    subtitle: '첫 구매 시 15% 할인 혜택!',
    icon: 'gift',
    colors: ['#FF6B9D', '#C44569'],
  },
  {
    id: '2',
    title: '펫 워커 서비스',
    subtitle: '전문 워커와 안전한 산책',
    icon: 'walk',
    colors: ['#4FACFE', '#00F2FE'],
  },
  {
    id: '3',
    title: '프리미엄 사료 특가',
    subtitle: '건강한 먹거리를 특별가에',
    icon: 'nutrition',
    colors: ['#43E97B', '#38F9D7'],
  },
  {
    id: '4',
    title: '건강 검진 이벤트',
    subtitle: '반려동물 건강 체크업 30% 할인',
    icon: 'medical',
    colors: ['#FA709A', '#FEE140'],
  },
];

export default ADVERTISEMENTS;





