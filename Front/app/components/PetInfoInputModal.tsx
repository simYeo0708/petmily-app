import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Switch,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { PET_INFO_INPUT_STEPS, SAFETY_INFO } from '../constants/PetInfoInputSteps';
import { SPECIES_OPTIONS, GENDER_OPTIONS, TEMPERAMENT_OPTIONS, BREED_OPTIONS } from '../constants/PetConstants';
import { BreedSelectionModal } from './BreedSelectionModal';

const { width } = Dimensions.get('window');

interface PetInfoInputModalProps {
  visible: boolean;
  onClose: () => void;
  onComplete: (petData: any) => void;
}

export const PetInfoInputModal: React.FC<PetInfoInputModalProps> = ({
  visible,
  onClose,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [petData, setPetData] = useState({
    name: '',
    species: 'dog',
    breed: '',
    age: '',
    weight: '',
    gender: 'male',
    neutered: false,
    photoUri: '',
    temperaments: [] as string[],
    description: '',
  });
  const [showBreedModal, setShowBreedModal] = useState(false);
  const [customBreed, setCustomBreed] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  const currentStepData = PET_INFO_INPUT_STEPS[currentStep];
  const totalSteps = PET_INFO_INPUT_STEPS.length;

  // 품종 선택 모달이 표시될 때 즉시 렌더링되도록 강제
  useEffect(() => {
    if (showBreedModal) {
      console.log('품종 선택 모달 열림 - 즉시 렌더링');
    }
  }, [showBreedModal]);

  const validateStep = () => {
    const newErrors: {[key: string]: string} = {};
    
    switch (currentStepData.id) {
      case 'basic_info':
        if (!petData.name.trim()) newErrors.name = '이름을 입력해주세요';
        if (!petData.breed.trim()) newErrors.breed = '품종을 선택해주세요';
        break;
      case 'detail_info':
        if (!petData.age.trim()) newErrors.age = '나이를 입력해주세요';
        if (!petData.weight.trim()) newErrors.weight = '체중을 입력해주세요';
        break;
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      // 흔들림 애니메이션
      Animated.sequence([
        Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnimation, { toValue: -10, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnimation, { toValue: 0, duration: 100, useNativeDriver: true }),
      ]).start();
      return false;
    }
    
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    
    if (currentStep < totalSteps - 1) {
      setErrors({});
      setCurrentStep(currentStep + 1);
    } else {
      // 마지막 단계 - 정보 저장 및 완료
      onComplete(petData);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setPetData({ ...petData, photoUri: result.assets[0].uri });
    }
  };

  const toggleTemperament = (temperament: string) => {
    setPetData({
      ...petData,
      temperaments: petData.temperaments.includes(temperament)
        ? petData.temperaments.filter(t => t !== temperament)
        : [...petData.temperaments, temperament],
    });
  };

  const handleBreedSelect = (breedValue: string, breedLabel: string) => {
    if (breedValue === 'other') {
      // '기타' 선택 시 직접 입력 모드
      setCustomBreed('');
      setPetData({ ...petData, breed: '' });
    } else {
      setPetData({ ...petData, breed: breedLabel });
      setShowBreedModal(false);
    }
  };

  const handleCustomBreedSubmit = () => {
    if (customBreed.trim()) {
      setPetData({ ...petData, breed: customBreed.trim() });
      setShowBreedModal(false);
      setCustomBreed('');
    }
  };

  // 종이 변경될 때 품종 초기화
  const handleSpeciesChange = (species: string) => {
    setPetData({ ...petData, species, breed: '' });
    setCustomBreed('');
  };

  const renderStepContent = () => {
    switch (currentStepData.id) {
      case 'basic_info':
        return (
          <View style={styles.formContainer}>
            {/* 이름 */}
            <Animated.View style={[styles.inputGroup, { transform: [{ translateX: errors.name ? shakeAnimation : 0 }] }]}>
              <Text style={styles.label}>이름 *</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                placeholder="반려동물 이름"
                value={petData.name}
                onChangeText={(text) => setPetData({ ...petData, name: text })}
              />
              {errors.name && (
                <Text style={styles.errorText}>{errors.name}</Text>
              )}
            </Animated.View>

            {/* 종 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>종 *</Text>
              <View style={styles.optionRow}>
                {SPECIES_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionButton,
                      petData.species === option.value && styles.optionButtonSelected,
                    ]}
                    onPress={() => handleSpeciesChange(option.value)}>
                    <Text style={styles.optionEmoji}>{option.emoji}</Text>
                    <Text
                      style={[
                        styles.optionText,
                        petData.species === option.value && styles.optionTextSelected,
                      ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 품종 */}
            <Animated.View style={[styles.inputGroup, { transform: [{ translateX: errors.breed ? shakeAnimation : 0 }] }]}>
              <Text style={styles.label}>품종 *</Text>
              <TouchableOpacity
                style={[
                  styles.breedSelectButton,
                  errors.breed && styles.inputError
                ]}
                onPress={() => {
                  console.log('품종 선택 버튼 클릭');
                  setShowBreedModal(true);
                }}
                activeOpacity={0.7}>
                <Text style={petData.breed ? styles.breedSelectedText : styles.breedPlaceholderText}>
                  {petData.breed || '품종을 선택해주세요'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#C59172" />
              </TouchableOpacity>
              {errors.breed && (
                <Text style={styles.errorText}>{errors.breed}</Text>
              )}
            </Animated.View>
          </View>
        );

      case 'detail_info':
        return (
          <View style={styles.formContainer}>
            {/* 나이 & 체중 */}
            <View style={styles.rowGroup}>
              <Animated.View style={[styles.inputGroup, { flex: 1, marginRight: 10, transform: [{ translateX: errors.age ? shakeAnimation : 0 }] }]}>
                <Text style={styles.label}>나이 *</Text>
                <TextInput
                  style={[styles.input, errors.age && styles.inputError]}
                  placeholder="예: 3"
                  value={petData.age}
                  onChangeText={(text) => setPetData({ ...petData, age: text })}
                  keyboardType="numeric"
                />
                {errors.age && (
                  <Text style={styles.errorText}>{errors.age}</Text>
                )}
              </Animated.View>
              <Animated.View style={[styles.inputGroup, { flex: 1, transform: [{ translateX: errors.weight ? shakeAnimation : 0 }] }]}>
                <Text style={styles.label}>체중 (kg) *</Text>
                <TextInput
                  style={[styles.input, errors.weight && styles.inputError]}
                  placeholder="예: 25.5"
                  value={petData.weight}
                  onChangeText={(text) => setPetData({ ...petData, weight: text })}
                  keyboardType="numeric"
                />
                {errors.weight && (
                  <Text style={styles.errorText}>{errors.weight}</Text>
                )}
              </Animated.View>
            </View>

            {/* 성별 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>성별 *</Text>
              <View style={styles.optionRow}>
                {GENDER_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.genderButton,
                      petData.gender === option.value && styles.genderButtonSelected,
                    ]}
                    onPress={() => setPetData({ ...petData, gender: option.value })}>
                    <Text style={styles.optionEmoji}>{option.emoji}</Text>
                    <Text
                      style={[
                        styles.optionText,
                        petData.gender === option.value && styles.optionTextSelected,
                      ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 중성화 */}
            <View style={styles.switchGroup}>
              <Text style={styles.label}>중성화 여부 *</Text>
              <Switch
                value={petData.neutered}
                onValueChange={(value) => setPetData({ ...petData, neutered: value })}
                trackColor={{ false: '#E0E0E0', true: '#C59172' }}
                thumbColor={petData.neutered ? '#FFFFFF' : '#f4f3f4'}
              />
            </View>
          </View>
        );

      case 'optional_info':
        return (
          <View style={styles.formContainer}>
            {/* 프로필 사진 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>프로필 사진</Text>
              <TouchableOpacity style={styles.photoButton} onPress={handlePickImage}>
                {petData.photoUri ? (
                  <Image source={{ uri: petData.photoUri }} style={styles.photoImage} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Ionicons name="camera" size={32} color="#C59172" />
                    <Text style={styles.photoPlaceholderText}>사진 추가</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* 성격/특징 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>성격/특징</Text>
              <View style={styles.temperamentGrid}>
                {TEMPERAMENT_OPTIONS.map((temperament) => (
                  <TouchableOpacity
                    key={temperament.value}
                    style={[
                      styles.temperamentButton,
                      petData.temperaments.includes(temperament.value) && styles.temperamentButtonSelected,
                    ]}
                    onPress={() => toggleTemperament(temperament.value)}>
                    <Text
                      style={[
                        styles.temperamentText,
                        petData.temperaments.includes(temperament.value) && styles.temperamentTextSelected,
                      ]}>
                      {temperament.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 특이사항 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>특이사항/알러지</Text>
              <TextInput
                style={styles.textArea}
                placeholder="알러지나 주의사항을 입력하세요"
                value={petData.description}
                onChangeText={(text) => setPetData({ ...petData, description: text })}
                multiline
                numberOfLines={4}
              />
            </View>
          </View>
        );

      case 'safety_info':
        return (
          <View style={styles.formContainer}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* 보험 안내 */}
              <View style={styles.infoSection}>
                <Text style={styles.infoTitle}>{SAFETY_INFO.insurance.title}</Text>
                {SAFETY_INFO.insurance.items.map((item, index) => (
                  <View key={index} style={styles.infoItem}>
                    <Text style={styles.infoBullet}>•</Text>
                    <Text style={styles.infoText}>{item}</Text>
                  </View>
                ))}
              </View>

              {/* 안전 수칙 */}
              <View style={styles.infoSection}>
                <Text style={styles.infoTitle}>{SAFETY_INFO.safety.title}</Text>
                {SAFETY_INFO.safety.items.map((item, index) => (
                  <View key={index} style={styles.infoItem}>
                    <Text style={styles.infoBullet}>•</Text>
                    <Text style={styles.infoText}>{item}</Text>
                  </View>
                ))}
              </View>

              {/* 긴급 연락 */}
              <View style={styles.infoSection}>
                <Text style={styles.infoTitle}>{SAFETY_INFO.emergency.title}</Text>
                {SAFETY_INFO.emergency.items.map((item, index) => (
                  <View key={index} style={styles.infoItem}>
                    <Text style={styles.infoBullet}>•</Text>
                    <Text style={styles.infoText}>{item}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        );

      default:
        return null;
    }
  };

  const currentBreedOptions = BREED_OPTIONS[petData.species as keyof typeof BREED_OPTIONS] || BREED_OPTIONS.other;

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        transparent={false}
        onRequestClose={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
          keyboardVerticalOffset={0}>
          <View style={styles.container}>
            {/* 헤더 */}
            <View style={styles.header}>
              {currentStep > 0 && (
                <TouchableOpacity style={styles.backButton} onPress={handlePrevious}>
                  <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
              )}
              <Text style={styles.headerTitle}>반려동물 정보 입력</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {/* 진행 상황 */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${((currentStep + 1) / totalSteps) * 100}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {currentStep + 1} / {totalSteps}
              </Text>
            </View>

            {/* 단계별 콘텐츠 (제목 포함) */}
            <ScrollView 
              style={styles.content} 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scrollContentContainer}>
              {/* 단계 제목 및 설명 (스크롤 가능) */}
              <View style={styles.stepHeaderInScroll}>
                <Text style={styles.stepTitle}>{currentStepData.title}</Text>
                <Text style={styles.stepDescription}>{currentStepData.description}</Text>
                {currentStepData.isRequired && (
                  <Text style={styles.requiredNote}>* 필수 항목입니다</Text>
                )}
              </View>
              
              {renderStepContent()}
            </ScrollView>

            {/* 하단 버튼 */}
            <View style={styles.footer}>
              <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                <Text style={styles.nextButtonText}>
                  {currentStep === totalSteps - 1 ? '정보 입력 완료' : '다음'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* 품종 선택 모달 - 별도 컴포넌트로 분리 */}
      <BreedSelectionModal
        visible={showBreedModal}
        species={petData.species}
        selectedBreed={petData.breed}
        breedOptions={currentBreedOptions}
        customBreed={customBreed}
        onClose={() => setShowBreedModal(false)}
        onSelectBreed={handleBreedSelect}
        onCustomBreedChange={setCustomBreed}
        onCustomBreedSubmit={handleCustomBreedSubmit}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 5,
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
    width: 40,
    alignItems: 'flex-end',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#C59172',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  requiredNote: {
    fontSize: 14,
    color: '#FF6B6B',
  },
  content: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 40,
    flexGrow: 1,
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  rowGroup: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  inputError: {
    borderColor: '#FF6B6B',
    borderWidth: 2,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 13,
    marginTop: 5,
    fontWeight: '500',
  },
  stepHeaderInScroll: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 10,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  optionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },
  optionButtonSelected: {
    backgroundColor: '#C59172',
    borderColor: '#C59172',
  },
  optionEmoji: {
    fontSize: 28,
    marginBottom: 5,
  },
  optionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
  genderButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  genderButtonSelected: {
    backgroundColor: '#C59172',
    borderColor: '#C59172',
  },
  switchGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  photoButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  photoImage: {
    width: 116,
    height: 116,
    borderRadius: 58,
  },
  photoPlaceholder: {
    alignItems: 'center',
  },
  photoPlaceholderText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  temperamentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  temperamentButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  temperamentButtonSelected: {
    backgroundColor: '#C59172',
    borderColor: '#C59172',
  },
  temperamentText: {
    fontSize: 14,
    color: '#666',
  },
  temperamentTextSelected: {
    color: '#FFFFFF',
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    height: 100,
    textAlignVertical: 'top',
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoBullet: {
    fontSize: 16,
    color: '#C59172',
    marginRight: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  nextButton: {
    backgroundColor: '#C59172',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  breedSelectButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breedPlaceholderText: {
    fontSize: 16,
    color: '#999',
  },
  breedSelectedText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
});

export default PetInfoInputModal;
