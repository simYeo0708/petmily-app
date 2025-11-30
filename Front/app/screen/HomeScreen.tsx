import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StatusBar,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import GuideStepModal from "../components/GuideStepModal";
import { PetMallContent } from "../components/PetMallContent";
import { PetWalkerContent } from "../components/PetWalkerContent";
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
import { IconImage, IconName } from "../components/IconImage";
import { Ionicons } from "@expo/vector-icons";
import {
  GuideStep as GuideStepType,
  SearchResult as SearchResultType,
  PetInfo as PetInfoType,
} from "../types/HomeScreen";
import { guideSteps } from "../data/guideData";
import { useHomeSearch } from "../hooks/useHomeSearch";
import { useServiceMode } from "../hooks/useServiceMode";
import { useHomeGuide } from "../hooks/useHomeGuide";

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

type SearchResult = SearchResultType;

const MODE_ICON_SOURCE_MAP: Record<string, any> = {
  "@dog_food.png": require("../../assets/images/dog_food.png"),
  "@dog_snack.png": require("../../assets/images/dog_snack.png"),
  "@cat_food.png": require("../../assets/images/cat_food.png"),
  "@cat_snack.png": require("../../assets/images/cat_snack.png"),
  "@toy.png": require("../../assets/images/toy.png"),
  "@toilet.png": require("../../assets/images/toilet.png"),
  "@grooming.png": require("../../assets/images/grooming.png"),
  "@clothing.png": require("../../assets/images/clothing.png"),
  "@outdoor.png": require("../../assets/images/outdoor.png"),
  "@house.png": require("../../assets/images/house.png"),
  "@shop.png": require("../../assets/images/shop.png"),
  "@walker.png": require("../../assets/images/walker.png"),
};

const resolveModeIconSource = (icon: string) => {
  if (!icon.startsWith("@")) return null;
  const source = MODE_ICON_SOURCE_MAP[icon] ?? MODE_ICON_SOURCE_MAP["@shop.png"];
  if (!source) {
    console.warn(`[HomeScreen] 아이콘 소스를 찾을 수 없습니다: ${icon}, 기본값 사용`);
    return MODE_ICON_SOURCE_MAP["@shop.png"];
  }
  return source;
};

const SHOP_CATEGORY_MAP: Record<string, string> = {
  '사료': '강아지 사료',
  '간식': '강아지 간식',
  '장난감': '장난감',
  '용품': '외출 용품',
  '패션': '의류',
  '건강관리': '미용 용품',
  '위생용품': '배변용품',
  '기타': '전체',
};

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { handleGuideNext: onGuideNext } = useGuide();
  const { setGuideActive, setGuideStep } = useGuideContext();
  const { petInfo, refreshPetInfo } = usePet();
  
  // 커스텀 훅 사용
  const { serviceMode, setServiceMode, currentMode } = useServiceMode("PW");
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    showSearchResults,
    setShowSearchResults,
    isSearching,
    setIsSearching,
  } = useHomeSearch(serviceMode);
  const {
    showServiceGuide,
    showGuideOverlay,
    showStepModal,
    setShowStepModal,
    currentGuideStep,
    setCurrentGuideStep,
    hasPetInfo,
    isFirstTime,
    petWalkerScale,
    petMallScale,
    handleCompleteServiceGuide,
    getGuideFocusCallback,
    forceStartGuide,
  } = useHomeGuide();
  
  const [showWalkerModal, setShowWalkerModal] = useState(true);
  
  // 화면 포커스될 때마다 펫 정보 갱신 (단, 너무 자주 호출되지 않도록 제한)
  const lastRefreshRef = useRef<number>(0);
  useFocusEffect(
    useCallback(() => {
      const now = Date.now();
      // 마지막 갱신으로부터 5초 이상 경과한 경우에만 갱신
      if (now - lastRefreshRef.current > 5000) {
        lastRefreshRef.current = now;
        refreshPetInfo();
      }
    }, [refreshPetInfo])
  );

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
    console.log("[가이드] 상태 변화 - showServiceGuide:", showServiceGuide, "showGuideOverlay:", showGuideOverlay, "showStepModal:", showStepModal, "currentGuideStep:", currentGuideStep, "isFirstTime:", isFirstTime, "hasPetInfo:", hasPetInfo);
  }, [showServiceGuide, showGuideOverlay, showStepModal, currentGuideStep, isFirstTime, hasPetInfo]);

  const { helperStatus, becomeHelper } = useHelperStatus();

  // Refs for guide targets
  const petWalkerButtonRef = useRef<View | null>(null);
  const petMallButtonRef = useRef<View | null>(null);
  const walkRequestButtonRef = useRef<View | null>(null);
  const walkRequestListRef = useRef<View | null>(null);
  const shopButtonRef = useRef<View | null>(null);
  const scrollViewRef = useRef<ScrollView | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const floatingButtonOpacity = useRef(new Animated.Value(1)).current;

  const handleNavigateToHelper = () => {
    navigation.navigate("HelperDashboard");
  };

  const handleNavigateToMyPet = () => {
    // TabNavigator 내의 MyPetTab으로 이동
    navigation.navigate("Main", { initialTab: "MyPetTab" });
  };

  const handleCategoryPress = (category: string) => {
    navigation.navigate("Shop", { category });
  }; 

  // 화면이 포커스될 때마다 체크 (하지만 서비스 가이드는 최초 1회만)
  useFocusEffect(
    useCallback(() => {
      getGuideFocusCallback(setGuideActive, setGuideStep)();
    }, [isFirstTime, getGuideFocusCallback, setGuideActive, setGuideStep])
  );



  const currentStepData = guideSteps[currentGuideStep];

  // 가이드 다음 단계로 이동
  const handleGuideNext = () => {
    if (currentGuideStep < guideSteps.length - 1) {
      const nextStep = currentGuideStep + 1;
      
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
            
            // 스크롤 실행 전 ScrollView 상태 확인
            
            // 계산된 scrollY로 스크롤
            if (scrollViewRef.current) {
              scrollViewRef.current.scrollTo({ x: 0, y: scrollY, animated: true });
            } else {
            }
            
            // 스크롤 실행 후 확인
            setTimeout(() => {
            }, 500);
          });
        }
      }, 100);
    } else {
      // Step 2 (My Pet 탭 하이라이트) - 정보 입력 화면으로 이동
      if (currentGuideStep === 2) {
        setShowStepModal(false); // 가이드 모달 숨김
        handleCompleteServiceGuide(setGuideActive, setGuideStep); // 가이드 완료
        navigation.navigate('PetInfoInput'); // 정보 입력 화면으로 이동
      } else {
        handleCompleteServiceGuide(setGuideActive, setGuideStep);
      }
    }
  };

  // 가이드 건너뛰기
  const handleGuideSkip = () => {
    handleCompleteServiceGuide(setGuideActive, setGuideStep);
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
  };

  const handleSearchResultPress = (result: SearchResult) => {
    setShowSearchResults(false);
    setSearchQuery('');
    result.action();
  };

  return (
    <>
    <StatusBar barStyle="dark-content" backgroundColor={"#000000"}/>
      {/* 메인 콘텐츠 영역 */}
      <SafeAreaView
        style={[homeScreenStyles.root]}
        edges={['top', 'left', 'right']}>
        {/* ==================== 메인 콘텐츠 영역 ==================== */}
        <View style={[homeScreenStyles.content, { backgroundColor: currentMode.lightColor }]}>
          {/* ==================== 헤더 영역 (항상 최상단 고정) ==================== */}
          {!showGuideOverlay && (
            <View
              style={[
                headerStyles.header,
                { 
                  backgroundColor: "#FFFFFF",
                },
              ]}>
              {/* 로고 */}
              <View style={headerStyles.logoContainer}>
                <IconImage name="paw" size={22} style={headerStyles.logoIcon} />
                <Text style={headerStyles.logoText}>Petmily</Text>
              </View>
              
              {/* 검색바 영역 */}
              <View style={headerStyles.headerRight}>
                <View style={headerStyles.searchBar}>
                  <Ionicons name="search" size={16} color="#888" style={headerStyles.searchIcon} />
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
                <TouchableOpacity
                  onPress={handleNavigateToMyPet}
                  style={headerStyles.petAvatar}>
                  {petInfo?.hasPhoto && petInfo.photoUri ? (
                    <Image
                      source={{ uri: petInfo.photoUri }}
                      style={headerStyles.petAvatarImage}
                    />
                  ) : (
                  <View style={headerStyles.petAvatarPlaceholder}>
                    {petInfo?.name ? (
                      <Text style={headerStyles.petAvatarInitial}>
                        {petInfo.name.slice(0, 1)}
                      </Text>
                    ) : (
                      <IconImage name="paw" size={20} />
                    )}
                  </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

      {/* 검색 결과 오버레이 (투명도 0) */}
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
                <Ionicons name="close" size={20} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView 
              style={styles.searchResultsList}
              nestedScrollEnabled={true}
              keyboardShouldPersistTaps="handled"
            >
              {isSearching ? (
                <View style={styles.noSearchResults}>
                  <Text style={styles.noSearchResultsText}>검색 중입니다...</Text>
                </View>
              ) : searchResults.length > 0 ? (
                searchResults.map((result) => (
                  <TouchableOpacity
                    key={result.id}
                    style={styles.searchResultItem}
                    onPress={() => handleSearchResultPress(result)}
                  >
                    {result.iconName && (
                      <IconImage
                        name={result.iconName}
                        size={28}
                        style={styles.searchResultIcon}
                      />
                    )}
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
                    &quot;{searchQuery}&quot;에 대한 검색 결과가 없습니다
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
        onScroll={(event) => {
          const currentScrollY = event.nativeEvent.contentOffset.y;
          setScrollY(currentScrollY);
          
          // 스크롤 위치에 따라 투명도 조절 (50px 이상 스크롤 시 투명하게)
          const threshold = 50;
          const maxOpacity = 1;
          const minOpacity = 0.3;
          
          if (currentScrollY > threshold) {
            // 스크롤이 내려갔을 때 투명도 감소
            const opacity = Math.max(
              minOpacity,
              maxOpacity - (currentScrollY - threshold) / 200 // 200px 스크롤 시 최소 투명도 도달
            );
            Animated.timing(floatingButtonOpacity, {
              toValue: opacity,
              duration: 100,
              useNativeDriver: true,
            }).start();
          } else {
            // 스크롤이 위로 올라왔을 때 투명도 복원
            Animated.timing(floatingButtonOpacity, {
              toValue: maxOpacity,
              duration: 100,
              useNativeDriver: true,
            }).start();
          }
        }}
        scrollEventThrottle={16}
      >
        {!showGuideOverlay && (
        <View style={homeScreenStyles.fullWidthBanner}>
          <AdBanner />
        </View>
      )}
        <View style={homeScreenStyles.section}>
          {/* 디버깅 버튼들 (임시) */}
          {/* <View style={{ flexDirection: 'row',justifyContent:'center', marginBottom: 10, gap: 10 }}>
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
          </View> */}

          {/* 서비스 선택 */}
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
                    {SERVICE_MODE_CONFIG[mode].icon.startsWith("@") ? (
                      (() => {
                        const iconSource = resolveModeIconSource(SERVICE_MODE_CONFIG[mode].icon);
                        if (!iconSource) {
                          console.warn(`[HomeScreen] 아이콘 소스를 찾을 수 없습니다 - mode: ${mode}, icon: ${SERVICE_MODE_CONFIG[mode].icon}`);
                          return (
                            <Ionicons 
                              name={mode === "PM" ? "storefront" : "walk"} 
                              size={36} 
                              color={serviceMode === mode ? "#FFF" : SERVICE_MODE_CONFIG[mode].color}
                            />
                          );
                        }
                        return (
                          <Image
                            source={iconSource}
                            style={modeStyles.modeIconImage}
                            resizeMode="contain"
                            onError={(error) => {
                              console.error(`[HomeScreen] 아이콘 로드 실패 - mode: ${mode}, icon: ${SERVICE_MODE_CONFIG[mode].icon}`, error);
                            }}
                          />
                        );
                      })()
                    ) : (
                      <Text style={modeStyles.modeIcon}>
                        {SERVICE_MODE_CONFIG[mode].icon}
                      </Text>
                    )}
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
        
        {/* ========== 광고 배너 (자동 슬라이더) ========== */}
          {serviceMode === "PW" && (
            <PetWalkerContent 
              currentMode={currentMode}
              walkRequestButtonRef={walkRequestButtonRef}
              walkRequestListRef={walkRequestListRef}
              showGuideOverlay={showGuideOverlay}
              currentGuideStep={currentStepData?.id}
            />
          )}
          {serviceMode === "PM" && (
            <View ref={shopButtonRef}>
              <PetMallContent
                currentMode={currentMode}
                onCategoryPress={handleCategoryPress}
              />
            </View>
          )}
      </ScrollView>

      {/* 워커 모집 모달 */}
      {serviceMode === "PW" && (
        <WalkerRecruitmentModal
          visible={showWalkerModal}
          onClose={() => setShowWalkerModal(false)}
          onDismiss={() => setShowWalkerModal(false)}
        />
      )}

        </View>
      </SafeAreaView>
      
      {/* 가이드 시작 플로팅 버튼 */}
      <Animated.View style={{ opacity: floatingButtonOpacity }}>
        <TouchableOpacity
          style={styles.guideButton}
        onPress={() => {
          console.log("[가이드] 가이드 시작 버튼 클릭");
          console.log("[가이드] 현재 scrollY:", scrollY);
          
          // 특정 박스 구간으로 스크롤 (예: 0 위치로 이동)
          // TODO: 원하는 박스 구간의 Y 좌표로 변경 필요
          const targetScrollY = 0;
          
          if (scrollViewRef.current) {
            // Animated.timing을 사용하여 명시적으로 300ms duration 적용
            // transition-all duration-300과 동일한 효과
            const startY = scrollY;
            const diff = targetScrollY - startY;
            const duration = 300; // 300ms duration
            const startTime = Date.now();
            
            // requestAnimationFrame을 사용하여 부드러운 스크롤 애니메이션 구현
            const animateScroll = () => {
              const elapsed = Date.now() - startTime;
              const progress = Math.min(elapsed / duration, 1); // 0 ~ 1
              
              // Easing 함수 적용 (ease-out cubic)
              const easedProgress = 1 - Math.pow(1 - progress, 3);
              
              const currentY = startY + (diff * easedProgress);
              
              if (scrollViewRef.current) {
                scrollViewRef.current.scrollTo({
                  x: 0,
                  y: currentY,
                  animated: false, // 즉시 이동 (애니메이션은 requestAnimationFrame으로 제어)
                });
              }
              
              if (progress < 1) {
                // 아직 애니메이션 진행 중
                requestAnimationFrame(animateScroll);
              } else {
                // 애니메이션 완료
                // 최종 위치로 정확히 이동
                if (scrollViewRef.current) {
                  scrollViewRef.current.scrollTo({
                    x: 0,
                    y: targetScrollY,
                    animated: false,
                  });
                }
                
                // 300ms 애니메이션 완료 후 가이드 시작
                forceStartGuide();
                setGuideActive(true);
                setGuideStep(0);
              }
            };
            
            // 애니메이션 시작
            requestAnimationFrame(animateScroll);
          } else {
            // scrollViewRef가 없을 경우 즉시 실행
            forceStartGuide();
            setGuideActive(true);
            setGuideStep(0);
          }
        }}
          activeOpacity={0.8}
        >
          <Ionicons name="help-circle" size={28} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
      
      {/* 헬퍼 대시보드 플로팅 버튼 */}
      <Animated.View style={{ opacity: floatingButtonOpacity }}>
        <TouchableOpacity
          style={styles.helperDashboardButton}
        onPress={handleNavigateToHelper}
          activeOpacity={0.8}
        >
          <Ionicons name="grid" size={28} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
      
      {/* AI 고객지원 플로팅 버튼 */}
      <Animated.View style={{ opacity: floatingButtonOpacity }}>
        <TouchableOpacity
          style={styles.aiChatButton}
        onPress={() => navigation.navigate('AIChat')}
          activeOpacity={0.8}
        >
          <Ionicons name="chatbubble-ellipses" size={28} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
      
      {/* 서비스 가이드 오버레이 및 하이라이트 */}
      {/* {showServiceGuide && (
        <ServiceGuide
          isVisible={showServiceGuide}
          onComplete={() => handleCompleteServiceGuide(setGuideActive, setGuideStep)}
          serviceMode={serviceMode}
          petWalkerButtonRef={petWalkerButtonRef}
          petMallButtonRef={petMallButtonRef}
          walkBookingButtonRef={walkRequestButtonRef}
          shopButtonRef={shopButtonRef}
          onStepChange={(step) => {
            setCurrentGuideStep(step);
            setGuideStep(step);
          }}
        />
      )} */}

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
        iconName={currentStepData?.iconName}
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
    backgroundColor: 'rgba(0, 0, 0, 0)',
    zIndex: 1000,
  },
  searchResultsContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    maxHeight: 450,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  searchResultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchResultsTitle: {
    fontSize: rf(15),
    fontWeight: '600',
    color: '#333',
  },
  closeSearchButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchResultsList: {
    maxHeight: 380,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f8f8',
    backgroundColor: '#fff',
  },
  searchResultIcon: {
    marginRight: 15,
  },
  searchResultContent: {
    flex: 1,
  },
  searchResultTitle: {
    fontSize: rf(15),
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  searchResultDescription: {
    fontSize: rf(13),
    color: '#666',
    lineHeight: 18,
  },
  searchResultArrow: {
    fontSize: rf(18),
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
  guideButton: {
    position: 'absolute',
    right: 20,
    bottom: 230,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    zIndex: 999,
  },
  helperDashboardButton: {
    position: 'absolute',
    right: 20,
    bottom: 160,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#C59172',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    zIndex: 999,
  },
  aiChatButton: {
    position: 'absolute',
    right: 20,
    bottom: 90,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#C59172',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    zIndex: 999,
  },
});

export default HomeScreen;
