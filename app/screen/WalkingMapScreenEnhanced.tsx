import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocationTracking } from '../hooks/useLocationTracking';
import { WalkingMiniMap } from '../components/WalkingMiniMap';
import {
  formatDistance,
  formatDuration,
  formatSpeed,
  calculatePace,
} from '../utils/LocationUtils';
import MapService from '../services/MapService';

const { width } = Dimensions.get('window');
const mapService = MapService.getInstance();

interface WalkingMapScreenEnhancedProps {
  navigation: any;
  route?: {
    params?: {
      bookingId?: number;
      walkerName?: string;
      petName?: string;
      petImageUrl?: string;
    };
  };
}

const WalkingMapScreenEnhanced: React.FC<WalkingMapScreenEnhancedProps> = ({
  navigation,
  route,
}) => {
  const {
    currentLocation,
    path,
    stats,
    isTracking,
    error,
    permissionStatus,
    startTracking,
    stopTracking,
    resetTracking,
  } = useLocationTracking();

  const [mapConfig, setMapConfig] = useState<{ appKey: string } | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  // 지도 설정 불러오기
  useEffect(() => {
    loadMapConfig();
  }, []);

  const loadMapConfig = async () => {
    try {
      const config = await mapService.getMapConfig();
      setMapConfig({ appKey: config.kakaoMapApiKey });
    } catch (error) {
      console.error('Failed to load map config:', error);
      Alert.alert('오류', '지도 설정을 불러올 수 없습니다.');
    }
  };

  // 산책 시작/일시정지
  const handleStartPause = async () => {
    if (!isTracking) {
      await startTracking();
      if (permissionStatus === 'denied') {
        Alert.alert(
          '위치 권한 필요',
          '산책 추적을 위해서는 위치 권한이 필요합니다. 설정에서 권한을 허용해주세요.',
          [{ text: '확인' }]
        );
      }
    } else {
      setIsPaused(!isPaused);
      if (!isPaused) {
        stopTracking();
      } else {
        startTracking();
      }
    }
  };

  // 산책 종료
  const handleFinish = () => {
    Alert.alert(
      '산책 종료',
      `총 거리: ${formatDistance(stats.distance)}\n소요 시간: ${formatDuration(stats.duration)}\n\n산책을 종료하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '종료',
          style: 'destructive',
          onPress: () => {
            stopTracking();
            navigation.goBack();
          },
        },
      ]
    );
  };

  // 산책 초기화
  const handleReset = () => {
    Alert.alert('산책 초기화', '현재 산책 기록을 초기화하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '초기화',
        style: 'destructive',
        onPress: resetTracking,
      },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: 0 }]}>
      <StatusBar barStyle="light-content" backgroundColor="#C59172" translucent={false} />

      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {route?.params?.petName || '반려동물'} 산책 중
        </Text>
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Ionicons name="refresh" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* 통계 카드 */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>거리</Text>
            <Text style={styles.statValue}>{formatDistance(stats.distance)}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>시간</Text>
            <Text style={styles.statValue}>{formatDuration(stats.duration)}</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>평균 속도</Text>
            <Text style={styles.statValueSmall}>
              {formatSpeed(stats.averageSpeed)}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>페이스</Text>
            <Text style={styles.statValueSmall}>
              {calculatePace(stats.averageSpeed)}
            </Text>
          </View>
        </View>

        {/* 지도 */}
        {mapConfig && (
          <View style={styles.mapContainer}>
            <WalkingMiniMap
              currentLocation={currentLocation}
              path={path}
              petImageUrl={route?.params?.petImageUrl}
              mapApiKey={mapConfig.appKey}
              style={styles.map}
            />
          </View>
        )}

        {/* 현재 속도 표시 */}
        {isTracking && stats.currentSpeed > 0 && (
          <View style={styles.currentSpeedContainer}>
            <Ionicons name="speedometer" size={20} color="#4A90E2" />
            <Text style={styles.currentSpeedText}>
              현재 속도: {formatSpeed(stats.currentSpeed)}
            </Text>
          </View>
        )}

        {/* 에러 메시지 */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color="#FF6B6B" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* 컨트롤 버튼 */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={[
              styles.controlButton,
              isTracking && styles.controlButtonActive,
            ]}
            onPress={handleStartPause}
          >
            <LinearGradient
              colors={
                isTracking
                  ? ['#FF9800', '#F57C00']
                  : ['#4A90E2', '#357ABD']
              }
              style={styles.controlButtonGradient}
            >
              <Ionicons
                name={isTracking ? (isPaused ? 'play' : 'pause') : 'play'}
                size={32}
                color="#FFFFFF"
              />
              <Text style={styles.controlButtonText}>
                {isTracking ? (isPaused ? '재개' : '일시정지') : '시작'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {isTracking && (
            <TouchableOpacity
              style={styles.finishButton}
              onPress={handleFinish}
            >
              <LinearGradient
                colors={['#FF6B6B', '#EE5A52']}
                style={styles.controlButtonGradient}
              >
                <Ionicons name="stop" size={32} color="#FFFFFF" />
                <Text style={styles.controlButtonText}>종료</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        {/* 산책자 정보 (있는 경우) */}
        {route?.params?.walkerName && (
          <View style={styles.walkerInfo}>
            <Ionicons name="person-circle" size={24} color="#666" />
            <Text style={styles.walkerInfoText}>
              산책자: {route.params.walkerName}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#C59172',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#C59172',
  },
  backButton: {
    padding: 8,
  },
  resetButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  statValueSmall: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  mapContainer: {
    marginVertical: 16,
  },
  map: {
    height: 300,
    borderRadius: 16,
  },
  currentSpeedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  currentSpeedText: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#FF6B6B',
  },
  controlsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 'auto',
  },
  controlButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  controlButtonActive: {
    flex: 1,
  },
  finishButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  controlButtonGradient: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  controlButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  walkerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  walkerInfoText: {
    fontSize: 14,
    color: '#666',
  },
});

export default WalkingMapScreenEnhanced;
