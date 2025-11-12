export interface Walker {
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
  distance?: number;
  specialties?: string[];
  languages?: string[];
  certifications?: string[];
  isFavorite?: boolean;
}

export interface BookingData {
  timeSlot: string;
  address: string;
  specialInstructions?: string;
  duration?: string;
  petId?: string;
}

export interface WalkerMatchingScreenState {
  walkers: Walker[];
  filteredWalkers: Walker[];
  selectedFilter: string;
  isLoading: boolean;
  isRefreshing: boolean;
  searchQuery: string;
  sortBy: string;
  showFilters: boolean;
}

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface SortOption {
  value: string;
  label: string;
}
