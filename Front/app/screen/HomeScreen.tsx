import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Header from "../components/Header";
import { PetMallContent } from "../components/PetMallContent";
import { PetWalkerContent } from "../components/PetWalkerContent";
import { SERVICE_MODE_CONFIG, ServiceMode } from "../constants/ServiceModes";
import { useHelperStatus } from "../hooks/useHelperStatus";
import { RootStackParamList } from "../index";
import {
  homeScreenStyles,
  modalStyles,
  modeStyles
} from "../styles/HomeScreenStyles";

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [serviceMode, setServiceMode] = useState<ServiceMode>("PW");
  const [searchQuery, setSearchQuery] = useState("");

  const { helperStatus, becomeHelper } = useHelperStatus();

  const handleNavigateToHelper = () => {
    navigation.navigate("HelperDashboard");
  };

  const handleJoinHelper = async () => {
    await becomeHelper();
    handleNavigateToHelper();
  };

  const handleWalkBooking = () => {
    navigation.navigate("Booking");
  };

  const currentMode = SERVICE_MODE_CONFIG[serviceMode];

  const handleCategoryPress = (category: string) => {
    navigation.navigate("Shop", { category });
  };

  return (
    <SafeAreaView
      style={[
        homeScreenStyles.root,
        { backgroundColor: currentMode.lightColor },
      ]}>
      <Header
        showSearch={true}
        searchPlaceholder={
          serviceMode === "PW" ? "산책 장소 검색" : "상품 검색"
        }
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <ScrollView contentContainerStyle={homeScreenStyles.scrollContent}>
        <View style={homeScreenStyles.section}>
          <Text style={homeScreenStyles.sectionTitle}>서비스 선택</Text>
          <View style={modeStyles.modeRow}>
            {(["PW", "PM"] as const).map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[
                  modeStyles.modeChip,
                  serviceMode === mode && [
                    modeStyles.modeChipActive,
                    { backgroundColor: SERVICE_MODE_CONFIG[mode].color },
                  ],
                ]}
                onPress={() => setServiceMode(mode)}>
                <Text style={modeStyles.modeIcon}>
                  {SERVICE_MODE_CONFIG[mode].icon}
                </Text>
                <View style={modeStyles.modeTextContainer}>
                  <Text
                    style={[
                      modeStyles.modeChipTitle,
                      serviceMode === mode && modeStyles.modeChipTextActive,
                    ]}>
                    {SERVICE_MODE_CONFIG[mode].title}
                  </Text>
                  <Text
                    style={[
                      modeStyles.modeChipSubtitle,
                      serviceMode === mode && modeStyles.modeChipTextActive,
                    ]}>
                    {SERVICE_MODE_CONFIG[mode].subtitle}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 산책 예약하기 */}
        {serviceMode === "PW" && (
          <View style={modalStyles.modalBox}>
            <Text style={modalStyles.modalTitle}>🐕 산책 예약하기</Text>
            <Text style={modalStyles.modalBody}>
              우리 아이와 함께 즐거운 산책 시간을 만들어보세요!
            </Text>
            <View style={modalStyles.modalButtonsRow}>
              <Pressable
                style={[
                  modalStyles.choiceBtn,
                  modalStyles.primaryBtn,
                  {
                    backgroundColor: currentMode.color,
                    borderColor: currentMode.color,
                    flex: 1,
                  },
                ]}
                onPress={handleWalkBooking}>
                <Text
                  style={[
                    modalStyles.choiceBtnText,
                    modalStyles.primaryBtnText,
                  ]}>
                  산책 예약하러 가기
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* 헬퍼 참여 제안 */}
        {!helperStatus.isHelper && serviceMode === "PW" && (
          <View style={modalStyles.modalBox}>
            <Text style={modalStyles.modalTitle}>
              🤝 워커로 참여하시겠어요?
            </Text>
            <Text style={modalStyles.modalBody}>
              다른 반려동물 가족들을 도와주는 워커가 되어보세요!
            </Text>
            <View style={modalStyles.modalButtonsRow}>
              <Pressable
                style={[
                  modalStyles.choiceBtn,
                  modalStyles.primaryBtn,
                  {
                    backgroundColor: currentMode.color,
                    borderColor: currentMode.color,
                    flex: 1,
                  },
                ]}
                onPress={handleJoinHelper}>
                <Text
                  style={[
                    modalStyles.choiceBtnText,
                    modalStyles.primaryBtnText,
                  ]}>
                  네, 참여할게요
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* 헬퍼 대시보드 바로가기 */}
        {helperStatus.isHelper && serviceMode === "PW" && (
          <View style={modalStyles.modalBox}>
            <Text style={modalStyles.modalTitle}>🎉 워커로 활동 중입니다!</Text>
            <Text style={modalStyles.modalBody}>
              워커 대시보드에서 수익과 매칭 현황을 확인해보세요.
            </Text>
            <View style={modalStyles.modalButtonsRow}>
              <Pressable
                style={[
                  modalStyles.choiceBtn,
                  modalStyles.primaryBtn,
                  {
                    backgroundColor: currentMode.color,
                    borderColor: currentMode.color,
                  },
                ]}
                onPress={handleNavigateToHelper}>
                <Text
                  style={[
                    modalStyles.choiceBtnText,
                    modalStyles.primaryBtnText,
                  ]}>
                  워커 대시보드 보기
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {serviceMode === "PW" ? (
          <PetWalkerContent currentMode={currentMode} />
        ) : (
          <PetMallContent
            currentMode={currentMode}
            onCategoryPress={handleCategoryPress}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
