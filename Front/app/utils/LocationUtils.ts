import { LocationCoords } from '../hooks/useLocationTracking';

/**
 * 두 좌표 사이의 거리를 계산합니다 (Haversine formula)
 * @param coord1 첫 번째 좌표
 * @param coord2 두 번째 좌표
 * @returns 거리 (미터)
 */
export const calculateDistance = (
  coord1: LocationCoords,
  coord2: LocationCoords
): number => {
  const R = 6371e3; // 지구 반지름 (미터)
  const φ1 = (coord1.latitude * Math.PI) / 180;
  const φ2 = (coord2.latitude * Math.PI) / 180;
  const Δφ = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const Δλ = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

/**
 * 거리를 포맷팅합니다
 * @param meters 거리 (미터)
 * @returns 포맷된 문자열 (예: "1.23 km" 또는 "123 m")
 */
export const formatDistance = (meters: number): string => {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(2)} km`;
  }
  return `${Math.round(meters)} m`;
};

/**
 * 시간을 포맷팅합니다
 * @param seconds 시간 (초)
 * @returns 포맷된 문자열 (예: "1:23:45" 또는 "23:45")
 */
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${minutes}:${String(secs).padStart(2, '0')}`;
};

/**
 * 속도를 포맷팅합니다
 * @param kmh 속도 (km/h)
 * @returns 포맷된 문자열 (예: "5.4 km/h")
 */
export const formatSpeed = (kmh: number): string => {
  return `${kmh.toFixed(1)} km/h`;
};

/**
 * 페이스를 계산합니다 (분/km)
 * @param kmh 속도 (km/h)
 * @returns 페이스 문자열 (예: "11:05 /km")
 */
export const calculatePace = (kmh: number): string => {
  if (kmh === 0) return '--:-- /km';
  
  const minutesPerKm = 60 / kmh;
  const minutes = Math.floor(minutesPerKm);
  const seconds = Math.round((minutesPerKm - minutes) * 60);
  
  return `${minutes}:${String(seconds).padStart(2, '0')} /km`;
};

/**
 * 칼로리를 추정합니다 (매우 간단한 추정)
 * @param distanceKm 거리 (km)
 * @param weightKg 체중 (kg) - 기본값 70kg
 * @returns 칼로리
 */
export const estimateCalories = (distanceKm: number, weightKg: number = 70): number => {
  // 간단한 공식: 칼로리 = 체중(kg) × 거리(km) × 1.036
  return Math.round(weightKg * distanceKm * 1.036);
};

/**
 * 경로의 중심점을 계산합니다
 * @param path 좌표 배열
 * @returns 중심 좌표 또는 null
 */
export const getPathCenter = (path: LocationCoords[]): LocationCoords | null => {
  if (path.length === 0) return null;

  const sum = path.reduce(
    (acc, coord) => ({
      latitude: acc.latitude + coord.latitude,
      longitude: acc.longitude + coord.longitude,
    }),
    { latitude: 0, longitude: 0 }
  );

  return {
    latitude: sum.latitude / path.length,
    longitude: sum.longitude / path.length,
    altitude: null,
    accuracy: null,
    timestamp: Date.now(),
  };
};

/**
 * 경로의 경계를 계산합니다
 * @param path 좌표 배열
 * @returns 경계 { minLat, maxLat, minLng, maxLng } 또는 null
 */
export const getPathBounds = (
  path: LocationCoords[]
): {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
} | null => {
  if (path.length === 0) return null;

  const bounds = path.reduce(
    (acc, coord) => ({
      minLat: Math.min(acc.minLat, coord.latitude),
      maxLat: Math.max(acc.maxLat, coord.latitude),
      minLng: Math.min(acc.minLng, coord.longitude),
      maxLng: Math.max(acc.maxLng, coord.longitude),
    }),
    {
      minLat: path[0].latitude,
      maxLat: path[0].latitude,
      minLng: path[0].longitude,
      maxLng: path[0].longitude,
    }
  );

  return bounds;
};


