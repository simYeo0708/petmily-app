import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  Animated,
  Image,
  PanResponder,
  DeviceEventEmitter,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import * as TaskManager from 'expo-task-manager';
import { IconImage } from '../components/IconImage';
import MapService, { MapConfigResponse, LocationResponse, WalkSessionResponse, RouteResponse, AddressInfo } from '../services/MapService';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { useWalkerRouteSimulation } from '../hooks/useWalkerRouteSimulation';
import { WalkingRoute, WALKING_ROUTES } from '../data/walkingRoutes';
import WalkerService from '../services/WalkerService';
import WalkerBookingService from '../services/WalkerBookingService';
import { getOrCreateChatRoomWithWalker } from '../services/ChatRoomService';
import { useWalker } from '../contexts/WalkerContext';

const { width, height } = Dimensions.get('window');

// MapService 인스턴스
const mapService = MapService.getInstance();

const LOCATION_TASK_NAME = 'petmily-walking-location-updates';
const LOCATION_EVENT_NAME = 'petmily.walking.location';
const LIVE_ROUTE_UPDATE_INTERVAL = 90 * 1000; // 약 1.5분
const BACKEND_UPDATE_INTERVAL = 5 * 1000; // 5초

const globalAny = global as any;
if (!globalAny.__PETMILY_LOCATION_TASK_DEFINED__) {
  TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
    if (error) {
      return;
    }
    const locationData = (data as { locations?: Location.LocationObject[] } | undefined)?.locations ?? [];
    if (locationData.length > 0) {
      DeviceEventEmitter.emit(LOCATION_EVENT_NAME, locationData[0]);
    }
    return;
  });
  globalAny.__PETMILY_LOCATION_TASK_DEFINED__ = true;
}

const isWithinKorea = (latitude: number, longitude: number) =>
  latitude >= 33 && latitude <= 39 && longitude >= 124 && longitude <= 132;

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const EARTH_RADIUS_METERS = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * c;
};

interface WalkingMapScreenProps {
  navigation: any;
}

interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: number;
}

const WalkingMapScreen: React.FC<WalkingMapScreenProps> = ({ navigation }) => {
  const [isWalking, setIsWalking] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [locationHistory, setLocationHistory] = useState<LocationData[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [walkingDistance, setWalkingDistance] = useState(0);
  const [walkingTime, setWalkingTime] = useState(0);
  const [currentAddress, setCurrentAddress] = useState<string | null>(null);
  const lastGeocodeTimeRef = useRef<number>(0);
  const GEOCODE_UPDATE_INTERVAL = 10 * 1000; // 10초마다 주소 업데이트
  const startTime = useRef<number | null>(null);
  const [customTime, setCustomTime] = useState('');
  const [selectedAddress, setSelectedAddress] = useState('');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<string[]>([]);
  const [newAddress, setNewAddress] = useState('');
  const [showGuide, setShowGuide] = useState(true);
  const [hasActiveService, setHasActiveService] = useState(false);
  const arrowAnimation = useRef(new Animated.Value(0)).current;
  const locationHistoryRef = useRef<LocationData[]>([]);
  const lastBackendSyncRef = useRef<number>(0);
  const lastLiveRouteUpdateRef = useRef<number>(0);
  const lastLocationRef = useRef<LocationData | null>(null);
  const isTrackingRef = useRef<boolean>(false);
  
  // 현재 워킹 정보
  const [currentWalking, setCurrentWalking] = useState<any>(null);
  const [showTopModal, setShowTopModal] = useState(false);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 100 });
  const [isModalMinimized, setIsModalMinimized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // 산책 정보 오버레이 스와이프 관련 상태
  const [isInfoOverlayHidden, setIsInfoOverlayHidden] = useState(false);
  const infoOverlayTranslateX = useRef(new Animated.Value(0)).current;
  const infoOverlayOpacity = useRef(new Animated.Value(0.85)).current; // 기본 투명도
  
  // 오버레이 드래그 관련 상태
  const [overlayPosition, setOverlayPosition] = useState({ x: 20, y: height - 200 });
  const [isOverlayMinimized, setIsOverlayMinimized] = useState(false);
  
  // 시뮬레이션 리스트 모달 상태
  const [showSimulationListModal, setShowSimulationListModal] = useState(false);
  
  // 워커 전용 산책 요청 모달 상태
  const { isWalker, refreshWalkerStatus } = useWalker(); // 전역 Context에서 워커 여부 가져오기
  const [showWalkerRequestModal, setShowWalkerRequestModal] = useState(false);
  const [walkerBookings, setWalkerBookings] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  
  // 지도 모드 토글 (일반 모드 / 워커 모드)
  const [mapMode, setMapMode] = useState<'general' | 'walker'>('general');
  const toggleAnimation = useRef(new Animated.Value(0)).current; // 0: 일반, 1: 워커
  
  // 워커 등록 권유 모달
  const [showWalkerRegistrationModal, setShowWalkerRegistrationModal] = useState(false);
  
  // 산책 종료 특이사항 입력 모달
  const [showWalkEndNotesModal, setShowWalkEndNotesModal] = useState(false);
  const [walkEndNotes, setWalkEndNotes] = useState('');
  
  // 일반 사용자 모드: 주변 워커 및 이전 산책 정보
  const [nearbyWalkers, setNearbyWalkers] = useState<any[]>([]);
  const [previousWalkers, setPreviousWalkers] = useState<any[]>([]);
  const [completedWalks, setCompletedWalks] = useState<any[]>([]);
  const [isLoadingWalkers, setIsLoadingWalkers] = useState(false);
  
  // 채팅 관련 상태
  const [showChatButton, setShowChatButton] = useState(false);
  
  // 프로필 모달 상태
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<{ id: string; name: string; role: 'walker' | 'user' } | null>(null);
  
  // 플로팅 버튼 펼치기 애니메이션 상태
  const [isFloatingMenuExpanded, setIsFloatingMenuExpanded] = useState(false);
  const floatingMenuAnimation = useRef(new Animated.Value(0)).current;
  
  // 지도 설정 및 위치 정보
  const [mapConfig, setMapConfig] = useState<MapConfigResponse | null>(null);
  const [userLocation, setUserLocation] = useState<LocationResponse | null>(null);
  const [activeLocations, setActiveLocations] = useState<LocationResponse[]>([]);
  
  // 네이티브 지도 참조
  const mapViewRef = useRef<MapView>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<Array<{latitude: number, longitude: number}>>([]);
  const [drawnRouteCoordinates, setDrawnRouteCoordinates] = useState<Array<{latitude: number, longitude: number}>>([]); // 순차적으로 그려지는 경로
  
  // 초기 region 저장 (줌 리셋용)
  const defaultRegionRef = useRef<{
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null>(null);
  
  // 산책 세션 관리
  const walkSessionIdRef = useRef<number | null>(null);

  // 산책 종료 후 경로 재생 모드 (시뮬레이션)
  const [isPlayingRoute, setIsPlayingRoute] = useState(false);
  const [completedRouteData, setCompletedRouteData] = useState<LocationData[] | null>(null);

  // 경로 재생 훅 (산책 종료 후 완료된 경로를 재생)
  const {
    isSimulating,
    currentRoute,
    simulatedPath,
    stats: simulationStats,
    startSimulation,
    stopSimulation,
    resetSimulation,
  } = useWalkerRouteSimulation(
    500, // 0.5초마다 업데이트 (재생)
    (location) => {
      // 경로 재생 위치 업데이트
      const newLocation: LocationData = {
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: location.timestamp,
      };

      setCurrentLocation(newLocation);

      // 카메라 추적 위치 업데이트
      if (mapViewRef.current) {
        mapViewRef.current.animateCamera({
          center: {
            latitude: newLocation.latitude,
            longitude: newLocation.longitude,
          },
          zoom: 17,
        }, { duration: 500 });
      }

      // 현재까지 재생된 경로 표시 (순차적으로 그리기)
      locationHistoryRef.current = [...locationHistoryRef.current, newLocation];
      const coordinates = buildRouteCoordinates(locationHistoryRef.current);
      if (coordinates.length >= 2) {
        setRouteCoordinates(coordinates);
        // 순차적으로 그려지는 경로도 업데이트
        setDrawnRouteCoordinates(coordinates);
      }
    }
  );

  const defaultLatitude = parseFloat(mapConfig?.mapCenterLat ?? '37.5665');
  const defaultLongitude = parseFloat(mapConfig?.mapCenterLon ?? '126.9780');
  const mapLatitude =
    currentLocation && isWithinKorea(currentLocation.latitude, currentLocation.longitude)
      ? currentLocation.latitude
      : defaultLatitude;
  const mapLongitude =
    currentLocation && isWithinKorea(currentLocation.latitude, currentLocation.longitude)
      ? currentLocation.longitude
      : defaultLongitude;
  const mapZoomLevel = mapConfig?.mapZoomLevel ?? 15;
  
  // 초기 region 설정 및 저장
  const initialRegion = useRef({
    latitude: mapLatitude,
    longitude: mapLongitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  }).current;
  
  // 초기 region 저장 (한 번만)
  useEffect(() => {
    if (!defaultRegionRef.current) {
      defaultRegionRef.current = initialRegion;
    }
  }, [initialRegion]);

  useEffect(() => {
    loadMapConfig();
    requestLocationPermission();
    loadCurrentWalking();
    // 워커 여부는 Context에서 가져오므로 별도 확인 불필요
    // 워커인 경우 기본 모드를 워커 모드로 설정
    if (isWalker) {
      setMapMode('walker');
      toggleAnimation.setValue(1);
      loadWalkerBookings();
    } else {
      setMapMode('general');
      toggleAnimation.setValue(0);
      loadNearbyWalkers();
      loadCompletedWalks();
    }
    return () => {
      (async () => {
        try {
          const started = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
          if (started) {
            await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
          }
        } catch (error) {
        }
      })();
    };
  }, [isWalker]); // isWalker가 변경될 때마다 모드 설정

  // 화면이 포커스될 때마다 저장된 산책 시간 정보 다시 로드 (홈 화면과 동기화)
  useFocusEffect(
    useCallback(() => {
      loadCurrentWalking();
      if (mapMode === 'general') {
        loadNearbyWalkers();
        loadCompletedWalks();
      } else if (mapMode === 'walker' && isWalker) {
        loadWalkerBookings();
      }
    }, [currentLocation, mapMode, isWalker]) // currentLocation이 변경되면 주소도 업데이트
  );

  useEffect(() => {
    if (showGuide) {
      startArrowAnimation();
    }
  }, [showGuide]);

  const startArrowAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(arrowAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(arrowAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const loadCurrentWalking = async () => {
    try {
      // 실제 위치 기반으로 주소 가져오기
      let locationAddress = '위치 정보 없음';
      if (currentLocation) {
        try {
          const addressInfo = await mapService.reverseGeocode(
            currentLocation.latitude,
            currentLocation.longitude
          );
          if (addressInfo) {
            locationAddress = addressInfo.roadAddress || addressInfo.jibunAddress || 
              (addressInfo.region2depth && addressInfo.region3depth 
                ? `${addressInfo.region2depth} ${addressInfo.region3depth}` 
                : '위치 정보 없음');
          }
        } catch (error) {
          // 주소 가져오기 실패 시 기본값 유지
        }
      }
      
      // 저장된 산책 시작 시간과 duration 가져오기 (홈 화면과 동일한 값 사용)
      const { getCurrentWalkingStartTime } = require('../utils/WalkingUtils');
      const { startTime: savedStartTime, duration: savedDuration } = await getCurrentWalkingStartTime();
      
      // 실제로는 API에서 현재 워킹 정보를 가져옴
      // 샘플 데이터
      const sampleWalking = {
        id: '1',
        walker: {
          id: '1',
          name: '김산책',
          profileImage: 'https://via.placeholder.com/100',
          rating: 4.8,
          reviewCount: 127,
        },
        user: {
          id: '1',
          name: '홍길동',
          profileImage: 'https://via.placeholder.com/100',
        },
        startTime: savedStartTime || new Date().toISOString(), // 저장된 시간 사용, 없으면 현재 시간
        duration: savedDuration || 120, // 저장된 duration 사용, 없으면 기본 120분
        location: locationAddress, // 실제 위치 기반 주소 사용
        status: 'in_progress',
        distance: 2.5,
        currentLocation: currentLocation || {
          latitude: 37.5665,
          longitude: 126.9780,
        },
      };
      
      setCurrentWalking(sampleWalking);
      setHasActiveService(true);
      setShowTopModal(true);
    } catch (error) {
    }
  };

  // 워커 여부 확인
  // checkWalkerStatus 함수 제거 - useWalker 훅에서 관리

  const loadNearbyWalkers = async () => {
    try {
      setIsLoadingWalkers(true);
      
      // 샘플 데이터: 주변 워커들
      const sampleNearbyWalkers = [
        {
          id: 'walker-1',
          name: '김워커',
          rating: 4.8,
          reviewCount: 48,
          profileImage: '',
          bio: '안녕하세요! 3년 경력의 워커입니다.',
          experience: '3년',
          hourlyRate: 15000,
          isAvailable: true,
          location: '서울시 강남구',
          distance: 1.2,
          specialties: ['대형견', '산책 훈련'],
          latitude: currentLocation ? currentLocation.latitude + 0.005 : 37.5715,
          longitude: currentLocation ? currentLocation.longitude + 0.005 : 126.9830,
        },
        {
          id: 'walker-2',
          name: '이워커',
          rating: 4.9,
          reviewCount: 95,
          profileImage: '',
          bio: '사랑으로 돌보겠습니다!',
          experience: '5년',
          hourlyRate: 20000,
          isAvailable: true,
          location: '서울시 서초구',
          distance: 0.8,
          specialties: ['소형견', '노견 케어'],
          latitude: currentLocation ? currentLocation.latitude - 0.003 : 37.5635,
          longitude: currentLocation ? currentLocation.longitude + 0.003 : 126.9810,
        },
        {
          id: 'walker-3',
          name: '박워커',
          rating: 4.7,
          reviewCount: 32,
          profileImage: '',
          bio: '반려동물 전문 케어 서비스',
          experience: '2년',
          hourlyRate: 18000,
          isAvailable: true,
          location: '서울시 송파구',
          distance: 2.1,
          specialties: ['중형견', '산책'],
          latitude: currentLocation ? currentLocation.latitude + 0.008 : 37.5745,
          longitude: currentLocation ? currentLocation.longitude - 0.004 : 126.9750,
        },
      ];
      
      setNearbyWalkers(sampleNearbyWalkers);
    } catch (error) {
      setNearbyWalkers([]);
    } finally {
      setIsLoadingWalkers(false);
    }
  };

  const loadCompletedWalks = async () => {
    try {
      // 샘플 데이터: 이전에 맡긴 워커들
      const samplePreviousWalkers = [
        {
          id: 'previous-walker-1',
          name: '최워커',
          rating: 5.0,
          reviewCount: 127,
          profileImage: '',
          bio: '10년 경력의 베테랑 워커',
          experience: '10년',
          hourlyRate: 25000,
          isAvailable: true,
          location: '서울시 강동구',
          distance: 1.5,
          specialties: ['대형견', '훈련', '케어'],
          latitude: currentLocation ? currentLocation.latitude - 0.006 : 37.5605,
          longitude: currentLocation ? currentLocation.longitude - 0.006 : 126.9720,
          walkCount: 5,
          lastWalkDate: '2024-01-10',
        },
        {
          id: 'previous-walker-2',
          name: '정워커',
          rating: 4.6,
          reviewCount: 28,
          profileImage: '',
          bio: '친절하고 책임감 있는 워커',
          experience: '1년',
          hourlyRate: 16000,
          isAvailable: true,
          location: '서울시 마포구',
          distance: 0.5,
          specialties: ['소형견', '산책'],
          latitude: currentLocation ? currentLocation.latitude + 0.004 : 37.5705,
          longitude: currentLocation ? currentLocation.longitude + 0.007 : 126.9850,
          walkCount: 3,
          lastWalkDate: '2024-01-05',
        },
      ];
      
      // 샘플 완료된 산책 데이터
      const sampleCompletedWalks = [
        {
          id: 1,
          walkerId: 1,
          walkerName: '최워커',
          date: '2024-01-10',
          duration: 60,
          status: 'COMPLETED',
        },
        {
          id: 2,
          walkerId: 2,
          walkerName: '정워커',
          date: '2024-01-05',
          duration: 90,
          status: 'COMPLETED',
        },
      ];
      
      setCompletedWalks(sampleCompletedWalks);
      setPreviousWalkers(samplePreviousWalkers);
    } catch (error) {
      setCompletedWalks([]);
      setPreviousWalkers([]);
    }
  };
  
  // 플로팅 메뉴 토글 애니메이션
  const toggleFloatingMenu = () => {
    const toValue = isFloatingMenuExpanded ? 0 : 1;
    setIsFloatingMenuExpanded(!isFloatingMenuExpanded);
    
    Animated.spring(floatingMenuAnimation, {
      toValue,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  };

  // 워커 산책 요청 목록 로드
  const loadWalkerBookings = async () => {
    try {
      setIsLoadingBookings(true);
      const bookings = await WalkerBookingService.getWalkBookings();
      setWalkerBookings(bookings);
      
      // 요청이 있으면 모달 표시
      if (bookings.length > 0) {
        setShowWalkerRequestModal(true);
      }
    } catch (error) {
      setWalkerBookings([]);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  // 요청 선택 시 해당 지역으로 지도 이동
  const handleSelectBooking = async (booking: any) => {
    try {
      setSelectedBooking(booking);
      
      // 요청자의 주소를 좌표로 변환
      if (booking.pickupAddress) {
        const coordinates = await mapService.geocodeAddress(booking.pickupAddress);
        if (coordinates && mapViewRef.current) {
          // 지도를 해당 위치로 이동
          mapViewRef.current.animateCamera({
            center: {
              latitude: coordinates.latitude,
              longitude: coordinates.longitude,
            },
            zoom: 15,
          }, { duration: 1000 });
        }
      }
      
      // 모달 닫기
      setShowWalkerRequestModal(false);
    } catch (error) {
      Alert.alert('오류', '위치를 불러올 수 없습니다.');
    }
  };

  // 워커 모드에서 산책 시작 처리
  const handleStartWalkingAsWalker = async () => {
    if (!selectedBooking) {
      Alert.alert('알림', '산책 요청을 선택해주세요.');
      return;
    }
    
    try {
      // 선택된 예약을 currentWalking으로 설정
      const walkingData = {
        id: selectedBooking.id.toString(),
        walker: {
          id: selectedBooking.walkerId?.toString() || '1',
          name: '나',
          profileImage: '',
        },
        user: {
          id: selectedBooking.userId?.toString() || '1',
          name: selectedBooking.username || '사용자',
          profileImage: '',
        },
        startTime: new Date().toISOString(),
        duration: selectedBooking.duration || 120,
        location: selectedBooking.pickupAddress || '위치 정보 없음',
        status: 'in_progress',
        distance: 0,
      };
      
      setCurrentWalking(walkingData);
      await handleStartWalking();
    } catch (error) {
      Alert.alert('오류', '산책을 시작할 수 없습니다.');
    }
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('위치 권한이 필요합니다', '산책 추적을 위해 위치 권한을 허용해주세요.');
        return;
      }
      
      // 현재 위치 가져오기
      const location = await Location.getCurrentPositionAsync({});
      const newLocation: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: Date.now(),
      };
      setCurrentLocation(newLocation);
      setLocationHistory([newLocation]);
      locationHistoryRef.current = [newLocation];
      lastLocationRef.current = newLocation;
      
      // 현재 위치의 주소 가져오기
      updateCurrentAddress(newLocation.latitude, newLocation.longitude);
      
      // 백엔드에 위치 업데이트
      await updateUserLocation(location.coords.latitude, location.coords.longitude);
    } catch (error) {
    }
  };

  const buildRouteCoordinates = useCallback((data: LocationData[]) => {
    return data.map(point => ({
      latitude: point.latitude,
      longitude: point.longitude,
    }));
  }, []);

  const updateLiveRouteOnMap = useCallback(() => {
    const coordinates = buildRouteCoordinates(locationHistoryRef.current);
    if (coordinates.length < 2) {
      return;
    }
    setRouteCoordinates(coordinates);
  }, [buildRouteCoordinates]);

  const showFullRouteOnMap = useCallback(() => {
    const coordinates = buildRouteCoordinates(locationHistoryRef.current);
    if (coordinates.length < 2) {
      return;
    }
    setRouteCoordinates(coordinates);
    setDrawnRouteCoordinates(coordinates); // 전체 경로 표시
  }, [buildRouteCoordinates]);

  // 역지오코딩으로 주소 가져오기
  const updateCurrentAddress = useCallback(async (latitude: number, longitude: number) => {
    try {
      const addressInfo = await mapService.reverseGeocode(latitude, longitude);
      if (addressInfo) {
        // 도로명 주소가 있으면 도로명, 없으면 지번 주소 사용
        const address = addressInfo.roadAddress || addressInfo.jibunAddress || 
                       (addressInfo.region2depth && addressInfo.region3depth 
                         ? `${addressInfo.region2depth} ${addressInfo.region3depth}` 
                         : '주소 정보 없음');
        setCurrentAddress(address);
      }
    } catch (error) {
      // 에러는 UI로만 처리 (콘솔 로그 없이)
      // 에러 발생 시에도 null로 설정하지 않고 이전 주소 유지
    }
  }, []);

  const handleLocationEvent = useCallback(
    (location: Location.LocationObject) => {
      if (!isTrackingRef.current) {
        return;
      }
      const newLocation: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: location.timestamp ?? Date.now(),
      };

      setCurrentLocation(newLocation);
      setLocationHistory(prev => {
        const updated = [...prev, newLocation];
        locationHistoryRef.current = updated;
        
        // 순차적으로 경로 그리기
        const coordinates = buildRouteCoordinates(updated);
        if (coordinates.length >= 2) {
          setDrawnRouteCoordinates(coordinates);
        }
        
        return updated;
      });

      if (lastLocationRef.current) {
        const distance = calculateDistance(
          lastLocationRef.current.latitude,
          lastLocationRef.current.longitude,
          newLocation.latitude,
          newLocation.longitude
        );
        setWalkingDistance(prev => prev + distance);
      }
      lastLocationRef.current = newLocation;

      if (startTime.current) {
        setWalkingTime(Math.floor((Date.now() - startTime.current!) / 1000));
      }

      // 카메라 추적 위치 업데이트
      if (mapViewRef.current && isTrackingRef.current) {
        mapViewRef.current.animateCamera({
          center: {
            latitude: newLocation.latitude,
            longitude: newLocation.longitude,
          },
          zoom: 17,
        }, { duration: 1000 });
      }

      const now = Date.now();
      if (now - lastBackendSyncRef.current >= BACKEND_UPDATE_INTERVAL) {
        lastBackendSyncRef.current = now;
        updateUserLocation(
          newLocation.latitude,
          newLocation.longitude,
          location.coords.accuracy,
          location.coords.speed ? location.coords.speed * 3.6 : undefined, // m/s to km/h
          location.coords.altitude ?? undefined
        ).catch(() => {});
      }

      // 주소 업데이트 (10초마다)
      if (now - lastGeocodeTimeRef.current >= GEOCODE_UPDATE_INTERVAL) {
        lastGeocodeTimeRef.current = now;
        updateCurrentAddress(newLocation.latitude, newLocation.longitude);
      }

      if (now - lastLiveRouteUpdateRef.current >= LIVE_ROUTE_UPDATE_INTERVAL) {
        lastLiveRouteUpdateRef.current = now;
        updateLiveRouteOnMap();
      }
    },
    [updateLiveRouteOnMap, updateCurrentAddress]
  );

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(LOCATION_EVENT_NAME, handleLocationEvent);
    return () => {
      subscription.remove();
    };
  }, [handleLocationEvent]);

  const startLocationTracking = async () => {
    try {
      // 1. 위치 권한 확인
      const foregroundPermission = await Location.getForegroundPermissionsAsync();
      if (foregroundPermission.status !== 'granted') {
        const requestedPermission = await Location.requestForegroundPermissionsAsync();
        if (requestedPermission.status !== 'granted') {
          Alert.alert(
            '위치 권한 필요',
            '산책 추적을 위해 위치 권한이 필요합니다. 설정에서 권한을 허용해주세요.',
            [
              { text: '취소', style: 'cancel' },
              { 
                text: '설정 열기', 
                onPress: () => {
                  // 설정 앱 열기 (플랫폼별 구현 필요)
                  Alert.alert('알림', '설정 앱에서 위치 권한을 허용해주세요.');
                }
              }
            ]
          );
          isTrackingRef.current = false;
          setIsTracking(false);
          setIsWalking(false);
          return;
        }
      }

      // 2. 현재 위치 가져오기 (없는 경우)
      if (!currentLocation) {
        try {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });
          const newLocation: LocationData = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            timestamp: location.timestamp ?? Date.now(),
          };
          setCurrentLocation(newLocation);
          
          // 현재 위치의 주소 가져오기
          updateCurrentAddress(newLocation.latitude, newLocation.longitude);
          
          // 백엔드에 위치 업데이트
          await updateUserLocation(location.coords.latitude, location.coords.longitude);
        } catch (locationError) {
          // 에러는 UI로만 처리 (콘솔 로그 없이)
          Alert.alert(
            '위치 정보 오류',
            '현재 위치를 가져올 수 없습니다. GPS가 켜져 있는지 확인해주세요.',
            [{ text: '확인' }]
          );
          isTrackingRef.current = false;
          setIsTracking(false);
          setIsWalking(false);
          return;
        }
      }

      // 3. 상태 초기화
      isTrackingRef.current = true;
      setIsTracking(true);
      startTime.current = Date.now();
      setWalkingDistance(0);
      setWalkingTime(0);
      lastBackendSyncRef.current = 0;
      lastLiveRouteUpdateRef.current = 0;

      const initialHistory = currentLocation ? [currentLocation] : [];
      locationHistoryRef.current = initialHistory;
      setLocationHistory(initialHistory);
      if (initialHistory.length > 0) {
        lastLocationRef.current = initialHistory[initialHistory.length - 1];
      } else {
        lastLocationRef.current = null;
      }

      // 경로 초기화
      setRouteCoordinates([]);
      setDrawnRouteCoordinates([]);

      // 카메라 추적 시작
      if (mapViewRef.current && currentLocation) {
        mapViewRef.current.animateToRegion({
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, 1000);
      }

      // 4. 산책 세션 생성 (실패해도 계속 진행)
      if (currentLocation) {
        try {
          const session = await mapService.createWalkSession(
            currentLocation.latitude,
            currentLocation.longitude
          );
          walkSessionIdRef.current = session.id;
          console.log('[위치 추적] 산책 세션 생성 성공:', session.id);
        } catch (error) {
          // 에러는 UI로만 처리 (콘솔 로그 없이)
          // 세션 생성 실패해도 위치 추적은 계속 진행
        }
      }

      // 5. 백그라운드 위치 권한 확인 및 요청 (선택사항)
      // Info.plist에 UIBackgroundModes가 설정되어 있어도 권한은 별도로 요청해야 함
      let hasBackgroundPermission = false;
      try {
        const backgroundPermission = await Location.getBackgroundPermissionsAsync();
        hasBackgroundPermission = backgroundPermission.status === 'granted';
        
        if (!hasBackgroundPermission) {
          // 백그라운드 권한 요청 시도 (사용자가 거부할 수 있음)
          const requestedPermission = await Location.requestBackgroundPermissionsAsync();
          hasBackgroundPermission = requestedPermission.status === 'granted';
          
          if (!hasBackgroundPermission) {
            console.log('[위치 추적] 백그라운드 권한이 거부되었습니다. 전경 위치 추적만 사용합니다.');
          }
        }
      } catch (backgroundError) {
        console.warn('[위치 추적] 백그라운드 권한 확인 실패 (전경 모드로 계속 진행):', backgroundError);
        // 백그라운드 권한은 필수는 아니므로 계속 진행
      }

      // 6. 위치 업데이트 시작
      try {
        // TaskManager 기반 위치 추적 시도
        const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
        if (hasStarted) {
          console.log('[위치 추적] 이미 시작된 위치 업데이트 중지 후 재시작');
          await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
        }

        try {
          // 위치 업데이트 시작 (백그라운드 권한이 없어도 전경에서 작동)
          await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000, // 5초마다 업데이트
            distanceInterval: 5, // 5미터 이동 시 업데이트
            showsBackgroundLocationIndicator: hasBackgroundPermission, // 백그라운드 권한이 있을 때만 표시
            pausesUpdatesAutomatically: !hasBackgroundPermission, // 백그라운드 권한이 없으면 자동 일시정지
          });
          
          console.log('[위치 추적] 위치 업데이트 시작 성공 (백그라운드:', hasBackgroundPermission ? '활성' : '비활성', ')');
        } catch (taskLocationError: any) {
          // TaskManager 기반 위치 추적 실패 시 watchPositionAsync 사용 (전경 전용)
          if (taskLocationError?.message?.includes('UIBackgroundModes') || 
              taskLocationError?.message?.includes('Background location')) {
            console.warn('[위치 추적] TaskManager 위치 추적 실패, 전경 위치 추적으로 전환:', taskLocationError.message);
            
            // 전경 위치 추적 사용 (watchPositionAsync)
            const subscription = await Location.watchPositionAsync(
              {
                accuracy: Location.Accuracy.High,
                timeInterval: 5000, // 5초마다 업데이트
                distanceInterval: 5, // 5미터 이동 시 업데이트
              },
              (location) => {
                // 위치 업데이트 처리
                handleLocationEvent(location);
              }
            );
            
            // 구독 객체 저장 (나중에 정리하기 위해)
            (globalThis as any).__PETMILY_LOCATION_SUBSCRIPTION__ = subscription;
            
            console.log('[위치 추적] 전경 위치 추적 시작 성공 (watchPositionAsync)');
          } else {
            throw taskLocationError;
          }
        }
      } catch (locationUpdateError: any) {
        // 에러는 UI로만 처리 (콘솔 로그 없이)
        
        // UIBackgroundModes 설정 오류인 경우 명확한 메시지 표시
        if (locationUpdateError?.message?.includes('UIBackgroundModes') || 
            locationUpdateError?.message?.includes('Background location')) {
          Alert.alert(
            '설정 오류',
            '앱 설정에 백그라운드 위치 모드가 필요합니다. Xcode에서 프로젝트를 다시 빌드해주세요.\n\n또는 전경 위치 추적 모드로 계속 진행합니다.',
            [{ text: '확인' }]
          );
          
          // 전경 위치 추적으로 폴백
          try {
            const subscription = await Location.watchPositionAsync(
              {
                accuracy: Location.Accuracy.High,
                timeInterval: 5000,
                distanceInterval: 5,
              },
              (location) => {
                handleLocationEvent(location);
              }
            );
            (globalThis as any).__PETMILY_LOCATION_SUBSCRIPTION__ = subscription;
            console.log('[위치 추적] 전경 위치 추적으로 폴백 성공');
          } catch (fallbackError) {
              // 에러는 UI로만 처리 (콘솔 로그 없이)
            throw locationUpdateError;
          }
        } else {
          throw locationUpdateError;
        }
      }
    } catch (error: any) {
      console.error('[위치 추적] 시작 실패:', error);
      
      // 상태 롤백
      isTrackingRef.current = false;
      setIsTracking(false);
      setIsWalking(false);

      // 구체적인 오류 메시지 표시
      let errorMessage = '위치 추적을 시작할 수 없습니다.';
      if (error?.message) {
        if (error.message.includes('permission') || error.message.includes('권한')) {
          errorMessage = '위치 권한이 필요합니다. 설정에서 권한을 허용해주세요.';
        } else if (error.message.includes('location') || error.message.includes('위치')) {
          errorMessage = '위치 정보를 가져올 수 없습니다. GPS가 켜져 있는지 확인해주세요.';
        } else {
          errorMessage = `오류: ${error.message}`;
        }
      }

      Alert.alert('오류', errorMessage, [{ text: '확인' }]);
    }
  };

  const stopLocationTracking = async () => {
    try {
      // TaskManager 기반 위치 추적 중지
      const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
      if (hasStarted) {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      }
      
      // watchPositionAsync 기반 위치 추적 중지 (전경 모드)
      const subscription = (globalThis as any).__PETMILY_LOCATION_SUBSCRIPTION__;
      if (subscription) {
        subscription.remove();
        (globalThis as any).__PETMILY_LOCATION_SUBSCRIPTION__ = null;
      }

      // 산책 세션 종료
      if (walkSessionIdRef.current && currentLocation) {
        try {
          const totalDistanceMeters = walkingDistance;
          const durationSeconds = startTime.current
            ? Math.floor((Date.now() - startTime.current) / 1000)
            : 0;

          await mapService.endWalkSession(
            walkSessionIdRef.current,
            currentLocation.latitude,
            currentLocation.longitude,
            totalDistanceMeters,
            durationSeconds,
            undefined // 이 부분은 performWalkEnd에서 처리
          );

          // 저장된 경로 조회 및 표시
          try {
            const route = await mapService.getWalkRoute(walkSessionIdRef.current);
            if (route.points.length >= 2) {
              const coordinates = route.points.map(point => ({
                latitude: point.latitude,
                longitude: point.longitude,
              }));
              setRouteCoordinates(coordinates);
            }
          } catch (error) {
            // 경로 조회 실패 시 로컬 데이터로 표시
            showFullRouteOnMap();
          }
        } catch (error) {
        } finally {
          walkSessionIdRef.current = null;
        }
      } else {
        // 세션이 없으면 로컬 데이터로만 표시
        showFullRouteOnMap();
      }
    } catch (error) {
    } finally {
      isTrackingRef.current = false;
      setIsTracking(false);
      startTime.current = null;
      lastLocationRef.current = null;
    }
  };

  // 모달 드래그 핸들러
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        setIsDragging(true);
      },
      onPanResponderMove: (evt, gestureState) => {
        const newY = Math.max(60, Math.min(height - 200, modalPosition.y + gestureState.dy));
        setModalPosition({ x: 0, y: newY });
      },
      onPanResponderRelease: () => {
        setIsDragging(false);
      },
    })
  ).current;

  // 모달 최소화/확장 토글
  const toggleModalMinimize = () => {
    setIsModalMinimized(!isModalMinimized);
  };

  // 모달 위치 리셋
  const resetModalPosition = () => {
    setModalPosition({ x: 0, y: 100 });
    setIsModalMinimized(false);
  };

  // 산책 정보 오버레이 드래그 핸들러 (자유롭게 움직이기)
  const overlayDragPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // 드래그 감지 (5px 이상 이동)
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        // 드래그 시작
      },
      onPanResponderMove: (evt, gestureState) => {
        // 자유롭게 드래그
        const overlayWidth = 300; // 오버레이 너비
        const newX = Math.max(0, Math.min(width - overlayWidth, overlayPosition.x + gestureState.dx));
        const newY = Math.max(100, Math.min(height - 300, overlayPosition.y + gestureState.dy));
        setOverlayPosition({ x: newX, y: newY });
      },
      onPanResponderRelease: () => {
        // 드래그 종료
      },
    })
  ).current;

  // 산책 정보 오버레이 스와이프 핸들러 (좌우 스와이프로 숨기기 - 기존 기능 유지)
  const infoOverlayPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // 좌우 스와이프만 감지 (수직 이동은 무시)
        return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderGrant: () => {
        // 스와이프 시작
      },
      onPanResponderMove: (evt, gestureState) => {
        // 스와이프 중 실시간 애니메이션
        const maxTranslate = width * 0.8; // 최대 이동 거리
        const translateX = Math.max(-maxTranslate, Math.min(maxTranslate, gestureState.dx));
        infoOverlayTranslateX.setValue(translateX);
        
        // 투명도 조절 (스와이프할수록 투명해짐)
        const opacity = Math.max(0.3, 0.85 - Math.abs(translateX) / maxTranslate * 0.55);
        infoOverlayOpacity.setValue(opacity);
      },
      onPanResponderRelease: (evt, gestureState) => {
        const threshold = 50; // 스와이프 임계값
        const maxTranslate = width * 0.8;
        
        if (Math.abs(gestureState.dx) > threshold) {
          // 스와이프가 충분히 크면 숨기기/보이기
          if (gestureState.dx > 0) {
            // 오른쪽으로 스와이프 -> 숨기기
            hideInfoOverlay();
          } else {
            // 왼쪽으로 스와이프 -> 숨기기
            hideInfoOverlay();
          }
        } else {
          // 스와이프가 충분하지 않으면 원래 위치로
          showInfoOverlay();
        }
      },
    })
  ).current;

  const hideInfoOverlay = () => {
    setIsInfoOverlayHidden(true);
    Animated.parallel([
      Animated.timing(infoOverlayTranslateX, {
        toValue: width * 0.8, // 오른쪽으로 이동
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(infoOverlayOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const showInfoOverlay = () => {
    setIsInfoOverlayHidden(false);
    Animated.parallel([
      Animated.timing(infoOverlayTranslateX, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(infoOverlayOpacity, {
        toValue: 0.85, // 기본 투명도
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // 지도 설정 로드
  const loadMapConfig = async () => {
    try {
      const config = await mapService.getMapConfig();
      setMapConfig(config);
    } catch (error) {
    }
  };

  // 사용자 위치 업데이트
  const updateUserLocation = async (latitude: number, longitude: number, accuracy?: number, speed?: number, altitude?: number) => {
    try {
      const userId = await mapService.getCurrentUserId();
      const locationRequest = {
        latitude,
        longitude,
        timestamp: Date.now(),
        userId,
        walkSessionId: walkSessionIdRef.current ?? undefined,
        accuracy,
        speed,
        altitude,
      };
      
      const response = await mapService.updateUserLocation(locationRequest);
      setUserLocation(response);
    } catch (error) {
    }
  };

  // 마커 추가 함수 (현재는 사용하지 않음)
  const addMarkerToMap = (lat: number, lng: number, title: string) => {
    // react-native-maps에서는 Marker 컴포넌트로 직접 렌더링
  };

  const timeSlots = [
    '오전 6:00-8:00',
    '오전 8:00-10:00',
    '오전 10:00-12:00',
    '오후 12:00-14:00',
    '오후 14:00-16:00',
    '오후 16:00-18:00',
    '오후 18:00-20:00',
    '오후 20:00-22:00',
  ];

  const handleStartWalking = async () => {
    try {
      setIsWalking(true);
      
      // 산책 시작 시간과 duration 저장 (홈 화면과 공유)
      const walkingStartTime = new Date().toISOString();
      const walkingDuration = currentWalking?.duration || 120; // 기본 120분
      
      // AsyncStorage에 저장
      const { saveCurrentWalkingStartTime } = require('../utils/WalkingUtils');
      await saveCurrentWalkingStartTime(walkingStartTime, walkingDuration);
      
      // currentWalking 업데이트
      if (currentWalking) {
        setCurrentWalking({
          ...currentWalking,
          startTime: walkingStartTime,
          duration: walkingDuration,
        });
      }
      
      await startLocationTracking();
      // startLocationTracking에서 오류가 발생하면 setIsWalking(false)가 호출됨
    } catch (error) {
        // 에러는 UI로만 처리 (콘솔 로그 없이)
      setIsWalking(false);
      // 오류 메시지는 startLocationTracking에서 표시됨
    }
  };

  const handleStopWalking = async () => {
    // 워커 모드이고 산책 중일 때만 특이사항 입력 모달 표시
    if (mapMode === 'walker' && isWalker && isWalking) {
      setShowWalkEndNotesModal(true);
    } else {
      // 일반 사용자이거나 모달 없이 바로 종료
      await performWalkEnd();
    }
  };

  // 실제 산책 종료 처리
  const performWalkEnd = async () => {
    try {
      setIsWalking(false);
      await stopLocationTracking();
      updateLiveRouteOnMap();
      showFullRouteOnMap();
      
      // 산책 세션 종료 (백엔드에 전송)
      if (walkSessionIdRef.current && currentLocation) {
        try {
          const totalDistanceMeters = walkingDistance;
          const durationSeconds = startTime.current
            ? Math.floor((Date.now() - startTime.current) / 1000)
            : 0;

          await mapService.endWalkSession(
            walkSessionIdRef.current,
            currentLocation.latitude,
            currentLocation.longitude,
            totalDistanceMeters,
            durationSeconds,
            walkEndNotes.trim() || undefined // 특이사항 전송 (워커인 경우에만)
          );
        } catch (error) {
          console.error('산책 세션 종료 실패:', error);
        }
      }
      
      // 종료된 경로를 저장 (재생용)
      setCompletedRouteData([...locationHistoryRef.current]);
      
      // 산책 종료 시 저장된 시작 시간 정보 삭제
      const { clearCurrentWalking } = require('../utils/WalkingUtils');
      await clearCurrentWalking();
      
      // 특이사항 입력 모달 닫기
      setShowWalkEndNotesModal(false);
      setWalkEndNotes('');
    } catch (error) {
      console.error('산책 종료 처리 실패:', error);
      Alert.alert('오류', '산책 종료 중 오류가 발생했습니다.');
    }
  };

  // 완료된 경로 재생 (산책 종료 후 주인이 볼 수 있는 기능)
  const handlePlayCompletedRoute = () => {
    if (!completedRouteData || completedRouteData.length < 2) {
      Alert.alert('알림', '재생할 경로가 없습니다.');
      return;
    }

    // 완료된 경로 데이터를 시뮬레이션 경로로 변환
    const totalDuration = Math.floor(
      (completedRouteData[completedRouteData.length - 1].timestamp - completedRouteData[0].timestamp) / 1000
    );
    const playbackSpeed = 10; // 실제 시간의 10배 빠르게 재생 (예: 30분 -> 3분)
    const route: WalkingRoute = {
      id: 'completed-route',
      name: '완료된 산책 경로',
      description: '산책 종료 후 경로 재생',
      estimatedDuration: Math.floor(totalDuration / playbackSpeed),
      estimatedDistance: 0, // 계산은 시뮬레이션에서 수행
      points: completedRouteData.map((loc, index) => ({
        latitude: loc.latitude,
        longitude: loc.longitude,
        timestamp: Math.floor((index * totalDuration) / (completedRouteData.length * playbackSpeed)), // 재생 속도 적용
      })),
    };

    // 초기 상태 설정
    locationHistoryRef.current = [];
    setRouteCoordinates([]);
    setDrawnRouteCoordinates([]);
    setIsPlayingRoute(true);
    
    // 첫 번째 위치로 카메라 이동
    const firstLocation = completedRouteData[0];
    setCurrentLocation(firstLocation);
    if (mapViewRef.current) {
      mapViewRef.current.animateToRegion({
        latitude: firstLocation.latitude,
        longitude: firstLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }

    // 재생 시작
    startSimulation(route);
  };

  const handleStopRoutePlayback = () => {
    stopSimulation();
    setIsPlayingRoute(false);
    resetSimulation();
    
    // 원래 완료된 경로 다시 표시
    if (completedRouteData) {
      const coordinates = buildRouteCoordinates(completedRouteData);
      setRouteCoordinates(coordinates);
      setDrawnRouteCoordinates(coordinates); // 전체 경로 표시
      if (completedRouteData.length > 0) {
        const lastLocation = completedRouteData[completedRouteData.length - 1];
        setCurrentLocation(lastLocation);
        if (mapViewRef.current) {
          mapViewRef.current.animateToRegion({
            latitude: lastLocation.latitude,
            longitude: lastLocation.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }, 1000);
        }
      }
    }
  };

  const handleRequestWalker = () => {
    navigation.navigate('WalkingRequest');
    setShowGuide(false);
  };

  const handleResetZoom = () => {
    if (mapViewRef.current && defaultRegionRef.current) {
      mapViewRef.current.animateToRegion(defaultRegionRef.current, 500);
    }
  };

  const handleTimeSlotSelect = (time: string) => {
    setSelectedTimeSlot(time);
  };

  const handleCustomTimeChange = (time: string) => {
    setCustomTime(time);
    setSelectedTimeSlot('custom');
  };

  const handleAddressSelect = () => {
    setShowAddressModal(true);
  };

  const handleAddressSave = () => {
    if (newAddress.trim()) {
      setSavedAddresses([...savedAddresses, newAddress.trim()]);
      setNewAddress('');
    }
  };

  const handleAddressSelectFromList = (address: string) => {
    setSelectedAddress(address);
    setShowAddressModal(false);
  };

  const handleSubmitBooking = () => {
    if (!selectedTimeSlot && !customTime) {
      Alert.alert('알림', '시간을 선택해주세요.');
      return;
    }
    if (!selectedAddress) {
      Alert.alert('알림', '주소를 선택해주세요.');
      return;
    }

    // 예약 요청 로직
    const bookingData = {
      timeSlot: selectedTimeSlot === 'custom' ? customTime : selectedTimeSlot,
      address: selectedAddress,
    };

    
    // 워커 매칭 화면으로 이동
    navigation.navigate('WalkerMatching', { bookingData });
    setShowBookingModal(false);
  };

  // 지도 모드에 따른 스타일 결정 (일반 모드는 밝은 화면)
  const mapStyleMode = mapMode === 'general' ? 'user' : 'walker';

  return (
    <View style={[styles.container, mapStyleMode === 'user' && styles.containerLight]}>
      <StatusBar barStyle={mapStyleMode === 'user' ? "dark-content" : "light-content"} backgroundColor="transparent" translucent={true} />
      <View style={[styles.content, mapStyleMode === 'user' && styles.contentLight]}>
      
      {/* 지도 영역 */}
      <View style={[styles.mapContainer, mapStyleMode === 'user' && styles.mapContainerLight]}>
        <MapView
          ref={mapViewRef}
          provider={PROVIDER_DEFAULT}
          style={[styles.map, mapStyleMode === 'user' && styles.mapLight]}
          initialRegion={{
            latitude: mapLatitude,
            longitude: mapLongitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          region={
            currentLocation && isTracking
              ? {
                  latitude: currentLocation.latitude,
                  longitude: currentLocation.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }
              : undefined
          }
          showsUserLocation={!isPlayingRoute}
          showsMyLocationButton={!isTracking && !isPlayingRoute}
          followsUserLocation={isTracking && !isPlayingRoute}
          scrollEnabled={true}
          zoomEnabled={true}
          pitchEnabled={true}
          rotateEnabled={true}
        >
          {/* 현재 위치 마커 */}
          {currentLocation && (
            <Marker
              coordinate={{
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
              }}
              title="현재 위치"
            />
          )}
          
          {/* 워커 위치 마커 (대리 산책자 위치) */}
          {currentWalking?.walker?.currentLocation && (
            <Marker
              coordinate={{
                latitude: currentWalking.walker.currentLocation.latitude,
                longitude: currentWalking.walker.currentLocation.longitude,
              }}
              title="워커 위치"
              pinColor="#C59172"
            >
              <View style={{ alignItems: 'center' }}>
                {currentWalking?.walker?.name !== 'asdf' ? (
                  <Image
                    source={require('../../assets/images/user1.png')}
                    style={{ width: 32, height: 32, borderRadius: 16 }}
                  />
                ) : (
                  <Ionicons name="person-circle" size={32} color="#C59172" />
                )}
              </View>
            </Marker>
          )}
          
          {/* 사용자 위치 마커 (산책 중인 경우) */}
          {currentWalking?.user?.currentLocation && (
            <Marker
              coordinate={{
                latitude: currentWalking.user.currentLocation.latitude,
                longitude: currentWalking.user.currentLocation.longitude,
              }}
              title="사용자 위치"
              pinColor="#4A90E2"
            >
              <View style={{ alignItems: 'center' }}>
                {currentWalking?.user?.name !== 'asdf' ? (
                  <Image
                    source={require('../../assets/images/user1.png')}
                    style={{ width: 32, height: 32, borderRadius: 16 }}
                  />
                ) : (
                  <Ionicons name="person-circle" size={32} color="#4A90E2" />
                )}
              </View>
            </Marker>
          )}
          
          {/* 일반 사용자 모드: 이전에 맡긴 워커 마커 (주황색) */}
          {mapMode === 'general' && !currentWalking && previousWalkers.map((walker, index) => (
            <Marker
              key={`previous-walker-${walker.id}-${index}`}
              coordinate={{
                latitude: walker.latitude || (currentLocation ? currentLocation.latitude : 37.5665),
                longitude: walker.longitude || (currentLocation ? currentLocation.longitude : 126.9780),
              }}
              title={walker.name}
              description={`이전 산책 ${walker.walkCount || 0}회 | 평점: ${walker.rating} | ${walker.experience} 경력`}
              pinColor="#FF9800"
            >
              <View style={{ alignItems: 'center' }}>
                {walker.name !== 'asdf' ? (
                  <Image
                    source={require('../../assets/images/user1.png')}
                    style={{ 
                      width: 36, 
                      height: 36, 
                      borderRadius: 18,
                      borderWidth: 2,
                      borderColor: '#FF9800',
                    }}
                  />
                ) : (
                  <Ionicons 
                    name="person-circle" 
                    size={36} 
                    color="#FF9800" 
                  />
                )}
              </View>
            </Marker>
          ))}
          
          {/* 일반 사용자 모드: 주변 워커 마커 (파란색) */}
          {mapMode === 'general' && !currentWalking && nearbyWalkers.map((walker, index) => {
            // 이전에 산책을 맡긴 워커인지 확인
            const isPreviousWalker = previousWalkers.some(pw => pw.id === walker.id);
            
            // 이전 워커는 이미 표시했으므로 건너뛰기
            if (isPreviousWalker) {
              return null;
            }
            
            return (
              <Marker
                key={`walker-${walker.id}-${index}`}
                coordinate={{
                  latitude: walker.latitude || (currentLocation ? currentLocation.latitude : 37.5665),
                  longitude: walker.longitude || (currentLocation ? currentLocation.longitude : 126.9780),
                }}
                title={walker.name}
                description={`평점: ${walker.rating} | ${walker.experience} 경력`}
                pinColor="#4A90E2"
              >
                <View style={{ alignItems: 'center' }}>
                  {walker.name !== 'asdf' ? (
                    <Image
                      source={require('../../assets/images/user1.png')}
                      style={{ 
                        width: 32, 
                        height: 32, 
                        borderRadius: 16,
                      }}
                    />
                  ) : (
                    <Ionicons 
                      name="person-circle" 
                      size={32} 
                      color="#4A90E2" 
                    />
                  )}
                </View>
              </Marker>
            );
          })}
          
          {/* 산책 경로 (순차적으로 그려지는 경로) */}
          {drawnRouteCoordinates.length > 1 && (
            <Polyline
              coordinates={drawnRouteCoordinates}
              strokeColor="#4A90E2"
              strokeWidth={4}
            />
          )}
        </MapView>
        
        {/* 상단 산책 정보 모달 */}
        {showTopModal && currentWalking && (
          <View 
            style={[
              styles.topModal, 
              { 
                top: modalPosition.y,
                left: modalPosition.x + 20,
                right: 20 - modalPosition.x,
              }
            ]}
          >
            <View style={styles.topModalContent}>
              {/* 드래그 핸들 */}
              <View
                style={[
                  styles.modalDragHandle,
                  {
                    backgroundColor: isDragging ? '#f8f9fa' : 'transparent',
                    borderColor: isDragging ? '#4A90E2' : 'transparent',
                    borderWidth: isDragging ? 1 : 0,
                    borderRadius: isDragging ? 8 : 0,
                  }
                ]}
                {...panResponder.panHandlers}
              >
                <View 
                  style={[
                    styles.dragIndicator,
                    {
                      backgroundColor: isDragging ? '#4A90E2' : '#ccc',
                      transform: isDragging ? [{ scale: 1.2 }] : [{ scale: 1 }],
                    }
                  ]} 
                />
              </View>

              <View style={styles.topModalHeader}>
                <View style={styles.topModalTitleContainer}>
                  <View style={styles.topModalTitleRow}>
                    <IconImage name="walker" size={18} style={styles.topModalTitleIcon} />
                    <Text style={styles.topModalTitle}>현재 산책 중</Text>
                  </View>
                  {__DEV__ && (
                    <Text style={{ fontSize: 10, color: '#999' }}>
                      드래그 상태: {isDragging ? '활성' : '비활성'}
                    </Text>
                  )}
                  {!isModalMinimized && (
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedProfile({
                          id: currentWalking.walker.id,
                          name: currentWalking.walker.name,
                          role: 'walker',
                        });
                        setShowProfileModal(true);
                      }}
                      activeOpacity={0.7}
                    >
                    <Text style={styles.topModalSubtitle}>
                      {currentWalking.walker.name} • {currentWalking.distance}km
                    </Text>
                    </TouchableOpacity>
                  )}
                </View>
                <View style={styles.topModalButtons}>
                  <TouchableOpacity
                    onPress={toggleModalMinimize}
                    style={styles.topModalMinimizeButton}
                  >
                    <Ionicons 
                      name={isModalMinimized ? "chevron-up" : "chevron-down"} 
                      size={16} 
                      color="#666" 
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setShowTopModal(false)}
                    style={styles.topModalCloseButton}
                  >
                    <Ionicons name="close" size={16} color="#666" />
                  </TouchableOpacity>
                </View>
              </View>
              
              {!isModalMinimized && (
                <View style={styles.topModalInfo}>
                  <View style={styles.topModalInfoRow}>
                    <Ionicons name="time" size={14} color="#4A90E2" />
                    <Text style={styles.topModalInfoText}>
                      {new Date(currentWalking.startTime).toLocaleTimeString('ko-KR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })} - {new Date(new Date(currentWalking.startTime).getTime() + currentWalking.duration * 60000).toLocaleTimeString('ko-KR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </Text>
                  </View>
                  {/* 주소는 walkingInfoOverlay에서만 표시하므로 여기서는 제거 */}
                </View>
              )}
            </View>
          </View>
        )}
        
        {/* 산책 정보 오버레이 */}
        {/* 일반 사용자 모드에서 현재 산책 중인 서비스가 없을 때 */}
        {mapMode === 'general' && !currentWalking && !isWalking && !isPlayingRoute && (
          <View style={styles.noServiceOverlay}>
            <Text style={styles.noServiceOverlayText}>현재 이용 중인 서비스가 없습니다</Text>
          </View>
        )}
        
        {/* 산책 중이거나 시뮬레이션 중일 때 */}
        {(isWalking || isPlayingRoute) && (
          <>
            {!isOverlayMinimized ? (
              <Animated.View 
                style={[
                  styles.walkingInfoOverlay,
                  {
                    left: overlayPosition.x,
                    top: overlayPosition.y,
                    right: undefined,
                    bottom: undefined,
                    transform: [{ translateX: infoOverlayTranslateX }],
                    opacity: infoOverlayOpacity,
                  }
                ]}
                {...overlayDragPanResponder.panHandlers}
              >
                <View style={styles.overlayHeader}>
                  <View style={styles.dragHandle} />
                  <TouchableOpacity
                    style={styles.minimizeButton}
                    onPress={() => setIsOverlayMinimized(true)}
                  >
                    <Ionicons name="chevron-down" size={20} color="#666" />
                  </TouchableOpacity>
                </View>
            <View style={styles.walkingStats} pointerEvents="none">
                  {/* 현재 위치 주소 표시 */}
                  {currentAddress && (
                    <View style={styles.addressContainer}>
                      <Ionicons name="location" size={14} color="#4A90E2" style={styles.addressIcon} />
                      <Text style={styles.addressText} numberOfLines={2}>
                        {currentAddress}
                      </Text>
                    </View>
                  )}
                  <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>거리</Text>
                <Text style={styles.statValue}>
                  {isPlayingRoute 
                    ? (simulationStats.distance / 1000).toFixed(2)
                    : (walkingDistance / 1000).toFixed(2)} km
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>시간</Text>
                <Text style={styles.statValue}>
                  {isPlayingRoute ? (
                    <>
                      {Math.floor(simulationStats.duration / 60)}:
                      {(simulationStats.duration % 60).toString().padStart(2, '0')}
                    </>
                  ) : (
                    <>
                      {Math.floor(walkingTime / 60)}:
                      {(walkingTime % 60).toString().padStart(2, '0')}
                    </>
                  )}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>속도</Text>
                <Text style={styles.statValue}>
                  {isPlayingRoute
                    ? simulationStats.averageSpeed.toFixed(1)
                    : walkingTime > 0 
                      ? ((walkingDistance / 1000) / (walkingTime / 3600)).toFixed(1) 
                      : '0.0'} km/h
                </Text>
              </View>
            </View>
          </View>
              </Animated.View>
            ) : (
              <TouchableOpacity
                style={[styles.floatingMinimizeButton, { left: overlayPosition.x, top: overlayPosition.y }]}
                onPress={() => setIsOverlayMinimized(false)}
                activeOpacity={0.8}
              >
                <Ionicons name="chevron-up" size={24} color="#4A90E2" />
              </TouchableOpacity>
            )}
            
            {/* 숨겨진 상태일 때 플로팅 버튼 (오른쪽에 화살표 아이콘) */}
            {isInfoOverlayHidden && !isOverlayMinimized && (
              <TouchableOpacity
                style={styles.floatingInfoButton}
                onPress={showInfoOverlay}
                activeOpacity={0.8}
              >
                <Ionicons name="chevron-back" size={24} color="#4A90E2" />
              </TouchableOpacity>
            )}
          </>
        )}


        {/* Dark overlay when not walking */}
        {!isWalking && (
          <View style={styles.darkOverlay} pointerEvents={!hasActiveService ? 'auto' : 'none'}>
            {!hasActiveService && (
              <View style={styles.noServiceMessage} pointerEvents="auto">
                <Text style={styles.noServiceTitle}>이용 중인 서비스가 없습니다!</Text>
                <Text style={styles.noServiceSubtitle}>
                  산책 요청을 통해 워커와 매칭해보세요
                </Text>
              </View>
            )}
          </View>
        )}

        {/* 가이드 모드 */}
        {showGuide && !hasActiveService && (
          <View style={styles.guideOverlay} pointerEvents="auto">
            <View style={styles.guideContent}>
              <View style={styles.guideMessage}>
                <View style={styles.guideTitleRow}>
                  <IconImage name="walker" size={18} style={styles.guideTitleIcon} />
                  <Text style={styles.guideTitle}>산책 요청하기</Text>
                </View>
                <Text style={styles.guideDescription}>
                  아래 버튼을 눌러 워커와 매칭해보세요!
                </Text>
              </View>
              
              {/* 움직이는 화살표 */}
              <View style={styles.arrowContainer}>
                <Animated.View 
                  style={[
                    styles.arrow,
                    {
                      transform: [
                        {
                          translateY: arrowAnimation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 10],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <Ionicons name="arrow-down" size={30} color="#FF6B6B" />
                </Animated.View>
              </View>
              
              {/* 가이드 닫기 버튼 */}
              <TouchableOpacity
                style={styles.guideCloseButton}
                onPress={() => setShowGuide(false)}
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 상단 헤더 (지도 위 오버레이) */}
        <View style={styles.headerOverlay} pointerEvents="box-none">
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text 
            style={styles.headerTitle}
            numberOfLines={1}
            adjustsFontSizeToFit={true}
            minimumFontScale={0.7}
          >
            산책 지도
          </Text>
          
          {/* 모드 토글 버튼 */}
          <View style={styles.modeToggleWrapper}>
            {/* 텍스트 레이어 (토글 위에 표시) */}
            <View style={styles.modeToggleTextContainer}>
              <Text style={[
                styles.modeToggleText,
                mapMode === 'general' && styles.modeToggleTextActive
              ]}>
                일반
              </Text>
              {isWalker && (
                <Text style={[
                  styles.modeToggleText,
                  mapMode === 'walker' && styles.modeToggleTextActive
                ]}>
                  워커
                </Text>
              )}
            </View>
            
            {/* 토글 버튼 컨테이너 */}
            <Animated.View 
              style={[
                styles.modeToggleContainer, 
                { 
                  width: isWalker ? 100 : 60, // 워커는 항상 양쪽 모드 지원, 일반 사용자는 일반 모드만
                  backgroundColor: toggleAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['rgba(0, 0, 0, 0.3)', '#4A90E2'], // 일반: 반투명 검정, 워커: 파란색
                  }),
                }
              ]}
            >
              {/* 슬라이더 버튼 (이동) */}
              <Animated.View
                style={[
                  styles.modeToggleSlider,
                  {
                    transform: [
                      {
                        translateX: toggleAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [2, isWalker ? 63 : 23], // 워커는 양쪽 끝단(2, 63), 일반 사용자는 일반 모드만(2, 23)
                          extrapolate: 'clamp',
                        }),
                      },
                    ],
                    // translateX는 useNativeDriver: true를 사용할 수 있지만, backgroundColor와 함께 사용하므로 false로 통일
                  },
                ]}
              />
              
              {/* 터치 영역 */}
              <TouchableOpacity
                style={styles.modeToggleTouchArea}
                onPress={() => {
                  // 현재 모드의 반대 모드로 전환
                  const newMode = mapMode === 'general' ? 'walker' : 'general';
                  
                  // 워커가 아닌 일반 사용자가 워커 모드로 전환하려고 할 때만 등록 권유 모달 표시
                  // 워커로 등록된 사용자는 일반 모드와 워커 모드를 자유롭게 전환 가능
                  if (newMode === 'walker' && !isWalker) {
                    setShowWalkerRegistrationModal(true);
                    return;
                  }
                  
                  // 애니메이션 값 계산 (일반: 0, 워커: 1)
                  const targetValue = newMode === 'general' ? 0 : 1;
                  
                  // 애니메이션 실행 (상태 변경 전에 실행)
                  Animated.spring(toggleAnimation, {
                    toValue: targetValue,
                    useNativeDriver: false, // backgroundColor는 native driver 사용 불가
                    tension: 50,
                    friction: 7,
                  }).start();
                  
                  // 모드 변경
                  setMapMode(newMode);
                  
                  // 워커 모드로 전환 시 요청 목록 로드 및 모달 표시
                  if (newMode === 'walker') {
                    if (walkerBookings.length > 0) {
                      setShowWalkerRequestModal(true);
                    } else {
                      loadWalkerBookings();
                    }
                  } else {
                    // 일반 모드로 전환 시 (워커도 일반 사용자 모드로 전환 가능)
                    // 주변 워커 및 완료된 산책 정보 로드
                    loadNearbyWalkers();
                    loadCompletedWalks();
                  }
                }}
                activeOpacity={0.8}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              />
            </Animated.View>
          </View>
          
          {/* 시뮬레이션 리스트 버튼 (일반 모드에서만 표시) */}
          {mapMode === 'general' && (
            <TouchableOpacity
              style={styles.simulationListButton}
              onPress={() => setShowSimulationListModal(true)}
            >
              <Ionicons name="list" size={24} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        {/* 하단 액션 버튼 */}
        {!isWalking && !isPlayingRoute ? (
          <View style={styles.bottomActionContainer}>
            {/* 일반 모드: 산책 맡기러 가기 버튼 */}
            {mapMode === 'general' && !hasActiveService && (
              <TouchableOpacity
                style={styles.requestButton}
                onPress={handleRequestWalker}
              >
                <LinearGradient
                  colors={['#4A90E2', '#357ABD']}
                  style={styles.requestButtonGradient}
                >
                  <Ionicons name="paw" size={24} color="#fff" />
                  <Text style={styles.requestButtonText}>산책 맡기러 가기</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
            
            {/* 워커 모드: 산책 시작 버튼 */}
            {mapMode === 'walker' && selectedBooking && !hasActiveService && (
              <TouchableOpacity
                style={styles.requestButton}
                onPress={handleStartWalkingAsWalker}
              >
                <LinearGradient
                  colors={['#28a745', '#20c997']}
                  style={styles.requestButtonGradient}
                >
                  <Ionicons name="play-circle" size={24} color="#fff" />
                  <Text style={styles.requestButtonText}>산책 시작</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
            
            {/* 워커 모드: 선택된 예약이 없을 때 */}
            {mapMode === 'walker' && !selectedBooking && !hasActiveService && (
              <View style={styles.noBookingContainer}>
                <Text style={styles.noBookingText}>산책 요청을 선택해주세요</Text>
              </View>
            )}
          </View>
        ) : isWalking ? (
          // 산책 중일 때 종료 버튼
          <View style={styles.walkingControls}>
            <TouchableOpacity
              style={styles.stopWalkingButton}
              onPress={handleStopWalking}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FF4757', '#EE5A6F', '#DC3545']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.stopWalkingButtonGradient}
              >
                <View style={styles.stopWalkingButtonContent}>
                  <View style={styles.stopWalkingIconContainer}>
                    <Ionicons name="stop" size={28} color="#fff" />
                  </View>
                  <View style={styles.stopWalkingTextContainer}>
                    <Text style={styles.stopWalkingButtonText}>산책 종료</Text>
                    <Text style={styles.stopWalkingButtonSubtext}>터치하여 산책을 마치세요</Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : isPlayingRoute ? (
          // 경로 재생 중일 때 재생 중지 버튼
          <View style={styles.walkingControls}>
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: '#FF9800' }]}
              onPress={handleStopRoutePlayback}
            >
              <Ionicons name="stop" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={[styles.submitButtonText, { color: 'white' }]}>재생 중지</Text>
            </TouchableOpacity>
          </View>
        ) : completedRouteData && completedRouteData.length > 0 ? (
          // 산책 종료 후 경로 재생 버튼
          <View style={styles.bottomActionContainer}>
            <TouchableOpacity
              style={styles.playRouteButton}
              onPress={handlePlayCompletedRoute}
            >
              <LinearGradient
                colors={['#FF9800', '#F57C00']}
                style={styles.requestButtonGradient}
              >
                <Ionicons name="play-circle" size={24} color="#fff" />
                <Text style={styles.requestButtonText}>경로 재생</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : null}
        
        {/* 플로팅 메뉴 버튼들 */}
        <View style={styles.floatingMenuContainer}>
          {/* 펼쳐진 버튼들 */}
          {isFloatingMenuExpanded && (
            <>
              {/* 채팅 버튼 */}
              {hasActiveService && currentWalking && (
                <Animated.View
                  style={[
                    styles.floatingSubButton,
                    {
                      transform: [
                        {
                          translateY: floatingMenuAnimation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, -70],
                          }),
                        },
                        {
                          scale: floatingMenuAnimation,
                        },
                      ],
                      opacity: floatingMenuAnimation,
                    },
                  ]}
                >
                  <TouchableOpacity
                    style={[styles.floatingSubButtonInner, { backgroundColor: '#4A90E2' }]}
                    onPress={async () => {
                      try {
                        const walkerId = currentWalking.walker?.walkerId || currentWalking.walker?.id;
                        if (walkerId) {
                          const chatRoom = await getOrCreateChatRoomWithWalker(
                            typeof walkerId === 'string' ? parseInt(walkerId) : walkerId
                          );
                          Alert.alert('알림', '채팅방이 준비되었습니다. 채팅 화면으로 이동합니다.');
                        }
                        toggleFloatingMenu();
                      } catch (error: any) {
                        Alert.alert('오류', error.message || '채팅방을 열 수 없습니다.');
                      }
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="chatbubble-ellipses" size={24} color="#fff" />
                  </TouchableOpacity>
                </Animated.View>
              )}
              
              {/* 줌 리셋 버튼 */}
              <Animated.View
                style={[
                  styles.floatingSubButton,
                  {
                    transform: [
                      {
                        translateY: floatingMenuAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -140],
                        }),
                      },
                      {
                        scale: floatingMenuAnimation,
                      },
                    ],
                    opacity: floatingMenuAnimation,
                  },
                ]}
              >
                <TouchableOpacity
                  style={[styles.floatingSubButtonInner, { backgroundColor: 'rgba(255, 255, 255, 0.95)' }]}
                  onPress={() => {
                    if (mapViewRef.current && defaultRegionRef.current) {
                      mapViewRef.current.animateToRegion(defaultRegionRef.current, 500);
                    }
                    toggleFloatingMenu();
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="resize-outline" size={24} color="#333" />
                </TouchableOpacity>
              </Animated.View>
            </>
          )}
          
          {/* 메인 플로팅 버튼 */}
          <TouchableOpacity
            style={styles.floatingMainButton}
            onPress={toggleFloatingMenu}
            activeOpacity={0.8}
          >
            <Animated.View
              style={{
                transform: [
                  {
                    rotate: floatingMenuAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '45deg'],
                    }),
                  },
                ],
              }}
            >
              <Ionicons 
                name={isFloatingMenuExpanded ? "close" : "add"} 
                size={28} 
                color="#fff" 
              />
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* 프로필 모달 */}
      <Modal
        visible={showProfileModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowProfileModal(false)}
      >
        <TouchableOpacity
          style={styles.profileModalOverlay}
          activeOpacity={1}
          onPress={() => setShowProfileModal(false)}
        >
          <View style={styles.profileModalContent}>
            {selectedProfile && (
              <>
                <View style={styles.profileModalHeader}>
                  <Text style={styles.profileModalTitle}>{selectedProfile.name}</Text>
                  <TouchableOpacity
                    onPress={() => setShowProfileModal(false)}
                    style={styles.profileModalCloseButton}
                  >
                    <Ionicons name="close" size={24} color="#333" />
                  </TouchableOpacity>
                </View>
                
                <TouchableOpacity
                  style={styles.profileModalOption}
                  onPress={() => {
                    setShowProfileModal(false);
                    // 프로필 정보 보기 화면으로 이동
                    Alert.alert('알림', '프로필 정보 화면으로 이동합니다.');
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="person-circle-outline" size={24} color="#333" />
                  <Text style={styles.profileModalOptionText}>프로필 정보 보기</Text>
                  <Ionicons name="chevron-forward" size={20} color="#999" />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.profileModalOption}
                  onPress={async () => {
                    try {
                      setShowProfileModal(false);
                      const walkerId = selectedProfile.role === 'walker' 
                        ? (currentWalking?.walker?.walkerId || currentWalking?.walker?.id)
                        : null;
                      if (walkerId) {
                        const chatRoom = await getOrCreateChatRoomWithWalker(
                          typeof walkerId === 'string' ? parseInt(walkerId) : walkerId
                        );
                        Alert.alert('알림', '채팅방이 준비되었습니다. 채팅 화면으로 이동합니다.');
                        // TODO: ChatRoomScreen으로 이동하는 로직 추가 필요
                      } else {
                        Alert.alert('알림', '1:1 채팅을 시작합니다.');
                        // TODO: 일반 사용자와의 채팅방 생성 로직 추가 필요
                      }
                    } catch (error: any) {
                      Alert.alert('오류', error.message || '채팅방을 열 수 없습니다.');
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="chatbubble-outline" size={24} color="#333" />
                  <Text style={styles.profileModalOptionText}>1:1 채팅하기</Text>
                  <Ionicons name="chevron-forward" size={20} color="#999" />
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 산책 종료 특이사항 입력 모달 (워커 전용) */}
      <Modal
        visible={showWalkEndNotesModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowWalkEndNotesModal(false);
          setWalkEndNotes('');
        }}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            setShowWalkEndNotesModal(false);
            setWalkEndNotes('');
          }}
        >
          <View style={styles.walkEndNotesModalContent}>
            <View style={styles.walkEndNotesModalHeader}>
              <Text style={styles.walkEndNotesModalTitle}>산책 종료</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowWalkEndNotesModal(false);
                  setWalkEndNotes('');
                }}
                style={styles.walkEndNotesModalCloseButton}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.walkEndNotesModalBody}>
              <Text style={styles.walkEndNotesModalLabel}>
                산책 중 특이사항을 입력해주세요 (선택사항)
              </Text>
              <TextInput
                style={styles.walkEndNotesInput}
                placeholder="예: 반려동물이 잘 산책했고, 특별한 문제는 없었습니다."
                value={walkEndNotes}
                onChangeText={setWalkEndNotes}
                placeholderTextColor="#999"
                multiline={true}
                numberOfLines={6}
                textAlignVertical="top"
                maxLength={500}
              />
              <Text style={styles.walkEndNotesCharCount}>
                {walkEndNotes.length}/500
              </Text>
            </View>
            
            <View style={styles.walkEndNotesModalFooter}>
              <TouchableOpacity
                style={[styles.walkEndNotesButton, styles.walkEndNotesCancelButton]}
                onPress={() => {
                  setShowWalkEndNotesModal(false);
                  setWalkEndNotes('');
                }}
              >
                <Text style={styles.walkEndNotesCancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.walkEndNotesButton, styles.walkEndNotesSubmitButton]}
                onPress={performWalkEnd}
              >
                <LinearGradient
                  colors={['#4A90E2', '#357ABD']}
                  style={styles.walkEndNotesSubmitButtonGradient}
                >
                  <Text style={styles.walkEndNotesSubmitButtonText}>종료하기</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 예약 요청 모달 */}
      <Modal
        visible={showBookingModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowBookingModal(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>산책 예약 요청</Text>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* 시간 선택 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>시간 선택</Text>
              <View style={styles.timeSlotGrid}>
                {timeSlots.map((time, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.timeSlotButton,
                      selectedTimeSlot === time && styles.timeSlotButtonSelected,
                    ]}
                    onPress={() => handleTimeSlotSelect(time)}
                  >
                    <Text
                      style={[
                        styles.timeSlotText,
                        selectedTimeSlot === time && styles.timeSlotTextSelected,
                      ]}
                    >
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <Text style={styles.customTimeLabel}>직접 입력</Text>
              <TextInput
                style={styles.customTimeInput}
                placeholder="예: 오후 3:30-5:30"
                value={customTime}
                onChangeText={handleCustomTimeChange}
                placeholderTextColor="#999"
              />
            </View>

            {/* 주소 선택 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>주소 선택</Text>
              <TouchableOpacity
                style={styles.addressButton}
                onPress={handleAddressSelect}
              >
                <Text style={styles.addressButtonText}>
                  {selectedAddress || '주소를 선택해주세요'}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
            </View>

            {/* 제출 버튼 */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmitBooking}
            >
              <LinearGradient
                colors={['#4A90E2', '#357ABD']}
                style={styles.submitButtonGradient}
              >
                <Text style={styles.submitButtonText}>워커 찾기</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* 주소 선택 모달 */}
      <Modal
        visible={showAddressModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowAddressModal(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>주소 선택</Text>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* 저장된 주소 목록 */}
            {savedAddresses.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>저장된 주소</Text>
                {savedAddresses.map((address, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.addressItem}
                    onPress={() => handleAddressSelectFromList(address)}
                  >
                    <Ionicons name="location" size={20} color="#4A90E2" />
                    <Text style={styles.addressItemText}>{address}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* 새 주소 입력 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>새 주소 입력</Text>
              <TextInput
                style={styles.addressInput}
                placeholder="주소를 입력해주세요"
                value={newAddress}
                onChangeText={setNewAddress}
                placeholderTextColor="#999"
              />
              <TouchableOpacity
                style={styles.saveAddressButton}
                onPress={handleAddressSave}
              >
                <Text style={styles.saveAddressButtonText}>주소 저장</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* 시뮬레이션 리스트 모달 */}
      <Modal
        visible={showSimulationListModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSimulationListModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowSimulationListModal(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>산책 시뮬레이션 경로</Text>
      </View>

          <View 
            style={[
              styles.modalContent,
              {
                height: Math.min(
                  height * 0.4, // 최대 화면 높이의 40%
                  (WALKING_ROUTES.length * 120) + 60 // 항목 수 * 항목 높이 + 헤더 + 패딩
                ),
              }
            ]}
          >
            <ScrollView 
              style={styles.modalScrollView}
              showsVerticalScrollIndicator={(WALKING_ROUTES.length + completedWalks.length) > 2}
              contentContainerStyle={styles.modalScrollContent}
            >
              {/* 완료된 산책 경로 */}
              {completedWalks.map((walk) => {
                // 완료된 산책에서 경로 데이터 생성 (실제로는 백엔드에서 가져와야 함)
                const routeFromWalk: WalkingRoute = {
                  id: `completed-${walk.id}`,
                  name: `${walk.walkerName || '워커'}와의 산책`,
                  description: `${new Date(walk.date).toLocaleDateString('ko-KR')} | ${walk.duration}분`,
                  estimatedDuration: (walk.duration || 60) * 60,
                  estimatedDistance: 2000,
                  points: [
                    // 임시 경로 데이터 (실제로는 백엔드에서 가져와야 함)
                    { latitude: 37.5665, longitude: 126.9780, timestamp: 0 },
                    { latitude: 37.5670, longitude: 126.9785, timestamp: 60 },
                    { latitude: 37.5675, longitude: 126.9790, timestamp: 120 },
                    { latitude: 37.5680, longitude: 126.9795, timestamp: 180 },
                  ],
                };
                
                return (
                  <TouchableOpacity
                    key={`completed-${walk.id}`}
                    style={[styles.simulationRouteItem, { borderLeftColor: '#FF9800', borderLeftWidth: 4 }]}
                    onPress={() => {
                      setShowSimulationListModal(false);
                      navigation.navigate('WalkingSimulation', { route: routeFromWalk });
                    }}
                  >
                    <View style={styles.simulationRouteContent}>
                      <View style={styles.simulationRouteHeader}>
                        <Ionicons name="walk" size={20} color="#FF9800" />
                        <Text style={styles.simulationRouteName}>{routeFromWalk.name}</Text>
                      </View>
                      <Text style={styles.simulationRouteDescription}>{routeFromWalk.description}</Text>
                      <View style={styles.simulationRouteStats}>
                        <View style={styles.simulationRouteStatItem}>
                          <Ionicons name="walk-outline" size={14} color="#666" />
                          <Text style={styles.simulationRouteStatText}>
                            거리: {(routeFromWalk.estimatedDistance / 1000).toFixed(1)}km
                          </Text>
                        </View>
                        <View style={styles.simulationRouteStatItem}>
                          <Ionicons name="time-outline" size={14} color="#666" />
                          <Text style={styles.simulationRouteStatText}>
                            시간: {Math.floor(routeFromWalk.estimatedDuration / 60)}분
                          </Text>
                        </View>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#999" />
                  </TouchableOpacity>
                );
              })}
              
              {/* 기본 시뮬레이션 경로 */}
              {WALKING_ROUTES.map((route) => (
                <TouchableOpacity
                  key={route.id}
                  style={styles.simulationRouteItem}
                  onPress={() => {
                    setShowSimulationListModal(false);
                    navigation.navigate('WalkingSimulation', { route });
                  }}
                >
                  <View style={styles.simulationRouteContent}>
                    <View style={styles.simulationRouteHeader}>
                      <Text style={styles.simulationRouteName}>{route.name}</Text>
                      <Ionicons name="chevron-forward" size={20} color="#999" />
                    </View>
                    <Text style={styles.simulationRouteDescription}>
                      {route.description}
                    </Text>
                    <View style={styles.simulationRouteStats}>
                      <View style={styles.simulationRouteStatItem}>
                        <Ionicons name="time-outline" size={14} color="#666" />
                        <Text style={styles.simulationRouteStatText}>
                          약 {Math.floor(route.estimatedDuration / 60)}분
                        </Text>
                      </View>
                      <View style={styles.simulationRouteStatItem}>
                        <Ionicons name="walk-outline" size={14} color="#666" />
                        <Text style={styles.simulationRouteStatText}>
                          약 {(route.estimatedDistance / 1000).toFixed(1)}km
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>

      {/* 워커 등록 권유 모달 */}
      <Modal
        visible={showWalkerRegistrationModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowWalkerRegistrationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.walkerRegistrationModalContent}>
            <View style={styles.walkerRegistrationModalHeader}>
              <Text style={styles.walkerRegistrationModalTitle}>워커로 활동하고 싶으신가요?</Text>
              <TouchableOpacity
                style={styles.walkerRegistrationModalCloseButton}
                onPress={() => setShowWalkerRegistrationModal(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.walkerRegistrationModalBody}>
              <Ionicons name="walk-outline" size={64} color="#4A90E2" style={styles.walkerRegistrationModalIcon} />
              <Text style={styles.walkerRegistrationModalDescription}>
                워커로 등록하시면 반려동물 산책 서비스를 제공하고{'\n'}
                수익을 얻을 수 있습니다.
              </Text>
              <Text style={styles.walkerRegistrationModalSubDescription}>
                지금 바로 워커로 등록해보세요!
              </Text>
            </View>
            
            <View style={styles.walkerRegistrationModalFooter}>
              <TouchableOpacity
                style={styles.walkerRegistrationModalCancelButton}
                onPress={() => setShowWalkerRegistrationModal(false)}
              >
                <Text style={styles.walkerRegistrationModalCancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.walkerRegistrationModalRegisterButton}
                onPress={() => {
                  setShowWalkerRegistrationModal(false);
                  navigation.navigate('WalkerRegistration');
                }}
              >
                <Text style={styles.walkerRegistrationModalRegisterText}>워커 등록하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 워커 전용 산책 요청 모달 */}
      {mapMode === 'walker' && isWalker && (
        <Modal
          visible={showWalkerRequestModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowWalkerRequestModal(false)}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setShowWalkerRequestModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>받은 산책 요청</Text>
            </View>

            <View style={styles.modalContent}>
              {isLoadingBookings ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>요청 목록을 불러오는 중...</Text>
                </View>
              ) : walkerBookings.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="walk-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyText}>받은 산책 요청이 없습니다</Text>
                </View>
              ) : (
                <ScrollView 
                  style={styles.modalScrollView}
                  showsVerticalScrollIndicator={true}
                  contentContainerStyle={styles.modalScrollContent}
                >
                  {walkerBookings.map((booking) => (
                    <TouchableOpacity
                      key={booking.id}
                      style={[
                        styles.bookingItem,
                        selectedBooking?.id === booking.id && styles.bookingItemSelected
                      ]}
                      onPress={() => handleSelectBooking(booking)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.bookingContent}>
                        <View style={styles.bookingHeader}>
                          <View style={styles.bookingStatusBadge}>
                            <Text style={styles.bookingStatusText}>
                              {booking.status === 'PENDING' ? '대기중' : 
                               booking.status === 'ACCEPTED' ? '수락됨' :
                               booking.status === 'IN_PROGRESS' ? '진행중' :
                               booking.status === 'COMPLETED' ? '완료' : booking.status}
                            </Text>
                          </View>
                          <Text style={styles.bookingDate}>{booking.date}</Text>
                        </View>
                        
                        <View style={styles.bookingInfo}>
                          <View style={styles.bookingInfoRow}>
                            <Ionicons name="location" size={16} color="#C59172" />
                            <Text style={styles.bookingAddress} numberOfLines={2}>
                              {booking.pickupAddress || '주소 정보 없음'}
                            </Text>
                          </View>
                          
                          {booking.duration && (
                            <View style={styles.bookingInfoRow}>
                              <Ionicons name="time-outline" size={16} color="#666" />
                              <Text style={styles.bookingDuration}>
                                {booking.duration}분
                              </Text>
                            </View>
                          )}
                          
                          {booking.notes && (
                            <View style={styles.bookingInfoRow}>
                              <Ionicons name="document-text-outline" size={16} color="#666" />
                              <Text style={styles.bookingNotes} numberOfLines={2}>
                                {booking.notes}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                      
                      <Ionicons name="chevron-forward" size={20} color="#999" />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          </SafeAreaView>
        </Modal>
      )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  containerLight: {
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
  },
  contentLight: {
    backgroundColor: '#f8f9fa',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  mapContainerLight: {
    backgroundColor: '#f8f9fa',
  },
  map: {
    flex: 1,
  },
  mapLight: {
    // 밝은 지도 스타일 (필요시 추가)
  },
  darkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noServiceMessage: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  noServiceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  noServiceSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  guideOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  guideContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 25,
    padding: 30,
    alignItems: 'center',
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    position: 'relative',
  },
  guideMessage: {
    alignItems: 'center',
    marginBottom: 30,
  },
  guideTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  guideTitleIcon: {
    width: 20,
    height: 20,
  },
  guideTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  guideDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  arrowContainer: {
    position: 'absolute',
    bottom: -50,
    alignItems: 'center',
  },
  arrow: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 25,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  guideCloseButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 15,
    padding: 8,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1000,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  headerOverlayLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  backButton: {
    marginRight: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    flex: 1,
    flexShrink: 1,
    marginRight: 8,
  },
  headerTitleLight: {
    color: '#333',
    textShadowColor: 'transparent',
  },
  simulationListButton: {
    marginLeft: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    padding: 8,
  },
  modeToggleWrapper: {
    flexDirection: 'column',
    alignItems: 'center',
    marginLeft: 'auto',
    marginRight: 10,
  },
  modeToggleTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    width: '100%',
    gap: 4,
  },
  modeToggleContainer: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 2,
    position: 'relative',
    overflow: 'visible',
    height: 32,
    zIndex: 10,
  },
  modeToggleTouchArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    backgroundColor: 'transparent',
  },
  modeToggleSlider: {
    position: 'absolute',
    top: 2,
    left: 2,
    width: 35,
    height: 28,
    backgroundColor: '#fff',
    borderRadius: 18,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  modeToggleText: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    minWidth: 30,
  },
  modeToggleTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  noBookingContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 25,
    padding: 16,
    alignItems: 'center',
  },
  noBookingText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  simulationRouteItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  simulationRouteContent: {
    flex: 1,
  },
  simulationRouteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  simulationRouteName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  simulationRouteDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  simulationRouteStats: {
    flexDirection: 'row',
    gap: 16,
  },
  simulationRouteStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  simulationRouteStatText: {
    fontSize: 12,
    color: '#666',
  },
  simulationButton: {
    marginLeft: 10,
    backgroundColor: 'rgba(255, 193, 7, 0.8)',
    borderRadius: 20,
    padding: 8,
  },
  simulationIndicator: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 193, 7, 0.95)',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  simulationIndicatorText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
  },
  bottomActionContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
  requestButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  startButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  playRouteButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  requestButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  requestButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  walkingControls: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
  stopWalkingButton: {
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#FF4757',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  stopWalkingButtonGradient: {
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  stopWalkingButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopWalkingIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  stopWalkingTextContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  stopWalkingButtonText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  stopWalkingButtonSubtext: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding:5,
    marginBottom:50
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalCloseButton: {
    marginRight: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    paddingBottom: 10,
  },
  section: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  timeSlotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeSlotButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  timeSlotButtonSelected: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  timeSlotText: {
    fontSize: 14,
    color: '#333',
  },
  timeSlotTextSelected: {
    color: '#fff',
  },
  customTimeLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 15,
    marginBottom: 10,
  },
  customTimeInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  addressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  addressButtonText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  addressItemText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  addressInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  saveAddressButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveAddressButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButton: {
    marginTop: 30,
    borderRadius: 25,
    overflow: 'hidden',
  },
  submitButtonGradient: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // 산책 정보 오버레이 스타일
  noServiceOverlay: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  noServiceOverlayText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  walkingInfoOverlay: {
    position: 'absolute',
    width: 300,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  overlayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
    alignSelf: 'center',
    flex: 1,
  },
  minimizeButton: {
    padding: 4,
    marginLeft: 8,
  },
  floatingMinimizeButton: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  floatingInfoButton: {
    position: 'absolute',
    right: 20,
    bottom: 40,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  walkingStats: {
    gap: 8,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    padding: 10,
    borderRadius: 8,
    marginBottom: 4,
  },
  addressIcon: {
    marginRight: 6,
  },
  addressText: {
    fontSize: 13,
    color: '#333',
    flex: 1,
    lineHeight: 18,
  },
  statItem: {
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  // 상단 모달 스타일
  topModal: {
    position: 'absolute',
    zIndex: 1001,
  },
  topModalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  // 드래그 핸들 스타일 (모달용)
  modalDragHandle: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
    borderRadius: 8,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
  },
  topModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  topModalTitleContainer: {
    flex: 1,
  },
  topModalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  topModalTitleIcon: {
    width: 18,
    height: 18,
  },
  topModalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  topModalSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  topModalButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topModalMinimizeButton: {
    padding: 4,
    marginRight: 8,
  },
  topModalCloseButton: {
    padding: 4,
  },
  topModalInfo: {
    gap: 8,
  },
  topModalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topModalInfoText: {
    fontSize: 12,
    color: '#333',
    marginLeft: 6,
    flex: 1,
  },
  resetZoomButton: {
    position: 'absolute',
    right: 20,
    bottom: 150,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  // 워커 요청 모달 스타일
  bookingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  bookingItemSelected: {
    borderColor: '#C59172',
    borderWidth: 2,
    backgroundColor: '#FFF9F5',
  },
  bookingContent: {
    flex: 1,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bookingStatusBadge: {
    backgroundColor: '#C59172',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bookingStatusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  bookingDate: {
    fontSize: 12,
    color: '#666',
  },
  bookingInfo: {
    gap: 8,
  },
  bookingInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bookingAddress: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  bookingDuration: {
    fontSize: 13,
    color: '#666',
  },
  bookingNotes: {
    flex: 1,
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
  chatFloatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    zIndex: 1000,
  },
  profileModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '80%',
    maxWidth: 300,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  profileModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  profileModalCloseButton: {
    padding: 4,
  },
  profileModalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  profileModalOptionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  floatingMenuContainer: {
    position: 'absolute',
    right: 20,
    bottom: 200,
    alignItems: 'center',
    zIndex: 2000,
  },
  floatingMainButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  floatingSubButton: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 10,
  },
  floatingSubButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  walkerRegistrationModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: width * 0.85,
    maxWidth: 400,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  walkerRegistrationModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  walkerRegistrationModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  walkerRegistrationModalCloseButton: {
    padding: 4,
  },
  walkerRegistrationModalBody: {
    padding: 30,
    alignItems: 'center',
  },
  walkerRegistrationModalIcon: {
    marginBottom: 20,
  },
  walkerRegistrationModalDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 10,
  },
  walkerRegistrationModalSubDescription: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  walkEndNotesModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: width * 0.9,
    maxWidth: 500,
    maxHeight: height * 0.7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  walkEndNotesModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  walkEndNotesModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  walkEndNotesModalCloseButton: {
    padding: 4,
  },
  walkEndNotesModalBody: {
    padding: 20,
  },
  walkEndNotesModalLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  walkEndNotesInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    minHeight: 120,
    textAlignVertical: 'top',
    backgroundColor: '#f9f9f9',
  },
  walkEndNotesCharCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 8,
  },
  walkEndNotesModalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  walkEndNotesButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  walkEndNotesCancelButton: {
    backgroundColor: '#f0f0f0',
  },
  walkEndNotesCancelButtonText: {
    textAlign: 'center',
    padding: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  walkEndNotesSubmitButton: {
    overflow: 'hidden',
  },
  walkEndNotesSubmitButtonGradient: {
    padding: 16,
  },
  walkEndNotesSubmitButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  walkerRegistrationModalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  walkerRegistrationModalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  walkerRegistrationModalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  walkerRegistrationModalRegisterButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  walkerRegistrationModalRegisterText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default WalkingMapScreen;
