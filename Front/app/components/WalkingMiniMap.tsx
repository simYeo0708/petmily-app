import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { LocationCoords } from '../hooks/useLocationTracking';

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
  mapApiKey,
  style,
}) => {
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 지도 HTML 생성
  const generateMapHTML = () => {
    const center = currentLocation || (path.length > 0 ? path[0] : null);
    
    if (!center) {
      return `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                margin: 0;
                padding: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100vh;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                color: #666;
              }
            </style>
          </head>
          <body>
            <div>위치 정보를 불러오는 중...</div>
          </body>
        </html>
      `;
    }

    // 경로 좌표를 문자열로 변환
    const pathCoords = path
      .map(coord => `new kakao.maps.LatLng(${coord.latitude}, ${coord.longitude})`)
      .join(',\n          ');

    // 펫 이미지 마커 SVG
    const markerSVG = petImageUrl
      ? `
        <svg width="60" height="80" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <clipPath id="circleClip">
              <circle cx="30" cy="30" r="24"/>
            </clipPath>
          </defs>
          <circle cx="30" cy="30" r="26" fill="#4A90E2" stroke="#FFFFFF" stroke-width="3"/>
          <image href="${petImageUrl}" x="6" y="6" width="48" height="48" clip-path="url(#circleClip)"/>
          <path d="M 30 60 L 35 70 L 25 70 Z" fill="#4A90E2" stroke="#FFFFFF" stroke-width="2"/>
          <circle cx="30" cy="30" r="28" fill="none" stroke="#4A90E2" stroke-width="2" opacity="0.3">
            <animate attributeName="r" from="28" to="36" dur="1.5s" repeatCount="indefinite"/>
            <animate attributeName="opacity" from="0.3" to="0" dur="1.5s" repeatCount="indefinite"/>
          </circle>
        </svg>
      `
      : `
        <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="18" fill="#4A90E2" stroke="#FFFFFF" stroke-width="3"/>
          <circle cx="20" cy="20" r="8" fill="#FFFFFF"/>
          <circle cx="20" cy="20" r="20" fill="none" stroke="#4A90E2" stroke-width="2" opacity="0.3">
            <animate attributeName="r" from="20" to="28" dur="1.5s" repeatCount="indefinite"/>
            <animate attributeName="opacity" from="0.3" to="0" dur="1.5s" repeatCount="indefinite"/>
          </circle>
        </svg>
      `;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script type="text/javascript" src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${mapApiKey}"></script>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            html, body {
              width: 100%;
              height: 100%;
              overflow: hidden;
            }
            #map {
              width: 100%;
              height: 100%;
            }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script>
            try {
              const mapContainer = document.getElementById('map');
              const mapOption = {
                center: new kakao.maps.LatLng(${center.latitude}, ${center.longitude}),
                level: 3,
                draggable: true,
                scrollwheel: true,
                disableDoubleClick: false,
                disableDoubleClickZoom: false,
              };

              const map = new kakao.maps.Map(mapContainer, mapOption);

              // 경로 그리기
              ${path.length > 1 ? `
              const pathCoords = [
                ${pathCoords}
              ];

              const polyline = new kakao.maps.Polyline({
                path: pathCoords,
                strokeWeight: 5,
                strokeColor: '#4A90E2',
                strokeOpacity: 0.8,
                strokeStyle: 'solid'
              });

              polyline.setMap(map);

              // 시작점 마커
              const startPosition = pathCoords[0];
              const startMarker = new kakao.maps.Marker({
                position: startPosition,
                map: map
              });

              const startOverlay = new kakao.maps.CustomOverlay({
                position: startPosition,
                content: '<div style="background: #34C759; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">출발</div>',
                yAnchor: 2.5
              });
              startOverlay.setMap(map);
              ` : ''}

              // 현재 위치 마커 (펫 이미지 또는 기본 원형)
              const markerContent = \`
                <div style="position: relative; width: 60px; height: 80px;">
                  ${markerSVG}
                </div>
              \`;

              const customOverlay = new kakao.maps.CustomOverlay({
                position: new kakao.maps.LatLng(${center.latitude}, ${center.longitude}),
                content: markerContent,
                xAnchor: 0.5,
                yAnchor: 1
              });

              customOverlay.setMap(map);

              // 위치 업데이트 함수
              window.updateLocation = function(lat, lng) {
                const newPosition = new kakao.maps.LatLng(lat, lng);
                customOverlay.setPosition(newPosition);
                map.panTo(newPosition);
              };

              // 경로 업데이트 함수
              window.updatePath = function(pathData) {
                try {
                  const newPath = JSON.parse(pathData).map(coord => 
                    new kakao.maps.LatLng(coord.latitude, coord.longitude)
                  );
                  
                  if (window.currentPolyline) {
                    window.currentPolyline.setMap(null);
                  }
                  
                  window.currentPolyline = new kakao.maps.Polyline({
                    path: newPath,
                    strokeWeight: 5,
                    strokeColor: '#4A90E2',
                    strokeOpacity: 0.8,
                    strokeStyle: 'solid'
                  });
                  
                  window.currentPolyline.setMap(map);
                } catch (e) {
                  console.error('Path update error:', e);
                }
              };

              // 지도 중심 이동 함수
              window.centerMap = function(lat, lng, level) {
                map.setCenter(new kakao.maps.LatLng(lat, lng));
                if (level) map.setLevel(level);
              };

              // 로딩 완료 메시지
              window.ReactNativeWebView?.postMessage(JSON.stringify({ type: 'mapLoaded' }));
            } catch (error) {
              console.error('Map initialization error:', error);
              window.ReactNativeWebView?.postMessage(JSON.stringify({ 
                type: 'error', 
                message: error.toString() 
              }));
            }
          </script>
        </body>
      </html>
    `;
  };

  // 현재 위치 업데이트
  useEffect(() => {
    if (currentLocation && webViewRef.current && !isLoading) {
      webViewRef.current.injectJavaScript(`
        if (window.updateLocation) {
          window.updateLocation(${currentLocation.latitude}, ${currentLocation.longitude});
        }
        true;
      `);
    }
  }, [currentLocation, isLoading]);

  // 경로 업데이트
  useEffect(() => {
    if (path.length > 0 && webViewRef.current && !isLoading) {
      webViewRef.current.injectJavaScript(`
        if (window.updatePath) {
          window.updatePath('${JSON.stringify(path)}');
        }
        true;
      `);
    }
  }, [path, isLoading]);

  return (
    <View style={[styles.container, style]}>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
        </View>
      )}
      <WebView
        ref={webViewRef}
        source={{ html: generateMapHTML() }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onLoadEnd={() => setIsLoading(false)}
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'mapLoaded') {
              setIsLoading(false);
            }
          } catch (e) {
            console.error('WebView message error:', e);
          }
        }}
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
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    zIndex: 1,
  },
});

