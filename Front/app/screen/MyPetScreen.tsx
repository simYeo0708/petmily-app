import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState, useRef } from "react";
import { usePet } from "../contexts/PetContext";
import { PetInfo } from "../services/PetService";
import { testBackendConnection, testPetCreation } from "../utils/BackendConnectionTest";
import {
  Alert,
  Animated,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { headerStyles, homeScreenStyles } from "../styles/HomeScreenStyles";
import { myPetScreenStyles, modalStyles } from "../styles/MyPetScreenStyles";
import { breedOptions, speciesOptions, temperamentOptions } from "../data/petData";
import { StyleSheet } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { IconImage } from "../components/IconImage";
import { useMyPetForm } from "../hooks/useMyPetForm";
import { useMyPetImage } from "../hooks/useMyPetImage";
import { useMyPetAnimations } from "../hooks/useMyPetAnimations";

const MyPetScreen = () => {
  const { petInfo } = usePet();
  
  // 커스텀 훅 사용
  const {
    localPetInfo,
    setLocalPetInfo,
    selectedAllergies,
    setSelectedAllergies,
    selectedMedications,
    setSelectedMedications,
    selectedTemperaments,
    setSelectedTemperaments,
    handleSave,
  } = useMyPetForm();
  
  const {
    hasPhoto,
    selectedImage,
    showImageModal,
    setShowImageModal,
    pickFromLibrary,
    takePhoto,
    deleteImage,
  } = useMyPetImage(() => {
    triggerSuccessAnimation();
  });
  
  const {
    showSuccessAnimation,
    showDeleteMessage,
    hasSuccessfullyAddedPhoto,
    borderAnimation,
    scaleAnimation,
    confettiAnimation,
    deleteMessageOpacity,
    temperamentAnimations,
    triggerSuccessAnimation,
    triggerDeleteAnimation,
    toggleTemperament: toggleTemperamentAnimation,
  } = useMyPetAnimations();
  
  const [showBreedModal, setShowBreedModal] = useState(false);

  const localStyles = StyleSheet.create({
    testButtonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingHorizontal: 20,
      paddingVertical: 10,
      gap: 10,
    },
    testButton: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 15,
      borderRadius: 8,
      alignItems: 'center',
    },
    testButtonText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: 'bold',
    },
  });
  
  const pickImage = () => {
    setShowImageModal(true);
  };
  
  const toggleTemperament = (temperament: string) => {
    toggleTemperamentAnimation(temperament, selectedTemperaments, setSelectedTemperaments);
  };
  
  const handleDeleteImage = () => {
    deleteImage();
    triggerDeleteAnimation();
  };
  

  // 폭죽 컴포넌트
  const Confetti = () => {
    const confettiPieces = Array.from({ length: 20 }, (_, i) => {
      const rotation = confettiAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [`${i * 18}deg`, `${i * 18 + 360}deg`],
      });
      
      const translateY = confettiAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -200],
      });
      
      const opacity = confettiAnimation.interpolate({
        inputRange: [0, 0.1, 0.9, 1],
        outputRange: [0, 1, 1, 0],
      });
      
      return (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 8,
            height: 8,
            backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'][i % 5],
            borderRadius: 4,
            transform: [
              { translateX: -4 },
              { translateY: -4 },
              { rotate: rotation },
              { translateY: translateY },
            ],
            opacity: opacity,
          }}
        />
      );
    });
    
    return <>{confettiPieces}</>;
  };

  // 품종 선택 모달 컴포넌트
  const BreedSelectionModal = () => {
    const currentBreeds = breedOptions[localPetInfo.species as keyof typeof breedOptions] || [];
    
    return (
      <Modal
        visible={showBreedModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowBreedModal(false)}>
        <View style={modalStyles.overlay}>
          <View style={modalStyles.container}>
            <View style={modalStyles.header}>
              <Text style={modalStyles.title}>
                품종 선택
              </Text>
              <TouchableOpacity
                onPress={() => setShowBreedModal(false)}
                style={modalStyles.closeButton}>
                <Text style={modalStyles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={modalStyles.breedList}>
              {currentBreeds.map((breed, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    setLocalPetInfo({ ...localPetInfo, breed: breed });
                    setShowBreedModal(false);
                  }}
                  style={modalStyles.breedItem}>
                  <Text style={modalStyles.breedItemText}>
                    {breed}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    // <SafeAreaView 
    //   style={[myPetScreenStyles.root, { backgroundColor: '#FFFFFF' }]}
    //   edges={['top', 'left', 'right']}>
    <>
      <View style={myPetScreenStyles.header}>
        <View style={myPetScreenStyles.logoRow}>
          <IconImage name="paw" size={22} style={myPetScreenStyles.logoIcon} />
          <Text style={myPetScreenStyles.logoText}>My Pet</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={myPetScreenStyles.scrollContent}>
        {/* 프로필 사진 섹션 */}
        <View style={myPetScreenStyles.section}>
          <Text style={myPetScreenStyles.sectionTitle}>프로필 사진</Text>
          <View style={myPetScreenStyles.photoContainer}>
            <Animated.View
              style={{
                transform: [{ scale: scaleAnimation }],
                position: "relative",
              }}>
              {/* 성공 시 초록색 띠 - 사진 영역과 간격을 두고 둘러싸기 */}
              {hasSuccessfullyAddedPhoto && (
                <View
                  style={{
                    position: "absolute",
                    top: -8,
                    left: -8,
                    right: -8,
                    bottom: -8,
                    borderRadius: 68,
                    borderWidth: 3,
                    borderColor: "#4CAF50",
                    zIndex: 1,
                  }}
                />
              )}
              
              <TouchableOpacity
                style={[
                  myPetScreenStyles.photoButton,
                  showSuccessAnimation && myPetScreenStyles.photoButtonSuccess,
                  { zIndex: 2 }
                ]}
                onPress={pickImage}>
                
                {/* 성공 애니메이션 윤곽선 */}
                {showSuccessAnimation && (
                  <Animated.View
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      borderRadius: 60,
                      borderWidth: 4,
                      borderColor: "#4CAF50",
                      borderTopColor: "transparent",
                      borderRightColor: "transparent",
                      borderBottomColor: "transparent",
                      transform: [
                        {
                          rotate: borderAnimation.interpolate({
                            inputRange: [0, 1],
                            outputRange: ["0deg", "360deg"],
                          }),
                        },
                      ],
                    }}
                  />
                )}
                
                {hasPhoto && selectedImage ? (
                  <View style={{ position: "relative" }}>
                    <Image
                      source={{ uri: selectedImage }}
                      style={myPetScreenStyles.photoImage}
                    />
                    <TouchableOpacity
                      style={myPetScreenStyles.photoDeleteButton}
                      onPress={handleDeleteImage}>
                      <Text style={myPetScreenStyles.photoDeleteText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={myPetScreenStyles.photoPlaceholder}>
                    <Ionicons name="camera" size={40} color="#999" />
                    <Text style={myPetScreenStyles.photoPlaceholderText}>사진 추가</Text>
                  </View>
                )}
                
                {/* 삭제 메시지 - 사진 이미지 바로 밑에 표시 */}
                {showDeleteMessage && (
                  <Animated.View
                    style={[
                      myPetScreenStyles.deleteMessageContainer,
                      {
                        opacity: deleteMessageOpacity,
                        transform: [
                          {
                            translateY: deleteMessageOpacity.interpolate({
                              inputRange: [0, 1],
                              outputRange: [20, 0],
                            }),
                          },
                        ],
                      },
                    ]}>
                    <View style={myPetScreenStyles.deleteMessageBox}>
                      <Text style={myPetScreenStyles.deleteMessageText}>
                        ❌ 사진을 등록해주세요
                      </Text>
                    </View>
                  </Animated.View>
                )}
              </TouchableOpacity>
              
              {/* 폭죽 애니메이션 */}
              {showSuccessAnimation && (
                <View style={{ 
                  position: "absolute", 
                  top: 0, 
                  left: 0, 
                  right: 0, 
                  bottom: 0, 
                  pointerEvents: "none",
                  zIndex: 9999,
                  elevation: 9999,
                }}>
                  <Confetti />
                </View>
              )}
            </Animated.View>
            
            {/* 성공 메시지 제거 */}
          </View>
        </View>

        {/* 기본 정보 */}
        <View style={myPetScreenStyles.section}>
          <Text style={myPetScreenStyles.sectionTitle}>기본 정보</Text>

          <View style={myPetScreenStyles.inputContainer}>
            <Text style={myPetScreenStyles.inputLabel}>
              이름 *
            </Text>
            <TextInput
              style={myPetScreenStyles.inputField}
              placeholder="반려동물의 이름을 입력하세요"
              value={localPetInfo.name}
              onChangeText={(text) => setLocalPetInfo({ ...localPetInfo, name: text })}
            />
          </View>

          <View style={myPetScreenStyles.inputContainer}>
            <Text style={myPetScreenStyles.inputLabel}>
              종류 *
            </Text>
            <View style={myPetScreenStyles.speciesContainer}>
              {speciesOptions.map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    myPetScreenStyles.speciesButton,
                    localPetInfo.species === option.key && myPetScreenStyles.speciesButtonSelected
                  ]}
                  onPress={() => {
                    setLocalPetInfo({ 
                      ...localPetInfo, 
                      species: option.key,
                      breed: "" // 동물 종류 변경 시 품종 초기화
                    });
                  }}>
                  <IconImage
                    name={option.iconName}
                    size={28}
                    style={myPetScreenStyles.speciesIcon}
                  />
                  <Text
                    style={[
                      myPetScreenStyles.speciesLabel,
                      localPetInfo.species === option.key 
                        ? myPetScreenStyles.speciesLabelSelected 
                        : myPetScreenStyles.speciesLabelUnselected
                    ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={myPetScreenStyles.inputContainer}>
            <Text style={myPetScreenStyles.inputLabel}>
              품종 *
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TextInput
                style={[
                  myPetScreenStyles.inputField,
                  myPetScreenStyles.inputFieldWithButton
                ]}
                placeholder="품종을 입력하거나 선택하세요"
                value={localPetInfo.breed}
                onChangeText={(text) => setLocalPetInfo({ ...localPetInfo, breed: text })}
              />
              {localPetInfo.species !== "other" && (
                <TouchableOpacity
                  onPress={() => setShowBreedModal(true)}
                  style={myPetScreenStyles.breedSelectButton}
                  activeOpacity={0.7}>
                  <Text style={myPetScreenStyles.breedSelectButtonText}>
                    📋 선택
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: 10, marginBottom: 15 }}>
            <View style={{ flex: 1 }}>
              <Text style={myPetScreenStyles.inputLabel}>
                나이 *
              </Text>
              <TextInput
                style={myPetScreenStyles.inputField}
                placeholder="예: 3"
                value={localPetInfo.age}
                onChangeText={(text) => setLocalPetInfo({ ...localPetInfo, age: text })}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={myPetScreenStyles.inputLabel}>
                체중 (kg)
              </Text>
              <TextInput
                style={myPetScreenStyles.inputField}
                placeholder="예: 25.5"
                value={localPetInfo.weight}
                onChangeText={(text) =>
                  setLocalPetInfo({ ...localPetInfo, weight: text })
                }
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={myPetScreenStyles.inputContainer}>
            <Text style={myPetScreenStyles.inputLabel}>
              성별
            </Text>
            <View style={myPetScreenStyles.genderContainer}>
              <TouchableOpacity
                style={[
                  myPetScreenStyles.genderButton,
                  localPetInfo.gender === "male" && myPetScreenStyles.genderButtonSelected
                ]}
                onPress={() => setLocalPetInfo({ ...localPetInfo, gender: "male" })}>
                <Ionicons
                  name="male"
                  size={22}
                  color={localPetInfo.gender === "male" ? '#FFFFFF' : '#C59172'}
                  style={myPetScreenStyles.genderIcon}
                />
                <Text
                  style={[
                    myPetScreenStyles.genderLabel,
                    localPetInfo.gender === "male" 
                      ? myPetScreenStyles.genderLabelSelected 
                      : myPetScreenStyles.genderLabelUnselected
                  ]}>
                  수컷
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  myPetScreenStyles.genderButton,
                  localPetInfo.gender === "female" && myPetScreenStyles.genderButtonSelected
                ]}
                onPress={() => setLocalPetInfo({ ...localPetInfo, gender: "female" })}>
                <Ionicons
                  name="female"
                  size={22}
                  color={localPetInfo.gender === "female" ? '#FFFFFF' : '#C59172'}
                  style={myPetScreenStyles.genderIcon}
                />
                <Text
                  style={[
                    myPetScreenStyles.genderLabel,
                    localPetInfo.gender === "female" 
                      ? myPetScreenStyles.genderLabelSelected 
                      : myPetScreenStyles.genderLabelUnselected
                  ]}>
                  암컷
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={myPetScreenStyles.switchContainer}>
            <Text style={myPetScreenStyles.switchLabel}>
              중성화 수술 여부
            </Text>
            <Switch
              value={localPetInfo.isNeutered}
              onValueChange={(value) =>
                setLocalPetInfo({ ...localPetInfo, isNeutered: value })
              }
              trackColor={{ false: "#ccc", true: "#C59172" }}
              thumbColor={localPetInfo.isNeutered ? "#fff" : "#fff"}
            />
          </View>
        </View>

        {/* 추가 정보 */}
        <View style={myPetScreenStyles.section}>
          <Text style={myPetScreenStyles.sectionTitle}>추가 정보</Text>

          <View style={myPetScreenStyles.temperamentContainer}>
            <Text style={myPetScreenStyles.inputLabel}>
              성격/특징
            </Text>
            <View style={myPetScreenStyles.temperamentGrid}>
              {temperamentOptions.map((temperament) => {
                const isSelected = selectedTemperaments.includes(temperament);
                const animationValue = temperamentAnimations[temperament] || new Animated.Value(0);
                
                return (
                  <Animated.View
                    key={temperament}
                    style={{
                      transform: [
                        {
                          scale: animationValue.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 1.05],
                          }),
                        },
                      ],
                    }}>
                    <TouchableOpacity
                      style={[
                        myPetScreenStyles.temperamentButton,
                        isSelected && myPetScreenStyles.temperamentButtonSelected,
                      ]}
                      onPress={() => toggleTemperament(temperament)}
                      activeOpacity={0.7}>
                      <Text
                        style={[
                          myPetScreenStyles.temperamentButtonText,
                          isSelected && myPetScreenStyles.temperamentButtonTextSelected,
                        ]}>
                        {temperament}
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </View>
          </View>

          <View style={myPetScreenStyles.inputContainer}>
            <Text style={myPetScreenStyles.inputLabel}>
              기본 메모 (간략한 설명)
            </Text>
            <TextInput
              style={myPetScreenStyles.textArea}
              placeholder="예: 활발하고 사람을 좋아하는 아이입니다"
              value={localPetInfo.medicalInfo}
              onChangeText={(text) =>
                setLocalPetInfo({ ...localPetInfo, medicalInfo: text })
              }
              multiline
            />
          </View>
        </View>

        {/* 건강 및 알레르기 정보 섹션 */}
        <View style={myPetScreenStyles.section}>
          <Text style={myPetScreenStyles.sectionTitle}>건강 및 알레르기 정보</Text>
          <Text style={{fontSize: 12, color: '#666', marginBottom: 15}}>
            * 상품 추천 시 활용됩니다
          </Text>

          {/* 예방접종 여부 */}
          <View style={myPetScreenStyles.switchContainer}>
            <Text style={myPetScreenStyles.switchLabel}>예방접종 완료</Text>
            <Switch
              value={localPetInfo.isVaccinated}
              onValueChange={(value) =>
                setLocalPetInfo({ ...localPetInfo, isVaccinated: value })
              }
              trackColor={{ false: "#E0E0E0", true: "#C59172" }}
              thumbColor={localPetInfo.isVaccinated ? "#FFFFFF" : "#F4F3F4"}
            />
          </View>

          {/* 알레르기 */}
          <View style={myPetScreenStyles.inputContainer}>
            <Text style={myPetScreenStyles.inputLabel}>
              알레르기 (쉼표로 구분)
            </Text>
            <TextInput
              style={myPetScreenStyles.inputField}
              placeholder="예: 닭고기, 복숭아, 밀가루"
              value={selectedAllergies.join(", ")}
              onChangeText={(text) => {
                const allergies = text.split(",").map(a => a.trim()).filter(a => a);
                setSelectedAllergies(allergies);
              }}
            />
          </View>

          {/* 복용 중인 약물 */}
          <View style={myPetScreenStyles.inputContainer}>
            <Text style={myPetScreenStyles.inputLabel}>
              복용 중인 약물 (쉼표로 구분)
            </Text>
            <TextInput
              style={myPetScreenStyles.inputField}
              placeholder="예: 심장약, 관절영양제"
              value={selectedMedications.join(", ")}
              onChangeText={(text) => {
                const medications = text.split(",").map(m => m.trim()).filter(m => m);
                setSelectedMedications(medications);
              }}
            />
          </View>

          {/* 기존 질병/건강 상태 */}
          <View style={myPetScreenStyles.inputContainer}>
            <Text style={myPetScreenStyles.inputLabel}>
              기존 질병/건강 상태
            </Text>
            <TextInput
              style={myPetScreenStyles.textArea}
              placeholder="예: 슬개골 탈구, 심장 질환 등"
              value={localPetInfo.medicalConditions}
              onChangeText={(text) =>
                setLocalPetInfo({ ...localPetInfo, medicalConditions: text })
              }
              multiline
            />
          </View>

          {/* 특별 주의사항 */}
          <View style={myPetScreenStyles.inputContainer}>
            <Text style={myPetScreenStyles.inputLabel}>
              특별 주의사항
            </Text>
            <TextInput
              style={myPetScreenStyles.textArea}
              placeholder="예: 산책 시 큰 소리에 놀랄 수 있음, 다른 개를 보면 짖음 등"
              value={localPetInfo.specialNotes}
              onChangeText={(text) =>
                setLocalPetInfo({ ...localPetInfo, specialNotes: text })
              }
              multiline
            />
          </View>
        </View>

        {/* 저장 버튼 */}
        <View style={myPetScreenStyles.saveButtonContainer}>
          <TouchableOpacity
            style={myPetScreenStyles.saveButton}
            onPress={handleSave}>
            <Text style={myPetScreenStyles.saveButtonText}>
              저장하기
            </Text>
          </TouchableOpacity>
        </View>

        {/* 백엔드 연결 테스트 버튼들 (개발용) */}
        {__DEV__ && (
          <View style={localStyles.testButtonContainer}>
            <TouchableOpacity
              style={[localStyles.testButton, { backgroundColor: '#007AFF' }]}
              onPress={testBackendConnection}>
              <Text style={localStyles.testButtonText}>
                백엔드 연결 테스트
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[localStyles.testButton, { backgroundColor: '#34C759' }]}
              onPress={testPetCreation}>
              <Text style={localStyles.testButtonText}>
                펫 생성 테스트
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      
      {/* 프로필 이미지 변경 모달 */}
      <Modal
        visible={showImageModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImageModal(false)}>
        <View style={styles.imageModalOverlay}>
          <View style={styles.imageModalContainer}>
            <Text style={styles.imageModalTitle}>프로필 이미지 변경</Text>
            <Text style={styles.imageModalSubtitle}>프로필 사진을 어떻게 추가하시겠습니까?</Text>
            
            <TouchableOpacity
              style={styles.imageModalButton}
              onPress={takePhoto}>
              <Ionicons name="camera" size={24} color="#C59172" />
              <Text style={styles.imageModalButtonText}>카메라로 촬영</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.imageModalButton}
              onPress={pickFromLibrary}>
              <Ionicons name="images" size={24} color="#C59172"/>
              <Text style={styles.imageModalButtonText}>앨범에서 선택</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.imageModalButton, styles.imageModalCancelButton]}
              onPress={() => setShowImageModal(false)}>
              <Text style={styles.imageModalCancelButtonText}>취소</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* 품종 선택 모달 */}
      <BreedSelectionModal />
    </>
  );
};

// 프로필 이미지 모달 스타일
const styles = StyleSheet.create({
  imageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  imageModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  imageModalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  imageModalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    marginBottom: 12,
  },
  imageModalButtonText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    fontWeight: '500',
  },
  imageModalCancelButton: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  imageModalCancelButtonText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default MyPetScreen;
