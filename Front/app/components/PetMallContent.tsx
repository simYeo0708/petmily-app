import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { ModeConfig } from "../constants/ServiceModes";
import { homeScreenStyles } from "../styles/HomeScreenStyles";
import { CardBox } from "./CardBox";
import { CategoryList } from "./CategoryList";

interface PetMallContentProps {
  currentMode: ModeConfig;
  onCategoryPress?: (category: string) => void;
}

export const PetMallContent: React.FC<PetMallContentProps> = ({
  currentMode,
  onCategoryPress,
}) => {
  return (
    <>
      <View style={homeScreenStyles.section}>
        <Text style={homeScreenStyles.sectionTitle}>🔥 인기 상품 TOP 10</Text>
        <CardBox
          icon="🏆"
          description="지금 가장 인기 있는 반려용품을 확인하세요"
          actionText="상품 보기"
          borderColor={currentMode.color}
          backgroundColor={currentMode.color}
        />
      </View>

      <View style={homeScreenStyles.section}>
        <Text style={homeScreenStyles.sectionTitle}>📦 나의 주문</Text>
        <CardBox
          icon="📋"
          description="주문 내역과 배송 상태를 확인하세요"
          actionText="주문 보기"
          borderColor={currentMode.color}
          backgroundColor={currentMode.color}
        />
      </View>
    </>
  );
};

export default PetMallContent;
