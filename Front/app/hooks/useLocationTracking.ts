import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';

export interface LocationCoords {
  latitude: number;
  longitude: number;
  altitude: number | null;
  accuracy: number | null;
  timestamp: number;
}

export interface WalkingStats {
  distance: number; // 미터 단위
  duration: number; // 초 단위
  averageSpeed: number; // km/h
  currentSpeed: number; // km/h
}

export interface LocationTrackingState {
  currentLocation: LocationCoords | null;
  path: LocationCoords[];
  stats: WalkingStats;
  isTracking: boolean;
  error: string | null;
  permissionStatus: 'granted' | 'denied' | 'undetermined';
}

export const useLocationTracking = () => {
  const [state, setState] = useState<LocationTrackingState>({
    currentLocation: null,
    path: [],
    stats: {
      distance: 0,
      duration: 0,
      averageSpeed: 0,
      currentSpeed: 0,
    },
    isTracking: false,
    error: null,
    permissionStatus: 'undetermined',
  });

  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const startTime = useRef<number | null>(null);
  const lastLocation = useRef<LocationCoords | null>(null);

  // 위치 권한 요청
  const requestPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setState(prev => ({
        ...prev,
        permissionStatus: status === 'granted' ? 'granted' : 'denied',
        error: status !== 'granted' ? '위치 권한이 필요합니다.' : null,
      }));
      return status === 'granted';
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: '위치 권한 요청 중 오류가 발생했습니다.',
        permissionStatus: 'denied',
      }));
      return false;
    }
  };

  // 두 좌표 사이의 거리 계산 (Haversine formula)
  const calculateDistance = (
    coord1: LocationCoords,
    coord2: LocationCoords
  ): number => {
    const R = 6371e3; // 지구 반지름 (미터)
    const pi1 = (coord1.latitude * Math.PI) / 180;
    const pi2 = (coord2.latitude * Math.PI) / 180;
    const del_pi = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
    const del_lambda = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(del_pi / 2) * Math.sin(del_pi / 2) +
      Math.cos(pi1) * Math.cos(pi2) * Math.sin(del_lambda / 2) * Math.sin(del_lambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // 미터 단위
  };

  // 위치 업데이트 처리
  const handleLocationUpdate = (location: Location.LocationObject) => {
    const newCoords: LocationCoords = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      altitude: location.coords.altitude,
      accuracy: location.coords.accuracy,
      timestamp: location.timestamp,
    };

    setState(prev => {
      const newPath = [...prev.path, newCoords];
      let newDistance = prev.stats.distance;
      let currentSpeed = 0;

      // 이전 위치가 있으면 거리 계산
      if (lastLocation.current) {
        const distanceIncrement = calculateDistance(lastLocation.current, newCoords);
        
        // 정확도가 낮거나 거리가 비정상적으로 크면 무시
        if (
          newCoords.accuracy !== null &&
          newCoords.accuracy < 50 &&
          distanceIncrement < 100
        ) {
          newDistance += distanceIncrement;
          
          // 현재 속도 계산 (km/h)
          const timeDiff = (newCoords.timestamp - lastLocation.current.timestamp) / 1000; // 초
          if (timeDiff > 0) {
            currentSpeed = (distanceIncrement / timeDiff) * 3.6; // m/s -> km/h
          }
        }
      }

      lastLocation.current = newCoords;

      // 경과 시간 계산
      const duration = startTime.current
        ? Math.floor((Date.now() - startTime.current) / 1000)
        : 0;

      // 평균 속도 계산
      const averageSpeed = duration > 0 ? (newDistance / duration) * 3.6 : 0;

      return {
        ...prev,
        currentLocation: newCoords,
        path: newPath,
        stats: {
          distance: newDistance,
          duration,
          averageSpeed,
          currentSpeed,
        },
      };
    });
  };

  // 추적 시작
  const startTracking = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    try {
      // 현재 위치 가져오기
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });

      startTime.current = Date.now();
      handleLocationUpdate(location);

      // 위치 구독 시작 (1초마다 업데이트)
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000, // 1초
          distanceInterval: 5, // 5미터
        },
        handleLocationUpdate
      );

      setState(prev => ({
        ...prev,
        isTracking: true,
        error: null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: '위치 추적을 시작할 수 없습니다.',
      }));
    }
  };

  // 추적 중지
  const stopTracking = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }

    setState(prev => ({
      ...prev,
      isTracking: false,
    }));
  };

  // 추적 초기화
  const resetTracking = () => {
    stopTracking();
    lastLocation.current = null;
    startTime.current = null;

    setState({
      currentLocation: null,
      path: [],
      stats: {
        distance: 0,
        duration: 0,
        averageSpeed: 0,
        currentSpeed: 0,
      },
      isTracking: false,
      error: null,
      permissionStatus: state.permissionStatus,
    });
  };

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
    };
  }, []);

  return {
    ...state,
    startTracking,
    stopTracking,
    resetTracking,
    requestPermission,
  };
};





