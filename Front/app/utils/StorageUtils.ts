import AsyncStorage from "@react-native-async-storage/async-storage";
import { PetInfo } from '../types/HomeScreen';

export const STORAGE_KEYS = {
  HAS_SEEN_SERVICE_INTRO: 'hasSeenServiceIntro',
  PET_INFO: 'petInfo',
} as const;

export const checkFirstTimeUser = async (): Promise<boolean> => {
  try {
    const hasSeenIntro = await AsyncStorage.getItem(STORAGE_KEYS.HAS_SEEN_SERVICE_INTRO);
    const isFirstTimeUser = !hasSeenIntro;
    return isFirstTimeUser;
  } catch (error) {
    return true; // 에러 시 첫 사용자로 간주
  }
};

export const checkPetInfo = async (): Promise<boolean> => {
  try {
    const savedPetInfo = await AsyncStorage.getItem(STORAGE_KEYS.PET_INFO);
    
    if (savedPetInfo) {
      const petInfo: PetInfo = JSON.parse(savedPetInfo);
      
      const hasEssentialInfo = !!(petInfo.name && petInfo.breed);
      return hasEssentialInfo;
    }
    
    return false;
  } catch (error) {
    return false;
  }
};

export const clearGuideData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.HAS_SEEN_SERVICE_INTRO);
  } catch (error) {
  }
};

export const markServiceIntroAsSeen = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.HAS_SEEN_SERVICE_INTRO, 'true');
  } catch (error) {
  }
};
