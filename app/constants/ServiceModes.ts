export type ServiceMode = "PW" | "PM";

export interface ModeConfig {
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  lightColor: string;
}

export const SERVICE_MODE_CONFIG: Record<ServiceMode, ModeConfig> = {
  PW: {
    title: "Pet Walker",
    subtitle: "산책 서비스",
    icon: "@walker.png",
    color: "#C59172",
    lightColor: "#FFF5F0",
  },
  PM: {
    title: "Pet Mall",
    subtitle: "반려용품 쇼핑",
    icon: "@pet_mall.png",
    color: "#C59172",
    lightColor: "#FFF5F0",
  },
};

export const CATEGORY_DATA = [
  { name: "강아지 사료", icon: "@dog_food.png" },
  { name: "강아지 간식", icon: "@dog_snack.png" },
  { name: "고양이 사료", icon: "@cat_food.png" },
  { name: "고양이 간식", icon: "@cat_snack.png" },
  { name: "장난감", icon: "@toy.png" },
  { name: "배변용품", icon: "@toilet.png" },
  { name: "미용 용품", icon: "@grooming.png" },
  { name: "의류", icon: "@clothing.png" },
  { name: "외출 용품", icon: "@outdoor.png" },
  { name: "하우스/침대", icon: "@house.png" },
];

export default SERVICE_MODE_CONFIG;
