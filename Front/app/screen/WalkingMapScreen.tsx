import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import MapService, { MapConfigResponse, LocationResponse, WalkSessionResponse, RouteResponse } from '../services/MapService';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { KAKAO_MAP_API_KEY } from '../config/api';
import { useWalkerRouteSimulation } from '../hooks/useWalkerRouteSimulation';
import { WalkingRoute, WALKING_ROUTES } from '../data/walkingRoutes';

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
  }, []);

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
        startTime: new Date().toISOString(),
        duration: 120, // 분
        location: '서울시 강남구 테헤란로 123',
        status: 'in_progress',
        distance: 2.5,
        currentLocation: {
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

      if (now - lastLiveRouteUpdateRef.current >= LIVE_ROUTE_UPDATE_INTERVAL) {
        lastLiveRouteUpdateRef.current = now;
        updateLiveRouteOnMap();
      }
    },
    [updateLiveRouteOnMap]
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
          
          // 백엔드에 위치 업데이트
          await updateUserLocation(location.coords.latitude, location.coords.longitude);
        } catch (locationError) {
          console.error('[위치 추적] 현재 위치 가져오기 실패:', locationError);
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
          console.warn('[위치 추적] 산책 세션 생성 실패 (계속 진행):', error);
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
        console.error('[위치 추적] 위치 업데이트 시작 실패:', locationUpdateError);
        
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
            console.error('[위치 추적] 전경 위치 추적 폴백 실패:', fallbackError);
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
            durationSeconds
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
      await startLocationTracking();
      // startLocationTracking에서 오류가 발생하면 setIsWalking(false)가 호출됨
    } catch (error) {
      console.error('[산책 시작] 오류:', error);
      setIsWalking(false);
      // 오류 메시지는 startLocationTracking에서 표시됨
    }
  };

  const handleStopWalking = async () => {
    setIsWalking(false);
    await stopLocationTracking();
    updateLiveRouteOnMap();
    showFullRouteOnMap();
    
    // 종료된 경로를 저장 (재생용)
    setCompletedRouteData([...locationHistoryRef.current]);
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      <View style={styles.content}>
      
      {/* 지도 영역 */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapViewRef}
          provider={PROVIDER_DEFAULT}
          style={styles.map}
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
                    <Text style={styles.topModalSubtitle}>
                      {currentWalking.walker.name} • {currentWalking.distance}km
                    </Text>
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
                  <View style={styles.topModalInfoRow}>
                    <Ionicons name="location" size={14} color="#4A90E2" />
                    <Text style={styles.topModalInfoText} numberOfLines={1}>
                      {currentWalking.location}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}
        
        {/* 산책 정보 오버레이 */}
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
          <Text style={styles.headerTitle}>산책 지도</Text>
          <TouchableOpacity
            style={styles.simulationListButton}
            onPress={() => setShowSimulationListModal(true)}
          >
            <Ionicons name="list" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* 줌 리셋 버튼 */}
        <TouchableOpacity
          style={styles.resetZoomButton}
          onPress={handleResetZoom}
          activeOpacity={0.8}
        >
          <Ionicons name="locate" size={24} color="#4A90E2" />
        </TouchableOpacity>

        {/* 하단 액션 버튼 */}
        {!isWalking && !isPlayingRoute ? (
          <View style={styles.bottomActionContainer}>
            {hasActiveService && currentWalking ? (
              // 산책 시작 버튼 (워커가 산책을 시작할 때)
              <TouchableOpacity
                style={styles.startButton}
                onPress={handleStartWalking}
              >
                <LinearGradient
                  colors={['#4CAF50', '#45A049']}
                  style={styles.requestButtonGradient}
                >
                  <Ionicons name="play" size={24} color="#fff" />
                  <Text style={styles.requestButtonText}>산책 시작</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              // 산책 맡기러 가기 버튼
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
      </View>

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
              showsVerticalScrollIndicator={WALKING_ROUTES.length > 2}
              contentContainerStyle={styles.modalScrollContent}
            >
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
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
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
    backgroundColor: 'transparent',
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
  },
  simulationListButton: {
    marginLeft: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    padding: 8,
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
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
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
});

export default WalkingMapScreen;
