import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { View } from "react-native";
import { RootStackParamList } from "../index";
import GuideTooltip from "./GuideTooltip";
import { GuideStep as GuideStepType } from "../types/HomeScreen";
import { IconName } from "../components/IconImage";

interface ServiceGuideProps {
  isVisible: boolean;
  onComplete: () => void;
  serviceMode: "PW" | "PM";
  petWalkerButtonRef: React.RefObject<View | null>;
  petMallButtonRef: React.RefObject<View | null>;
  walkBookingButtonRef: React.RefObject<View | null>;
  shopButtonRef: React.RefObject<View | null>;
  onStepChange: (step: number) => void;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ServiceGuide: React.FC<ServiceGuideProps> = ({
  isVisible,
  onComplete,
  serviceMode,
  petWalkerButtonRef,
  petMallButtonRef,
  walkBookingButtonRef,
  shopButtonRef,
  onStepChange,
}) => {
  const navigation = useNavigation<NavigationProp>();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const allGuideSteps: Array<GuideStepType & { iconName: IconName }> = [
    {
      id: "pet_walker_button",
      title: "Pet Walker 서비스",
      description: "신뢰할 수 있는 워커가 반려동물과 함께\n안전하고 즐거운 산책을 도와드려요!\n\n• 전문 워커와의 매칭\n• 실시간 산책 추적\n• 안전한 산책 경로 제공",
      nextButtonText: "다음",
      iconName: "walker",
    },
    {
      id: "pet_mall_button",
      title: "Pet Mall 서비스",
      description: "반려동물에게 필요한 모든 용품을\n한 곳에서 편리하게 쇼핑하세요!\n\n• 다양한 펫 용품 카테고리\n• 합리적인 가격\n• 빠른 배송 서비스",
      nextButtonText: "다음",
      iconName: "shop",
    },
    {
      id: "walk_booking",
      title: "반려동물 정보 입력",
      description: "산책 예약을 위해 먼저 반려동물 정보를\n입력해주세요!\n\n• 반려동물 프로필 생성\n• 산책 요청 작성\n• 워커와의 매칭",
      nextButtonText: "정보 입력하기",
      iconName: "paw",
    },
  ];

  // 현재 서비스 모드에 따라 표시할 단계 필터링
  const guideSteps = React.useMemo(() => {
    const baseSteps = allGuideSteps.slice(0, 2); // Pet Walker, Pet Mall
    if (serviceMode === "PW") {
      return [...baseSteps, allGuideSteps[2]]; // 반려동물 정보 입력 추가
    }
    return baseSteps;
  }, [serviceMode]);

  const currentStep = guideSteps[currentStepIndex];

  // 가이드가 시작될 때 현재 단계를 알림
  React.useEffect(() => {
    if (isVisible) {
      onStepChange(currentStepIndex);
    }
  }, [isVisible, currentStepIndex, onStepChange]);

  // 마지막 단계에서 동적 버튼 텍스트 설정
  const getNextButtonText = () => {
    const isLastStep = currentStepIndex === guideSteps.length - 1;
    if (isLastStep) {
      if (currentStep?.id === "walk_booking") {
        return "정보 입력하기";
      } else if (currentStep?.id === "pet_mall_button" && serviceMode === "PM") {
        return "체험하기";
      } else {
        return "완료";
      }
    }
    return currentStep?.nextButtonText || "다음";
  };

  const handleNext = async () => {
    const isLastStep = currentStepIndex === guideSteps.length - 1;
    const currentStepId = currentStep.id;

    // 마지막 단계에서의 특별한 액션
    if (isLastStep) {
      if (currentStepId === "walk_booking") {
        // Pet Walker 모드: 반려동물 정보 입력 페이지로 이동
        await markGuideAsCompleted();
        onComplete();
        navigation.navigate("Main", { initialTab: "MyPet" });
        return;
      } else if (currentStepId === "pet_mall_button" && serviceMode === "PM") {
        // Pet Mall 모드: Pet Mall로 이동
        await markGuideAsCompleted();
        onComplete();
        navigation.navigate("Shop", { category: "전체" });
        return;
      } else {
        // 일반적인 가이드 완료
        await markGuideAsCompleted();
        onComplete();
        return;
      }
    }

    // 다음 단계로
    const nextStep = currentStepIndex + 1;
    setCurrentStepIndex(nextStep);
    onStepChange(nextStep);
  };

  const handleSkip = async () => {
    await markGuideAsCompleted();
    onComplete();
  };

  const handleClose = async () => {
    await markGuideAsCompleted();
    onComplete();
  };

  const markGuideAsCompleted = async () => {
    try {
      await AsyncStorage.setItem("hasSeenServiceIntro", "true");
    } catch (error) {
      console.error("Failed to save service guide completion:", error);
    }
  };

  if (!isVisible || !currentStep) return null;

  return (
    <GuideTooltip
      isVisible={isVisible}
      title={currentStep.title}
      description={currentStep.description}
      position="bottom"
      onNext={handleNext}
      onSkip={handleSkip}
      onClose={handleClose}
      currentStep={currentStepIndex + 1}
      totalSteps={guideSteps.length}
      nextButtonText={getNextButtonText()}
      skipButtonText="건너뛰기"
      iconName={currentStep.iconName}
    />
  );
};

export default ServiceGuide;
