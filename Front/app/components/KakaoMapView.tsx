// app/components/KakaoMapView.tsx
import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import {
  requireNativeComponent,
  UIManager,
  findNodeHandle,
  ViewStyle,
  Platform,
  ViewProps,
  processColor,
  View,
  Text,
  StyleSheet,
} from 'react-native';

interface NativeKakaoMapViewProps extends ViewProps {
  apiKey: string;
  latitude: number;
  longitude: number;
  zoomLevel: number;
}

interface KakaoMapViewProps {
  apiKey: string;
  latitude?: number;
  longitude?: number;
  zoomLevel?: number;
  style?: ViewStyle;
}

export interface KakaoMapViewHandle {
  addMarker: (latitude: number, longitude: number, title: string) => void;
  updateRoute: (
    routeId: string,
    coordinates: Array<{ latitude: number; longitude: number }>,
    options?: UpdateRouteOptions
  ) => void;
  clearRoute: (routeId: string) => void;
  startCameraTracking: () => void;
  stopCameraTracking: () => void;
  updateTrackingLocation: (latitude: number, longitude: number) => void;
}

interface UpdateRouteOptions {
  color?: string | number;
  strokeColor?: string | number;
  lineWidth?: number;
}

// Expo Go에서는 커스텀 모듈을 사용할 수 없으므로 null 처리
const nativeConfig = UIManager.getViewManagerConfig?.('KakaoMapView');
const isNativeModuleAvailable = !!nativeConfig;

declare global {
  // eslint-disable-next-line no-var
  var __KakaoMapViewComponent: React.ComponentType<any> | undefined;
}

let NativeKakaoMapView = global.__KakaoMapViewComponent;

if (!NativeKakaoMapView && isNativeModuleAvailable) {
  try {
    NativeKakaoMapView = requireNativeComponent<NativeKakaoMapViewProps>('KakaoMapView');
    global.__KakaoMapViewComponent = NativeKakaoMapView;
  } catch (e) {
    // Native module not available
    NativeKakaoMapView = null;
  }
}

const KakaoMapView = forwardRef<KakaoMapViewHandle, KakaoMapViewProps>(
  ({ apiKey, latitude = 37.5665, longitude = 126.9780, zoomLevel = 15, style }, ref) => {
    const mapRef = useRef(null);
    const commandMap = UIManager.getViewManagerConfig?.('KakaoMapView')?.Commands ?? {};

    const getCommandId = (name: string) => {
      const command = commandMap?.[name];
      return command != null ? command : name;
    };

    useImperativeHandle(ref, () => ({
      addMarker: (lat: number, lng: number, title: string) => {
        if (Platform.OS === 'ios') {
          const handle = findNodeHandle(mapRef.current);
          if (handle) {
            UIManager.dispatchViewManagerCommand(handle, getCommandId('addMarker'), [lat, lng, title]);
          }
        }
      },
      updateRoute: (routeId, coordinates, options = {}) => {
        if (Platform.OS !== 'ios') {
          return;
        }
        const handle = findNodeHandle(mapRef.current);
        if (!handle) return;

        const color = (processColor(options.color ?? '#4A90E2') ??
          processColor('#4A90E2') ??
          0) as number;
        const strokeColor = (processColor(options.strokeColor ?? '#FFFFFF') ??
          processColor('#FFFFFF') ??
          0) as number;
        const lineWidth = options.lineWidth ?? 12;

        UIManager.dispatchViewManagerCommand(handle, getCommandId('updateRoute'), [
          routeId,
          coordinates,
          color,
          strokeColor,
          lineWidth,
        ]);
      },
      clearRoute: (routeId: string) => {
        if (Platform.OS !== 'ios') {
          return;
        }
        const handle = findNodeHandle(mapRef.current);
        if (!handle) return;

        UIManager.dispatchViewManagerCommand(handle, getCommandId('clearRoute'), [routeId]);
      },
      startCameraTracking: () => {
        if (Platform.OS !== 'ios') {
          return;
        }
        const handle = findNodeHandle(mapRef.current);
        if (!handle) return;

        UIManager.dispatchViewManagerCommand(handle, getCommandId('startCameraTracking'), []);
      },
      stopCameraTracking: () => {
        if (Platform.OS !== 'ios') {
          return;
        }
        const handle = findNodeHandle(mapRef.current);
        if (!handle) return;

        UIManager.dispatchViewManagerCommand(handle, getCommandId('stopCameraTracking'), []);
      },
      updateTrackingLocation: (latitude: number, longitude: number) => {
        if (Platform.OS !== 'ios') {
          return;
        }
        const handle = findNodeHandle(mapRef.current);
        if (!handle) return;

        UIManager.dispatchViewManagerCommand(handle, getCommandId('updateTrackingLocation'), [
          latitude,
          longitude,
        ]);
      },
    }));

    // 네이티브 모듈이 없으면 폴백 UI 표시
    if (!NativeKakaoMapView) {
      return (
        <View style={[styles.fallbackContainer, style]}>
          <Text style={styles.fallbackText}>
            🗺️ 지도를 표시하려면{'\n'}
            Development Build가 필요합니다
          </Text>
          <Text style={styles.fallbackSubtext}>
            npx expo run:ios 로 실행하세요
          </Text>
        </View>
      );
    }

    return (
      <NativeKakaoMapView
        ref={mapRef}
        apiKey={apiKey}
        latitude={latitude}
        longitude={longitude}
        zoomLevel={zoomLevel}
        style={style}
      />
    );
  }
);

const styles = StyleSheet.create({
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 20,
  },
  fallbackText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '600',
  },
  fallbackSubtext: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

KakaoMapView.displayName = 'KakaoMapView';
export default KakaoMapView;