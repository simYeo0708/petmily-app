import * as ImagePicker from 'expo-image-picker';
import { PetFormData } from '../types/MyPetScreen';

export const requestImagePickerPermissions = async (): Promise<boolean> => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === 'granted';
};

export const requestCameraPermissions = async (): Promise<boolean> => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return status === 'granted';
};

export const pickImageFromLibrary = async (): Promise<string | null> => {
  try {
    const hasPermission = await requestImagePickerPermissions();
    if (!hasPermission) {
      throw new Error('갤러리 접근 권한이 필요합니다.');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      return result.assets[0].uri;
    }
    return null;
  } catch (error) {
    throw error;
  }
};

export const takePhotoWithCamera = async (): Promise<string | null> => {
  try {
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) {
      throw new Error('카메라 접근 권한이 필요합니다.');
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      return result.assets[0].uri;
    }
    return null;
  } catch (error) {
    throw error;
  }
};

export const validatePetForm = (petInfo: PetFormData): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!petInfo.name.trim()) {
    errors.push('이름을 입력해주세요.');
  }

  if (!petInfo.species) {
    errors.push('종을 선택해주세요.');
  }

  if (!petInfo.breed) {
    errors.push('품종을 선택해주세요.');
  }

  if (!petInfo.age.trim()) {
    errors.push('나이를 입력해주세요.');
  }

  if (!petInfo.weight.trim()) {
    errors.push('체중을 입력해주세요.');
  }

  if (!petInfo.gender) {
    errors.push('성별을 선택해주세요.');
  }

  if (petInfo.temperaments.length === 0) {
    errors.push('성격을 최소 하나 선택해주세요.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const getDefaultPetFormData = (): PetFormData => ({
  name: '',
  species: '',
  breed: '',
  age: '',
  weight: '',
  gender: '',
  isNeutered: false,
  description: '',
  photoUri: undefined,
  hasPhoto: false,
  temperaments: ['온순함'], // 기본값으로 '온순함' 설정
});

export const formatPetInfoForDisplay = (petInfo: PetFormData) => {
  return {
    ...petInfo,
    temperamentsText: petInfo.temperaments.join(', '),
    neuteredText: petInfo.isNeutered ? '중성화됨' : '중성화 안됨',
  };
};
