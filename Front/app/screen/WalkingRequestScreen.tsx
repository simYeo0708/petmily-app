import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Image,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../index';
import { useWalkingRequest } from '../hooks/useWalkingRequest';
import { SafeAreaView } from 'react-native-safe-area-context';

type WalkingRequestScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'WalkingRequest'>;

const WalkingRequestScreen: React.FC = () => {
  const navigation = useNavigation<WalkingRequestScreenNavigationProp>();
  const {
    requestData,
    savedAddresses,
    previousWalkers,
    selectedPreviousWalker,
    showTimeSlotModal,
    showDurationModal,
    showAddressModal,
    showPreviousWalkerModal,
    isSubmitting,
    timeSlots,
    durationOptions,
    petInfo,
    handleTimeSlotSelect,
    handleDurationSelect,
    handleAddressSelect,
    handleAddressInput,
    handlePreviousWalkerSelect,
    handleSpecialInstructionsChange,
    handleSubmit,
    setShowTimeSlotModal,
    setShowDurationModal,
    setShowAddressModal,
    setShowPreviousWalkerModal,
    getSelectedTimeSlotLabel,
    getSelectedDurationLabel,
    getSelectedPreviousWalker,
  } = useWalkingRequest();

  const selectedWalker = getSelectedPreviousWalker();

  const handleSubmitAndNavigate = () => {
    handleSubmit().then(() => {
      navigation.navigate('WalkerMatching', { bookingData: { timeSlot: '', address: '' } });
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#000000" barStyle="light-content" translucent={false} />
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>산책 요청</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* 반려동물 정보 */}
        {petInfo && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>반려동물 정보</Text>
            <View style={styles.petInfoCard}>
              <Image
                source={{ uri: petInfo.photoUri || 'https://via.placeholder.com/60' }}
                style={styles.petImage}
              />
              <View style={styles.petInfo}>
                <Text style={styles.petName}>{petInfo.name}</Text>
                <Text style={styles.petDetails}>
                  {petInfo.species} • {petInfo.breed} • {petInfo.age}살
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* 시간대 선택 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>시간대 *</Text>
          <TouchableOpacity
            style={styles.selectorButton}
            onPress={() => setShowTimeSlotModal(true)}
          >
            <Text style={styles.selectorButtonText}>
              {getSelectedTimeSlotLabel()}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* 산책 시간 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>산책 시간 *</Text>
          <TouchableOpacity
            style={styles.selectorButton}
            onPress={() => setShowDurationModal(true)}
          >
            <Text style={styles.selectorButtonText}>
              {getSelectedDurationLabel()}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* 주소 입력 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>산책 주소 *</Text>
          <TextInput
            style={styles.textInput}
            value={requestData.address}
            onChangeText={handleAddressInput}
            placeholder="산책할 주소를 입력해주세요"
            placeholderTextColor="#999"
            multiline
          />
          
          {savedAddresses.length > 0 && (
            <TouchableOpacity
              style={styles.savedAddressButton}
              onPress={() => setShowAddressModal(true)}
            >
              <Ionicons name="location-outline" size={16} color="#4CAF50" />
              <Text style={styles.savedAddressButtonText}>저장된 주소에서 선택</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 특별 요청사항 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>특별 요청사항</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={requestData.specialInstructions}
            onChangeText={handleSpecialInstructionsChange}
            placeholder="특별한 요청사항이 있다면 입력해주세요.\n예: 산책 중 다른 강아지와 만나지 않도록 해주세요."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* 이전 워커 선택 */}
        {previousWalkers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>이전 워커 재신청</Text>
            <TouchableOpacity
              style={styles.selectorButton}
              onPress={() => setShowPreviousWalkerModal(true)}
            >
              <Text style={styles.selectorButtonText}>
                {selectedWalker ? selectedWalker.name : '이전 워커 선택 (선택사항)'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
            
            {selectedWalker && (
              <View style={styles.selectedWalkerCard}>
                <Image
                  source={{ uri: selectedWalker.profileImage }}
                  style={styles.walkerImage}
                />
                <View style={styles.walkerInfo}>
                  <Text style={styles.walkerName}>{selectedWalker.name}</Text>
                  <View style={styles.walkerRating}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={styles.walkerRatingText}>
                      {selectedWalker.rating} ({selectedWalker.reviewCount}개 리뷰)
                    </Text>
                  </View>
                  <Text style={styles.walkerStats}>
                    총 {selectedWalker.walkCount}회 산책 • 마지막 산책: {selectedWalker.lastWalkDate}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* 제출 버튼 */}
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmitAndNavigate}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? '제출 중...' : '산책 요청하기'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 시간대 선택 모달 */}
      <Modal
        visible={showTimeSlotModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTimeSlotModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>시간대 선택</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowTimeSlotModal(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScrollView}>
              {timeSlots.map((timeSlot) => (
                <TouchableOpacity
                  key={timeSlot.value}
                  style={[
                    styles.modalOption,
                    requestData.timeSlot === timeSlot.value && styles.selectedModalOption,
                  ]}
                  onPress={() => handleTimeSlotSelect(timeSlot.value)}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      requestData.timeSlot === timeSlot.value && styles.selectedModalOptionText,
                    ]}
                  >
                    {timeSlot.label}
                  </Text>
                  {!timeSlot.available && (
                    <Text style={styles.unavailableText}>예약 불가</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 산책 시간 선택 모달 */}
      <Modal
        visible={showDurationModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDurationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>산책 시간 선택</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowDurationModal(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScrollView}>
              {durationOptions.map((duration) => (
                <TouchableOpacity
                  key={duration.value}
                  style={[
                    styles.modalOption,
                    requestData.duration === duration.value && styles.selectedModalOption,
                  ]}
                  onPress={() => handleDurationSelect(duration.value)}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      requestData.duration === duration.value && styles.selectedModalOptionText,
                    ]}
                  >
                    {duration.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 주소 선택 모달 */}
      <Modal
        visible={showAddressModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddressModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>저장된 주소 선택</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowAddressModal(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScrollView}>
              {savedAddresses.map((address, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.modalOption}
                  onPress={() => handleAddressSelect(address)}
                >
                  <Ionicons name="location-outline" size={20} color="#4CAF50" />
                  <Text style={[styles.modalOptionText, styles.addressOptionText]}>
                    {address}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 이전 워커 선택 모달 */}
      <Modal
        visible={showPreviousWalkerModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPreviousWalkerModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>이전 워커 선택</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowPreviousWalkerModal(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScrollView}>
              {previousWalkers.map((walker) => (
                <TouchableOpacity
                  key={walker.id}
                  style={[
                    styles.modalOption,
                    selectedPreviousWalker === walker.id && styles.selectedModalOption,
                  ]}
                  onPress={() => handlePreviousWalkerSelect(walker.id)}
                >
                  <Image
                    source={{ uri: walker.profileImage }}
                    style={styles.modalWalkerImage}
                  />
                  <View style={styles.modalWalkerInfo}>
                    <Text style={styles.modalWalkerName}>{walker.name}</Text>
                    <View style={styles.modalWalkerRating}>
                      <Ionicons name="star" size={14} color="#FFD700" />
                      <Text style={styles.modalWalkerRatingText}>
                        {walker.rating} ({walker.reviewCount}개 리뷰)
                      </Text>
                    </View>
                    <Text style={styles.modalWalkerStats}>
                      총 {walker.walkCount}회 산책
                    </Text>
                  </View>
                  {selectedPreviousWalker === walker.id && (
                    <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
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
    backgroundColor: '#C59172',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  petInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  petImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  petDetails: {
    fontSize: 14,
    color: '#666',
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectorButtonText: {
    fontSize: 16,
    color: '#333',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  savedAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
  },
  savedAddressButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  selectedWalkerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  walkerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  walkerInfo: {
    flex: 1,
  },
  walkerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  walkerRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  walkerRatingText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  walkerStats: {
    fontSize: 12,
    color: '#999',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    marginHorizontal: 16,
    marginBottom: 32,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalScrollView: {
    maxHeight: 400,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectedModalOption: {
    backgroundColor: '#E8F5E8',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  selectedModalOptionText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  unavailableText: {
    fontSize: 12,
    color: '#FF6B6B',
    marginLeft: 8,
  },
  addressOptionText: {
    marginLeft: 12,
  },
  modalWalkerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  modalWalkerInfo: {
    flex: 1,
  },
  modalWalkerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  modalWalkerRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  modalWalkerRatingText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  modalWalkerStats: {
    fontSize: 12,
    color: '#999',
  },
});

export default WalkingRequestScreen;
