import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Pressable,
  Modal,
  Alert,
} from 'react-native';
import { usePet } from '../contexts/PetContext';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { rf, wp, hp } from '../utils/responsive';

const { width } = Dimensions.get('window');

const PetInfoHeader: React.FC = () => {
  const { petInfo, updatePetInfo } = usePet();
  const [showImageModal, setShowImageModal] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  
  // 디버깅용 로그
  React.useEffect(() => {
    console.log('PetInfoHeader - petInfo 업데이트:', petInfo);
  }, [petInfo]);

  // 이미지 선택 핸들러
  const handleImagePress = () => {
    setShowImageModal(true);
  };

  const pickImageFromCamera = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.status !== 'granted') {
        Alert.alert('권한 필요', '카메라 권한이 필요합니다.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && petInfo) {
        await updatePetInfo({
          ...petInfo,
          photoUri: result.assets[0].uri,
          hasPhoto: true,
        });
        setShowImageModal(false);
      }
    } catch (error) {
      console.error('카메라 오류:', error);
      Alert.alert('오류', '사진 촬영 중 문제가 발생했습니다.');
    }
  };

  const pickImageFromGallery = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.status !== 'granted') {
        Alert.alert('권한 필요', '사진 라이브러리 권한이 필요합니다.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && petInfo) {
        await updatePetInfo({
          ...petInfo,
          photoUri: result.assets[0].uri,
          hasPhoto: true,
        });
        setShowImageModal(false);
      }
    } catch (error) {
      console.error('갤러리 오류:', error);
      Alert.alert('오류', '사진 선택 중 문제가 발생했습니다.');
    }
  };

  if (!petInfo) {
    return (
      <View style={styles.container}>
        <View style={styles.petInfoCard}>
          <View style={styles.petImageContainer}>
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>🐾</Text>
            </View>
          </View>
          <View style={styles.petDetails}>
            <Text style={styles.petName}>반려동물 정보 없음</Text>
            <Text style={styles.petSpecies}>정보를 등록해주세요</Text>
          </View>
        </View>
      </View>
    );
  }

  const getSpeciesEmoji = (species: string) => {
    switch (species) {
      case 'dog': return '🐕';
      case 'cat': return '🐱';
      case 'other': return '🐾';
      default: return '🐾';
    }
  };

  const getSpeciesLabel = (species: string) => {
    switch (species) {
      case 'dog': return '강아지';
      case 'cat': return '고양이';
      case 'other': return '기타';
      default: return '반려동물';
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.petInfoCard}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        onPress={handleImagePress}
        android_ripple={{ color: 'rgba(197, 145, 114, 0.2)' }}>
        <View style={[styles.cardContent, isPressed && styles.cardPressed]}>
          <Pressable 
            style={styles.petImageContainer}
            onPress={handleImagePress}>
            {petInfo.hasPhoto && petInfo.photoUri && !imageLoadError ? (
              <Image
                source={{ uri: petInfo.photoUri }}
                style={styles.petImage}
                onError={() => {
                  console.log('🖼️ Image load failed, showing placeholder');
                  setImageLoadError(true);
                }}
                onLoad={() => setImageLoadError(false)}
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons name="camera" size={24} color="#999" />
              </View>
            )}
          </Pressable>
          <View style={styles.petDetails}>
            <Text style={styles.petName}>{petInfo.name}</Text>
            <Text style={styles.petSpecies}>
              {getSpeciesLabel(petInfo.species)} • {petInfo.breed}
            </Text>
          </View>
        </View>
      </Pressable>

      {/* 프로필 이미지 변경 모달 */}
      <Modal
        visible={showImageModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImageModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>프로필 이미지 변경</Text>
            <Text style={styles.modalSubtitle}>프로필 사진을 어떻게 추가하시겠습니까?</Text>
            
            <TouchableOpacity
              style={styles.modalButton}
              onPress={pickImageFromCamera}>
              <Ionicons name="camera" size={24} color="#C59172" />
              <Text style={styles.modalButtonText}>카메라로 촬영</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.modalButton}
              onPress={pickImageFromGallery}>
              <Ionicons name="images" size={24} color="#C59172" />
              <Text style={styles.modalButtonText}>앨범에서 선택</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowImageModal(false)}>
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
    backgroundColor: 'transparent',
    marginTop: 0,
    marginBottom: 0,
  },
  petInfoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    marginBottom: 0,
    borderWidth: 2.5,
    borderColor: '#C59172', // 브라운 색 테두리
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp(15),
  },
  cardPressed: {
    backgroundColor: 'rgba(197, 145, 114, 0.05)',
    transform: [{ scale: 0.98 }],
  },
  petImageContainer: {
    marginRight: wp(15),
  },
  petImage: {
    width: wp(60),
    height: wp(60),
    borderRadius: wp(30),
    borderWidth: 2,
    borderColor: '#C59172',
  },
  placeholderImage: {
    width: wp(60),
    height: wp(60),
    borderRadius: wp(30),
    backgroundColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#C59172', // 브라운 색 테두리로 통일
  },
  placeholderText: {
    fontSize: rf(24),
  },
  petDetails: {
    flex: 1,
  },
  petName: {
    fontSize: rf(18),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: hp(4),
  },
  petSpecies: {
    fontSize: rf(14),
    color: '#666',
  },
  // 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: wp(24),
    width: width * 0.85,
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: rf(20),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: hp(8),
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: rf(14),
    color: '#666',
    marginBottom: hp(24),
    textAlign: 'center',
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp(16),
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    marginBottom: hp(12),
  },
  modalButtonText: {
    fontSize: rf(16),
    color: '#333',
    marginLeft: wp(12),
    fontWeight: '500',
  },
  cancelButton: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  cancelButtonText: {
    fontSize: rf(16),
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default PetInfoHeader;
