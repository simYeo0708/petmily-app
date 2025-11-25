import { IconName } from "../components/IconImage";
import { Ionicons } from "@expo/vector-icons";

type SpeciesOption = {
  value: string;
  label: string;
  iconName: IconName;
};

type GenderOption = {
  value: string;
  label: string;
  ionIcon: keyof typeof Ionicons.glyphMap;
};

export const SPECIES_OPTIONS: SpeciesOption[] = [
  { value: 'dog', label: '개', iconName: 'dog' },
  { value: 'cat', label: '고양이', iconName: 'cat' },
  { value: 'other', label: '기타', iconName: 'paw' },
];

export const GENDER_OPTIONS: GenderOption[] = [
  { value: 'male', label: '수컷', ionIcon: 'male' },
  { value: 'female', label: '암컷', ionIcon: 'female' },
];

export const TEMPERAMENT_OPTIONS = [
  { value: '온순함', label: '온순함' },
  { value: '활발함', label: '활발함' },
  { value: '사교적', label: '사교적' },
  { value: '조용함', label: '조용함' },
  { value: '장난꾸러기', label: '장난꾸러기' },
  { value: '차분함', label: '차분함' },
  { value: '호기심 많음', label: '호기심 많음' },
  { value: '독립적', label: '독립적' },
  { value: '애교쟁이', label: '애교쟁이' },
  { value: '용감함', label: '용감함' },
  { value: '신중함', label: '신중함' },
  { value: '장난스러움', label: '장난스러움' },
  { value: '친근함', label: '친근함' },
  { value: '고집스러움', label: '고집스러움' },
  { value: '영리함', label: '영리함' },
  { value: '겁쟁이', label: '겁쟁이' },
  { value: '적극적', label: '적극적' },
  { value: '소심함', label: '소심함' },
];

export const BREED_OPTIONS = {
  dog: [
    { value: 'golden_retriever', label: '골든 리트리버' },
    { value: 'labrador', label: '래브라도 리트리버' },
    { value: 'german_shepherd', label: '저먼 셰퍼드' },
    { value: 'bulldog', label: '불독' },
    { value: 'poodle', label: '푸들' },
    { value: 'beagle', label: '비글' },
    { value: 'rottweiler', label: '로트와일러' },
    { value: 'yorkshire_terrier', label: '요크셔 테리어' },
    { value: 'siberian_husky', label: '시베리안 허스키' },
    { value: 'shiba_inu', label: '시바 이누' },
    { value: 'maltese', label: '말티즈' },
    { value: 'chihuahua', label: '치와와' },
    { value: 'mixed', label: '믹스' },
    { value: 'other', label: '기타' },
  ],
  cat: [
    { value: 'persian', label: '페르시안' },
    { value: 'maine_coon', label: '메인쿤' },
    { value: 'british_shorthair', label: '브리티시 숏헤어' },
    { value: 'ragdoll', label: '래그돌' },
    { value: 'siamese', label: '샴' },
    { value: 'american_shorthair', label: '아메리칸 숏헤어' },
    { value: 'russian_blue', label: '러시안 블루' },
    { value: 'scottish_fold', label: '스코티시 폴드' },
    { value: 'norwegian_forest', label: '노르웨이 숲' },
    { value: 'mixed', label: '믹스' },
    { value: 'other', label: '기타' },
  ],
  other: [
    { value: 'other', label: '직접 입력' },
  ],
};

export const ANIMATION_CONFIG = {
  fadeIn: {
    duration: 300,
    toValue: 1,
    useNativeDriver: true,
  },
  fadeOut: {
    duration: 300,
    toValue: 0,
    useNativeDriver: true,
  },
  scaleUp: {
    duration: 200,
    toValue: 1.1,
    useNativeDriver: true,
  },
  scaleDown: {
    duration: 200,
    toValue: 1,
    useNativeDriver: true,
  },
  confetti: {
    duration: 2000,
    toValue: 1,
    useNativeDriver: true,
  },
};
