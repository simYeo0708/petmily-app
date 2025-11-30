import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  FlatList,
  RefreshControl,
  TextInput,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import WalkerCard from '../components/WalkerCard';
import { RootStackParamList } from '../index';
import WalkerSearchService, { WalkerSearchRequest, Walker } from '../services/WalkerSearchService';
import * as Location from 'expo-location';

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

const SORT_OPTIONS = [
  { value: 'DISTANCE', label: '거리순', icon: 'location' },
  { value: 'RATING', label: '평점순', icon: 'star' },
  { value: 'HOURLY_RATE', label: '요금순', icon: 'cash' },
  { value: 'REVIEWS_COUNT', label: '리뷰순', icon: 'chatbubbles' },
  { value: 'EXPERIENCE', label: '경력순', icon: 'briefcase' },
];

const WalkerMatchingScreen: React.FC<WalkerMatchingScreenProps> = ({ navigation, route }) => {
  const { bookingData } = route.params;
  const [walkers, setWalkers] = useState<Walker[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<WalkerSearchRequest['sortBy']>('DISTANCE');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  
  // 필터 상태
  const [minRating, setMinRating] = useState<number | undefined>(undefined);
  const [maxRating, setMaxRating] = useState<number | undefined>(undefined);
  const [minHourlyRate, setMinHourlyRate] = useState<number | undefined>(undefined);
  const [maxHourlyRate, setMaxHourlyRate] = useState<number | undefined>(undefined);
  const [maxDistanceKm, setMaxDistanceKm] = useState<number | undefined>(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // 반응형 그리드 계산
  const getColumnsCount = () => {
    if (width < 400) return 1;
    if (width < 600) return 2;
    return 2;
  };

  const columnsCount = getColumnsCount();

  // 색상 팔레트
  const colorPalette = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
    '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA',
  ];

  const loadWalkers = useCallback(async (page: number = 0, reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true);
        setCurrentPage(0);
      }

      const searchRequest: WalkerSearchRequest = {
        keyword: searchQuery || undefined,
        minRating: minRating,
        maxRating: maxRating,
        minHourlyRate: minHourlyRate,
        maxHourlyRate: maxHourlyRate,
        maxDistanceKm: maxDistanceKm,
        sortBy: sortBy,
        sortDirection: 'ASC',
        page: page,
        size: 20,
      };

      const response = await WalkerSearchService.searchWalkers(searchRequest);
      
      if (reset) {
        setWalkers(response.content);
      } else {
        setWalkers(prev => [...prev, ...response.content]);
      }
      
      setTotalPages(response.totalPages);
      setHasMore(page < response.totalPages - 1);
    } catch (error) {
      // 에러는 UI로만 처리
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, minRating, maxRating, minHourlyRate, maxHourlyRate, maxDistanceKm, sortBy]);

  useEffect(() => {
    loadWalkers(0, true);
  }, [searchQuery, minRating, maxRating, minHourlyRate, maxHourlyRate, maxDistanceKm, sortBy]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadWalkers(0, true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      loadWalkers(nextPage, false);
    }
  };

  const handleWalkerSelect = (walker: Walker) => {
    navigation.navigate('WalkerDetail', { 
      walker: walker as any, 
      bookingData 
    });
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const handleSortSelect = (sort: WalkerSearchRequest['sortBy']) => {
    setSortBy(sort);
    setShowSortModal(false);
  };

  const clearFilters = () => {
    setMinRating(undefined);
    setMaxRating(undefined);
    setMinHourlyRate(undefined);
    setMaxHourlyRate(undefined);
    setMaxDistanceKm(10);
    setSearchQuery('');
  };

  const hasActiveFilters = minRating !== undefined || maxRating !== undefined || 
                          minHourlyRate !== undefined || maxHourlyRate !== undefined || 
                          maxDistanceKm !== 10 || searchQuery !== '';

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
          <Text style={styles.headerTitle}>워커 검색</Text>
          <Text style={styles.headerSubtitle}>{walkers.length}명의 워커</Text>
        </View>
        <View style={styles.placeholder} />
      </View>
      
      {/* 검색바 */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="워커 이름, 소개글 검색..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 필터 및 정렬 버튼 */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterButton, hasActiveFilters && styles.filterButtonActive]}
          onPress={() => setShowFilterModal(true)}
        >
          <Ionicons 
            name="options" 
            size={18} 
            color={hasActiveFilters ? "#fff" : "#666"} 
          />
          <Text style={[
            styles.filterButtonText,
            hasActiveFilters && styles.filterButtonTextActive
          ]}>
            필터
            {hasActiveFilters && ' ✓'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowSortModal(true)}
        >
          <Ionicons name="swap-vertical" size={18} color="#666" />
          <Text style={styles.filterButtonText}>
            {SORT_OPTIONS.find(opt => opt.value === sortBy)?.label || '정렬'}
          </Text>
        </TouchableOpacity>

        {hasActiveFilters && (
          <TouchableOpacity
            style={styles.clearFilterButton}
            onPress={clearFilters}
          >
            <Ionicons name="close-circle" size={16} color="#FF6B6B" />
            <Text style={styles.clearFilterText}>초기화</Text>
          </TouchableOpacity>
        )}
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

  const renderFilterModal = () => (
    <Modal
      visible={showFilterModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowFilterModal(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>필터 설정</Text>
          <TouchableOpacity onPress={() => setShowFilterModal(false)}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {/* 평점 필터 */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>평점</Text>
            <View style={styles.rangeContainer}>
              <View style={styles.rangeInput}>
                <Text style={styles.rangeLabel}>최소</Text>
                <TextInput
                  style={styles.rangeTextInput}
                  placeholder="0.0"
                  keyboardType="numeric"
                  value={minRating?.toString() || ''}
                  onChangeText={(text) => setMinRating(text ? parseFloat(text) : undefined)}
                />
              </View>
              <Text style={styles.rangeSeparator}>~</Text>
              <View style={styles.rangeInput}>
                <Text style={styles.rangeLabel}>최대</Text>
                <TextInput
                  style={styles.rangeTextInput}
                  placeholder="5.0"
                  keyboardType="numeric"
                  value={maxRating?.toString() || ''}
                  onChangeText={(text) => setMaxRating(text ? parseFloat(text) : undefined)}
                />
              </View>
            </View>
          </View>

          {/* 요금 필터 */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>시급 (원)</Text>
            <View style={styles.rangeContainer}>
              <View style={styles.rangeInput}>
                <Text style={styles.rangeLabel}>최소</Text>
                <TextInput
                  style={styles.rangeTextInput}
                  placeholder="0"
                  keyboardType="numeric"
                  value={minHourlyRate?.toString() || ''}
                  onChangeText={(text) => setMinHourlyRate(text ? parseInt(text) : undefined)}
                />
              </View>
              <Text style={styles.rangeSeparator}>~</Text>
              <View style={styles.rangeInput}>
                <Text style={styles.rangeLabel}>최대</Text>
                <TextInput
                  style={styles.rangeTextInput}
                  placeholder="50000"
                  keyboardType="numeric"
                  value={maxHourlyRate?.toString() || ''}
                  onChangeText={(text) => setMaxHourlyRate(text ? parseInt(text) : undefined)}
                />
              </View>
            </View>
          </View>

          {/* 거리 필터 */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>최대 거리 (km)</Text>
            <View style={styles.distanceButtons}>
              {[5, 10, 15, 20, 30].map((distance) => (
                <TouchableOpacity
                  key={distance}
                  style={[
                    styles.distanceButton,
                    maxDistanceKm === distance && styles.distanceButtonActive
                  ]}
                  onPress={() => setMaxDistanceKm(distance)}
                >
                  <Text style={[
                    styles.distanceButtonText,
                    maxDistanceKm === distance && styles.distanceButtonTextActive
                  ]}>
                    {distance}km
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.modalFooter}>
          <TouchableOpacity
            style={styles.modalClearButton}
            onPress={clearFilters}
          >
            <Text style={styles.modalClearButtonText}>초기화</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.modalApplyButton}
            onPress={() => setShowFilterModal(false)}
          >
            <Text style={styles.modalApplyButtonText}>적용</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );

  const renderSortModal = () => (
    <Modal
      visible={showSortModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowSortModal(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>정렬 기준</Text>
          <TouchableOpacity onPress={() => setShowSortModal(false)}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.modalContent}>
          {SORT_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.sortOption,
                sortBy === option.value && styles.sortOptionActive
              ]}
              onPress={() => handleSortSelect(option.value as WalkerSearchRequest['sortBy'])}
            >
              <Ionicons
                name={option.icon as any}
                size={20}
                color={sortBy === option.value ? "#4A90E2" : "#666"}
              />
              <Text style={[
                styles.sortOptionText,
                sortBy === option.value && styles.sortOptionTextActive
              ]}>
                {option.label}
              </Text>
              {sortBy === option.value && (
                <Ionicons name="checkmark" size={20} color="#4A90E2" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    </Modal>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyStateIconContainer}>
        <Ionicons name="search" size={64} color="#C59172" />
      </View>
      <Text style={styles.emptyStateTitle}>검색 결과가 없습니다</Text>
      <Text style={styles.emptyStateText}>
        필터 조건을 변경하거나 검색어를 수정해보세요
      </Text>
      {hasActiveFilters && (
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={clearFilters}
        >
          <Ionicons name="refresh" size={20} color="#4A90E2" />
          <Text style={styles.refreshButtonText}>필터 초기화</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" translucent={false} />
      
      {loading && walkers.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>워커를 검색하는 중...</Text>
        </View>
      ) : (
        <FlatList
          data={walkers}
          renderItem={renderWalkerCard}
          keyExtractor={(item) => item.id.toString()}
          numColumns={columnsCount}
          key={columnsCount}
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
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            hasMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#4A90E2" />
              </View>
            ) : null
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {renderFilterModal()}
      {renderSortModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  listContainer: {
    paddingBottom: 20,
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
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
    marginBottom: 12,
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
  searchContainer: {
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: '#4A90E2',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  clearFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF6B6B',
    gap: 4,
  },
  clearFilterText: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '500',
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
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  rangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rangeInput: {
    flex: 1,
  },
  rangeLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  rangeTextInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#333',
  },
  rangeSeparator: {
    fontSize: 18,
    color: '#999',
    marginTop: 20,
  },
  distanceButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  distanceButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  distanceButtonActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  distanceButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  distanceButtonTextActive: {
    color: '#fff',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 12,
  },
  modalClearButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  modalClearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  modalApplyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
  },
  modalApplyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    marginBottom: 8,
    gap: 12,
  },
  sortOptionActive: {
    backgroundColor: '#E3F2FD',
  },
  sortOptionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  sortOptionTextActive: {
    color: '#4A90E2',
    fontWeight: '600',
  },
});

export default WalkerMatchingScreen;
