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
    icon: "🐕‍🦺",
    color: "#C59172",
    lightColor: "#FFF5F0",
  },
  PM: {
    title: "Pet Mall",
    subtitle: "반려용품 쇼핑",
    icon: "🛍️",
    color: "#C59172",
    lightColor: "#FFF5F0",
  },
};

export const CATEGORY_DATA = [
  { name: "사료", icon: "🥘" },
  { name: "간식", icon: "🦴" },
  { name: "장난감", icon: "🧸" },
  { name: "용품", icon: "🎾" },
];

export default SERVICE_MODE_CONFIG;
