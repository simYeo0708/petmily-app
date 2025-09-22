import React from "react";
import { Text, View } from "react-native";
import { ModeConfig } from "../constants/ServiceModes";
import { homeScreenStyles } from "../styles/HomeScreenStyles";
import { CardBox } from "./CardBox";

interface PetWalkerContentProps {
  currentMode: ModeConfig;
}

export const PetWalkerContent: React.FC<PetWalkerContentProps> = ({
  currentMode,
}) => {
  return (
    <>
      <View style={homeScreenStyles.section}>
        <Text style={homeScreenStyles.sectionTitle}>📍 산책 지도</Text>
        <CardBox
          icon="🗺️"
          description="반려동물의 산책 경로와 위치를 확인하세요"
          actionText="지도 보기"
          borderColor={currentMode.color}
          backgroundColor={currentMode.color}
        />
      </View>

      <View style={homeScreenStyles.section}>
        <Text style={homeScreenStyles.sectionTitle}>📋 최근 산책 기록</Text>
        <CardBox
          icon="🚶‍♂️"
          description="오늘의 산책 기록과 통계를 확인하세요"
          actionText="기록 보기"
          borderColor={currentMode.color}
          backgroundColor={currentMode.color}
        />
      </View>
    </>
  );
};

export default PetWalkerContent;
