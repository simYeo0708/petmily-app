import AsyncStorage from "@react-native-async-storage/async-storage";
import { PetInfo } from '../types/HomeScreen';

export const STORAGE_KEYS = {
  HAS_SEEN_SERVICE_INTRO: 'hasSeenServiceIntro',
  PET_INFO: 'petInfo',
} as const;

export const checkFirstTimeUser = async (): Promise<boolean> => {
  try {
    const hasSeenIntro = await AsyncStorage.getItem(STORAGE_KEYS.HAS_SEEN_SERVICE_INTRO);
    console.log("🔍 [DEBUG] hasSeenIntro from AsyncStorage:", hasSeenIntro);
    const isFirstTimeUser = !hasSeenIntro;
    console.log("🔍 [DEBUG] isFirstTimeUser:", isFirstTimeUser);
    return isFirstTimeUser;
  } catch (error) {
    console.error("❌ [ERROR] Error checking first time user:", error);
    return true; // 에러 시 첫 사용자로 간주
  }
};

export const checkPetInfo = async (): Promise<boolean> => {
  try {
    const savedPetInfo = await AsyncStorage.getItem(STORAGE_KEYS.PET_INFO);
    console.log("🔍 [DEBUG] savedPetInfo from AsyncStorage:", savedPetInfo);
    
    if (savedPetInfo) {
      const petInfo: PetInfo = JSON.parse(savedPetInfo);
      console.log("🔍 [DEBUG] parsed petInfo:", petInfo);
      
      const hasEssentialInfo = !!(petInfo.name && petInfo.breed);
      console.log("🔍 [DEBUG] hasEssentialInfo:", hasEssentialInfo);
      return hasEssentialInfo;
    }
    
    console.log("🔍 [DEBUG] No saved pet info found");
    return false;
  } catch (error) {
    console.error("❌ [ERROR] Error checking pet info:", error);
    return false;
  }
};

export const clearGuideData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.HAS_SEEN_SERVICE_INTRO);
    console.log("🧹 [DEBUG] Guide data cleared");
  } catch (error) {
    console.error("❌ [ERROR] Error clearing guide data:", error);
  }
};

export const markServiceIntroAsSeen = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.HAS_SEEN_SERVICE_INTRO, 'true');
    console.log("✅ [DEBUG] Service intro marked as seen");
  } catch (error) {
    console.error("❌ [ERROR] Error marking service intro as seen:", error);
  }
};
