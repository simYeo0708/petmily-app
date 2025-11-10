import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Switch,
  KeyboardAvoidingView,
  Platform,
  Animated,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PET_INFO_INPUT_STEPS, SAFETY_INFO } from '../constants/PetInfoInputSteps';
import { SPECIES_OPTIONS, GENDER_OPTIONS, TEMPERAMENT_OPTIONS, BREED_OPTIONS } from '../constants/PetConstants';
import { BreedSelectionModal } from '../components/BreedSelectionModal';
import { RootStackParamList } from '../index';
import { usePet } from '../contexts/PetContext';
import { PetService } from '../services/PetService';

type PetInfoInputScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const PetInfoInputScreen = () => {
  const navigation = useNavigation<PetInfoInputScreenNavigationProp>();
  const { updatePetInfo } = usePet();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
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

  const handleNext = async () => {
    if (!validateStep()) return;
    
    if (currentStep < totalSteps - 1) {
      setErrors({});
      setCurrentStep(currentStep + 1);
    } else {
      // 마지막 단계 - 정보 저장 및 완료
      console.log('반려동물 정보 저장:', petData);
      setIsSaving(true);
      
      try {
        // 백엔드 API 호출하여 저장
        const petInfoForApi = {
          name: petData.name,
          species: petData.species,
          breed: petData.breed,
          age: petData.age,
          weight: petData.weight,
          gender: petData.gender,
          isNeutered: petData.neutered,  // neutered → isNeutered
          photoUri: petData.photoUri,
          hasPhoto: !!petData.photoUri,
          temperaments: petData.temperaments,
          description: petData.description,
        };
        
        const savedPet = await PetService.createPet(petInfoForApi);
        console.log('반려동물 정보 저장 성공:', savedPet);
        
        // Context 업데이트하여 전체 앱에 반영
        await updatePetInfo(petInfoForApi);
        
        // My Pet 탭으로 이동
        navigation.navigate('Main', { initialTab: 'MyPetTab' });
      } catch (error) {
        console.error('반려동물 정보 저장 실패:', error);
        // 에러 처리 - 사용자에게 알림
        setErrors({ general: '정보 저장에 실패했습니다. 다시 시도해주세요.' });
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
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

  const handleSpeciesChange = (species: string) => {
    setPetData({ ...petData, species, breed: '' });
    setCustomBreed('');
  };

  const currentBreedOptions = BREED_OPTIONS[petData.species as keyof typeof BREED_OPTIONS] || BREED_OPTIONS.other;

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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar backgroundColor="#000000" barStyle="light-content" translucent={false} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={0}>
        <View style={styles.container}>
          {/* 헤더 */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handlePrevious}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>반려동물 정보 입력</Text>
            <View style={styles.placeholder} />
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

          {/* 단계별 콘텐츠 */}
          <ScrollView 
            style={styles.content} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContentContainer}>
            {/* 단계 제목 및 설명 */}
            <View style={styles.stepHeader}>
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
            <TouchableOpacity 
              style={[styles.nextButton, isSaving && styles.nextButtonDisabled]} 
              onPress={handleNext}
              disabled={isSaving}>
              <Text style={styles.nextButtonText}>
                {isSaving ? '저장 중...' : currentStep === totalSteps - 1 ? '정보 입력 완료' : '다음'}
              </Text>
            </TouchableOpacity>
            {errors.general && (
              <Text style={styles.generalErrorText}>{errors.general}</Text>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* 품종 선택 모달 */}
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
    </SafeAreaView>
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
  placeholder: {
    width: 40,
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
  content: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 40,
    flexGrow: 1,
  },
  stepHeader: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 10,
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
  nextButtonDisabled: {
    backgroundColor: '#CCC',
  },
  generalErrorText: {
    color: '#FF6B6B',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
    fontWeight: '500',
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

export default PetInfoInputScreen;

