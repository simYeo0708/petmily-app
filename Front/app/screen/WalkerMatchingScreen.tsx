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
import { WALKER_MATCHING_DATA, type Walker } from '../data';

type WalkerMatchingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'WalkerMatching'>;
type WalkerMatchingScreenRouteProp = RouteProp<RootStackParamList, 'WalkerMatching'>;

const { width } = Dimensions.get('window');

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
  // 중앙 관리 샘플 데이터 사용
  const dummyWalkers: Walker[] = WALKER_MATCHING_DATA;

  useEffect(() => {
    loadWalkers();
  }, []);

  const loadWalkers = async () => {
    try {
      setLoading(true);
      // 실제 API 호출
      // const response = await fetch('/api/walkers');
      // const data = await response.json();
      
      // 중앙 관리 샘플 데이터 사용
      setTimeout(() => {
        setWalkers(dummyWalkers as Walker[]);
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
        walker={item as any}
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
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>워커 선택</Text>
          <Text style={styles.headerSubtitle}>{walkers.length}명의 워커</Text>
        </View>
        <View style={styles.placeholder} />
      </View>
      
      <View style={styles.bookingInfo}>
        <LinearGradient
          colors={['#E3F2FD', '#F5F5F5']}
          style={styles.bookingInfoGradient}
        >
          <View style={styles.infoItem}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="time" size={18} color="#4A90E2" />
            </View>
            <Text style={styles.infoText}>{bookingData.timeSlot}</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoItem}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="location" size={18} color="#4A90E2" />
            </View>
            <Text style={styles.infoText} numberOfLines={1}>{bookingData.address}</Text>
          </View>
        </LinearGradient>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyStateIconContainer}>
        <Ionicons name="paw" size={64} color="#C59172" />
      </View>
      <Text style={styles.emptyStateTitle}>사용 가능한 워커가 없습니다</Text>
      <Text style={styles.emptyStateText}>
        다른 시간대나 지역을 선택해보세요
      </Text>
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={handleRefresh}
      >
        <Ionicons name="refresh" size={20} color="#4A90E2" />
        <Text style={styles.refreshButtonText}>다시 검색</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" translucent={false} />
      
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
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#999',
  },
  placeholder: {
    width: 40,
  },
  bookingInfo: {
    marginTop: 8,
  },
  bookingInfoGradient: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E3F2FD',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  infoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 8,
    marginLeft: 44,
  },
  infoText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyStateIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(197, 145, 114, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  refreshButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4A90E2',
  },
});

export default WalkerMatchingScreen;
