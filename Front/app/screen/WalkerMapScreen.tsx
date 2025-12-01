import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Modal,
  ScrollView,
  Alert,
  Animated,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { RootStackParamList } from '../index';
import WalkerBookingService from '../services/WalkerBookingService';
import WalkerService from '../services/WalkerService';
import { IconImage } from '../components/IconImage';

const { width, height } = Dimensions.get('window');

type WalkerMapScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'WalkerMap'>;

interface WalkingBookingResponse {
  id: number;
  petId: number;
  walkerId?: number;
  date: string;
  duration: number;
  status: string;
  pickupAddress: string;
  notes?: string;
  userId?: number;
  userName?: string;
  petName?: string;
  petImage?: string;
}

// 샘플 매칭된 산책 데이터
const SAMPLE_MATCHED_BOOKING: WalkingBookingResponse = {
  id: 1,
  petId: 1,
  walkerId: 1,
  userId: 2,
  userName: '김보호자',
  petName: '뽀삐',
  petImage: 'https://via.placeholder.com/100',
  date: new Date().toISOString(),
  duration: 60,
  status: 'CONFIRMED',
  pickupAddress: '서울특별시 강남구 테헤란로 123',
  notes: '활발한 강아지입니다. 산책 중 물을 자주 마셔야 합니다.',
};

const WalkerMapScreen: React.FC = () => {
  const navigation = useNavigation<WalkerMapScreenNavigationProp>();
  
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<WalkingBookingResponse | null>(null);
  const [bookings, setBookings] = useState<WalkingBookingResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showBookingList, setShowBookingList] = useState(false);
  const [isWalking, setIsWalking] = useState(false); // 산책 중 상태
  const [walkStartTime, setWalkStartTime] = useState<Date | null>(null); // 산책 시작 시간
  const mapViewRef = useRef<MapView>(null);

  // 워커 여부 확인
  useEffect(() => {
    checkWalkerAndLoadBookings();
  }, []);

  useFocusEffect(
    useCallback(() => {
      checkWalkerAndLoadBookings();
    }, [])
  );

  const checkWalkerAndLoadBookings = async () => {
    try {
      const walker = await WalkerService.getCurrentWalker();
      if (!walker) {
        Alert.alert('알림', '워커로 등록되어 있지 않습니다.');
        navigation.goBack();
        return;
      }
      
      await loadBookings();
      await loadCurrentLocation();
    } catch (error) {
      Alert.alert('오류', '정보를 불러올 수 없습니다.');
    }
  };

  const loadCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('위치 권한 필요', '위치 정보를 사용하려면 권한이 필요합니다.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setCurrentLocation(location);

      if (mapViewRef.current) {
        mapViewRef.current.animateToRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, 1000);
      }
    } catch (error) {
      Alert.alert('오류', '현재 위치를 가져올 수 없습니다.');
    }
  };

  const loadBookings = async () => {
    try {
      setIsLoading(true);
      
      // 샘플 데이터 사용 (실제 API 호출 대신)
      // const walkerBookings = await WalkerBookingService.getWalkBookings();
      // const confirmedBookings = walkerBookings.filter(
      //   booking => booking.status === 'CONFIRMED' || booking.status === 'confirmed'
      // );
      
      // 샘플 데이터로 매칭된 산책 설정
      const sampleBookings = [SAMPLE_MATCHED_BOOKING];
      setBookings(sampleBookings);
      
      if (sampleBookings.length > 0 && !selectedBooking) {
        setSelectedBooking(sampleBookings[0]);
      }
    } catch (error) {
      // 샘플 데이터 사용 중이므로 에러 발생 시에도 샘플 데이터 설정
      const sampleBookings = [SAMPLE_MATCHED_BOOKING];
      setBookings(sampleBookings);
      if (!selectedBooking) {
        setSelectedBooking(sampleBookings[0]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartWalking = async () => {
    if (!selectedBooking) {
      Alert.alert('알림', '산책을 선택해주세요.');
      return;
    }

    Alert.alert(
      '산책 시작',
      `${selectedBooking.petName || '반려동물'}와(과) 산책을 시작하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '시작',
          onPress: async () => {
            try {
              // 샘플 데이터 사용 중이므로 실제 API 호출은 주석 처리
              // const response = await fetch(
              //   `${require('../config/api').API_BASE_URL}/walker-bookings/${selectedBooking.id}/status?status=IN_PROGRESS`,
              //   {
              //     method: 'PUT',
              //     headers: {
              //       'Authorization': `Bearer ${await require('../services/AuthService').default.getAuthToken()}`,
              //     },
              //   }
              // );

              // if (response.ok) {
                // 산책 시작 상태로 변경
                setIsWalking(true);
                setWalkStartTime(new Date());
                
                // 예약 상태를 IN_PROGRESS로 업데이트 (샘플 데이터)
                const updatedBooking = { ...selectedBooking, status: 'IN_PROGRESS' };
                setSelectedBooking(updatedBooking);
                setBookings(bookings.map(b => b.id === selectedBooking.id ? updatedBooking : b));
                
                Alert.alert('알림', '산책이 시작되었습니다.');
                
                // 실제 구현 시에는 WalkingMap 화면으로 이동하여 위치 추적 시작
                // navigation.navigate('WalkingMap', { bookingId: selectedBooking.id });
              // } else {
              //   Alert.alert('오류', '산책 시작에 실패했습니다.');
              // }
            } catch (error) {
              Alert.alert('오류', '산책 시작 중 오류가 발생했습니다.');
            }
          },
        },
      ]
    );
  };

  const handleStopWalking = async () => {
    if (!selectedBooking) {
      return;
    }

    Alert.alert(
      '산책 종료',
      '산책을 종료하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '종료',
          style: 'destructive',
          onPress: async () => {
            try {
              // 샘플 데이터 사용 중이므로 실제 API 호출은 주석 처리
              // const response = await fetch(
              //   `${require('../config/api').API_BASE_URL}/walker-bookings/${selectedBooking.id}/status?status=COMPLETED`,
              //   {
              //     method: 'PUT',
              //     headers: {
              //       'Authorization': `Bearer ${await require('../services/AuthService').default.getAuthToken()}`,
              //     },
              //   }
              // );

              // if (response.ok) {
                // 산책 종료 상태로 변경
                setIsWalking(false);
                setWalkStartTime(null);
                
                // 예약 상태를 COMPLETED로 업데이트 (샘플 데이터)
                const updatedBooking = { ...selectedBooking, status: 'COMPLETED' };
                setSelectedBooking(updatedBooking);
                setBookings(bookings.map(b => b.id === selectedBooking.id ? updatedBooking : b));
                
                Alert.alert('완료', '산책이 종료되었습니다.');
              // } else {
              //   Alert.alert('오류', '산책 종료에 실패했습니다.');
              // }
            } catch (error) {
              Alert.alert('오류', '산책 종료 중 오류가 발생했습니다.');
            }
          },
        },
      ]
    );
  };

  const renderBookingItem = ({ item }: { item: WalkingBookingResponse }) => (
    <TouchableOpacity
      style={[
        styles.bookingItem,
        selectedBooking?.id === item.id && styles.bookingItemSelected,
      ]}
      onPress={() => setSelectedBooking(item)}
      activeOpacity={0.7}
    >
      <View style={styles.bookingItemContent}>
        <Text style={styles.bookingItemTitle}>
          {item.petName || '반려동물'} 산책
        </Text>
        <Text style={styles.bookingItemAddress}>{item.pickupAddress}</Text>
        <Text style={styles.bookingItemDate}>
          {new Date(item.date).toLocaleDateString('ko-KR')} • {item.duration}분
        </Text>
      </View>
      {selectedBooking?.id === item.id && (
        <Ionicons name="checkmark-circle" size={24} color="#4A90E2" />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      
      {/* 지도 영역 */}
      <MapView
        ref={mapViewRef}
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={{
          latitude: currentLocation?.coords.latitude || 37.5665,
          longitude: currentLocation?.coords.longitude || 126.9780,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {/* 현재 위치 마커 */}
        {currentLocation && (
          <Marker
            coordinate={{
              latitude: currentLocation.coords.latitude,
              longitude: currentLocation.coords.longitude,
            }}
            title="내 위치"
          />
        )}
        
        {/* 선택된 예약의 픽업 위치 마커 */}
        {selectedBooking && (
          <Marker
            coordinate={{
              latitude: 37.5665, // TODO: 실제 주소를 좌표로 변환
              longitude: 126.9780,
            }}
            title="픽업 위치"
            pinColor="#C59172"
          />
        )}
      </MapView>

      {/* 상단 헤더 */}
      <View style={styles.headerOverlay} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>워커 지도</Text>
        <TouchableOpacity
          style={styles.listButton}
          onPress={() => setShowBookingList(!showBookingList)}
        >
          <Ionicons name="list" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* 예약 목록 모달 */}
      <Modal
        visible={showBookingList}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowBookingList(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>매칭된 산책 목록</Text>
              <TouchableOpacity
                onPress={() => setShowBookingList(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>로딩 중...</Text>
              </View>
            ) : bookings.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="walk-outline" size={48} color="#ccc" />
                <Text style={styles.emptyText}>매칭된 산책이 없습니다</Text>
              </View>
            ) : (
              <FlatList
                data={bookings}
                renderItem={renderBookingItem}
                keyExtractor={(item) => item.id.toString()}
                style={styles.bookingList}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* 하단 선택된 예약 정보 및 산책 시작/종료 버튼 */}
      {selectedBooking && (
        <View style={styles.bottomContainer}>
          <View style={styles.bookingInfo}>
            <View style={styles.bookingInfoHeader}>
              <IconImage name="walker" size={20} style={styles.bookingInfoIcon} />
              <Text style={styles.bookingInfoTitle}>
                {selectedBooking.petName || '반려동물'} 산책
              </Text>
              {isWalking && (
                <View style={styles.walkingBadge}>
                  <Text style={styles.walkingBadgeText}>산책 중</Text>
                </View>
              )}
            </View>
            <Text style={styles.bookingInfoAddress}>{selectedBooking.pickupAddress}</Text>
            <Text style={styles.bookingInfoDate}>
              {new Date(selectedBooking.date).toLocaleDateString('ko-KR')} • {selectedBooking.duration}분
            </Text>
            {selectedBooking.notes && (
              <Text style={styles.bookingInfoNotes}>{selectedBooking.notes}</Text>
            )}
            {isWalking && walkStartTime && (
              <Text style={styles.walkingTimeText}>
                시작 시간: {walkStartTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            )}
          </View>
          
          {!isWalking ? (
            <TouchableOpacity
              style={styles.startButton}
              onPress={handleStartWalking}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#4CAF50', '#45A049']}
                style={styles.startButtonGradient}
              >
                <Ionicons name="play" size={24} color="#fff" />
                <Text style={styles.startButtonText}>산책 시작</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.stopButton}
              onPress={handleStopWalking}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FF4757', '#EE5A6F']}
                style={styles.stopButtonGradient}
              >
                <Ionicons name="stop" size={24} color="#fff" />
                <Text style={styles.stopButtonText}>산책 종료</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
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
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
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
    flex: 1,
  },
  listButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    padding: 8,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  bookingInfo: {
    marginBottom: 16,
  },
  bookingInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bookingInfoIcon: {
    marginRight: 8,
  },
  bookingInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  bookingInfoAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  bookingInfoDate: {
    fontSize: 12,
    color: '#999',
  },
  bookingInfoNotes: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  walkingBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  walkingBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  walkingTimeText: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 4,
    fontWeight: '600',
  },
  startButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  stopButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  stopButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  stopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.7,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalCloseButton: {
    padding: 4,
  },
  bookingList: {
    flex: 1,
  },
  bookingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  bookingItemSelected: {
    backgroundColor: '#f8f9fa',
  },
  bookingItemContent: {
    flex: 1,
  },
  bookingItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  bookingItemAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  bookingItemDate: {
    fontSize: 12,
    color: '#999',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
});

export default WalkerMapScreen;

