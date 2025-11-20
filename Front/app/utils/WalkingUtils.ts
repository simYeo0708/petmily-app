import AsyncStorage from '@react-native-async-storage/async-storage';
import { WalkingRequestData, PreviousWalker } from '../types/WalkingRequestScreen';
import { VALIDATION_MESSAGES } from '../constants/WalkingConstants';

export const STORAGE_KEYS = {
  SAVED_ADDRESSES: 'saved_addresses',
  PREVIOUS_WALKERS: 'previous_walkers',
  WALKING_REQUESTS: 'walking_requests',
} as const;

export const validateWalkingRequest = (requestData: WalkingRequestData): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!requestData.timeSlot) {
    errors.push(VALIDATION_MESSAGES.TIME_SLOT_REQUIRED);
  }

  if (!requestData.address.trim()) {
    errors.push(VALIDATION_MESSAGES.ADDRESS_REQUIRED);
  }

  if (!requestData.petId) {
    errors.push(VALIDATION_MESSAGES.PET_REQUIRED);
  }

  if (!requestData.duration) {
    errors.push(VALIDATION_MESSAGES.DURATION_REQUIRED);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const saveAddress = async (address: string): Promise<void> => {
  try {
    const existingAddresses = await getSavedAddresses();
    if (!existingAddresses.includes(address)) {
      const updatedAddresses = [...existingAddresses, address];
      await AsyncStorage.setItem(STORAGE_KEYS.SAVED_ADDRESSES, JSON.stringify(updatedAddresses));
    }
  } catch (error) {
    throw error;
  }
};

export const getSavedAddresses = async (): Promise<string[]> => {
  try {
    const addresses = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_ADDRESSES);
    return addresses ? JSON.parse(addresses) : [];
  } catch (error) {
    return [];
  }
};

export const savePreviousWalker = async (walker: PreviousWalker): Promise<void> => {
  try {
    const existingWalkers = await getPreviousWalkers();
    const updatedWalkers = existingWalkers.filter(w => w.id !== walker.id);
    updatedWalkers.unshift(walker); // 최신 순으로 정렬
    await AsyncStorage.setItem(STORAGE_KEYS.PREVIOUS_WALKERS, JSON.stringify(updatedWalkers.slice(0, 5))); // 최대 5개만 저장
  } catch (error) {
    throw error;
  }
};

export const getPreviousWalkers = async (): Promise<PreviousWalker[]> => {
  try {
    const walkers = await AsyncStorage.getItem(STORAGE_KEYS.PREVIOUS_WALKERS);
    return walkers ? JSON.parse(walkers) : [];
  } catch (error) {
    return [];
  }
};

export const saveWalkingRequest = async (requestData: WalkingRequestData): Promise<void> => {
  try {
    const existingRequests = await getWalkingRequests();
    const newRequest = {
      ...requestData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    const updatedRequests = [newRequest, ...existingRequests];
    await AsyncStorage.setItem(STORAGE_KEYS.WALKING_REQUESTS, JSON.stringify(updatedRequests));
  } catch (error) {
    throw error;
  }
};

export const getWalkingRequests = async (): Promise<any[]> => {
  try {
    const requests = await AsyncStorage.getItem(STORAGE_KEYS.WALKING_REQUESTS);
    return requests ? JSON.parse(requests) : [];
  } catch (error) {
    return [];
  }
};

export const formatTimeSlot = (timeSlot: string): string => {
  return timeSlot.replace('-', ' ~ ');
};

export const formatDuration = (duration: string): string => {
  const durationMap: { [key: string]: string } = {
    '30': '30분',
    '60': '1시간',
    '90': '1시간 30분',
    '120': '2시간',
    '180': '3시간',
  };
  return durationMap[duration] || duration;
};

export const generateMockPreviousWalkers = (): PreviousWalker[] => [
  {
    id: '1',
    name: '김워커',
    rating: 4.8,
    reviewCount: 127,
    profileImage: 'https://via.placeholder.com/50',
    lastWalkDate: '2024-01-15',
    walkCount: 15,
  },
  {
    id: '2',
    name: '이산책',
    rating: 4.9,
    reviewCount: 89,
    profileImage: 'https://via.placeholder.com/50',
    lastWalkDate: '2024-01-10',
    walkCount: 8,
  },
  {
    id: '3',
    name: '박펫시터',
    rating: 4.7,
    reviewCount: 203,
    profileImage: 'https://via.placeholder.com/50',
    lastWalkDate: '2024-01-05',
    walkCount: 22,
  },
];
