import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import GuideStepModal from "../components/GuideStepModal";
import { PetMallContent } from "../components/PetMallContent";
import { PetWalkerContent } from "../components/PetWalkerContent";
import PetInfoHeader from "../components/PetInfoHeader";
import AdBanner from "../components/AdBanner";
import ServiceGuide from "../components/ServiceGuide";
import WalkerRecruitmentModal from "../components/WalkerRecruitmentModal";
import { SERVICE_MODE_CONFIG, ServiceMode } from "../constants/ServiceModes";
import { useHelperStatus } from "../hooks/useHelperStatus";
import { useGuide } from "../hooks/useGuide";
import { useGuideContext } from "../contexts/GuideContext";
import { usePet } from "../contexts/PetContext";
import { rf } from "../utils/responsive";
import { RootStackParamList } from "../index";
import {
  headerStyles,
  homeScreenStyles,
  modalStyles,
  modeStyles,
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
  const { handleGuideNext: onGuideNext } = useGuide();
  const { setGuideActive, setGuideStep } = useGuideContext();
  const { petInfo, refreshPetInfo } = usePet();  // PetContext 사용
  const [serviceMode, setServiceMode] = useState<ServiceMode>("PW");
  const [searchQuery, setSearchQuery] = useState("");
  const [showWalkerModal, setShowWalkerModal] = useState(true);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showServiceGuide, setShowServiceGuide] = useState(false);
  const [hasPetInfo, setHasPetInfo] = useState<boolean | null>(null);
  const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null);
  const [currentGuideStep, setCurrentGuideStep] = useState(0);
  const [showGuideOverlay, setShowGuideOverlay] = useState(false);
  const [showStepModal, setShowStepModal] = useState(false);
  
  // 화면 포커스될 때마다 펫 정보 갱신 (단, 너무 자주 호출되지 않도록 제한)
  const lastRefreshRef = useRef<number>(0);
  useFocusEffect(
    useCallback(() => {
      const now = Date.now();
      // 마지막 갱신으로부터 5초 이상 경과한 경우에만 갱신
      if (now - lastRefreshRef.current > 5000) {
        console.log('🔄 HomeScreen focused - refreshing pet info');
        lastRefreshRef.current = now;
        refreshPetInfo();
      } else {
        console.log('⏭️ HomeScreen focused - skipping refresh (too soon)');
      }
    }, [refreshPetInfo])
  );

  // 애니메이션 값 (Pet Walker, Pet Mall)
  const petWalkerScale = useRef(new Animated.Value(1)).current;
  const petMallScale = useRef(new Animated.Value(1)).current;

  // Pet Walker/Mall Scale 애니메이션 (통통 튀는 효과)
  useEffect(() => {
    const currentStepData = guideSteps[currentGuideStep];
    
    if (showGuideOverlay && currentStepData?.id === 'pet_walker_button') {
      // Pet Walker 통통 튀는 애니메이션
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(petWalkerScale, {
            toValue: 1.05,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(petWalkerScale, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    } else {
      petWalkerScale.setValue(1);
    }
  }, [showGuideOverlay, currentGuideStep, petWalkerScale]);

  useEffect(() => {
    const currentStepData = guideSteps[currentGuideStep];
    
    if (showGuideOverlay && currentStepData?.id === 'pet_mall_button') {
      // Pet Mall 통통 튀는 애니메이션
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(petMallScale, {
            toValue: 1.05,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(petMallScale, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    } else {
      petMallScale.setValue(1);
    }
  }, [showGuideOverlay, currentGuideStep, petMallScale]);

  // 가이드 상태 변화 로그
  React.useEffect(() => {
    console.log("📊 [DEBUG] Guide states changed:");
    console.log("  - showServiceGuide:", showServiceGuide);
    console.log("  - showGuideOverlay:", showGuideOverlay);
    console.log("  - showStepModal:", showStepModal);
    console.log("  - currentGuideStep:", currentGuideStep);
    console.log("  - isFirstTime:", isFirstTime);
    console.log("  - hasPetInfo:", hasPetInfo);
  }, [showServiceGuide, showGuideOverlay, showStepModal, currentGuideStep, isFirstTime, hasPetInfo]);

  const { helperStatus, becomeHelper } = useHelperStatus();

  // Refs for guide targets
  const petWalkerButtonRef = useRef<View | null>(null);
  const petMallButtonRef = useRef<View | null>(null);
  const walkRequestButtonRef = useRef<View | null>(null);
  const walkRequestListRef = useRef<View | null>(null);
  const shopButtonRef = useRef<View | null>(null);
  const scrollViewRef = useRef<ScrollView | null>(null);

  const handleNavigateToHelper = () => {
    navigation.navigate("HelperDashboard");
  };

  const handleJoinHelper = async () => {
    await becomeHelper();
    handleNavigateToHelper();
  };

  const currentMode = SERVICE_MODE_CONFIG[serviceMode];

  const handleCategoryPress = (category: string) => {
    navigation.navigate("Shop", { category });
  };

  // AsyncStorage 초기화 함수 (디버깅용)
  const clearGuideData = async () => {
    try {
      await AsyncStorage.removeItem("hasSeenServiceIntro");
      await AsyncStorage.removeItem("petInfo");
      console.log("🧹 [DEBUG] Cleared guide data from AsyncStorage");
    } catch (error) {
      console.error("❌ [ERROR] Failed to clear guide data:", error);
    }
  };

  // 개발용: 가이드 강제 시작 함수
  const forceStartGuide = () => {
    console.log("🔧 [DEBUG] Force starting guide");
    setShowServiceGuide(true);
    setShowGuideOverlay(true);
    setShowStepModal(true);
    setCurrentGuideStep(0);
  };

  // 최초 실행 여부 확인 함수
  const checkFirstTimeUser = useCallback(async () => {
    try {
      const hasSeenIntro = await AsyncStorage.getItem("hasSeenServiceIntro");
      console.log("🔍 [DEBUG] hasSeenIntro from AsyncStorage:", hasSeenIntro);
      const isFirstTimeUser = !hasSeenIntro;
      console.log("🔍 [DEBUG] isFirstTimeUser:", isFirstTimeUser);
      setIsFirstTime(isFirstTimeUser);
      return isFirstTimeUser;
    } catch (error) {
      console.error("❌ [ERROR] Failed to check first time user:", error);
      setIsFirstTime(true);
      return true;
    }
  }, []);

  // 반려동물 정보 확인 함수
  const checkPetInfo = useCallback(async () => {
    try {
      const savedPetInfo = await AsyncStorage.getItem("petInfo");
      console.log("🔍 [DEBUG] savedPetInfo from AsyncStorage:", savedPetInfo);
      if (savedPetInfo) {
        const petInfo: PetInfo = JSON.parse(savedPetInfo);
        console.log("🔍 [DEBUG] parsed petInfo:", petInfo);
        // 필수 정보가 있는지 확인
        const hasEssentialInfo = !!(petInfo.name && petInfo.breed);
        console.log("🔍 [DEBUG] hasEssentialInfo:", hasEssentialInfo);
        setHasPetInfo(hasEssentialInfo);
        return hasEssentialInfo;
      } else {
        console.log("🔍 [DEBUG] No savedPetInfo found");
        setHasPetInfo(false);
        return false;
      }
    } catch (error) {
      console.error("❌ [ERROR] Failed to check pet info:", error);
      setHasPetInfo(false);
      return false;
    }
  }, []);

  // 서비스 가이드 표시 여부 결정
  const checkAndShowServiceGuide = useCallback(async () => {
    console.log("🚀 [DEBUG] checkAndShowServiceGuide called");
    const isFirstTime = await checkFirstTimeUser();
    const hasPetInfo = await checkPetInfo();
    
    console.log("🔍 [DEBUG] Final check results:");
    console.log("  - isFirstTime:", isFirstTime);
    console.log("  - hasPetInfo:", hasPetInfo);
    console.log("  - Should show guide:", isFirstTime && !hasPetInfo);
    
    // 최초 실행이고 반려동물 정보가 없을 때만 가이드 표시
    if (isFirstTime && !hasPetInfo) {
      console.log("✅ [DEBUG] Starting guide in 1.5 seconds...");
      
      // 스크롤 코드 제거 - 현재 위치에서 가이드 시작
      
      setTimeout(() => {
        console.log("🎯 [DEBUG] Setting guide states to true");
        setShowServiceGuide(true);
        setShowGuideOverlay(true);
        setShowStepModal(true);
        setCurrentGuideStep(0);
        
        // GuideContext 업데이트
        setGuideActive(true);
        setGuideStep(0);
      }, 1500); // 화면 로딩 후 충분한 시간
    } else {
      console.log("❌ [DEBUG] Guide conditions not met - not showing guide");
    }
  }, [checkFirstTimeUser, checkPetInfo]);

  // 화면이 포커스될 때마다 체크 (하지만 서비스 가이드는 최초 1회만)
  useFocusEffect(
    useCallback(() => {
      console.log("🔄 [DEBUG] useFocusEffect called, isFirstTime:", isFirstTime);
      if (isFirstTime === null) {
        console.log("🔄 [DEBUG] First time loading - checking service guide");
        // 최초 로딩 시에만 서비스 가이드 체크
        checkAndShowServiceGuide();
      } else {
        console.log("🔄 [DEBUG] Not first time - only checking pet info");
        // 이후에는 반려동물 정보만 체크
        checkPetInfo();
      }
    }, [isFirstTime, checkAndShowServiceGuide, checkPetInfo])
  );

  const handleCompleteServiceGuide = () => {
    console.log("🏁 [DEBUG] Completing service guide");
    setShowServiceGuide(false);
    setShowGuideOverlay(false);
    setShowStepModal(false);
    setIsFirstTime(false);
    
    // GuideContext 업데이트
    setGuideActive(false);
    setGuideStep(0);
  };

  // 가이드 단계별 설명 데이터
  const guideSteps = [
    {
      id: "pet_walker_button",
      title: "🐕 Pet Walker 서비스",
      description: "신뢰할 수 있는 워커가 반려동물과 함께\n안전하고 즐거운 산책을 도와드려요!",
      nextButtonText: "다음",
    },
    {
      id: "pet_mall_button", 
      title: "🛒 Pet Mall 서비스",
      description: "반려동물에게 필요한 모든 용품을\n한 곳에서 편리하게 쇼핑하세요!",
      nextButtonText: "다음",
    },
    {
      id: "walk_booking",
      title: "🐾 반려동물 정보 입력",
      description: "산책 예약을 위해 먼저 반려동물 정보를\n입력해주세요!",
      nextButtonText: "정보 입력하기",
    },
  ];

  const currentStepData = guideSteps[currentGuideStep];

  // 가이드 다음 단계로 이동
  const handleGuideNext = () => {
    console.log("🎯 [DEBUG] handleGuideNext called, currentStep:", currentGuideStep);
    if (currentGuideStep < guideSteps.length - 1) {
      const nextStep = currentGuideStep + 1;
      console.log("🎯 [DEBUG] Moving to next step:", nextStep);
      
      // 즉시 다음 단계로 이동 (모달 사라짐 없이)
      setCurrentGuideStep(nextStep);
      setGuideStep(nextStep); // GuideContext 동기화
      
      // 하이라이트된 요소로 스크롤
      setTimeout(() => {
        const targetRef = nextStep === 0 ? petWalkerButtonRef : 
                         nextStep === 1 ? petMallButtonRef : 
                         nextStep === 2 ? walkRequestButtonRef :
                         walkRequestListRef;
        if (targetRef.current && scrollViewRef.current) {
          targetRef.current.measure((x, y, width, height, pageX, pageY) => {
            console.log("🎯 [DEBUG] Element position:", { x, y, width, height, pageX, pageY });
            
            // 단계별 스크롤 오프셋 조정
            let scrollOffset = 0;
            if (nextStep === 0 || nextStep === 1) {
              // Pet Walker, Pet Mall: 스크롤 안함
              scrollOffset = 0;
              return; // 스크롤 실행 안함
            } else if (nextStep === 2) {
              // Walk Request Button: 스크롤
              scrollOffset = 150;
            } else if (nextStep === 3) {
              // Walk Request List: 스크롤
              scrollOffset = 100;
            }
            
            const scrollY = Math.max(0, pageY - scrollOffset);
            console.log("🎯 [DEBUG] Scroll calculation:", { 
              nextStep, 
              stepName: nextStep === 0 ? "Pet Walker" : nextStep === 1 ? "Pet Mall" : "Walk Booking",
              pageY, 
              scrollOffset, 
              calculatedScrollY: scrollY,
              finalScrollY: Math.max(0, pageY - scrollOffset)
            });
            
            // 스크롤 실행 전 현재 위치 확인
            console.log("🎯 [DEBUG] Before scroll - current scroll position check");
            
            // 모든 단계에서 계산된 scrollY 사용
            console.log("🎯 [DEBUG] Using calculated scrollY:", { 
              nextStep,
              stepName: nextStep === 0 ? "Pet Walker" : nextStep === 1 ? "Pet Mall" : "Walk Booking",
              scrollToY: scrollY
            });
            
            // 스크롤 실행 전 ScrollView 상태 확인
            console.log("🎯 [DEBUG] ScrollView ref exists:", !!scrollViewRef.current);
            
            // 계산된 scrollY로 스크롤
            if (scrollViewRef.current) {
              scrollViewRef.current.scrollTo({ x: 0, y: scrollY, animated: true });
              console.log("🎯 [DEBUG] Scroll executed with calculated scrollY");
            } else {
              console.log("🎯 [ERROR] ScrollView ref is null");
            }
            
            // 스크롤 실행 후 확인
            setTimeout(() => {
              console.log("🎯 [DEBUG] After scroll - scroll should be at:", scrollY);
            }, 500);
          });
        } else {
          console.log("🎯 [DEBUG] Scroll failed - missing refs:", {
            targetRef: !!targetRef.current,
            scrollViewRef: !!scrollViewRef.current
          });
        }
      }, 100);
    } else {
      // Step 2 (My Pet 탭 하이라이트) - 정보 입력 화면으로 이동
      if (currentGuideStep === 2) {
        console.log("[DEBUG] Navigating to Pet Info Input Screen");
        setShowStepModal(false); // 가이드 모달 숨김
        handleCompleteServiceGuide(); // 가이드 완료
        navigation.navigate('PetInfoInput'); // 정보 입력 화면으로 이동
      } else {
        console.log("[DEBUG] Completing guide");
        handleCompleteServiceGuide();
      }
    }
  };

  // 가이드 건너뛰기
  const handleGuideSkip = () => {
    handleCompleteServiceGuide();
  };

  // 가이드 단계별 하이라이트 결정
  const getHighlightState = (stepId: string) => {
    if (!showServiceGuide) return false;
    
    const stepMapping = ["pet_walker_button", "pet_mall_button", "walk_booking"];
    const currentStepId = stepMapping[currentGuideStep];
    
    return currentStepId === stepId;
  };

  // 검색 기능
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (query.trim().length === 0) {
      setShowSearchResults(false);
      setSearchResults([]);
      return;
    }

    // 검색 결과 생성 (실제로는 API 호출)
    const results = generateSearchResults(query, serviceMode);
    setSearchResults(results);
    setShowSearchResults(true);
  };

  const generateSearchResults = (query: string, mode: ServiceMode) => {
    const lowerQuery = query.toLowerCase();
    
    if (mode === "PW") {
      // Pet Walker 서비스 검색 결과
      return [
        {
          id: '1',
          type: 'feature',
          title: '산책 요청하기',
          description: '워커와 매칭하여 산책 서비스를 요청하세요',
          icon: '🚶‍♂️',
          action: () => navigation.navigate('WalkingRequest'),
        },
        {
          id: '2',
          type: 'feature',
          title: '산책 지도',
          description: '실시간 위치 추적과 산책 경로를 확인하세요',
          icon: '🗺️',
          action: () => navigation.navigate('WalkingMap'),
        },
        {
          id: '3',
          type: 'feature',
          title: '워커 매칭',
          description: '나에게 맞는 워커를 찾아보세요',
          icon: '👥',
          action: () => navigation.navigate('WalkerMatching', { 
            bookingData: { timeSlot: '선택된 시간', address: '선택된 주소' } 
          }),
        },
      ].filter(item => 
        item.title.toLowerCase().includes(lowerQuery) || 
        item.description.toLowerCase().includes(lowerQuery)
      );
    } else {
      // Pet Mall 서비스 검색 결과
      return [
        {
          id: '1',
          type: 'category',
          title: '사료',
          description: '건강한 사료를 찾아보세요',
          icon: '🍽️',
          action: () => navigation.navigate('Shop', { category: '사료' }),
        },
        {
          id: '2',
          type: 'category',
          title: '장난감',
          description: '재미있는 장난감을 만나보세요',
          icon: '🎾',
          action: () => navigation.navigate('Shop', { category: '장난감' }),
        },
        {
          id: '3',
          type: 'category',
          title: '의류',
          description: '귀여운 의류를 쇼핑하세요',
          icon: '👕',
          action: () => navigation.navigate('Shop', { category: '의류' }),
        },
      ].filter(item => 
        item.title.toLowerCase().includes(lowerQuery) || 
        item.description.toLowerCase().includes(lowerQuery)
      );
    }
  };

  const handleSearchResultPress = (result: any) => {
    setShowSearchResults(false);
    setSearchQuery('');
    result.action();
  };

  return (
    <>
      {/* 메인 콘텐츠 영역 */}
      <SafeAreaView
        style={[homeScreenStyles.root]}
        edges={['bottom', 'left', 'right']}>
        
        {/* ==================== 메인 콘텐츠 영역 ==================== */}
        <View style={[homeScreenStyles.content, { backgroundColor: currentMode.lightColor }]}>
          {/* ==================== 헤더 영역 (항상 최상단 고정) ==================== */}
          {!showGuideOverlay && (
            <View
              style={[
                headerStyles.header,
                { 
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                },
              ]}>
              {/* 로고 */}
              <Text style={headerStyles.logo}>🐾 Petmily</Text>
              
              {/* 검색바 영역 */}
              <View style={headerStyles.headerRight}>
                <View style={headerStyles.searchBar}>
                  <Text style={headerStyles.searchIcon}>🔍</Text>
                  <TextInput
                    style={headerStyles.searchInput}
                    placeholder={
                      serviceMode === "PW" ? "기능 검색 (산책, 지도, 워커...)" : "상품 검색 (사료, 장난감...)"
                    }
                    placeholderTextColor="#888"
                    value={searchQuery}
                    onChangeText={handleSearch}
                    returnKeyType="search"
                    onFocus={() => {
                      if (searchQuery.trim().length > 0) {
                        setShowSearchResults(true);
                      }
                    }}
                  />
                </View>
              </View>
            </View>
          )}

      {/* 검색 결과 오버레이 */}
      {showSearchResults && (
        <View style={styles.searchResultsOverlay}>
          <View style={styles.searchResultsContainer}>
            <View style={styles.searchResultsHeader}>
              <Text style={styles.searchResultsTitle}>
                {serviceMode === "PW" ? "Pet Walker 기능" : "Pet Mall 카테고리"}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowSearchResults(false);
                  setSearchQuery('');
                }}
                style={styles.closeSearchButton}
              >
                <Text style={styles.closeSearchText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.searchResultsList}>
              {searchResults.length > 0 ? (
                searchResults.map((result) => (
                  <TouchableOpacity
                    key={result.id}
                    style={styles.searchResultItem}
                    onPress={() => handleSearchResultPress(result)}
                  >
                    <Text style={styles.searchResultIcon}>{result.icon}</Text>
                    <View style={styles.searchResultContent}>
                      <Text style={styles.searchResultTitle}>{result.title}</Text>
                      <Text style={styles.searchResultDescription}>{result.description}</Text>
                    </View>
                    <Text style={styles.searchResultArrow}>›</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.noSearchResults}>
                  <Text style={styles.noSearchResultsText}>
                    "{searchQuery}"에 대한 검색 결과가 없습니다
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      )}

      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={homeScreenStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!showGuideOverlay}
      >
        {/* ========== 반려동물 정보 헤더 (스크롤 가능) ========== */}
        {!showGuideOverlay && (
          <View style={homeScreenStyles.section}>
            <Text style={homeScreenStyles.sectionTitle}>🐾 내 반려동물</Text>
            <PetInfoHeader />
          </View>
        )}

        <View style={homeScreenStyles.section}>
          <Text style={homeScreenStyles.sectionTitle}>서비스 선택</Text>
          
          {/* 디버깅 버튼들 (임시) */}
          <View style={{ flexDirection: 'row', marginBottom: 10, gap: 10 }}>
            <TouchableOpacity 
              style={{ backgroundColor: '#ff6b6b', padding: 8, borderRadius: 4 }}
              onPress={clearGuideData}
            >
              <Text style={{ color: 'white', fontSize: rf(12) }}>초기화</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={{ backgroundColor: '#4ecdc4', padding: 8, borderRadius: 4 }}
              onPress={forceStartGuide}
            >
              <Text style={{ color: 'white', fontSize: rf(12) }}>가이드 시작</Text>
            </TouchableOpacity>
          </View>
          <View style={modeStyles.modeRow}>
            {(["PW", "PM"] as const).map((mode) => (
              <Animated.View
                key={mode}
                style={{
                  flex: 1,
                  transform: [{ 
                    scale: mode === "PW" ? petWalkerScale : petMallScale 
                  }]
                }}
              >
                <TouchableOpacity
                  ref={mode === "PW" ? petWalkerButtonRef : petMallButtonRef}
                  style={[
                    modeStyles.modeChip,
                    serviceMode === mode && [
                      modeStyles.modeChipActive,
                      { backgroundColor: SERVICE_MODE_CONFIG[mode].color },
                    ],
                    // 가이드 모드일 때 하이라이트 border 추가
                    showGuideOverlay && (
                      (mode === "PW" && currentStepData?.id === "pet_walker_button") ||
                      (mode === "PM" && currentStepData?.id === "pet_mall_button")
                    ) && {
                      borderWidth: 3,
                      borderColor: '#4A90E2',
                    },
                  ]}
                  onPress={() => setServiceMode(mode)}>
                  <View style={modeStyles.modeIconContainer}>
                    <Text style={modeStyles.modeIcon}>
                      {SERVICE_MODE_CONFIG[mode].icon}
                    </Text>
                  </View>
                  <Text
                    style={[
                      modeStyles.modeChipTitle,
                      serviceMode === mode && modeStyles.modeChipTextActive,
                    ]}>
                    {SERVICE_MODE_CONFIG[mode].title}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </View>

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

        {/* ========== 광고 배너 (자동 슬라이더) ========== */}
        {!showGuideOverlay && (
          <View style={homeScreenStyles.section}>
            <Text style={homeScreenStyles.sectionTitle}>🎁 오늘의 특가</Text>
            <AdBanner />
          </View>
        )}

        {serviceMode === "PW" ? (
          <PetWalkerContent 
            currentMode={currentMode}
            walkRequestButtonRef={walkRequestButtonRef}
            walkRequestListRef={walkRequestListRef}
            showGuideOverlay={showGuideOverlay}
            currentGuideStep={currentStepData?.id}
          />
        ) : (
          <View ref={shopButtonRef}>
            <PetMallContent
              currentMode={currentMode}
              onCategoryPress={handleCategoryPress}
            />
          </View>
        )}
      </ScrollView>

      {/* 워커 모집 모달 */}
      <WalkerRecruitmentModal
        visible={showWalkerModal}
        onClose={() => setShowWalkerModal(false)}
        onDismiss={() => setShowWalkerModal(false)}
      />

        </View>
      </SafeAreaView>
      
      {/* 단계별 가이드 모달 */}
      <GuideStepModal
        isVisible={showStepModal}
        title={currentStepData?.title || ""}
        description={currentStepData?.description || ""}
        onNext={handleGuideNext}
        onSkip={handleGuideSkip}
        currentStep={currentGuideStep + 1}
        totalSteps={guideSteps.length}
        nextButtonText={currentStepData?.nextButtonText}
      />
    </>
  );
};

const styles = StyleSheet.create({
  searchResultsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  searchResultsContainer: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 15,
    maxHeight: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  searchResultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchResultsTitle: {
    fontSize: rf(16),
    fontWeight: 'bold',
    color: '#333',
  },
  closeSearchButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeSearchText: {
    fontSize: rf(16),
    color: '#666',
  },
  searchResultsList: {
    maxHeight: 300,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f8f8',
  },
  searchResultIcon: {
    fontSize: rf(24),
    marginRight: 15,
  },
  searchResultContent: {
    flex: 1,
  },
  searchResultTitle: {
    fontSize: rf(16),
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  searchResultDescription: {
    fontSize: rf(14),
    color: '#666',
  },
  searchResultArrow: {
    fontSize: rf(20),
    color: '#ccc',
  },
  noSearchResults: {
    padding: 30,
    alignItems: 'center',
  },
  noSearchResultsText: {
    fontSize: rf(14),
    color: '#666',
    textAlign: 'center',
  },
});

export default HomeScreen;
