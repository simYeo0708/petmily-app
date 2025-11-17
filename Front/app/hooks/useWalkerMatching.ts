import { useState, useEffect, useCallback } from 'react';
import { Walker, WalkerMatchingScreenState, BookingData } from '../types/WalkerMatchingScreen';
import { generateMockWalkers, filterWalkers, sortWalkers, updateFilterCounts } from '../utils/WalkerUtils';
import { FILTER_OPTIONS, SORT_OPTIONS } from '../constants/WalkerConstants';
import WalkerService from '../services/WalkerService';

export const useWalkerMatching = (bookingData?: BookingData) => {
  const [walkers, setWalkers] = useState<Walker[]>([]);
  const [filteredWalkers, setFilteredWalkers] = useState<Walker[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [showFilters, setShowFilters] = useState(false);
  const [filterOptions, setFilterOptions] = useState(FILTER_OPTIONS);

  // 워커 데이터 로드
  const loadWalkers = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // 백엔드 API 호출
      const apiWalkers = await WalkerService.getAllWalkers();
      
      if (apiWalkers && apiWalkers.length > 0) {
        setWalkers(apiWalkers);
        const updatedFilters = updateFilterCounts(apiWalkers, FILTER_OPTIONS);
        setFilterOptions(updatedFilters);
      } else {
        // Fallback: Mock 데이터
        const mockWalkers = generateMockWalkers();
        setWalkers(mockWalkers);
        const updatedFilters = updateFilterCounts(mockWalkers, FILTER_OPTIONS);
        setFilterOptions(updatedFilters);
      }
    } catch (error) {
      // 에러 시 Mock 데이터 사용
      const mockWalkers = generateMockWalkers();
      setWalkers(mockWalkers);
      const updatedFilters = updateFilterCounts(mockWalkers, FILTER_OPTIONS);
      setFilterOptions(updatedFilters);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 워커 필터링 및 정렬
  const applyFiltersAndSort = useCallback(() => {
    const filtered = filterWalkers(walkers, selectedFilter, searchQuery);
    const sorted = sortWalkers(filtered, sortBy);
    setFilteredWalkers(sorted);
  }, [walkers, selectedFilter, searchQuery, sortBy]);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadWalkers();
  }, [loadWalkers]);

  // 필터나 정렬이 변경될 때마다 적용
  useEffect(() => {
    applyFiltersAndSort();
  }, [applyFiltersAndSort]);

  // 새로고침
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadWalkers();
    setIsRefreshing(false);
  }, [loadWalkers]);

  // 필터 변경
  const handleFilterChange = useCallback((filter: string) => {
    setSelectedFilter(filter);
  }, []);

  // 검색어 변경
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // 정렬 변경
  const handleSortChange = useCallback((sort: string) => {
    setSortBy(sort);
  }, []);

  // 필터 모달 토글
  const toggleFilters = useCallback(() => {
    setShowFilters(!showFilters);
  }, [showFilters]);

  // 워커 선택
  const handleWalkerSelect = useCallback((walker: Walker) => {
    // 네비게이션 로직은 컴포넌트에서 처리
    return walker;
  }, []);

  // 워커 즐겨찾기 토글
  const toggleFavorite = useCallback((walkerId: string) => {
    setWalkers(prevWalkers =>
      prevWalkers.map(walker =>
        walker.id === walkerId
          ? { ...walker, isFavorite: !walker.isFavorite }
          : walker
      )
    );
  }, []);

  // 워커 상세 정보 가져오기
  const getWalkerById = useCallback((walkerId: string) => {
    return walkers.find(walker => walker.id === walkerId);
  }, [walkers]);

  // 통계 정보
  const getStats = useCallback(() => {
    const totalWalkers = walkers.length;
    const availableWalkers = walkers.filter(w => w.isAvailable).length;
    const averageRating = walkers.reduce((sum, w) => sum + w.rating, 0) / totalWalkers;
    const averagePrice = walkers.reduce((sum, w) => sum + w.hourlyRate, 0) / totalWalkers;

    return {
      totalWalkers,
      availableWalkers,
      averageRating: averageRating.toFixed(1),
      averagePrice: Math.round(averagePrice).toLocaleString(),
    };
  }, [walkers]);

  return {
    // State
    walkers,
    filteredWalkers,
    selectedFilter,
    isLoading,
    isRefreshing,
    searchQuery,
    sortBy,
    showFilters,
    filterOptions,
    
    // Data
    sortOptions: SORT_OPTIONS,
    bookingData,
    
    // Handlers
    handleRefresh,
    handleFilterChange,
    handleSearchChange,
    handleSortChange,
    toggleFilters,
    handleWalkerSelect,
    toggleFavorite,
    
    // Getters
    getWalkerById,
    getStats,
  };
};
