import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RootStackParamList } from "../index";
import { Ionicons } from "@expo/vector-icons";
import { IconImage } from "../components/IconImage";
import WalkerBookingService from "../services/WalkerBookingService";
import { LinearGradient } from "expo-linear-gradient";

type WalkerBookingDetailScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "WalkerBookingDetail"
>;

interface BookingDetail {
  id: number;
  date: string;
  petName: string;
  petBreed: string;
  notes: string | null;
  status: string;
  address: string;
  pickupAddress: string;
  dropoffAddress: string | null;
  duration: number;
  totalPrice: number | null;
  ownerName: string | null;
  ownerPhone: string | null;
  emergencyContact: string | null;
  isRegularPackage: boolean;
  packageFrequency: string | null;
}

const WalkerBookingDetailScreen = () => {
  const navigation = useNavigation<WalkerBookingDetailScreenNavigationProp>();
  const route = useRoute();
  const bookingId = (route.params as any)?.bookingId as number | undefined;
  const bookingData = (route.params as any)?.bookingData as Partial<BookingDetail> | undefined;
  
  const [booking, setBooking] = useState<BookingDetail | null>(
    bookingData ? {
      id: bookingData.id || 0,
      date: bookingData.date || '',
      petName: bookingData.petName || '반려동물',
      petBreed: bookingData.petBreed || '',
      notes: bookingData.notes || null,
      status: bookingData.status || 'PENDING',
      address: bookingData.address || '',
      pickupAddress: bookingData.pickupAddress || bookingData.address || '',
      dropoffAddress: bookingData.dropoffAddress || null,
      duration: bookingData.duration || 60,
      totalPrice: bookingData.totalPrice || null,
      ownerName: bookingData.ownerName || null,
      ownerPhone: bookingData.ownerPhone || null,
      emergencyContact: bookingData.emergencyContact || null,
      isRegularPackage: bookingData.isRegularPackage || false,
      packageFrequency: bookingData.packageFrequency || null,
    } : null
  );
  const [isLoading, setIsLoading] = useState(!!bookingId && !bookingData);

  useEffect(() => {
    if (bookingId && !bookingData) {
      loadBookingDetail();
    }
  }, [bookingId]);

  const loadBookingDetail = async () => {
    if (!bookingId) return;
    
    try {
      setIsLoading(true);
      const bookingDetail = await WalkerBookingService.getBookingById(bookingId);
      
      if (bookingDetail) {
        setBooking({
          id: bookingDetail.id,
          date: bookingDetail.date,
          petName: (bookingDetail as any).petName || '반려동물',
          petBreed: (bookingDetail as any).petBreed || '',
          notes: bookingDetail.notes || null,
          status: typeof bookingDetail.status === 'string' 
            ? bookingDetail.status 
            : (bookingDetail.status as any)?.name || 'PENDING',
          address: bookingDetail.pickupAddress || '',
          pickupAddress: bookingDetail.pickupAddress || '',
          dropoffAddress: (bookingDetail as any).dropoffAddress || null,
          duration: bookingDetail.duration || 60,
          totalPrice: (bookingDetail as any).totalPrice || null,
          ownerName: (bookingDetail as any).ownerName || (bookingDetail as any).username || null,
          ownerPhone: (bookingDetail as any).ownerPhone || null,
          emergencyContact: (bookingDetail as any).emergencyContact || null,
          isRegularPackage: (bookingDetail as any).isRegularPackage || false,
          packageFrequency: (bookingDetail as any).packageFrequency || null,
        });
      }
    } catch (error) {
      console.error('예약 상세 정보 로드 실패:', error);
      Alert.alert('오류', '예약 정보를 불러올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const bookingDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    const diffDays = Math.floor((bookingDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayName = dayNames[date.getDay()];
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    let dateLabel = '';
    if (diffDays === 0) {
      dateLabel = `오늘 (${dayName})`;
    } else if (diffDays === 1) {
      dateLabel = `내일 (${dayName})`;
    } else {
      dateLabel = `${month}월 ${day}일 (${dayName})`;
    }
    
    return {
      dateLabel,
      time: `${hours}:${minutes}`,
      fullDate: `${date.getFullYear()}년 ${month}월 ${day}일 (${dayName})`,
    };
  };

  const getStatusText = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return '대기중';
      case 'CONFIRMED':
        return '확정';
      case 'IN_PROGRESS':
        return '진행중';
      case 'COMPLETED':
        return '완료';
      case 'CANCELLED':
        return '취소됨';
      default:
        return '알 수 없음';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return '#FFA500';
      case 'CONFIRMED':
        return '#4CAF50';
      case 'IN_PROGRESS':
        return '#2196F3';
      case 'COMPLETED':
        return '#9E9E9E';
      case 'CANCELLED':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <View style={styles.header}>
          <Pressable onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>예약 상세</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#C59172" />
        </View>
      </SafeAreaView>
    );
  }

  if (!booking) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <View style={styles.header}>
          <Pressable onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>예약 상세</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>예약 정보를 찾을 수 없습니다</Text>
        </View>
      </SafeAreaView>
    );
  }

  const dateInfo = formatDate(booking.date);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* 헤더 */}
      <LinearGradient
        colors={['#C59172', '#A67C52']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <Pressable onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>예약 상세</Text>
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* 상태 배지 */}
        <View style={styles.statusSection}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
            <Text style={styles.statusText}>{getStatusText(booking.status)}</Text>
          </View>
        </View>

        {/* 날짜 및 시간 */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="calendar" size={20} color="#C59172" />
            <Text style={styles.cardTitle}>날짜 및 시간</Text>
          </View>
          <Text style={styles.dateLabel}>{dateInfo.dateLabel}</Text>
          <Text style={styles.timeText}>{dateInfo.time}</Text>
          <Text style={styles.fullDateText}>{dateInfo.fullDate}</Text>
        </View>

        {/* 반려동물 정보 */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <IconImage name="paw" size={20} style={styles.cardIcon} />
            <Text style={styles.cardTitle}>반려동물 정보</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>이름</Text>
            <Text style={styles.infoValue}>{booking.petName}</Text>
          </View>
          {booking.petBreed && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>품종</Text>
              <Text style={styles.infoValue}>{booking.petBreed}</Text>
            </View>
          )}
        </View>

        {/* 산책 정보 */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="walk" size={20} color="#C59172" />
            <Text style={styles.cardTitle}>산책 정보</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>소요 시간</Text>
            <Text style={styles.infoValue}>{booking.duration}분</Text>
          </View>
          {booking.totalPrice && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>예상 금액</Text>
              <Text style={styles.infoValue}>{booking.totalPrice.toLocaleString()}원</Text>
            </View>
          )}
        </View>

        {/* 위치 정보 */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="location" size={20} color="#C59172" />
            <Text style={styles.cardTitle}>위치 정보</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>픽업 장소</Text>
            <Text style={styles.infoValue}>{booking.pickupAddress || booking.address}</Text>
          </View>
          {booking.dropoffAddress && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>드롭오프 장소</Text>
              <Text style={styles.infoValue}>{booking.dropoffAddress}</Text>
            </View>
          )}
        </View>

        {/* 고객 정보 */}
        {(booking.ownerName || booking.ownerPhone) && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="person" size={20} color="#C59172" />
              <Text style={styles.cardTitle}>고객 정보</Text>
            </View>
            {booking.ownerName && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>이름</Text>
                <Text style={styles.infoValue}>{booking.ownerName}</Text>
              </View>
            )}
            {booking.ownerPhone && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>연락처</Text>
                <Text style={styles.infoValue}>{booking.ownerPhone}</Text>
              </View>
            )}
            {booking.emergencyContact && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>비상 연락처</Text>
                <Text style={styles.infoValue}>{booking.emergencyContact}</Text>
              </View>
            )}
          </View>
        )}

        {/* 정기 패키지 정보 */}
        {booking.isRegularPackage && booking.packageFrequency && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="repeat" size={20} color="#C59172" />
              <Text style={styles.cardTitle}>정기 패키지</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>주기</Text>
              <Text style={styles.infoValue}>
                {booking.packageFrequency === 'WEEKLY' ? '주 1회' :
                 booking.packageFrequency === 'BIWEEKLY' ? '격주' :
                 booking.packageFrequency === 'MONTHLY' ? '월 1회' :
                 booking.packageFrequency}
              </Text>
            </View>
          </View>
        )}

        {/* 특이사항 */}
        {booking.notes && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="document-text" size={20} color="#C59172" />
              <Text style={styles.cardTitle}>특이사항</Text>
            </View>
            <Text style={styles.notesText}>{booking.notes}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerGradient: {
    paddingTop: 8,
    paddingBottom: 12,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#fff',
    textAlign: 'center' as const,
  },
  headerSpacer: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  statusSection: {
    alignItems: 'center' as const,
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: 'white',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 16,
  },
  cardIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#333',
    marginLeft: 8,
  },
  dateLabel: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#333',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#C59172',
    marginBottom: 4,
  },
  fullDateText: {
    fontSize: 14,
    color: '#666',
  },
  infoRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#333',
    flex: 1,
    textAlign: 'right' as const,
  },
  notesText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
};

export default WalkerBookingDetailScreen;

