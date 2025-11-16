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
import { StyleSheet } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { IconImage } from "../components/IconImage";

const MyPetScreen = () => {
  const { petInfo, updatePetInfo } = usePet();

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
  
  // 로컬 상태 (Context와 동기화)
  const [localPetInfo, setLocalPetInfo] = useState({
    name: "",
    species: "dog",
    breed: "",
    age: "",
    weight: "",
    gender: "",
    isNeutered: false,
    medicalInfo: "",
    temperament: "",
    
    // 건강 및 알레르기 정보
    isVaccinated: false,
    medicalConditions: "",
    specialNotes: "",
  });
  
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [selectedMedications, setSelectedMedications] = useState<string[]>([]);

  const [hasPhoto, setHasPhoto] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  // const [showSuccessMessage, setShowSuccessMessage] = useState(false); // 제거됨
  const [showDeleteMessage, setShowDeleteMessage] = useState(false);
  const [hasSuccessfullyAddedPhoto, setHasSuccessfullyAddedPhoto] = useState(false);
  const [showBreedModal, setShowBreedModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);  // 프로필 이미지 변경 모달
  const [selectedTemperaments, setSelectedTemperaments] = useState<string[]>(['온순함']);
  
  // 애니메이션 값들
  const borderAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(1)).current;
  const confettiAnimation = useRef(new Animated.Value(0)).current;
  // const messageOpacity = useRef(new Animated.Value(0)).current; // 제거됨
  const deleteMessageOpacity = useRef(new Animated.Value(0)).current;
  const temperamentAnimations = useRef<{[key: string]: Animated.Value}>({}).current;

  // Context의 petInfo가 변경될 때마다 로컬 상태 동기화
  useEffect(() => {
    if (petInfo) {
      console.log('🔄 MyPetScreen: Syncing with Context petInfo:', petInfo.name);
      setLocalPetInfo({
        name: petInfo.name || "",
        species: petInfo.species || "dog",
        breed: petInfo.breed || "",
        age: petInfo.age || "",
        weight: petInfo.weight || "",
        gender: petInfo.gender || "",
        isNeutered: petInfo.isNeutered || false,
        medicalInfo: petInfo.description || "",
        temperament: petInfo.temperaments?.join(", ") || "",
        
        // 건강 및 알레르기 정보
        isVaccinated: petInfo.isVaccinated || false,
        medicalConditions: petInfo.medicalConditions || "",
        specialNotes: petInfo.specialNotes || "",
      });
      
      if (petInfo.allergies && petInfo.allergies.length > 0) {
        setSelectedAllergies(petInfo.allergies);
      }
      
      if (petInfo.medications && petInfo.medications.length > 0) {
        setSelectedMedications(petInfo.medications);
      }
      
      if (petInfo.photoUri) {
        setSelectedImage(petInfo.photoUri);
        setHasPhoto(petInfo.hasPhoto || false);
        setHasSuccessfullyAddedPhoto(true);
      }
      
      if (petInfo.temperaments && petInfo.temperaments.length > 0) {
        setSelectedTemperaments(petInfo.temperaments);
      } else {
        setSelectedTemperaments(['온순함']);
      }
    }
  }, [petInfo]); // petInfo가 변경될 때만 실행

  const pickImage = () => {
    setShowImageModal(true);
  };

  const pickFromLibrary = async () => {
    try {
      // 1) 권한 요청
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 필요', '앨범 접근 권한이 필요합니다.');
        return;
      }

      // 2) 앨범 열기
      const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images', // 사진만
      allowsEditing: true,                             // 편집 가능 여부
      aspect: [1, 1],                                  // 정사각형 크롭
      quality: 0.8,                                    // 품질 (0~1)
    });

      if (!result.canceled) {
        const newImageUri = result.assets[0].uri;
        setSelectedImage(newImageUri);
        setHasPhoto(true);
        setShowImageModal(false);  // 모달 닫기
        triggerSuccessAnimation();
        console.log('선택한 파일:', result.assets[0]);
        
        // 즉시 Context 업데이트
        if (petInfo) {
          const updatedPetInfo = {
            ...petInfo,
            photoUri: newImageUri,
            hasPhoto: true,
          };
          updatePetInfo(updatedPetInfo);
        }
      } else {
        setShowImageModal(false);  // 취소 시에도 모달 닫기
      }
    } catch (error) {
      console.error('앨범 선택 오류:', error);
      Alert.alert('오류', '사진 선택 중 문제가 발생했습니다.');
      setShowImageModal(false);
    }
  };

  const takePhoto = async () => {
    try {
      // 1) 카메라 권한 요청
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 필요', '카메라 접근 권한이 필요합니다.');
        return;
      }

      // 2) 카메라 열기
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,  // 편집 가능 여부
        aspect: [1, 1],       // 정사각형 크롭
        quality: 0.8,         // 품질 (0~1)
      });

      if (!result.canceled) {
        const newImageUri = result.assets[0].uri;
        setSelectedImage(newImageUri);
        setHasPhoto(true);
        setShowImageModal(false);  // 모달 닫기
        triggerSuccessAnimation();
        console.log('촬영한 파일:', result.assets[0]);
        
        // 즉시 Context 업데이트
        if (petInfo) {
          const updatedPetInfo = {
            ...petInfo,
            photoUri: newImageUri,
            hasPhoto: true,
          };
          updatePetInfo(updatedPetInfo);
        }
      } else {
        setShowImageModal(false);  // 취소 시에도 모달 닫기
      }
    } catch (error) {
      console.error('카메라 촬영 오류:', error);
      Alert.alert('오류', '사진 촬영 중 문제가 발생했습니다.');
      setShowImageModal(false);
    }
  };

  const triggerSuccessAnimation = () => {
    // 초록색 모달 없이 간단한 애니메이션만
    setShowSuccessAnimation(true);
    setHasSuccessfullyAddedPhoto(true);
    
    // 초기값 설정
    borderAnimation.setValue(0);
    scaleAnimation.setValue(1);
    confettiAnimation.setValue(0);
    
    // 간단한 애니메이션 (스케일 + 윤곽선만)
    Animated.sequence([
      Animated.timing(scaleAnimation, {
        toValue: 1.1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(borderAnimation, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: false,
      }),
    ]).start(() => {
      // 애니메이션 완료 후 초기화
      setTimeout(() => {
        setShowSuccessAnimation(false);
        borderAnimation.setValue(0);
      }, 1000);
    });
  };

  const triggerDeleteAnimation = () => {
    // 성공 애니메이션 상태 초기화 (삭제 시에는 성공 애니메이션 표시 안함)
    setShowSuccessAnimation(false);
    // setShowSuccessMessage(false); // 제거됨
    setHasSuccessfullyAddedPhoto(false);
    borderAnimation.setValue(0);
    confettiAnimation.setValue(0);
    // messageOpacity.setValue(0); // 제거됨
    
    setShowDeleteMessage(true);
    deleteMessageOpacity.setValue(0);
    
    // 삭제 메시지 애니메이션
    Animated.timing(deleteMessageOpacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      // 3초 후 메시지 숨기기
      setTimeout(() => {
        Animated.timing(deleteMessageOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          setShowDeleteMessage(false);
        });
      }, 3000);
    });
  };

  const toggleTemperament = (temperament: string) => {
    // 애니메이션 값 초기화 (없으면 생성)
    if (!temperamentAnimations[temperament]) {
      temperamentAnimations[temperament] = new Animated.Value(0);
    }
    
    const isCurrentlySelected = selectedTemperaments.includes(temperament);
    
    setSelectedTemperaments(prev => {
      if (prev.includes(temperament)) {
        return prev.filter(t => t !== temperament);
      } else {
        return [...prev, temperament];
      }
    });
    
    // 애니메이션 실행
    Animated.sequence([
      Animated.timing(temperamentAnimations[temperament], {
        toValue: isCurrentlySelected ? 0 : 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSave = async () => {
    if (!localPetInfo.name || !localPetInfo.breed || !localPetInfo.age) {
      Alert.alert("알림", "필수 정보를 모두 입력해주세요.");
      return;
    }

    try {
      // Context 형식에 맞게 데이터 변환 (기존 petInfo의 id 유지)
      const petData: PetInfo = {
        id: petInfo?.id,  // 기존 ID 유지 (있으면 업데이트, 없으면 생성)
        name: localPetInfo.name,
        species: localPetInfo.species,
        breed: localPetInfo.breed,
        age: localPetInfo.age,
        weight: localPetInfo.weight,
        gender: localPetInfo.gender,
        isNeutered: localPetInfo.isNeutered,
        description: localPetInfo.medicalInfo,
        photoUri: selectedImage || undefined,
        hasPhoto: hasPhoto,
        temperaments: selectedTemperaments,
        
        // 건강 및 알레르기 정보
        isVaccinated: localPetInfo.isVaccinated,
        allergies: selectedAllergies,
        medications: selectedMedications,
        medicalConditions: localPetInfo.medicalConditions,
        specialNotes: localPetInfo.specialNotes,
      };
      
      console.log('💾 MyPetScreen: Saving pet data:', { id: petData.id, name: petData.name });
      
      // Context를 통해 업데이트 (서버 + 로컬 저장 자동 처리)
      await updatePetInfo(petData);
      
      Alert.alert("성공", "반려동물 정보가 저장되었습니다!", [
        {
          text: "확인",
          onPress: () => {
            console.log("✅ Pet Info Saved:", { id: petData.id, name: petData.name });
          },
        },
      ]);
    } catch (error) {
      console.error("Failed to save pet info:", error);
      Alert.alert(
        "오류",
        "정보 저장 중 문제가 발생했습니다. 다시 시도해주세요."
      );
    }
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

  const speciesOptions = [
    { key: "dog", label: "강아지", iconName: "dog" as const },
    { key: "cat", label: "고양이", iconName: "cat" as const },
    { key: "other", label: "기타", iconName: "paw" as const },
  ];

  const breedOptions = {
    dog: [
      "Abyssinian", "American Bulldog", "American Pit Bull Terrier", "Basset Hound", "Beagle",
      "Bengal", "Border Collie", "Boxer", "British Shorthair", "Bulldog", "Chihuahua",
      "Cocker Spaniel", "Collie", "Dalmatian", "Doberman Pinscher", "English Setter",
      "German Shepherd", "Golden Retriever", "Great Dane", "Havanese", "Jack Russell Terrier",
      "Keeshond", "Labrador Retriever", "Maine Coon", "Maltese", "Munchkin", "Newfoundland",
      "Persian", "Pomeranian", "Poodle", "Pug", "Ragdoll", "Rottweiler", "Russian Blue",
      "Saint Bernard", "Samoyed", "Scottish Fold", "Shiba Inu", "Siberian Husky", "Siamese",
      "Staffordshire Bull Terrier", "Weimaraner", "Yorkshire Terrier", "기타"
    ],
    cat: [
      "Abyssinian", "American Curl", "American Shorthair", "Bengal", "Birman", "Bombay",
      "British Shorthair", "Burmese", "Chartreux", "Cornish Rex", "Devon Rex", "Egyptian Mau",
      "Exotic Shorthair", "Himalayan", "Japanese Bobtail", "Maine Coon", "Manx", "Munchkin",
      "Norwegian Forest", "Oriental Shorthair", "Persian", "Ragdoll", "Russian Blue",
      "Scottish Fold", "Siamese", "Siberian", "Singapura", "Somali", "Sphynx", "Tonkinese",
      "Turkish Angora", "Turkish Van", "기타"
    ],
    other: []
  };

  const temperamentOptions = [
    "온순함", "활발함", "사교적", "조용함", "장난꾸러기", "차분함",
    "호기심 많음", "독립적", "애교쟁이", "용감함", "신중함", "장난스러움",
    "친근함", "고집스러움", "영리함", "겁쟁이", "적극적", "소심함"
  ];

  return (
    <SafeAreaView style={[myPetScreenStyles.root, { backgroundColor: '#FFFFFF' }]}>
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
                      onPress={() => {
                        setSelectedImage(null);
                        setHasPhoto(false);
                        // 사진 삭제 시 삭제 애니메이션 실행
                        triggerDeleteAnimation();
                        
                        // 즉시 Context 업데이트
                        if (petInfo) {
                          const updatedPetInfo = {
                            ...petInfo,
                            photoUri: undefined,
                            hasPhoto: false,
                          };
                          updatePetInfo(updatedPetInfo);
                        }
                      }}>
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
    </SafeAreaView>
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
