import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StatusBar,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RootStackParamList } from "../index";
import { Ionicons } from "@expo/vector-icons";
import { IconImage } from "../components/IconImage";
import WalkerDashboardService, { WalkerDashboardResponse } from "../services/WalkerDashboardService";
import WalkerBookingService from "../services/WalkerBookingService";

type WalkerBookingsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "WalkerBookings"
>;

interface BookingItem {
  id: number;
  date: string;
  petName: string;
  petBreed: string;
  notes: string | null;
  status: string;
  address: string;
  time: string;
}

const WalkerBookingsScreen = () => {
  const navigation = useNavigation<WalkerBookingsScreenNavigationProp>();
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setIsLoading(true);
      
      // 백엔드 API에서 워커의 예약 목록 가져오기
      const walkerBookings = await WalkerBookingService.getWalkBookings();
      
      if (walkerBookings && walkerBookings.length > 0) {
        const bookingsList: BookingItem[] = walkerBookings
          .filter(booking => {
            // 다가오는 예약만 필터링 (PENDING, CONFIRMED 상태)
            const status = booking.status?.toUpperCase();
            return status === 'PENDING' || status === 'CONFIRMED';
          })
          .map(booking => {
            const bookingDate = booking.date ? new Date(booking.date) : new Date();
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const bookingDay = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate());
            
            const diffDays = Math.floor((bookingDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            let timeLabel = "";
            if (diffDays === 0) {
              timeLabel = `오늘 · ${bookingDate.getHours().toString().padStart(2, '0')}:${bookingDate.getMinutes().toString().padStart(2, '0')}`;
            } else if (diffDays === 1) {
              timeLabel = `내일 · ${bookingDate.getHours().toString().padStart(2, '0')}:${bookingDate.getMinutes().toString().padStart(2, '0')}`;
            } else {
              const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
              timeLabel = `${dayNames[bookingDate.getDay()]}요일 · ${bookingDate.getHours().toString().padStart(2, '0')}:${bookingDate.getMinutes().toString().padStart(2, '0')}`;
            }

            return {
              id: booking.id || 0,
              date: booking.date || new Date().toISOString(),
              petName: (booking as any).petName || '반려동물',
              petBreed: (booking as any).petBreed || '',
              notes: booking.notes || null,
              status: typeof booking.status === 'string' ? booking.status : (booking.status as any)?.name || 'PENDING',
              address: booking.pickupAddress || (booking as any).pickupLocation || '',
              time: timeLabel,
            };
          })
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        setBookings(bookingsList);
      } else {
        // Fallback: 대시보드 데이터 사용
        const dashboardData = await WalkerDashboardService.getDashboard();
        if (dashboardData && dashboardData.upcomingBookings) {
          const bookingsList: BookingItem[] = dashboardData.upcomingBookings.map(booking => {
            const bookingDate = new Date(booking.date);
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const bookingDay = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate());
            
            const diffDays = Math.floor((bookingDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            let timeLabel = "";
            if (diffDays === 0) {
              timeLabel = `오늘 · ${bookingDate.getHours().toString().padStart(2, '0')}:${bookingDate.getMinutes().toString().padStart(2, '0')}`;
            } else if (diffDays === 1) {
              timeLabel = `내일 · ${bookingDate.getHours().toString().padStart(2, '0')}:${bookingDate.getMinutes().toString().padStart(2, '0')}`;
            } else {
              const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
              timeLabel = `${dayNames[bookingDate.getDay()]}요일 · ${bookingDate.getHours().toString().padStart(2, '0')}:${bookingDate.getMinutes().toString().padStart(2, '0')}`;
            }

            return {
              id: booking.id,
              date: booking.date,
              petName: booking.petName,
              petBreed: booking.petBreed,
              notes: booking.notes,
              status: booking.status,
              address: booking.address,
              time: timeLabel,
            };
          });
          setBookings(bookingsList);
        }
      }
    } catch (error) {
      console.error('예약 목록 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  };

  const handleBackPress = () => {
    navigation.goBack();
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

  const renderBookingItem = ({ item }: { item: BookingItem }) => (
    <Pressable
      style={styles.bookingItem}
      onPress={() => {
        navigation.navigate('WalkerBookingDetail', {
          bookingId: item.id,
          bookingData: {
            id: item.id,
            date: item.date,
            petName: item.petName,
            petBreed: item.petBreed,
            notes: item.notes,
            status: item.status,
            address: item.address,
            pickupAddress: item.address,
          },
        });
      }}
    >
      <View style={styles.bookingIconBubble}>
        <IconImage name="paw" size={20} style={styles.bookingIcon} />
      </View>
      <View style={styles.bookingInfo}>
        <View style={styles.bookingHeader}>
          <Text style={styles.bookingTime}>{item.time}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
        </View>
        <Text style={styles.bookingPet}>
          {item.petName}{item.petBreed ? ` (${item.petBreed})` : ''}
        </Text>
        {item.address && (
          <Text style={styles.bookingAddress} numberOfLines={1}>
            📍 {item.address}
          </Text>
        )}
        {item.notes && (
          <Text style={styles.bookingNote} numberOfLines={2}>
            {item.notes}
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </Pressable>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#000000" />
        <View style={styles.header}>
          <Pressable onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#333" />
          </Pressable>
          <Text style={styles.headerTitle}>전체 예약 일정</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#C59172" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#000000" />
      <View style={styles.header}>
        <Pressable onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </Pressable>
        <Text style={styles.headerTitle}>전체 예약 일정</Text>
        <View style={styles.headerSpacer} />
      </View>

      {bookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>다가오는 예약이 없습니다</Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          renderItem={renderBookingItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#333',
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
  listContent: {
    padding: 16,
  },
  bookingItem: {
    flexDirection: 'row' as const,
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
  bookingIconBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5E6D3',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: 12,
  },
  bookingIcon: {
    width: 20,
    height: 20,
  },
  bookingInfo: {
    flex: 1,
  },
  bookingHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 8,
  },
  bookingTime: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: 'white',
  },
  bookingPet: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: '#333',
    marginBottom: 4,
  },
  bookingAddress: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  bookingNote: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
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

export default WalkerBookingsScreen;

