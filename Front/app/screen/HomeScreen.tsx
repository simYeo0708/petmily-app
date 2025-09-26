import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useRef, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import GuideHighlight from "../components/GuideHighlight";
import Header from "../components/Header";
import { PetMallContent } from "../components/PetMallContent";
import { PetWalkerContent } from "../components/PetWalkerContent";
import ServiceGuide from "../components/ServiceGuide";
import { SERVICE_MODE_CONFIG, ServiceMode } from "../constants/ServiceModes";
import { useHelperStatus } from "../hooks/useHelperStatus";
import { RootStackParamList } from "../index";
import {
  homeScreenStyles,
  modalStyles,
  modeStyles
} from "../styles/HomeScreenStyles";

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface PetInfo {
  name: string;
  breed: string;
  age: string;
  weight: string;
}

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [serviceMode, setServiceMode] = useState<ServiceMode>("PW");
  const [searchQuery, setSearchQuery] = useState("");
  const [showServiceGuide, setShowServiceGuide] = useState(false);
  const [hasPetInfo, setHasPetInfo] = useState<boolean | null>(null);
  const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null);

  // Refs for guide targets
  const petWalkerButtonRef = useRef<View>(null);
  const petMallButtonRef = useRef<View>(null);
  const walkBookingButtonRef = useRef<View>(null);
  const shopButtonRef = useRef<View>(null);

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

  // 최초 실행 여부 확인 함수
  const checkFirstTimeUser = useCallback(async () => {
    try {
      const hasSeenIntro = await AsyncStorage.getItem("hasSeenServiceIntro");
      const isFirstTimeUser = !hasSeenIntro;
      setIsFirstTime(isFirstTimeUser);
      return isFirstTimeUser;
    } catch (error) {
      console.error("Failed to check first time user:", error);
      setIsFirstTime(true);
      return true;
    }
  }, []);

  // 반려동물 정보 확인 함수
  const checkPetInfo = useCallback(async () => {
    try {
      const savedPetInfo = await AsyncStorage.getItem("petInfo");
      if (savedPetInfo) {
        const petInfo: PetInfo = JSON.parse(savedPetInfo);
        // 필수 정보가 있는지 확인
        const hasEssentialInfo = !!(petInfo.name && petInfo.breed);
        setHasPetInfo(hasEssentialInfo);
        return hasEssentialInfo;
      } else {
        setHasPetInfo(false);
        return false;
      }
    } catch (error) {
      console.error("Failed to check pet info:", error);
      setHasPetInfo(false);
      return false;
    }
  }, []);

  // 서비스 가이드 표시 여부 결정
  const checkAndShowServiceGuide = useCallback(async () => {
    const isFirstTime = await checkFirstTimeUser();
    const hasPetInfo = await checkPetInfo();
    
    // 최초 실행이고 반려동물 정보가 없을 때만 가이드 표시
    if (isFirstTime && !hasPetInfo) {
      setTimeout(() => {
        setShowServiceGuide(true);
      }, 1500); // 화면 로딩 후 충분한 시간
    }
  }, [checkFirstTimeUser, checkPetInfo]);

  // 화면이 포커스될 때마다 체크 (하지만 서비스 가이드는 최초 1회만)
  useFocusEffect(
    useCallback(() => {
      if (isFirstTime === null) {
        // 최초 로딩 시에만 서비스 가이드 체크
        checkAndShowServiceGuide();
      } else {
        // 이후에는 반려동물 정보만 체크
        checkPetInfo();
      }
    }, [isFirstTime, checkAndShowServiceGuide, checkPetInfo])
  );

  const handleCompleteServiceGuide = () => {
    setShowServiceGuide(false);
    setIsFirstTime(false);
  };

  // 현재 가이드 단계 상태 추가
  const [currentGuideStep, setCurrentGuideStep] = useState(0);

  // 가이드 단계별 하이라이트 결정
  const getHighlightState = (stepId: string) => {
    if (!showServiceGuide) return false;
    
    const stepMapping = ["pet_walker_button", "pet_mall_button", "walk_booking"];
    const currentStepId = stepMapping[currentGuideStep];
    
    return currentStepId === stepId;
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
                <GuideHighlight
                  key={mode}
                  isActive={getHighlightState(mode === "PW" ? "pet_walker_button" : "pet_mall_button")}
                >
                  <TouchableOpacity
                    ref={mode === "PW" ? petWalkerButtonRef : petMallButtonRef}
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
                </GuideHighlight>
              ))}
            </View>
          </View>

        {/* 산책 예약하기 */}
        {serviceMode === "PW" && (
          <GuideHighlight isActive={getHighlightState("walk_booking")}>
            <View style={modalStyles.modalBox} ref={walkBookingButtonRef}>
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
          </GuideHighlight>
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
          <View ref={shopButtonRef}>
            <PetMallContent
              currentMode={currentMode}
              onCategoryPress={handleCategoryPress}
            />
          </View>
        )}
      </ScrollView>

      {/* 서비스 가이드 */}
      <ServiceGuide
        isVisible={showServiceGuide}
        onComplete={handleCompleteServiceGuide}
        serviceMode={serviceMode}
        petWalkerButtonRef={petWalkerButtonRef}
        petMallButtonRef={petMallButtonRef}
        walkBookingButtonRef={walkBookingButtonRef}
        shopButtonRef={shopButtonRef}
        onStepChange={setCurrentGuideStep}
      />
    </SafeAreaView>
  );
};

export default HomeScreen;
