import { Walker, FilterOption, SortOption } from '../types/WalkerMatchingScreen';
import { MOCK_WALKERS } from '../constants/WalkerConstants';

export const generateMockWalkers = (): Walker[] => {
  return MOCK_WALKERS;
};

export const filterWalkers = (walkers: Walker[], filter: string, searchQuery: string): Walker[] => {
  let filtered = [...walkers];

  // 검색어 필터링
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(walker =>
      walker.name.toLowerCase().includes(query) ||
      walker.bio.toLowerCase().includes(query) ||
      walker.location.toLowerCase().includes(query) ||
      walker.specialties?.some(specialty => specialty.toLowerCase().includes(query))
    );
  }

  // 필터 적용
  switch (filter) {
    case 'available':
      filtered = filtered.filter(walker => walker.isAvailable);
      break;
    case 'high_rating':
      filtered = filtered.filter(walker => walker.rating >= 4.5);
      break;
    case 'nearby':
      filtered = filtered.filter(walker => walker.distance && walker.distance <= 2.0);
      break;
    case 'experienced':
      filtered = filtered.filter(walker => parseInt(walker.experience) >= 3);
      break;
    case 'certified':
      filtered = filtered.filter(walker => walker.certifications && walker.certifications.length > 0);
      break;
    default:
      // 'all' - 모든 워커 표시
      break;
  }

  return filtered;
};

export const sortWalkers = (walkers: Walker[], sortBy: string): Walker[] => {
  const sorted = [...walkers];

  switch (sortBy) {
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating);
    case 'distance':
      return sorted.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    case 'price':
      return sorted.sort((a, b) => a.hourlyRate - b.hourlyRate);
    case 'experience':
      return sorted.sort((a, b) => parseInt(b.experience) - parseInt(a.experience));
    case 'reviews':
      return sorted.sort((a, b) => b.reviewCount - a.reviewCount);
    default:
      return sorted;
  }
};

export const updateFilterCounts = (walkers: Walker[], filters: FilterOption[]): FilterOption[] => {
  return filters.map(filter => {
    let count = 0;
    
    switch (filter.value) {
      case 'all':
        count = walkers.length;
        break;
      case 'available':
        count = walkers.filter(w => w.isAvailable).length;
        break;
      case 'high_rating':
        count = walkers.filter(w => w.rating >= 4.5).length;
        break;
      case 'nearby':
        count = walkers.filter(w => w.distance && w.distance <= 2.0).length;
        break;
      case 'experienced':
        count = walkers.filter(w => parseInt(w.experience) >= 3).length;
        break;
      case 'certified':
        count = walkers.filter(w => w.certifications && w.certifications.length > 0).length;
        break;
    }
    
    return { ...filter, count };
  });
};

export const formatDistance = (distance: number | undefined): string => {
  if (!distance) return '거리 정보 없음';
  if (distance < 1) return `${Math.round(distance * 1000)}m`;
  return `${distance.toFixed(1)}km`;
};

export const formatRating = (rating: number): string => {
  return rating.toFixed(1);
};

export const formatPrice = (price: number): string => {
  return `${price.toLocaleString()}원/시간`;
};

export const getAvailabilityText = (isAvailable: boolean): string => {
  return isAvailable ? '예약 가능' : '예약 불가';
};

export const getAvailabilityColor = (isAvailable: boolean): string => {
  return isAvailable ? '#4CAF50' : '#FF6B6B';
};

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // 지구의 반지름 (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};
