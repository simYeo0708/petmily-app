import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Modal,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface WalkingMapScreenProps {
  navigation: any;
}

const WalkingMapScreen: React.FC<WalkingMapScreenProps> = ({ navigation }) => {
  const [isWalking, setIsWalking] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [customTime, setCustomTime] = useState('');
  const [selectedAddress, setSelectedAddress] = useState('');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<string[]>([]);
  const [newAddress, setNewAddress] = useState('');

  const timeSlots = [
    '오전 6:00-8:00',
    '오전 8:00-10:00',
    '오전 10:00-12:00',
    '오후 12:00-14:00',
    '오후 14:00-16:00',
    '오후 16:00-18:00',
    '오후 18:00-20:00',
    '오후 20:00-22:00',
  ];

  const handleStartWalking = () => {
    setIsWalking(true);
  };

  const handleRequestWalker = () => {
    setShowBookingModal(true);
  };

  const handleTimeSlotSelect = (time: string) => {
    setSelectedTimeSlot(time);
  };

  const handleCustomTimeChange = (time: string) => {
    setCustomTime(time);
    setSelectedTimeSlot('custom');
  };

  const handleAddressSelect = () => {
    setShowAddressModal(true);
  };

  const handleAddressSave = () => {
    if (newAddress.trim()) {
      setSavedAddresses([...savedAddresses, newAddress.trim()]);
      setNewAddress('');
    }
  };

  const handleAddressSelectFromList = (address: string) => {
    setSelectedAddress(address);
    setShowAddressModal(false);
  };

  const handleSubmitBooking = () => {
    if (!selectedTimeSlot && !customTime) {
      Alert.alert('알림', '시간을 선택해주세요.');
      return;
    }
    if (!selectedAddress) {
      Alert.alert('알림', '주소를 선택해주세요.');
      return;
    }

    // 예약 요청 로직
    const bookingData = {
      timeSlot: selectedTimeSlot === 'custom' ? customTime : selectedTimeSlot,
      address: selectedAddress,
    };

    console.log('예약 요청:', bookingData);
    
    // 워커 매칭 화면으로 이동
    navigation.navigate('WalkerMatching', { bookingData });
    setShowBookingModal(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4A90E2" />
      
      {/* 지도 영역 */}
      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: 37.5665,
            longitude: 126.9780,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          {isWalking && (
            <Marker
              coordinate={{
                latitude: 37.5665,
                longitude: 126.9780,
              }}
              title="현재 위치"
              description="산책 중"
            />
          )}
        </MapView>

        {/* Dark overlay when not walking */}
        {!isWalking && (
          <View style={styles.darkOverlay} />
        )}

        {/* 상단 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>산책 지도</Text>
        </View>

        {/* 하단 액션 버튼 */}
        {!isWalking ? (
          <View style={styles.bottomActionContainer}>
            <TouchableOpacity
              style={styles.requestButton}
              onPress={handleRequestWalker}
            >
              <LinearGradient
                colors={['#4A90E2', '#357ABD']}
                style={styles.requestButtonGradient}
              >
                <Ionicons name="paw" size={24} color="#fff" />
                <Text style={styles.requestButtonText}>산책 맡기러 가기</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.walkingControls}>
            <TouchableOpacity
              style={styles.stopButton}
              onPress={() => setIsWalking(false)}
            >
              <Text style={styles.stopButtonText}>산책 종료</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* 예약 요청 모달 */}
      <Modal
        visible={showBookingModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowBookingModal(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>산책 예약 요청</Text>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* 시간 선택 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>시간 선택</Text>
              <View style={styles.timeSlotGrid}>
                {timeSlots.map((time, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.timeSlotButton,
                      selectedTimeSlot === time && styles.timeSlotButtonSelected,
                    ]}
                    onPress={() => handleTimeSlotSelect(time)}
                  >
                    <Text
                      style={[
                        styles.timeSlotText,
                        selectedTimeSlot === time && styles.timeSlotTextSelected,
                      ]}
                    >
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <Text style={styles.customTimeLabel}>직접 입력</Text>
              <TextInput
                style={styles.customTimeInput}
                placeholder="예: 오후 3:30-5:30"
                value={customTime}
                onChangeText={handleCustomTimeChange}
                placeholderTextColor="#999"
              />
            </View>

            {/* 주소 선택 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>주소 선택</Text>
              <TouchableOpacity
                style={styles.addressButton}
                onPress={handleAddressSelect}
              >
                <Text style={styles.addressButtonText}>
                  {selectedAddress || '주소를 선택해주세요'}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
            </View>

            {/* 제출 버튼 */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmitBooking}
            >
              <LinearGradient
                colors={['#4A90E2', '#357ABD']}
                style={styles.submitButtonGradient}
              >
                <Text style={styles.submitButtonText}>워커 찾기</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* 주소 선택 모달 */}
      <Modal
        visible={showAddressModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowAddressModal(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>주소 선택</Text>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* 저장된 주소 목록 */}
            {savedAddresses.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>저장된 주소</Text>
                {savedAddresses.map((address, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.addressItem}
                    onPress={() => handleAddressSelectFromList(address)}
                  >
                    <Ionicons name="location" size={20} color="#4A90E2" />
                    <Text style={styles.addressItemText}>{address}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* 새 주소 입력 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>새 주소 입력</Text>
              <TextInput
                style={styles.addressInput}
                placeholder="주소를 입력해주세요"
                value={newAddress}
                onChangeText={setNewAddress}
                placeholderTextColor="#999"
              />
              <TouchableOpacity
                style={styles.saveAddressButton}
                onPress={handleAddressSave}
              >
                <Text style={styles.saveAddressButtonText}>주소 저장</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  darkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 1,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  bottomActionContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
  requestButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  requestButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  requestButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  walkingControls: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
  stopButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
  },
  stopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalCloseButton: {
    marginRight: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  timeSlotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeSlotButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  timeSlotButtonSelected: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  timeSlotText: {
    fontSize: 14,
    color: '#333',
  },
  timeSlotTextSelected: {
    color: '#fff',
  },
  customTimeLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 15,
    marginBottom: 10,
  },
  customTimeInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  addressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  addressButtonText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  addressItemText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  addressInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  saveAddressButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveAddressButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButton: {
    marginTop: 30,
    borderRadius: 25,
    overflow: 'hidden',
  },
  submitButtonGradient: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default WalkingMapScreen;
