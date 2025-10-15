import { useState, useRef, useCallback } from 'react';
import { Animated, Alert } from 'react-native';
import { usePet } from '../contexts/PetContext';
import { PetFormData, MyPetScreenState } from '../types/MyPetScreen';
import { 
  pickImageFromLibrary, 
  takePhotoWithCamera, 
  validatePetForm, 
  getDefaultPetFormData 
} from '../utils/PetUtils';
import { ANIMATION_CONFIG } from '../constants/PetConstants';

export const usePetForm = () => {
  const { petInfo, updatePetInfo, refreshPetInfo } = usePet();
  
  const [localPetInfo, setLocalPetInfo] = useState<PetFormData>(getDefaultPetFormData());
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showBreedModal, setShowBreedModal] = useState(false);
  const [showTemperamentModal, setShowTemperamentModal] = useState(false);
  const [selectedBreed, setSelectedBreed] = useState('');
  const [selectedTemperaments, setSelectedTemperaments] = useState<string[]>(['온순함']);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showDeleteMessage, setShowDeleteMessage] = useState(false);
  const [hasSuccessfullyAddedPhoto, setHasSuccessfullyAddedPhoto] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // 애니메이션 값들
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;
  const successMessageAnim = useRef(new Animated.Value(0)).current;
  const deleteMessageAnim = useRef(new Animated.Value(0)).current;

  const handleImagePicker = useCallback(async () => {
    try {
      Alert.alert(
        '사진 선택',
        '사진을 어떻게 가져오시겠습니까?',
        [
          { text: '갤러리에서 선택', onPress: handlePickFromLibrary },
          { text: '카메라로 촬영', onPress: handleTakePhoto },
          { text: '취소', style: 'cancel' },
        ]
      );
    } catch (error) {
      console.error('이미지 선택 중 오류:', error);
      Alert.alert('오류', '이미지를 선택할 수 없습니다.');
    }
  }, []);

  const handlePickFromLibrary = useCallback(async () => {
    try {
      const imageUri = await pickImageFromLibrary();
      if (imageUri) {
        setSelectedImage(imageUri);
        setLocalPetInfo(prev => ({
          ...prev,
          photoUri: imageUri,
          hasPhoto: true,
        }));
        triggerSuccessAnimation();
      }
    } catch (error) {
      console.error('갤러리에서 이미지 선택 중 오류:', error);
      Alert.alert('오류', '갤러리에서 이미지를 선택할 수 없습니다.');
    }
  }, []);

  const handleTakePhoto = useCallback(async () => {
    try {
      const imageUri = await takePhotoWithCamera();
      if (imageUri) {
        setSelectedImage(imageUri);
        setLocalPetInfo(prev => ({
          ...prev,
          photoUri: imageUri,
          hasPhoto: true,
        }));
        triggerSuccessAnimation();
      }
    } catch (error) {
      console.error('카메라로 사진 촬영 중 오류:', error);
      Alert.alert('오류', '카메라로 사진을 촬영할 수 없습니다.');
    }
  }, []);

  const triggerSuccessAnimation = useCallback(() => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setHasSuccessfullyAddedPhoto(true);
    setShowSuccessMessage(true);

    // 애니메이션 시퀀스
    Animated.parallel([
      Animated.timing(confettiAnim, ANIMATION_CONFIG.confetti),
      Animated.timing(successMessageAnim, ANIMATION_CONFIG.fadeIn),
    ]).start(() => {
      // 애니메이션 완료 후 정리
      setTimeout(() => {
        setShowSuccessMessage(false);
        setHasSuccessfullyAddedPhoto(false);
        confettiAnim.setValue(0);
        successMessageAnim.setValue(0);
        setIsAnimating(false);
      }, 2000);
    });
  }, [isAnimating, confettiAnim, successMessageAnim]);

  const triggerDeleteAnimation = useCallback(() => {
    setShowDeleteMessage(true);
    deleteMessageAnim.setValue(0);
    
    Animated.timing(deleteMessageAnim, ANIMATION_CONFIG.fadeIn).start(() => {
      setTimeout(() => {
        Animated.timing(deleteMessageAnim, ANIMATION_CONFIG.fadeOut).start(() => {
          setShowDeleteMessage(false);
        });
      }, 2000);
    });
  }, [deleteMessageAnim]);

  const handleDeletePhoto = useCallback(() => {
    setSelectedImage(null);
    setLocalPetInfo(prev => ({
      ...prev,
      photoUri: undefined,
      hasPhoto: false,
    }));
    setHasSuccessfullyAddedPhoto(false);
    triggerDeleteAnimation();
  }, [triggerDeleteAnimation]);

  const handleSave = useCallback(async () => {
    const validation = validatePetForm(localPetInfo);
    
    if (!validation.isValid) {
      Alert.alert('입력 오류', validation.errors.join('\n'));
      return;
    }

    try {
      await updatePetInfo(localPetInfo);
      Alert.alert('성공', '반려동물 정보가 저장되었습니다.');
    } catch (error) {
      console.error('반려동물 정보 저장 중 오류:', error);
      Alert.alert('오류', '반려동물 정보를 저장할 수 없습니다.');
    }
  }, [localPetInfo, updatePetInfo]);

  const handleBreedSelect = useCallback((breed: string) => {
    setSelectedBreed(breed);
    setLocalPetInfo(prev => ({ ...prev, breed }));
    setShowBreedModal(false);
  }, []);

  const handleTemperamentToggle = useCallback((temperament: string) => {
    setSelectedTemperaments(prev => {
      const newTemperaments = prev.includes(temperament)
        ? prev.filter(t => t !== temperament)
        : [...prev, temperament];
      
      setLocalPetInfo(prevInfo => ({
        ...prevInfo,
        temperaments: newTemperaments,
      }));
      
      return newTemperaments;
    });
  }, []);

  const handleTemperamentConfirm = useCallback(() => {
    setShowTemperamentModal(false);
  }, []);

  const handleSpeciesChange = useCallback((species: string) => {
    setLocalPetInfo(prev => ({
      ...prev,
      species,
      breed: '', // 종이 바뀌면 품종 초기화
    }));
    setSelectedBreed('');
  }, []);

  const handleGenderChange = useCallback((gender: string) => {
    setLocalPetInfo(prev => ({ ...prev, gender }));
  }, []);

  const handleNeuteredToggle = useCallback((isNeutered: boolean) => {
    setLocalPetInfo(prev => ({ ...prev, isNeutered }));
  }, []);

  const handleInputChange = useCallback((field: keyof PetFormData, value: string) => {
    setLocalPetInfo(prev => ({ ...prev, [field]: value }));
  }, []);

  return {
    // State
    localPetInfo,
    selectedImage,
    showBreedModal,
    showTemperamentModal,
    selectedBreed,
    selectedTemperaments,
    showSuccessMessage,
    showDeleteMessage,
    hasSuccessfullyAddedPhoto,
    isAnimating,
    
    // Animation values
    fadeAnim,
    scaleAnim,
    confettiAnim,
    successMessageAnim,
    deleteMessageAnim,
    
    // Handlers
    handleImagePicker,
    handlePickFromLibrary,
    handleTakePhoto,
    handleDeletePhoto,
    handleSave,
    handleBreedSelect,
    handleTemperamentToggle,
    handleTemperamentConfirm,
    handleSpeciesChange,
    handleGenderChange,
    handleNeuteredToggle,
    handleInputChange,
    
    // Modal handlers
    setShowBreedModal,
    setShowTemperamentModal,
    
    // State setters
    setLocalPetInfo,
    setSelectedBreed,
    setSelectedTemperaments,
    
    // Data
    petInfo,
    refreshPetInfo,
  };
};
