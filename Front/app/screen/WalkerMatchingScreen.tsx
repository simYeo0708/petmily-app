import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import WalkerCard from '../components/WalkerCard';
import { RootStackParamList } from '../index';

type WalkerMatchingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'WalkerMatching'>;
type WalkerMatchingScreenRouteProp = RouteProp<RootStackParamList, 'WalkerMatching'>;

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
}

interface WalkerMatchingScreenProps {
  navigation: any;
  route: {
    params: {
      bookingData: {
        timeSlot: string;
        address: string;
      };
    };
  };
}

const WalkerMatchingScreen: React.FC<WalkerMatchingScreenProps> = ({ navigation, route }) => {
  const { bookingData } = route.params;
  const [walkers, setWalkers] = useState<Walker[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 반응형 그리드 계산
  const getColumnsCount = () => {
    if (width < 400) return 2; // 작은 화면
    if (width < 600) return 3; // 중간 화면
    return 4; // 큰 화면
  };

  const columnsCount = getColumnsCount();

  // 색상 팔레트
  const colorPalette = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
    '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA',
  ];

  // 더미 데이터 (실제로는 API에서 가져옴)
  const dummyWalkers: Walker[] = [
    {
      id: '1',
      name: '김산책',
      rating: 4.8,
      reviewCount: 127,
      profileImage: 'https://via.placeholder.com/100',
      bio: '반려동물과 함께하는 즐거운 산책을 도와드립니다!',
      experience: '3년 경력',
      hourlyRate: 15000,
      isAvailable: true,
      location: '강남구',
    },
    {
      id: '2',
      name: '박워커',
      rating: 4.9,
      reviewCount: 89,
      profileImage: 'https://via.placeholder.com/100',
      bio: '안전하고 신뢰할 수 있는 산책 서비스를 제공합니다.',
      experience: '5년 경력',
      hourlyRate: 18000,
      isAvailable: true,
      location: '서초구',
    },
    {
      id: '3',
      name: '이펫시터',
      rating: 4.7,
      reviewCount: 203,
      profileImage: 'https://via.placeholder.com/100',
      bio: '반려동물 행동 전문가와 함께하는 특별한 산책',
      experience: '7년 경력',
      hourlyRate: 20000,
      isAvailable: true,
      location: '송파구',
    },
    {
      id: '4',
      name: '최도우미',
      rating: 4.6,
      reviewCount: 156,
      profileImage: 'https://via.placeholder.com/100',
      bio: '사랑과 정성으로 반려동물을 돌봐드립니다.',
      experience: '2년 경력',
      hourlyRate: 12000,
      isAvailable: true,
      location: '마포구',
    },
    {
      id: '5',
      name: '정산책러',
      rating: 4.9,
      reviewCount: 98,
      profileImage: 'https://via.placeholder.com/100',
      bio: '반려동물의 건강한 생활을 위한 전문 산책 서비스',
      experience: '4년 경력',
      hourlyRate: 16000,
      isAvailable: true,
      location: '용산구',
    },
    {
      id: '6',
      name: '한펫케어',
      rating: 4.8,
      reviewCount: 234,
      profileImage: 'https://via.placeholder.com/100',
      bio: '24시간 언제든지 반려동물을 돌봐드립니다.',
      experience: '6년 경력',
      hourlyRate: 17000,
      isAvailable: true,
      location: '영등포구',
    },
  ];

  useEffect(() => {
    loadWalkers();
  }, []);

  const loadWalkers = async () => {
    try {
      setLoading(true);
      // 실제 API 호출
      // const response = await fetch('/api/walkers');
      // const data = await response.json();
      
      // 더미 데이터 사용
      setTimeout(() => {
        setWalkers(dummyWalkers);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('워커 목록 로드 실패:', error);
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadWalkers();
    setRefreshing(false);
  };

  const handleWalkerSelect = (walker: Walker) => {
    navigation.navigate('WalkerDetail', { walker, bookingData });
  };

  const renderWalkerCard = ({ item, index }: { item: Walker; index: number }) => {
    const colorIndex = index % colorPalette.length;
    const cardColor = colorPalette[colorIndex];

    return (
      <WalkerCard
        walker={item}
        cardColor={cardColor}
        onPress={() => handleWalkerSelect(item)}
        style={{ width: (width - 60) / columnsCount }}
      />
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>워커 선택</Text>
        <View style={styles.placeholder} />
      </View>
      
      <View style={styles.bookingInfo}>
        <View style={styles.infoItem}>
          <Ionicons name="time" size={16} color="#4A90E2" />
          <Text style={styles.infoText}>{bookingData.timeSlot}</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="location" size={16} color="#4A90E2" />
          <Text style={styles.infoText}>{bookingData.address}</Text>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="paw" size={64} color="#ddd" />
      <Text style={styles.emptyStateTitle}>사용 가능한 워커가 없습니다</Text>
      <Text style={styles.emptyStateText}>
        다른 시간대나 지역을 선택해보세요
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#C59172" translucent={false} />
      
      <FlatList
        data={walkers}
        renderItem={renderWalkerCard}
        keyExtractor={(item) => item.id}
        numColumns={columnsCount}
        key={columnsCount} // columnsCount가 변경될 때 리렌더링
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#4A90E2']}
            tintColor="#4A90E2"
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    paddingBottom: 20,
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
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
  bookingInfo: {
    gap: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default WalkerMatchingScreen;
