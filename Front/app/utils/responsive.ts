import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 기준 디바이스 크기 (iPhone 11 Pro)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

/**
 * 화면 너비 기준 반응형 크기 계산
 * @param size 기준 크기
 * @returns 반응형 크기
 */
export const wp = (size: number): number => {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  return PixelRatio.roundToNearestPixel(size * scale);
};

/**
 * 화면 높이 기준 반응형 크기 계산
 * @param size 기준 크기
 * @returns 반응형 크기
 */
export const hp = (size: number): number => {
  const scale = SCREEN_HEIGHT / BASE_HEIGHT;
  return PixelRatio.roundToNearestPixel(size * scale);
};

/**
 * 반응형 폰트 크기
 * @param size 기준 폰트 크기
 * @returns 반응형 폰트 크기
 */
export const rf = (size: number): number => {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

/**
 * 현재 화면 크기 정보
 */
export const dimensions = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isSmallDevice: SCREEN_WIDTH < 375,
  isMediumDevice: SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414,
  isLargeDevice: SCREEN_WIDTH >= 414,
};

