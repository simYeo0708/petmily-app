import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
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
import { searchProducts, BackendSearchResult } from "../services/SearchService";

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

const resolveModeIconSource = (icon: string) =>
  icon.startsWith("@") ? MODE_ICON_SOURCE_MAP[icon] ?? MODE_ICON_SOURCE_MAP["@shop.png"] : null;

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
  const { petInfo, refreshPetInfo } = usePet();  // PetContext 사용
  const [serviceMode, setServiceMode] = useState<ServiceMode>("PW");
  const [searchQuery, setSearchQuery] = useState("");
  const [showWalkerModal, setShowWalkerModal] = useState(true);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showServiceGuide, setShowServiceGuide] = useState(false);
  const [hasPetInfo, setHasPetInfo] = useState<boolean | null>(null);
  const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null);
  const [isSearching, setIsSearching] = useState(false);
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
        lastRefreshRef.current = now;
        refreshPetInfo();
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

  const handleNavigateToMyPet = () => {
    navigation.navigate("Main", { initialTab: "MyPetTab" });
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
    } catch (error) {
    }
  };

  // 개발용: 가이드 강제 시작 함수
  const forceStartGuide = () => {
    setShowServiceGuide(true);
    setShowGuideOverlay(true);
    setShowStepModal(true);
    setCurrentGuideStep(0);
  };

  // 최초 실행 여부 확인 함수
  const checkFirstTimeUser = useCallback(async () => {
    try {
      const hasSeenIntro = await AsyncStorage.getItem("hasSeenServiceIntro");
      const isFirstTimeUser = !hasSeenIntro;
      setIsFirstTime(isFirstTimeUser);
      return isFirstTimeUser;
    } catch (error) {
      setIsFirstTime(true);
      return true;
    }
  }, []);

  // 반려동물 정보 확인 함수
  const checkPetInfo = useCallback(async () => {
    try {
      const savedPetInfo = await AsyncStorage.getItem("petInfo");
      if (savedPetInfo) {
        const petInfo: PetInfoType = JSON.parse(savedPetInfo);
        // 필수 정보가 있는지 확인
        const hasEssentialInfo = !!(petInfo.name && petInfo.breed);
        setHasPetInfo(hasEssentialInfo);
        return hasEssentialInfo;
      } else {
        setHasPetInfo(false);
        return false;
      }
    } catch (error) {
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
      
      // 스크롤 코드 제거 - 현재 위치에서 가이드 시작
      
      setTimeout(() => {
        setShowServiceGuide(true);
        setShowGuideOverlay(true);
        setShowStepModal(true);
        setCurrentGuideStep(0);
        
        // GuideContext 업데이트
        setGuideActive(true);
        setGuideStep(0);
      }, 1500); // 화면 로딩 후 충분한 시간
    } else {
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
    setShowGuideOverlay(false);
    setShowStepModal(false);
    setIsFirstTime(false);
    
    // GuideContext 업데이트
    setGuideActive(false);
    setGuideStep(0);
  };

  // 가이드 단계별 설명 데이터
  const guideSteps: Array<GuideStepType & { iconName: IconName }> = [
    {
      id: "pet_walker_button",
      title: "Pet Walker 서비스",
      description: "신뢰할 수 있는 워커가 반려동물과 함께\n안전하고 즐거운 산책을 도와드려요!",
      nextButtonText: "다음",
      iconName: "walker",
    },
    {
      id: "pet_mall_button",
      title: "Pet Mall 서비스",
      description: "반려동물에게 필요한 모든 용품을\n한 곳에서 편리하게 쇼핑하세요!",
      nextButtonText: "다음",
      iconName: "shop",
    },
    {
      id: "walk_booking",
      title: "반려동물 정보 입력",
      description: "산책 예약을 위해 먼저 반려동물 정보를\n입력해주세요!",
      nextButtonText: "정보 입력하기",
      iconName: "paw",
    },
  ];

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
        handleCompleteServiceGuide(); // 가이드 완료
        navigation.navigate('PetInfoInput'); // 정보 입력 화면으로 이동
      } else {
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

    setShowSearchResults(true);
  };

  const generateWalkerSearchResults = React.useCallback((query: string): SearchResult[] => {
    const lowerQuery = query.toLowerCase();
    
    const walkerResults: SearchResult[] = [
      {
        id: '1',
        type: 'feature',
        title: '산책 요청하기',
        description: '워커와 매칭하여 산책 서비스를 요청하세요',
        iconName: 'walker',
        action: () => navigation.navigate('WalkingRequest'),
      },
      {
        id: '2',
        type: 'feature',
        title: '산책 지도',
        description: '실시간 위치 추적과 산책 경로를 확인하세요',
        iconName: 'map',
        action: () => navigation.navigate('WalkingMap'),
      },
      {
        id: '3',
        type: 'feature',
        title: '워커 매칭',
        description: '나에게 맞는 워커를 찾아보세요',
        iconName: 'paw',
        action: () => navigation.navigate('WalkerMatching', { 
          bookingData: { timeSlot: '선택된 시간', address: '선택된 주소' } 
        }),
      },
    ];

    return walkerResults.filter(item => 
      item.title.toLowerCase().includes(lowerQuery) || 
      item.description.toLowerCase().includes(lowerQuery)
    );
  }, [navigation]);

  const handleSearchResultPress = (result: SearchResult) => {
    setShowSearchResults(false);
    setSearchQuery('');
    result.action();
  };

  const mapProductResultToSearchResult = React.useCallback((item: BackendSearchResult): SearchResult => {
    const metadata = (item.metadata ?? {}) as Record<string, unknown>;
    const rawPrice = metadata.price;
    const numericPrice =
      typeof rawPrice === 'number'
        ? rawPrice
        : typeof rawPrice === 'string' && !Number.isNaN(Number(rawPrice))
        ? Number(rawPrice)
        : undefined;

    const formattedPrice = typeof numericPrice === 'number' ? `${numericPrice.toLocaleString()}원` : undefined;
    const descriptionPieces = [
      formattedPrice,
      item.description ?? undefined,
    ].filter(Boolean);

    const categoryDisplay = typeof metadata.category === 'string' ? metadata.category : undefined;
    const categoryForNavigation =
      (categoryDisplay && SHOP_CATEGORY_MAP[categoryDisplay]) || '전체';

    return {
      id: item.id,
      type: 'service',
      title: item.title ?? '상품',
      description: descriptionPieces.join(' • ') || '상품 상세 보기',
      iconName: 'shop',
      action: () => navigation.navigate('Shop', { category: categoryForNavigation }),
    };
  }, [navigation]);

  React.useEffect(() => {
    let cancelled = false;

    const runSearch = async () => {
      const trimmed = searchQuery.trim();

      if (trimmed.length === 0) {
        setSearchResults([]);
        setShowSearchResults(false);
        setIsSearching(false);
        return;
      }

      if (serviceMode === "PW") {
        const localResults = generateWalkerSearchResults(trimmed);
        if (!cancelled) {
          setSearchResults(localResults);
          setIsSearching(false);
        }
        return;
      }

      setIsSearching(true);
      const backendResults = await searchProducts(trimmed);
      if (cancelled) {
        return;
      }

      const mapped = backendResults.map(mapProductResultToSearchResult);
      setSearchResults(mapped);
      setIsSearching(false);
    };

    runSearch();

    return () => {
      cancelled = true;
    };
  }, [generateWalkerSearchResults, mapProductResultToSearchResult, searchQuery, serviceMode]);

  return (
    <>
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
                      <Image
                        source={resolveModeIconSource(SERVICE_MODE_CONFIG[mode].icon)}
                        style={modeStyles.modeIconImage}
                        resizeMode="contain"
                      />
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
