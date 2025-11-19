import { useState, useEffect, useRef, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Animated } from "react-native";
import { PetInfo as PetInfoType } from "../types/HomeScreen";

export const useHomeGuide = () => {
  const [showServiceGuide, setShowServiceGuide] = useState(false);
  const [showGuideOverlay, setShowGuideOverlay] = useState(false);
  const [showStepModal, setShowStepModal] = useState(false);
  const [currentGuideStep, setCurrentGuideStep] = useState(0);
  const [hasPetInfo, setHasPetInfo] = useState<boolean | null>(null);
  // 디폴트값을 true로 설정하여 가이드가 잘 동작하는지 확인하기 위함
  const [isFirstTime, setIsFirstTime] = useState<boolean | null>(true);
  
  console.log("[가이드] useHomeGuide 초기화 - isFirstTime 초기값:", null);

  const petWalkerScale = useRef(new Animated.Value(1)).current;
  const petMallScale = useRef(new Animated.Value(1)).current;

  const checkFirstTimeUser = useCallback(async () => {
    try {
      console.log("[가이드] checkFirstTimeUser 함수 호출됨");
      const hasSeenIntro = await AsyncStorage.getItem("hasSeenServiceIntro");
      console.log("[가이드] 최초 실행 체크 - hasSeenServiceIntro:", hasSeenIntro);
      
      // hasSeenIntro가 null이거나 "false" 문자열이면 최초 실행으로 간주
      let isFirstTimeUser: boolean;
      if (hasSeenIntro === null) {
        isFirstTimeUser = true;
        console.log("[가이드] 최초 실행: true (hasSeenServiceIntro가 null)");
      } else if (hasSeenIntro === "false") {
        // "false" 문자열로 저장되어 있으면 최초 실행으로 처리
        isFirstTimeUser = true;
        console.log("[가이드] 최초 실행: true (hasSeenServiceIntro가 'false'로 저장됨 - 최초실행으로 변경)");
      } else {
        isFirstTimeUser = false;
        console.log("[가이드] 최초 실행: false (hasSeenServiceIntro:", hasSeenIntro, ")");
      }
      
      console.log("[가이드] setIsFirstTime 호출 전 - 현재 isFirstTime:", null, "-> 변경될 값:", isFirstTimeUser);
      setIsFirstTime(isFirstTimeUser);
      console.log("[가이드] setIsFirstTime 호출 완료 - isFirstTime:", isFirstTimeUser);
      return isFirstTimeUser;
    } catch (error) {
      console.log("[가이드] 최초 실행 체크 에러:", error);
      setIsFirstTime(true);
      return true;
    }
  }, []);

  const checkPetInfo = useCallback(async () => {
    try {
      const savedPetInfo = await AsyncStorage.getItem("petInfo");
      console.log("[가이드] 반려동물 정보 체크 - savedPetInfo:", savedPetInfo ? "있음" : "없음");
      
      if (savedPetInfo) {
        const petInfo: PetInfoType = JSON.parse(savedPetInfo);
        const hasEssentialInfo = !!(petInfo.name && petInfo.breed);
        console.log("[가이드] 반려동물 정보 체크 - hasEssentialInfo:", hasEssentialInfo, "(name:", petInfo.name, ", breed:", petInfo.breed, ")");
        setHasPetInfo(hasEssentialInfo);
        return hasEssentialInfo;
      } else {
        console.log("[가이드] 반려동물 정보 체크 - hasEssentialInfo: false (petInfo 없음)");
        setHasPetInfo(false);
        return false;
      }
    } catch (error) {
      console.log("[가이드] 반려동물 정보 체크 에러:", error);
      setHasPetInfo(false);
      return false;
    }
  }, []);

  // 훅 마운트 시 즉시 최초 실행 체크 (isFirstTime을 null에서 true/false로 초기화)
  // 앱 재실행 시마다 가이드를 표시하기 위해 hasSeenServiceIntro를 삭제
  useEffect(() => {
    console.log("[가이드] useHomeGuide useEffect - 앱 시작 시 hasSeenServiceIntro 삭제 (매번 가이드 실행)");
    // 앱 재실행 시마다 가이드를 표시하기 위해 저장된 값을 삭제
    AsyncStorage.removeItem("hasSeenServiceIntro").then(() => {
      console.log("[가이드] hasSeenServiceIntro 삭제 완료 - 가이드가 매번 실행됩니다");
      checkFirstTimeUser();
    }).catch((error) => {
      console.log("[가이드] hasSeenServiceIntro 삭제 에러:", error);
      checkFirstTimeUser();
    });
  }, [checkFirstTimeUser]); // checkFirstTimeUser가 정의된 후 실행

  const forceStartGuide = () => {
    setShowServiceGuide(true);
    setShowGuideOverlay(true);
    setShowStepModal(true);
    setCurrentGuideStep(0);
  };

  const clearGuideData = async () => {
    try {
      await AsyncStorage.removeItem("hasSeenServiceIntro");
      await AsyncStorage.removeItem("petInfo");
    } catch (error) {
      // Error handling
    }
  };

  // 서비스 가이드 표시 여부 결정
  const checkAndShowServiceGuide = useCallback(async (setGuideActive?: (active: boolean) => void, setGuideStep?: (step: number) => void) => {
    console.log("[가이드] checkAndShowServiceGuide 함수 실행 시작");
    const isFirstTimeResult = await checkFirstTimeUser();
    const hasPetInfoResult = await checkPetInfo();
    
    console.log("[가이드] 서비스 가이드 체크 - isFirstTime:", isFirstTimeResult, "hasPetInfo:", hasPetInfoResult);
    
    // 최초 실행이고 반려동물 정보가 없을 때만 가이드 표시
    if (isFirstTimeResult && !hasPetInfoResult) {
      console.log("[가이드] 가이드 표시 조건 충족 - 가이드 시작");
      
      setTimeout(() => {
        console.log("[가이드] 가이드 시작 (1.5초 후)");
        setShowServiceGuide(true);
        setShowGuideOverlay(true);
        setShowStepModal(true);
        setCurrentGuideStep(0);
        
        // GuideContext 업데이트 (옵셔널)
        if (setGuideActive) setGuideActive(true);
        if (setGuideStep) setGuideStep(0);
      }, 1500); // 화면 로딩 후 충분한 시간
    } else {
      console.log("[가이드] 가이드 표시 조건 불충족 - 가이드 표시 안함 (isFirstTime:", isFirstTimeResult, ", hasPetInfo:", hasPetInfoResult, ")");
    }
  }, [checkFirstTimeUser, checkPetInfo]);

  // 가이드 완료 처리
  const handleCompleteServiceGuide = useCallback((setGuideActive?: (active: boolean) => void, setGuideStep?: (step: number) => void) => {
    setShowServiceGuide(false);
    setShowGuideOverlay(false);
    setShowStepModal(false);
    setIsFirstTime(false);
    
    // GuideContext 업데이트 (옵셔널)
    if (setGuideActive) setGuideActive(false);
    if (setGuideStep) setGuideStep(0);
  }, []);

  // 화면 포커스 시 가이드 체크 로직 (useFocusEffect 콜백용)
  // 앱 재실행 시마다 가이드를 표시하기 위해 isFirstTime이 true이거나 null일 때 가이드 실행
  const getGuideFocusCallback = useCallback((setGuideActive?: (active: boolean) => void, setGuideStep?: (step: number) => void) => {
    return () => {
      console.log("[가이드] useFocusEffect 실행 - isFirstTime:", isFirstTime);
      
      // isFirstTime이 null이거나 true일 때 가이드 체크 (앱 재실행 시마다 가이드 표시)
      if (isFirstTime === null || isFirstTime === true) {
        // 앱 시작 시마다 서비스 가이드 체크
        console.log("[가이드] isFirstTime이", isFirstTime, "이므로 checkAndShowServiceGuide 실행 (매번 가이드 실행)");
        checkAndShowServiceGuide(setGuideActive, setGuideStep);
      } else {
        // isFirstTime이 false일 때만 반려동물 정보만 체크 (가이드 완료 후)
        console.log("[가이드] isFirstTime이 false이므로 checkPetInfo만 실행");
        checkPetInfo();
      }
    };
  }, [isFirstTime, checkAndShowServiceGuide, checkPetInfo]);

  return {
    showServiceGuide,
    setShowServiceGuide,
    showGuideOverlay,
    setShowGuideOverlay,
    showStepModal,
    setShowStepModal,
    currentGuideStep,
    setCurrentGuideStep,
    hasPetInfo,
    setHasPetInfo,
    isFirstTime,
    setIsFirstTime,
    petWalkerScale,
    petMallScale,
    checkFirstTimeUser,
    checkPetInfo,
    checkAndShowServiceGuide,
    handleCompleteServiceGuide,
    getGuideFocusCallback,
    forceStartGuide,
    clearGuideData,
  };
};

