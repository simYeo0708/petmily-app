// app/components/KakaoMapView.tsx
import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { requireNativeComponent, UIManager, findNodeHandle, ViewStyle, Platform, ViewProps } from 'react-native';

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
}

// Expo Go에서는 커스텀 모듈을 사용할 수 없으므로 예외 처리만 추가
const nativeConfig = UIManager.getViewManagerConfig?.('KakaoMapView');
if (!nativeConfig) {
  throw new Error('KakaoMapView native module is not available. Run with npx expo run:ios (Dev Client).');
}

declare global {
  // eslint-disable-next-line no-var
  var __KakaoMapViewComponent: React.ComponentType<any> | undefined;
}

let NativeKakaoMapView = global.__KakaoMapViewComponent;

if (!NativeKakaoMapView) {
  const viewConfig = UIManager.getViewManagerConfig?.('KakaoMapView');
  if (!viewConfig) {
    throw new Error('[KakaoMapView] Native module not found. Run `npx expo run:ios` to use the Dev Client.');
  }
  NativeKakaoMapView = requireNativeComponent<NativeKakaoMapViewProps>('KakaoMapView');
  global.__KakaoMapViewComponent = NativeKakaoMapView;
}

const KakaoMapView = forwardRef<KakaoMapViewHandle, KakaoMapViewProps>(
  ({ apiKey, latitude = 37.5665, longitude = 126.9780, zoomLevel = 15, style }, ref) => {
    const mapRef = useRef(null);

    useImperativeHandle(ref, () => ({
      addMarker: (lat: number, lng: number, title: string) => {
        if (Platform.OS === 'ios') {
          const handle = findNodeHandle(mapRef.current);
          if (handle) {
            UIManager.dispatchViewManagerCommand(handle, 'addMarker', [lat, lng, title]);
          }
        }
      },
    }));

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

KakaoMapView.displayName = 'KakaoMapView';
export default KakaoMapView;