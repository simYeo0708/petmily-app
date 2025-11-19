import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { usePet } from "../contexts/PetContext";
import { PetInfo } from "../services/PetService";

export interface LocalPetInfo {
  name: string;
  species: string;
  breed: string;
  age: string;
  weight: string;
  gender: string;
  isNeutered: boolean;
  medicalInfo: string;
  temperament: string;
  isVaccinated: boolean;
  medicalConditions: string;
  specialNotes: string;
}

export const useMyPetForm = () => {
  const { petInfo, updatePetInfo } = usePet();
  
  const [localPetInfo, setLocalPetInfo] = useState<LocalPetInfo>({
    name: "",
    species: "dog",
    breed: "",
    age: "",
    weight: "",
    gender: "",
    isNeutered: false,
    medicalInfo: "",
    temperament: "",
    isVaccinated: false,
    medicalConditions: "",
    specialNotes: "",
  });
  
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [selectedMedications, setSelectedMedications] = useState<string[]>([]);
  const [selectedTemperaments, setSelectedTemperaments] = useState<string[]>(['온순함']);

  // Context의 petInfo가 변경될 때마다 로컬 상태 동기화
  useEffect(() => {
    if (petInfo) {
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
      
      if (petInfo.temperaments && petInfo.temperaments.length > 0) {
        setSelectedTemperaments(petInfo.temperaments);
      } else {
        setSelectedTemperaments(['온순함']);
      }
    }
  }, [petInfo]);

  const handleSave = async () => {
    if (!localPetInfo.name || !localPetInfo.breed || !localPetInfo.age) {
      Alert.alert("알림", "필수 정보를 모두 입력해주세요.");
      return;
    }

    try {
      const petData: PetInfo = {
        id: petInfo?.id,
        name: localPetInfo.name,
        species: localPetInfo.species,
        breed: localPetInfo.breed,
        age: localPetInfo.age,
        weight: localPetInfo.weight,
        gender: localPetInfo.gender,
        isNeutered: localPetInfo.isNeutered,
        description: localPetInfo.medicalInfo,
        temperaments: selectedTemperaments,
        allergies: selectedAllergies,
        medications: selectedMedications,
        isVaccinated: localPetInfo.isVaccinated,
        medicalConditions: localPetInfo.medicalConditions,
        specialNotes: localPetInfo.specialNotes,
        photoUri: petInfo?.photoUri,
        hasPhoto: petInfo?.hasPhoto || false,
      };

      await updatePetInfo(petData);
      Alert.alert("저장 완료", "반려동물 정보가 저장되었습니다.");
    } catch (error) {
      Alert.alert("오류", "정보 저장 중 문제가 발생했습니다.");
    }
  };

  return {
    localPetInfo,
    setLocalPetInfo,
    selectedAllergies,
    setSelectedAllergies,
    selectedMedications,
    setSelectedMedications,
    selectedTemperaments,
    setSelectedTemperaments,
    handleSave,
  };
};

