import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
  PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { useWalkerRouteSimulation } from '../hooks/useWalkerRouteSimulation';
import { WalkingRoute } from '../data/walkingRoutes';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../index';

const { width, height } = Dimensions.get('window');

type WalkingSimulationScreenProps = NativeStackScreenProps<RootStackParamList, 'WalkingSimulation'>;

interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: number;
}

const WalkingSimulationScreen: React.FC<WalkingSimulationScreenProps> = ({ navigation, route }) => {
  const routeData = route.params?.route as WalkingRoute;
  
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [drawnRouteCoordinates, setDrawnRouteCoordinates] = useState<Array<{latitude: number, longitude: number}>>([]);
  const locationHistoryRef = useRef<LocationData[]>([]);
  const mapViewRef = useRef<MapView>(null);
  
  // 시간바 관련 상태
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekTime, setSeekTime] = useState(0);
  
  // 사용자 지도 조작 감지
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const userInteractionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // 초기 region 저장 (줌 리셋용)
  const defaultRegionRef = useRef<{
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null>(null);
  
  // 오버레이 드래그 관련 상태 (더 높은 위치로 초기화)
  const [overlayPosition, setOverlayPosition] = useState({ x: 20, y: height - 350 });
  const [isOverlayMinimized, setIsOverlayMinimized] = useState(false);
  const overlayPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // 슬라이더 영역이 아닐 때만 드래그 허용
        const touchY = evt.nativeEvent.locationY;
        // 슬라이더는 오버레이 하단에 있으므로, 상단 부분만 드래그 가능
        return (Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5) && touchY < 100;
      },
      onPanResponderGrant: () => {
        // 드래그 시작
      },
      onPanResponderMove: (evt, gestureState) => {
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

  const {
    isSimulating,
    isPaused,
    simulatedPath,
    stats: simulationStats,
    speedMultiplier,
    elapsedTime,
    currentRoute,
    startSimulation,
    pauseSimulation,
    resumeSimulation,
    stopSimulation,
    resetSimulation,
    setSpeedMultiplier,
    seekToTime,
  } = useWalkerRouteSimulation(
    500, // 0.5초마다 업데이트
    (location) => {
      const newLocation: LocationData = {
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: location.timestamp,
      };

      setCurrentLocation(newLocation);

      // 카메라 추적 - 사용자가 지도를 조작하지 않을 때만 자동 추적
      if (mapViewRef.current && !isUserInteracting) {
        mapViewRef.current.animateCamera({
          center: {
            latitude: newLocation.latitude,
            longitude: newLocation.longitude,
          },
          zoom: 17,
        }, { duration: 500 });
      }

      // 순차적으로 경로 그리기
      locationHistoryRef.current = [...locationHistoryRef.current, newLocation];
      const coordinates = locationHistoryRef.current.map(point => ({
        latitude: point.latitude,
        longitude: point.longitude,
      }));
      if (coordinates.length >= 2) {
        setDrawnRouteCoordinates(coordinates);
      }
    }
  );

  useEffect(() => {
    if (routeData) {
      // 첫 번째 위치로 카메라 이동
      const firstPoint = routeData.points[0];
      const initialLocation: LocationData = {
        latitude: firstPoint.latitude,
        longitude: firstPoint.longitude,
        timestamp: Date.now(),
      };
      setCurrentLocation(initialLocation);
      locationHistoryRef.current = [initialLocation];
      
      // 초기 region 저장
      const initialRegion = {
        latitude: firstPoint.latitude,
        longitude: firstPoint.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      defaultRegionRef.current = initialRegion;
      
      if (mapViewRef.current) {
        mapViewRef.current.animateToRegion(initialRegion, 1000);
      }

      // 시뮬레이션 시작
      startSimulation(routeData);
    }

    return () => {
      stopSimulation();
      resetSimulation();
      if (userInteractionTimeoutRef.current) {
        clearTimeout(userInteractionTimeoutRef.current);
      }
    };
  }, [routeData]);

  const handleStopSimulation = () => {
    stopSimulation();
    resetSimulation();
    navigation.goBack();
  };

  const handleResetZoom = () => {
    if (mapViewRef.current && defaultRegionRef.current) {
      mapViewRef.current.animateToRegion(defaultRegionRef.current, 500);
    }
  };

  // 전체 시뮬레이션 시간 계산
  // 시간바는 경로 시간을 표시 (속도 배율과 무관)
  const totalDuration = routeData?.estimatedDuration || 0;
  const currentRouteTime = isSeeking ? seekTime : elapsedTime; // 경로에서 진행된 시간
  const sliderWidth = 260; // 오버레이 내부 슬라이더 너비 (300 - 40 패딩)
  
  // 커스텀 슬라이더 관련 상태
  const sliderPosition = useRef(new Animated.Value(0)).current;
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const sliderStartX = useRef(0); // 드래그 시작 위치
  
  // 시간으로 이동하는 함수
  const handleSeekToTime = (targetTime: number) => {
    if (!routeData) return;
    
    // 슬라이더 위치 업데이트
    const progress = Math.max(0, Math.min(1, targetTime / totalDuration));
    const position = progress * sliderWidth;
    sliderPosition.setValue(position);
    
    seekToTime(targetTime, (location, pathToTime) => {
      const newLocation: LocationData = {
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: location.timestamp,
      };
      setCurrentLocation(newLocation);
      
      // 경로 업데이트
      locationHistoryRef.current = pathToTime.map(p => ({
        latitude: p.latitude,
        longitude: p.longitude,
        timestamp: p.timestamp || 0,
      }));
      
      const coordinates = locationHistoryRef.current.map(point => ({
        latitude: point.latitude,
        longitude: point.longitude,
      }));
      if (coordinates.length >= 2) {
        setDrawnRouteCoordinates(coordinates);
      }
      
      // 카메라 이동
      if (mapViewRef.current) {
        mapViewRef.current.animateCamera({
          center: {
            latitude: newLocation.latitude,
            longitude: newLocation.longitude,
          },
          zoom: 17,
        }, { duration: 300 });
      }
    });
  };
  
  // 슬라이더 PanResponder
  const sliderPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        if (!routeData || totalDuration === 0) return;
        setIsDraggingSlider(true);
        setIsSeeking(true);
        
        // 터치 위치를 시간으로 변환 (슬라이더 컨테이너 기준)
        const touchX = evt.nativeEvent.locationX;
        sliderStartX.current = touchX;
        const progress = Math.max(0, Math.min(1, touchX / sliderWidth));
        const targetTime = Math.floor(progress * totalDuration); // 소수점 제거
        setSeekTime(targetTime);
        sliderPosition.setValue(touchX);
        
        // 해당 시간으로 이동
        handleSeekToTime(targetTime);
      },
      onPanResponderMove: (evt, gestureState) => {
        if (!routeData || totalDuration === 0) return;
        
        // 슬라이더 위치 업데이트 (초기 터치 위치 + 이동 거리)
        const newX = Math.max(0, Math.min(sliderWidth, sliderStartX.current + gestureState.dx));
        sliderPosition.setValue(newX);
        
        // 시간 계산 (소수점 제거)
        const progress = Math.max(0, Math.min(1, newX / sliderWidth));
        const targetTime = Math.floor(progress * totalDuration); // 소수점 제거
        setSeekTime(targetTime);
        
        // 해당 시간으로 이동
        handleSeekToTime(targetTime);
      },
      onPanResponderRelease: () => {
        setIsDraggingSlider(false);
        setIsSeeking(false);
      },
    })
  ).current;

  // 현재 시간에 따라 슬라이더 위치 업데이트 (경로 시간 기준)
  useEffect(() => {
    if (!isDraggingSlider && routeData && totalDuration > 0) {
      const progress = currentRouteTime / totalDuration;
      const position = progress * sliderWidth;
      Animated.timing(sliderPosition, {
        toValue: position,
        duration: 100,
        useNativeDriver: false,
      }).start();
    }
  }, [currentRouteTime, totalDuration, isDraggingSlider, routeData, sliderWidth]);

  // 초기 슬라이더 위치 설정
  useEffect(() => {
    if (routeData && totalDuration > 0 && !isDraggingSlider) {
      sliderPosition.setValue(0);
    }
  }, [routeData]);

  // 시간 포맷팅 함수
  const formatTime = (seconds: number) => {
    const totalSeconds = Math.floor(seconds); // 소수점 제거
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const defaultLatitude = routeData?.points[0]?.latitude || 37.5665;
  const defaultLongitude = routeData?.points[0]?.longitude || 126.9780;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      
      {/* 지도 영역 */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapViewRef}
          provider={PROVIDER_DEFAULT}
          style={styles.map}
          initialRegion={{
            latitude: defaultLatitude,
            longitude: defaultLongitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          scrollEnabled={true}
          zoomEnabled={true}
          zoomControlEnabled={true}
          pitchEnabled={true}
          rotateEnabled={true}
          showsUserLocation={false}
          followsUserLocation={false}
          onPanDrag={() => {
            // 사용자가 지도를 드래그 중
            setIsUserInteracting(true);
            if (userInteractionTimeoutRef.current) {
              clearTimeout(userInteractionTimeoutRef.current);
            }
            // 2초 후 자동 추적 재개
            userInteractionTimeoutRef.current = setTimeout(() => {
              setIsUserInteracting(false);
            }, 2000);
          }}
          onRegionChangeComplete={() => {
            // 사용자가 지도 조작 완료
            setIsUserInteracting(true);
            if (userInteractionTimeoutRef.current) {
              clearTimeout(userInteractionTimeoutRef.current);
            }
            // 2초 후 자동 추적 재개
            userInteractionTimeoutRef.current = setTimeout(() => {
              setIsUserInteracting(false);
            }, 2000);
          }}
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
          
          {/* 순차적으로 그려지는 경로 */}
          {drawnRouteCoordinates.length > 1 && (
            <Polyline
              coordinates={drawnRouteCoordinates}
              strokeColor="#4A90E2"
              strokeWidth={4}
            />
          )}
        </MapView>
      </View>

      {/* 상단 헤더 */}
      <View style={styles.headerOverlay} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleStopSimulation}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {routeData?.name || '산책 시뮬레이션'}
        </Text>
      </View>

      {/* 속도 선택 버튼 */}
      {isSimulating && (
        <View style={styles.speedControlContainer}>
          <TouchableOpacity
            style={[styles.speedButton, speedMultiplier === 1 && styles.speedButtonActive]}
            onPress={() => setSpeedMultiplier(1)}
          >
            <Text style={[styles.speedButtonText, speedMultiplier === 1 && styles.speedButtonTextActive]}>1x</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.speedButton, speedMultiplier === 2 && styles.speedButtonActive]}
            onPress={() => setSpeedMultiplier(2)}
          >
            <Text style={[styles.speedButtonText, speedMultiplier === 2 && styles.speedButtonTextActive]}>2x</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.speedButton, speedMultiplier === 4 && styles.speedButtonActive]}
            onPress={() => setSpeedMultiplier(4)}
          >
            <Text style={[styles.speedButtonText, speedMultiplier === 4 && styles.speedButtonTextActive]}>4x</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 일시정지/재개 버튼 */}
      {isSimulating && (
        <TouchableOpacity
          style={styles.playPauseButton}
          onPress={() => {
            if (isPaused) {
              resumeSimulation();
            } else {
              pauseSimulation();
            }
          }}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={isPaused ? ['#4A90E2', '#357ABD'] : ['#FFA500', '#FF8C00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.playPauseButtonGradient}
          >
            <Ionicons 
              name={isPaused ? "play" : "pause"} 
              size={28} 
              color="#fff" 
            />
          </LinearGradient>
        </TouchableOpacity>
      )}
        
      {/* 줌 리셋 버튼 */}
      <TouchableOpacity
        style={styles.resetZoomButton}
        onPress={handleResetZoom}
        activeOpacity={0.8}
      >
        <Ionicons name="locate" size={24} color="#4A90E2" />
      </TouchableOpacity>

      {/* 산책 정보 오버레이 */}
      {isSimulating && (
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
                }
              ]}
            >
              <View style={styles.overlayHeader} {...overlayPanResponder.panHandlers}>
                <View style={styles.dragHandle} />
                <TouchableOpacity
                  style={styles.minimizeButton}
                  onPress={() => setIsOverlayMinimized(true)}
                >
                  <Ionicons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
              </View>
              <View style={styles.walkingStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>거리</Text>
                  <Text style={styles.statValue}>
                    {(simulationStats.distance / 1000).toFixed(2)} km
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>시간</Text>
                  <Text style={styles.statValue}>
                    {Math.floor(simulationStats.duration / 60)}:
                    {(simulationStats.duration % 60).toString().padStart(2, '0')}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>속도</Text>
                  <Text style={styles.statValue}>
                    {simulationStats.averageSpeed.toFixed(1)} km/h
                  </Text>
                </View>
              </View>
              
              {/* 시간바 통합 */}
              {routeData && (
                <View style={styles.timeBarSection}>
                  <View style={styles.timeBarHeader}>
                    <Text style={styles.timeBarLabel}>시간</Text>
                    <Text style={styles.timeBarTime}>
                      {formatTime(currentRouteTime)} / {formatTime(totalDuration)}
                    </Text>
                  </View>
                  <View style={styles.customSliderContainer} {...sliderPanResponder.panHandlers}>
                    {/* 슬라이더 트랙 */}
                    <View style={styles.sliderTrack}>
                      {/* 진행된 부분 */}
                      <Animated.View
                        style={[
                          styles.sliderProgress,
                          {
                            width: sliderPosition.interpolate({
                              inputRange: [0, sliderWidth],
                              outputRange: [0, sliderWidth],
                              extrapolate: 'clamp',
                            }),
                          },
                        ]}
                      />
                    </View>
                    {/* 슬라이더 썸 */}
                    <Animated.View
                      style={[
                        styles.sliderThumb,
                        {
                          transform: [
                            {
                              translateX: sliderPosition.interpolate({
                                inputRange: [0, sliderWidth],
                                outputRange: [0, sliderWidth - 12], // 썸 크기 고려
                                extrapolate: 'clamp',
                              }),
                            },
                          ],
                        },
                      ]}
                    />
                  </View>
                </View>
              )}
            </Animated.View>
          ) : (
            <TouchableOpacity
              style={styles.floatingMinimizeButton}
              onPress={() => setIsOverlayMinimized(false)}
            >
              <Ionicons name="chevron-up" size={24} color="#4A90E2" />
            </TouchableOpacity>
          )}
        </>
      )}


      {/* 하단 종료 버튼 */}
      <View style={styles.bottomControls}>
        <TouchableOpacity
          style={styles.stopButton}
          onPress={handleStopSimulation}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#FF4757', '#EE5A6F', '#DC3545']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.stopButtonGradient}
          >
            <View style={styles.stopButtonContent}>
              <View style={styles.stopIconContainer}>
                <Ionicons name="stop" size={28} color="#fff" />
              </View>
              <View style={styles.stopTextContainer}>
                <Text style={styles.stopButtonText}>시뮬레이션 종료</Text>
                <Text style={styles.stopButtonSubtext}>산책 지도로 돌아가기</Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
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
  speedControlContainer: {
    position: 'absolute',
    top: 100,
    right: 20,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 4,
    gap: 4,
  },
  speedButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  speedButtonActive: {
    backgroundColor: '#4A90E2',
  },
  speedButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  speedButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  playPauseButton: {
    position: 'absolute',
    top: 100,
    left: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  playPauseButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
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
    right: 20,
    bottom: 210, // resetZoomButton (bottom: 150) 바로 위에 배치 (150 + 50 + 10)
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
  bottomControls: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
  stopButton: {
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#FF4757',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  stopButtonGradient: {
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  stopButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopIconContainer: {
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
  stopTextContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  stopButtonText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  stopButtonSubtext: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.2,
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
  timeBarSection: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  timeBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  timeBarLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  timeBarTime: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A90E2',
  },
  customSliderContainer: {
    height: 50,
    justifyContent: 'center',
    paddingVertical: 15,
    position: 'relative',
  },
  sliderTrack: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    position: 'relative',
    width: '100%',
  },
  sliderProgress: {
    height: 4,
    backgroundColor: '#4A90E2',
    borderRadius: 2,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  sliderThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4A90E2',
    position: 'absolute',
    top: 15,
    left: 0,
    marginTop: -10,
    marginLeft: -10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#fff',
  },
});

export default WalkingSimulationScreen;

