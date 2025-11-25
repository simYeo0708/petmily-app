import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LocationCoords } from '../hooks/useLocationTracking';
import KakaoMapView, { KakaoMapViewHandle } from './KakaoMapView';
import { KAKAO_MAP_API_KEY } from '../config/api';

interface WalkingMiniMapProps {
  currentLocation: LocationCoords | null;
  path: LocationCoords[];
  petImageUrl?: string;
  mapApiKey: string;
  style?: any;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const WalkingMiniMap: React.FC<WalkingMiniMapProps> = ({
  currentLocation,
  path,
  petImageUrl,
  mapApiKey, // 파라미터는 유지하되 사용하지 않음
  style,
}) => {
  const kakaoMapRef = useRef<KakaoMapViewHandle>(null);

  // 경로 마커 추가
  useEffect(() => {
    if (path.length > 0 && kakaoMapRef.current) {
      // 경로의 각 지점에 마커 추가 (시작점과 끝점만)
      if (path.length >= 2) {
        const startPoint = path[0];
        const endPoint = path[path.length - 1];
        
        kakaoMapRef.current.addMarker(
          startPoint.latitude,
          startPoint.longitude,
          '시작'
        );
        
        if (path.length > 1) {
          kakaoMapRef.current.addMarker(
            endPoint.latitude,
            endPoint.longitude,
            '현재 위치'
          );
        }
      }
    }
  }, [path]);

  return (
    <View style={[styles.container, style]}>
      <KakaoMapView
        ref={kakaoMapRef}
        apiKey={KAKAO_MAP_API_KEY}
        latitude={currentLocation?.latitude || 37.5665}
        longitude={currentLocation?.longitude || 126.9780}
        zoomLevel={15}
        style={styles.map}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 300,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  map: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
