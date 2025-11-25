import { GuideStep } from '../types/HomeScreen';
import { IconName } from '../components/IconImage';

export const GUIDE_STEPS: Array<GuideStep & { iconName: IconName }> = [
  {
    id: "pet_walker_button",
    title: "Pet Walker 서비스",
    description: "신뢰할 수 있는 워커가 반려동물과 함께\n안전하고 즐거운 산책을 도와드려요!",
    nextButtonText: "다음",
    iconName: "walker",
  },
  {
    id: "pet_mall_button", 
    title: "Pet Mall 서비스",
    description: "반려동물에게 필요한 모든 용품을\n한 곳에서 편리하게 쇼핑하세요!",
    nextButtonText: "다음",
    iconName: "shop",
  },
  {
    id: "my_pet_tab_highlight",
    title: "반려동물 정보 입력",
    description: "산책 서비스를 이용하려면\n먼저 반려동물 정보를 등록해주세요!",
    nextButtonText: "정보 입력하기",
    iconName: "paw",
  },
];

export const GUIDE_STEP_MAPPING = ["pet_walker_button", "pet_mall_button", "my_pet_tab_highlight"];

export const SCROLL_OFFSETS = {
  PET_WALKER: 0,           // Pet Walker: 스크롤 안함
  PET_MALL: 0,             // Pet Mall: 스크롤 안함
  MY_PET_TAB: 0,           // My Pet Tab: 스크롤 안함
  DEFAULT: 0,
} as const;