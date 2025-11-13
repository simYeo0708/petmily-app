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

  return (
    <Image
      source={source}
      style={[{ width: size, height: size, resizeMode: "contain" }, style]}
    />
  );
};

export const getIconSource = (name: IconName) => ICON_SOURCE_MAP[name] ?? ICON_SOURCE_MAP.generic;

