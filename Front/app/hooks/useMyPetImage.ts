import { useState, useEffect } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { usePet } from "../contexts/PetContext";

export const useMyPetImage = (onImageSelected?: () => void) => {
  const { petInfo, updatePetInfo } = usePet();
  const [hasPhoto, setHasPhoto] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  
  // Context의 petInfo가 변경될 때 이미지 상태 동기화
  useEffect(() => {
    if (petInfo?.photoUri) {
      setSelectedImage(petInfo.photoUri);
      setHasPhoto(petInfo.hasPhoto || false);
    } else {
      setSelectedImage(null);
      setHasPhoto(false);
    }
  }, [petInfo]);

  const pickFromLibrary = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("권한 필요", "앨범 접근 권한이 필요합니다.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        const newImageUri = result.assets[0].uri;
        setSelectedImage(newImageUri);
        setHasPhoto(true);
        setShowImageModal(false);

        if (petInfo) {
          const updatedPetInfo = {
            ...petInfo,
            photoUri: newImageUri,
            hasPhoto: true,
          };
          updatePetInfo(updatedPetInfo);
        }

        onImageSelected?.();
      } else {
        setShowImageModal(false);
      }
    } catch (error) {
      Alert.alert("오류", "사진 선택 중 문제가 발생했습니다.");
      setShowImageModal(false);
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("권한 필요", "카메라 접근 권한이 필요합니다.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        const newImageUri = result.assets[0].uri;
        setSelectedImage(newImageUri);
        setHasPhoto(true);
        setShowImageModal(false);

        if (petInfo) {
          const updatedPetInfo = {
            ...petInfo,
            photoUri: newImageUri,
            hasPhoto: true,
          };
          updatePetInfo(updatedPetInfo);
        }

        onImageSelected?.();
      } else {
        setShowImageModal(false);
      }
    } catch (error) {
      Alert.alert("오류", "사진 촬영 중 문제가 발생했습니다.");
      setShowImageModal(false);
    }
  };

  const deleteImage = () => {
    setSelectedImage(null);
    setHasPhoto(false);
    if (petInfo) {
      const updatedPetInfo = {
        ...petInfo,
        photoUri: undefined,
        hasPhoto: false,
      };
      updatePetInfo(updatedPetInfo);
    }
  };

  return {
    hasPhoto,
    selectedImage,
    showImageModal,
    setShowImageModal,
    pickFromLibrary,
    takePhoto,
    deleteImage,
  };
};

