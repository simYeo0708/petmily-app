import React from "react";
import { Image, ImageStyle, StyleProp } from "react-native";

const ICON_SOURCE_MAP = {
  paw: require("../../assets/images/paw.png"),
  dogPaw: require("../../assets/images/dog-paw.png"),
  walker: require("../../assets/images/walker.png"),
  shop: require("../../assets/images/shop.png"),
  map: require("../../assets/images/explore.png"),
  dog: require("../../assets/images/dog.png"),
  cat: require("../../assets/images/cat.png"),
  cart: require("../../assets/images/cart.png"),
  setting: require("../../assets/images/setting.png"),
  home: require("../../assets/images/home.png"),
  food: require("../../assets/images/dog_food.png"),
  snack: require("../../assets/images/dog_snack.png"),
  toy: require("../../assets/images/toy.png"),
  clothing: require("../../assets/images/clothing.png"),
  grooming: require("../../assets/images/grooming.png"),
  toilet: require("../../assets/images/toilet.png"),
  outdoor: require("../../assets/images/outdoor.png"),
  house: require("../../assets/images/house.png"),
  generic: require("../../assets/images/paw.png"),
} as const;

export type IconName = keyof typeof ICON_SOURCE_MAP;

interface IconImageProps {
  name: IconName;
  size?: number;
  style?: StyleProp<ImageStyle>;
}

export const IconImage: React.FC<IconImageProps> = ({ name, size = 20, style }) => {
  const source = ICON_SOURCE_MAP[name] ?? ICON_SOURCE_MAP.generic;

  // 디버깅: 아이콘 이름과 소스 확인
  if (!ICON_SOURCE_MAP[name]) {
    console.warn(`[IconImage] 아이콘 이름 "${name}"이 ICON_SOURCE_MAP에 없습니다. generic 아이콘을 사용합니다.`);
  }

  // 기본 스타일: 명시적으로 width, height 설정
  const defaultStyle = {
    width: size,
    height: size,
  };

  return (
    <Image
      source={source}
      style={[defaultStyle, style]}
      resizeMode="contain"
      onError={(error) => {
        console.error(`[IconImage] 이미지 로드 실패 - name: ${name}, error:`, error);
      }}
      onLoad={() => {
        // 이미지 로드 성공 (디버깅용, 필요시 제거)
        // console.log(`[IconImage] 이미지 로드 성공 - name: ${name}`);
      }}
    />
  );
};

export const getIconSource = (name: IconName) => ICON_SOURCE_MAP[name] ?? ICON_SOURCE_MAP.generic;

