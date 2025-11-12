import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ScrollView,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface Walker {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  profileImage: string;
  bio: string;
  experience: string;
  hourlyRate: number;
  isAvailable: boolean;
  location: string;
  isPreviousWalker?: boolean;
  walkCount?: number;
  lastWalkDate?: string;
}

interface BookingConfirmScreenProps {
  navigation: any;
  route: {
    params: {
      walker: Walker;
      bookingData: {
        timeSlot: string;
        address: string;
      };
    };
  };
}

const BookingConfirmScreen: React.FC<BookingConfirmScreenProps> = ({ navigation, route }) => {
  const { walker, bookingData } = route.params;
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 샘플 데이터로 기본값 설정
  const defaultWalker: Walker = {
    id: '1',
    name: '김산책',
    rating: 4.8,
    reviewCount: 127,
    profileImage: 'https://via.placeholder.com/100',
    bio: '반려동물과 함께하는 산책을 사랑하는 워커입니다.',
    experience: '3년',
    hourlyRate: 15000,
    isAvailable: true,
    location: '서울시 강남구',
    isPreviousWalker: false,
    walkCount: 0,
    lastWalkDate: '',
  };

  const defaultBookingData = {
    timeSlot: '오후 3:00-5:00',
    address: '서울시 강남구 테헤란로 123',
  };

  // 안전한 데이터 사용
  const safeWalker = walker || defaultWalker;
  const safeBookingData = bookingData || defaultBookingData;

  const calculateTotalPrice = () => {
    // 시간대에서 시간 추출하여 계산 (간단한 예시)
    const duration = 2; // 기본 2시간
    return safeWalker.hourlyRate * duration;
  };

  const handleSubmitBooking = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      // 실제 API 호출
      const bookingRequest = {
        walkerId: safeWalker.id,
        timeSlot: safeBookingData.timeSlot,
        address: safeBookingData.address,
        notes: notes.trim(),
        totalPrice: calculateTotalPrice(),
      };

      console.log('예약 요청:', bookingRequest);

      // API 호출 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 2000));

      Alert.alert(
        '예약 요청 완료',
        '워커에게 예약 요청이 전달되었습니다. 곧 연락드릴게요!',
        [
          {
            text: '확인',
            onPress: () => {
              // 홈 화면으로 이동
              navigation.navigate('Home');
            },
          },
        ]
      );
    } catch (error) {
      console.error('예약 요청 실패:', error);
      Alert.alert('오류', '예약 요청 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons key={i} name="star" size={16} color="#FFD700" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Ionicons key="half" name="star-half" size={16} color="#FFD700" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Ionicons key={`empty-${i}`} name="star-outline" size={16} color="#DDD" />
      );
    }

    return stars;
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
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>예약 확인</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 워커 정보 카드 */}
        <View style={styles.walkerCard}>
          <View style={styles.walkerInfo}>
            <View style={styles.walkerImageContainer}>
            <Image
              source={{ uri: safeWalker.profileImage }}
              style={styles.walkerImage}
              defaultSource={require('../../assets/images/dog-paw.png')}
            />
            {safeWalker.isPreviousWalker && (
              <View style={styles.previousWalkerBadge}>
                <Text style={styles.previousWalkerBadgeText}>재신청</Text>
              </View>
            )}
          </View>
          <View style={styles.walkerDetails}>
            <Text style={styles.walkerName}>{safeWalker.name}</Text>
            <View style={styles.ratingContainer}>
              <View style={styles.starsContainer}>
                {renderStars(safeWalker.rating)}
              </View>
              <Text style={styles.ratingText}>{safeWalker.rating}</Text>
              <Text style={styles.reviewCount}>({safeWalker.reviewCount})</Text>
            </View>
            <Text style={styles.walkerLocation}>{safeWalker.location}</Text>
            {safeWalker.isPreviousWalker && safeWalker.walkCount && safeWalker.lastWalkDate && (
              <View style={styles.previousWalkerInfo}>
                <Text style={styles.previousWalkerInfoText}>
                  {safeWalker.walkCount}회 산책 • 마지막 산책: {safeWalker.lastWalkDate}
                </Text>
              </View>
            )}
            </View>
          </View>
        </View>

        {/* 예약 정보 */}
        <View style={styles.bookingInfoCard}>
          <Text style={styles.cardTitle}>예약 정보</Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="time" size={20} color="#4A90E2" />
            <Text style={styles.infoLabel}>시간</Text>
            <Text style={styles.infoValue}>{safeBookingData.timeSlot}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="location" size={20} color="#4A90E2" />
            <Text style={styles.infoLabel}>장소</Text>
            <Text style={styles.infoValue}>{safeBookingData.address}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="cash" size={20} color="#4A90E2" />
            <Text style={styles.infoLabel}>시간당 요금</Text>
            <Text style={styles.infoValue}>{safeWalker.hourlyRate.toLocaleString()}원</Text>
          </View>
        </View>

        {/* 요청사항 입력 */}
        <View style={styles.notesCard}>
          <Text style={styles.cardTitle}>요청사항 (선택사항)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="반려동물에 대한 특별한 요청사항이나 주의사항을 입력해주세요"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholderTextColor="#999"
          />
        </View>

        {/* 요금 정보 */}
        <View style={styles.priceCard}>
          <Text style={styles.cardTitle}>요금 정보</Text>
          
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>시간당 요금</Text>
            <Text style={styles.priceValue}>{safeWalker.hourlyRate.toLocaleString()}원</Text>
          </View>
          
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>예상 시간</Text>
            <Text style={styles.priceValue}>2시간</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>총 예상 금액</Text>
            <Text style={styles.totalValue}>{calculateTotalPrice().toLocaleString()}원</Text>
          </View>
        </View>

        {/* 안내사항 */}
        <View style={styles.noticeCard}>
          <Text style={styles.cardTitle}>안내사항</Text>
          <View style={styles.noticeList}>
            <View style={styles.noticeItem}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.noticeText}>워커가 예약을 확인하면 알림을 받으실 수 있습니다</Text>
            </View>
            <View style={styles.noticeItem}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.noticeText}>예약 전 워커와 채팅으로 상세 내용을 논의할 수 있습니다</Text>
            </View>
            <View style={styles.noticeItem}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.noticeText}>산책 완료 후 안전하게 결제하실 수 있습니다</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 하단 버튼 */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmitBooking}
          disabled={isSubmitting}
        >
          <LinearGradient
            colors={isSubmitting ? ['#ccc', '#999'] : ['#4A90E2', '#357ABD']}
            style={styles.submitButtonGradient}
          >
            {isSubmitting ? (
              <Text style={styles.submitButtonText}>요청 중...</Text>
            ) : (
              <>
                <Ionicons name="send" size={20} color="#fff" />
                <Text style={styles.submitButtonText}>예약 요청 보내기</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 34,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  walkerCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginVertical: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  walkerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walkerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  walkerDetails: {
    flex: 1,
  },
  walkerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: '#666',
  },
  walkerLocation: {
    fontSize: 14,
    color: '#666',
  },
  bookingInfoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    marginRight: 12,
    minWidth: 80,
  },
  infoValue: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  notesCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    minHeight: 100,
    backgroundColor: '#f8f9fa',
  },
  priceCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  priceLabel: {
    fontSize: 16,
    color: '#666',
  },
  priceValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  noticeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noticeList: {
    gap: 12,
  },
  noticeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  noticeText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  bottomButtonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  submitButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  // 이전 워커 관련 스타일
  walkerImageContainer: {
    position: 'relative',
  },
  previousWalkerBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#28a745',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    zIndex: 1,
  },
  previousWalkerBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  previousWalkerInfo: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#28a745',
  },
  previousWalkerInfoText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default BookingConfirmScreen;
