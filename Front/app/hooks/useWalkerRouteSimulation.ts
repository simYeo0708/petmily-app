/**
 * 워커 이동 경로 시뮬레이션 훅
 * 미리 정의된 경로를 따라 워커가 이동하는 것을 시뮬레이션합니다.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { WalkingRoute, RoutePoint } from '../data/walkingRoutes';
import { LocationCoords } from './useLocationTracking';

export interface SimulationState {
  isSimulating: boolean;
  isPaused: boolean;
  currentRoute: WalkingRoute | null;
  currentIndex: number;
  startTime: number | null;
  pausedTime: number | null; // 일시정지 시점의 시간
  elapsedTime: number; // 경과 시간 (초)
  speedMultiplier: number; // 속도 배율 (1x, 2x, 4x)
}

export interface SimulationStats {
  distance: number; // 미터
  duration: number; // 초 (실제 경과 시간)
  routeTime: number; // 초 (경로에서 진행된 시간)
  averageSpeed: number; // km/h
  currentSpeed: number; // km/h
}

/**
 * 두 좌표 사이의 거리 계산 (Haversine formula)
 */
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // 지구 반지름 (미터)
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // 미터 단위
};

/**
 * 두 경로 포인트 사이의 보간 (Interpolation)
 * 현재 시간에 맞는 중간 위치를 계산합니다.
 */
const interpolatePosition = (
  point1: RoutePoint,
  point2: RoutePoint,
  currentTime: number
): { latitude: number; longitude: number } => {
  const time1 = point1.timestamp || 0;
  const time2 = point2.timestamp || 0;

  if (time2 <= time1) {
    return { latitude: point2.latitude, longitude: point2.longitude };
  }

  // 두 포인트 사이의 진행률 계산 (0.0 ~ 1.0)
  const progress = Math.max(0, Math.min(1, (currentTime - time1) / (time2 - time1)));

  // 선형 보간
  const latitude = point1.latitude + (point2.latitude - point1.latitude) * progress;
  const longitude = point1.longitude + (point2.longitude - point1.longitude) * progress;

  return { latitude, longitude };
};

/**
 * 워커 경로 시뮬레이션 훅
 * @param updateInterval 업데이트 간격 (밀리초, 기본값: 1000ms = 1초)
 * @param onLocationUpdate 위치 업데이트 콜백 함수
 */
export const useWalkerRouteSimulation = (
  updateInterval: number = 1000,
  onLocationUpdate?: (location: LocationCoords) => void
) => {
  const [state, setState] = useState<SimulationState>({
    isSimulating: false,
    isPaused: false,
    currentRoute: null,
    currentIndex: 0,
    startTime: null,
    pausedTime: null,
    elapsedTime: 0,
    speedMultiplier: 1, // 기본 1x 속도
  });

  const [stats, setStats] = useState<SimulationStats>({
    distance: 0,
    duration: 0, // 실제 경과 시간
    routeTime: 0, // 경로에서 진행된 시간
    averageSpeed: 0,
    currentSpeed: 0,
  });

  const [simulatedPath, setSimulatedPath] = useState<LocationCoords[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastLocationRef = useRef<LocationCoords | null>(null);
  const prevPathRef = useRef<LocationCoords[]>([]);

  // 시뮬레이션 시작
  const startSimulation = useCallback(
    (route: WalkingRoute) => {
      // 이전 시뮬레이션이 실행 중이면 중지
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      const startTime = Date.now();
      setState(prev => ({
        isSimulating: true,
        isPaused: false,
        currentRoute: route,
        currentIndex: 0,
        startTime,
        pausedTime: null,
        elapsedTime: 0,
        speedMultiplier: prev.speedMultiplier || 1, // 기존 속도 유지
      }));
      setSimulatedPath([]);
      lastLocationRef.current = null;

      // 첫 번째 위치 설정
      if (route.points.length > 0) {
        const firstPoint = route.points[0];
        const initialLocation: LocationCoords = {
          latitude: firstPoint.latitude,
          longitude: firstPoint.longitude,
          altitude: null,
          accuracy: 10, // 시뮬레이션이므로 정확도 10m로 설정
          timestamp: Date.now(),
        };

        setSimulatedPath([initialLocation]);
        lastLocationRef.current = initialLocation;
        onLocationUpdate?.(initialLocation);
      }

      // 주기적으로 위치 업데이트
      intervalRef.current = setInterval(() => {
        setState(prev => {
          if (!prev.currentRoute || !prev.startTime || prev.isPaused) {
            return prev;
          }

          // 실제 경과 시간 (시작부터 지금까지 실제로 흐른 시간)
          // 일시정지 중이면 pausedTime 시점까지의 시간만 계산
          const currentTime = prev.isPaused && prev.pausedTime 
            ? prev.pausedTime 
            : Date.now();
          const realElapsed = Math.floor((currentTime - prev.startTime) / 1000);
          
          // 속도 배율 적용: 실제 경과 시간에 배율을 곱해서 경로에서 진행된 시간 계산
          // 예: 실제 10초 경과, 2x 배율 -> 경로 20초 진행
          const routeElapsed = Math.floor(realElapsed * prev.speedMultiplier);

          // 경로가 완료되었는지 확인
          const lastPoint = prev.currentRoute.points[prev.currentRoute.points.length - 1];
          const maxTime = lastPoint.timestamp || prev.currentRoute.estimatedDuration;

          if (routeElapsed >= maxTime) {
            // 경로 완료
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            return {
              ...prev,
              isSimulating: false,
            };
          }

          // 현재 시간에 맞는 경로 포인트 찾기 (경로 시간 기준)
          let currentIndex = prev.currentIndex;
          while (
            currentIndex < prev.currentRoute.points.length - 1 &&
            (prev.currentRoute.points[currentIndex + 1].timestamp || 0) <= routeElapsed
          ) {
            currentIndex++;
          }

          // 다음 포인트 인덱스
          const nextIndex = Math.min(currentIndex + 1, prev.currentRoute.points.length - 1);
          const currentPoint = prev.currentRoute.points[currentIndex];
          const nextPoint = prev.currentRoute.points[nextIndex];

          // 보간하여 현재 위치 계산 (경로 시간 기준)
          const interpolated = interpolatePosition(currentPoint, nextPoint, routeElapsed);

          const newLocation: LocationCoords = {
            latitude: interpolated.latitude,
            longitude: interpolated.longitude,
            altitude: null,
            accuracy: 10,
            timestamp: Date.now(),
          };

          // 경로에 추가
          setSimulatedPath(prevPath => {
            const updated = [...prevPath, newLocation];
            prevPathRef.current = updated;
            
            // 통계 계산
            let totalDistance = 0;
            let currentSpeed = 0;

            // 전체 경로 거리 계산
            if (updated.length > 1) {
              for (let i = 1; i < updated.length; i++) {
                totalDistance += calculateDistance(
                  updated[i - 1].latitude,
                  updated[i - 1].longitude,
                  updated[i].latitude,
                  updated[i].longitude
                );
              }
            }

            // 현재 속도 계산 (1배속 기준)
            if (lastLocationRef.current) {
              // 실제 시간 간격 (updateInterval을 초 단위로 변환)
              const realTimeDiff = updateInterval / 1000; // 초 단위
              // 경로 시간 간격 (1배속 기준)
              const routeTimeDiff = realTimeDiff * prev.speedMultiplier;
              const distanceIncrement = calculateDistance(
                lastLocationRef.current.latitude,
                lastLocationRef.current.longitude,
                newLocation.latitude,
                newLocation.longitude
              );
              // 1배속 기준 속도 계산 (경로 시간 기준)
              currentSpeed = routeTimeDiff > 0 ? (distanceIncrement / routeTimeDiff) * 3.6 : 0; // m/s -> km/h
            }

            // 평균 속도 계산 (1배속 기준 - 경로 시간 기준)
            const averageSpeed = routeElapsed > 0 ? (totalDistance / routeElapsed) * 3.6 : 0;

            setStats({
              distance: totalDistance,
              duration: realElapsed, // 실제 경과 시간
              routeTime: routeElapsed, // 경로에서 진행된 시간
              averageSpeed,
              currentSpeed,
            });

            return updated;
          });

          // 위치 업데이트 콜백 호출
          onLocationUpdate?.(newLocation);

          lastLocationRef.current = newLocation;

          return {
            ...prev,
            currentIndex,
            elapsedTime: routeElapsed, // 경로 시간 저장 (시간바 표시용)
          };
        });
      }, updateInterval);
    },
    [updateInterval, onLocationUpdate]
  );

  // 시뮬레이션 일시정지
  const pauseSimulation = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPaused: true,
      pausedTime: Date.now(),
    }));
  }, []);

  // 시뮬레이션 재개
  const resumeSimulation = useCallback(() => {
    setState(prev => {
      if (!prev.isPaused || !prev.pausedTime || !prev.startTime) {
        return prev;
      }

      // 일시정지 기간을 startTime에 반영
      const pauseDuration = Date.now() - prev.pausedTime;
      const adjustedStartTime = prev.startTime + pauseDuration;

      return {
        ...prev,
        isPaused: false,
        pausedTime: null,
        startTime: adjustedStartTime,
      };
    });
  }, []);

  // 시뮬레이션 중지
  const stopSimulation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setState(prev => ({
      ...prev,
      isSimulating: false,
      isPaused: false,
      pausedTime: null,
    }));
  }, []);

  // 속도 배율 변경
  const setSpeedMultiplier = useCallback((multiplier: number) => {
    setState(prev => ({
      ...prev,
      speedMultiplier: multiplier,
    }));
  }, []);

  // 특정 시간으로 이동 (시간바에서 사용)
  const seekToTime = useCallback((targetTime: number, onLocationUpdate?: (location: LocationCoords, path: LocationCoords[]) => void) => {
    setState(prev => {
      if (!prev.currentRoute) return prev;
      
      // startTime이 없으면 현재 시간을 기준으로 설정
      const baseStartTime = prev.startTime || Date.now();

      const maxTime = prev.currentRoute.estimatedDuration;
      const clampedRouteTime = Math.max(0, Math.min(targetTime, maxTime));
      
      // 실제 경과 시간 계산 (경로 시간 / 배율)
      const realElapsed = prev.startTime 
        ? Math.floor((Date.now() - prev.startTime) / 1000)
        : Math.floor(clampedRouteTime / prev.speedMultiplier);

      // 해당 시간에 맞는 경로 포인트 찾기 (경로 시간 기준)
      let currentIndex = 0;
      while (
        currentIndex < prev.currentRoute.points.length - 1 &&
        (prev.currentRoute.points[currentIndex + 1].timestamp || 0) <= clampedRouteTime
      ) {
        currentIndex++;
      }

      const nextIndex = Math.min(currentIndex + 1, prev.currentRoute.points.length - 1);
      const currentPoint = prev.currentRoute.points[currentIndex];
      const nextPoint = prev.currentRoute.points[nextIndex];

      // 보간하여 위치 계산 (경로 시간 기준)
      const interpolated = interpolatePosition(currentPoint, nextPoint, clampedRouteTime);

      const location: LocationCoords = {
        latitude: interpolated.latitude,
        longitude: interpolated.longitude,
        altitude: null,
        accuracy: 10,
        timestamp: Date.now(),
      };

      // 경로 계산 (시작부터 현재 시간까지)
      const pathToTime: LocationCoords[] = [];
      let totalDistance = 0;

      for (let i = 0; i <= currentIndex; i++) {
        const point = prev.currentRoute.points[i];
        pathToTime.push({
          latitude: point.latitude,
          longitude: point.longitude,
          altitude: null,
          accuracy: 10,
          timestamp: point.timestamp || 0,
        });

        if (i > 0) {
          const prevPoint = prev.currentRoute.points[i - 1];
          totalDistance += calculateDistance(
            prevPoint.latitude,
            prevPoint.longitude,
            point.latitude,
            point.longitude
          );
        }
      }

      // 마지막 보간된 위치 추가
      if (clampedRouteTime > (currentPoint.timestamp || 0)) {
        pathToTime.push(location);
        totalDistance += calculateDistance(
          currentPoint.latitude,
          currentPoint.longitude,
          location.latitude,
          location.longitude
        );
      }

      // 통계 계산 (1배속 기준 - 경로 시간 기준)
      const averageSpeed = clampedRouteTime > 0 ? (totalDistance / clampedRouteTime) * 3.6 : 0;

      setStats({
        distance: totalDistance,
        duration: realElapsed, // 실제 경과 시간
        routeTime: clampedRouteTime, // 경로에서 진행된 시간
        averageSpeed,
        currentSpeed: 0,
      });

      setSimulatedPath(pathToTime);

      // 위치 업데이트 콜백 호출 (경로도 함께 전달)
      onLocationUpdate?.(location, pathToTime);

      // startTime을 조정하여 경과 시간이 맞도록 함
      // 시뮬레이션이 진행 중이면 조정, 아니면 현재 시간 기준으로 설정
      // 실제 경과 시간 = 경로 시간 / 배율
      const adjustedStartTime = prev.isSimulating && prev.startTime
        ? Date.now() - (realElapsed * 1000)
        : Date.now() - (clampedRouteTime * 1000 / prev.speedMultiplier);

      return {
        ...prev,
        currentIndex,
        elapsedTime: clampedRouteTime, // 경로 시간 저장
        startTime: adjustedStartTime,
      };
    });
  }, []);

  // 시뮬레이션 초기화
  const resetSimulation = useCallback(() => {
    stopSimulation();
    setState({
      isSimulating: false,
      currentRoute: null,
      currentIndex: 0,
      startTime: null,
      elapsedTime: 0,
      speedMultiplier: 1,
    });
    setStats({
      distance: 0,
      duration: 0,
      routeTime: 0,
      averageSpeed: 0,
      currentSpeed: 0,
    });
    setSimulatedPath([]);
    lastLocationRef.current = null;
  }, [stopSimulation]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    ...state,
    stats,
    simulatedPath,
    startSimulation,
    pauseSimulation,
    resumeSimulation,
    stopSimulation,
    resetSimulation,
    setSpeedMultiplier,
    seekToTime,
  };
};

