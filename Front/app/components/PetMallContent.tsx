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
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 15,
          }}>
          <Text style={homeScreenStyles.sectionTitle}>🏪 카테고리별 쇼핑</Text>
          <TouchableOpacity
            style={{
              backgroundColor: "rgba(197, 145, 114, 0.1)",
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "rgba(197, 145, 114, 0.3)",
            }}
            onPress={() => onCategoryPress?.("전체")}
            activeOpacity={0.7}>
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: "#C59172",
              }}>
              전체 보기
            </Text>
          </TouchableOpacity>
        </View>
        <CategoryList onCategoryPress={onCategoryPress} />
      </View>

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
