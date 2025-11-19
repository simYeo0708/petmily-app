import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LocationCoords } from '../hooks/useLocationTracking';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
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
  const mapViewRef = useRef<MapView>(null);

  // 경로가 변경되면 지도 영역 조정
  useEffect(() => {
    if (path.length > 0 && mapViewRef.current) {
      const coordinates = path.map(p => ({
        latitude: p.latitude,
        longitude: p.longitude,
      }));
      
      if (coordinates.length >= 2) {
        mapViewRef.current.fitToCoordinates(coordinates, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
      }
    }
  }, [path]);

  const startPoint = path.length > 0 ? path[0] : null;
  const endPoint = path.length > 1 ? path[path.length - 1] : null;

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapViewRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: currentLocation?.latitude || 37.5665,
          longitude: currentLocation?.longitude || 126.9780,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={true}
      >
        {/* 시작 지점 마커 */}
        {startPoint && (
          <Marker
            coordinate={{
              latitude: startPoint.latitude,
              longitude: startPoint.longitude,
            }}
            title="시작"
            pinColor="green"
          />
        )}
        
        {/* 현재 위치 마커 */}
        {endPoint && path.length > 1 && (
          <Marker
            coordinate={{
              latitude: endPoint.latitude,
              longitude: endPoint.longitude,
            }}
            title="현재 위치"
            pinColor="red"
          />
        )}
        
        {/* 경로 선 */}
        {path.length > 1 && (
          <Polyline
            coordinates={path.map(p => ({
              latitude: p.latitude,
              longitude: p.longitude,
            }))}
            strokeColor="#4A90E2"
            strokeWidth={3}
          />
        )}
      </MapView>
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
