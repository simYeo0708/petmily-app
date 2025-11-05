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

const NativeKakaoMapView = requireNativeComponent<NativeKakaoMapViewProps>('KakaoMapView');

const KakaoMapView = forwardRef<KakaoMapViewHandle, KakaoMapViewProps>(
  ({ apiKey, latitude = 37.5665, longitude = 126.9780, zoomLevel = 15, style }, ref) => {
    const mapRef = useRef(null);

    useImperativeHandle(ref, () => ({
      addMarker: (lat: number, lng: number, title: string) => {
        if (Platform.OS === 'ios') {
          const handle = findNodeHandle(mapRef.current);
          if (handle) {
            UIManager.dispatchViewManagerCommand(
              handle,
              'addMarker',
              [lat, lng, title]
            );
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

