import { useCallback, useState } from 'react';
import { checkFirstTimeUser, checkPetInfo, clearGuideData, markServiceIntroAsSeen } from '../utils/StorageUtils';
import { GUIDE_STEPS, SCROLL_OFFSETS } from '../constants/GuideSteps';

export const useGuide = () => {
  const [showServiceGuide, setShowServiceGuide] = useState(false);
  const [hasPetInfo, setHasPetInfo] = useState<boolean | null>(null);
  const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null);
  const [currentGuideStep, setCurrentGuideStep] = useState(0);
  const [showGuideOverlay, setShowGuideOverlay] = useState(false);
  const [showStepModal, setShowStepModal] = useState(false);

  const checkAndShowServiceGuide = useCallback(async (scrollViewRef?: React.RefObject<any>) => {
    console.log("🚀 [DEBUG] checkAndShowServiceGuide called");
    const isFirstTime = await checkFirstTimeUser();
    const hasPetInfo = await checkPetInfo();
    
    console.log("🔍 [DEBUG] Final check results:");
    console.log("  - isFirstTime:", isFirstTime);
    console.log("  - hasPetInfo:", hasPetInfo);
    console.log("  - Should show guide:", isFirstTime && !hasPetInfo);
    
    // 최초 실행이고 반려동물 정보가 없을 때만 가이드 표시
    if (isFirstTime && !hasPetInfo) {
      console.log("✅ [DEBUG] Starting guide...");
      
      // 가이드 시작 전 스크롤을 최상단으로 즉시 이동
      if (scrollViewRef?.current) {
        console.log("🎯 [DEBUG] Forcing scroll to top before guide starts");
        scrollViewRef.current.scrollTo({ y: 0, animated: false });
      }
      
      // 짧은 지연 후 스크롤 위치 재확인 및 가이드 시작
      setTimeout(() => {
        // 사용자가 스크롤했을 수 있으므로 다시 최상단으로 강제 이동
        if (scrollViewRef?.current) {
          scrollViewRef.current.scrollTo({ y: 0, animated: true });
          console.log("🎯 [DEBUG] Scroll position re-fixed to top (y: 0)");
        }
        
        // 가이드 시작
        console.log("🎯 [DEBUG] Setting guide states to true");
        setShowServiceGuide(true);
        setShowGuideOverlay(true);
        setShowStepModal(true);
        setCurrentGuideStep(0);
      }, 500); // 스크롤 위치 고정 후 가이드 시작
    } else {
      console.log("❌ [DEBUG] Guide conditions not met - not showing guide");
    }
  }, []);

  const handleCompleteServiceGuide = useCallback(() => {
    console.log("🏁 [DEBUG] Completing service guide");
    setShowServiceGuide(false);
    setShowGuideOverlay(false);
    setShowStepModal(false);
    setCurrentGuideStep(0);
    setIsFirstTime(false);
    markServiceIntroAsSeen();
  }, []);

  const handleGuideNext = useCallback((
    currentStep: number,
    scrollViewRef: React.RefObject<any>,
    petWalkerButtonRef: React.RefObject<any>,
    petMallButtonRef: React.RefObject<any>,
    walkRequestButtonRef: React.RefObject<any>,
    walkRequestListRef: React.RefObject<any>,
    navigation?: any
  ) => {
    console.log("🎯 [DEBUG] handleGuideNext called, currentStep:", currentStep);
    if (currentStep < GUIDE_STEPS.length - 1) {
      const nextStep = currentStep + 1;
      console.log("🎯 [DEBUG] Moving to next step:", nextStep);
      
      // 즉시 다음 단계로 이동 (모달 사라짐 없이)
      setCurrentGuideStep(nextStep);
      
      // 스크롤이 필요한 경우 (현재는 모든 단계에서 스크롤 안함)
      console.log("🎯 [DEBUG] No scroll needed for step:", nextStep);
    } else {
      // 마지막 단계 (Step 2 - My Pet Tab)
      if (currentStep === 2 && navigation) {
        // My Pet 탭으로 이동하지 않고, 가이드만 완료
        // (TabNavigator에서 My Pet 탭 클릭 시 PetInfoInputModal 열림)
        handleCompleteServiceGuide();
      } else {
        handleCompleteServiceGuide();
      }
    }
  }, [handleCompleteServiceGuide]);

  const handleGuideSkip = useCallback(() => {
    handleCompleteServiceGuide();
  }, [handleCompleteServiceGuide]);

  const getHighlightState = useCallback((stepId: string) => {
    if (!showServiceGuide) return false;
    
    const stepMapping = ["pet_walker_button", "pet_mall_button", "walk_booking"];
    const currentStepId = stepMapping[currentGuideStep];
    
    return currentStepId === stepId;
  }, [showServiceGuide, currentGuideStep]);

  const forceStartGuide = useCallback(() => {
    console.log("🔧 [DEBUG] Force starting guide");
    setShowServiceGuide(true);
    setShowGuideOverlay(true);
    setShowStepModal(true);
    setCurrentGuideStep(0);
  }, []);

  return {
    // State
    showServiceGuide,
    hasPetInfo,
    isFirstTime,
    currentGuideStep,
    showGuideOverlay,
    showStepModal,
    
    // Actions
    checkAndShowServiceGuide,
    handleCompleteServiceGuide,
    handleGuideNext,
    handleGuideSkip,
    getHighlightState,
    forceStartGuide,
    clearGuideData,
    
    // Data
    guideSteps: GUIDE_STEPS,
  };
};
