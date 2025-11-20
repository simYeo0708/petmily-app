import { PetService } from '../services/PetService';

export const testBackendConnection = async () => {
  
  try {
    // 1. 기본 펫 정보 조회 테스트
    const primaryPet = await PetService.getPrimaryPet();
    
    // 2. 모든 펫 정보 조회 테스트
    const allPets = await PetService.getPets();
    
    // 3. 로컬 펫 정보 조회 테스트
    const localPet = await PetService.getPetFromLocal();
    
    return true;
  } catch (error) {
    return false;
  }
};

export const testPetCreation = async () => {
  
  try {
    const testPetData = {
      name: '테스트 강아지',
      species: 'dog',
      breed: '골든리트리버',
      age: '3',
      weight: '25.5',
      gender: 'male',
      isNeutered: true,
      description: '테스트용 반려동물입니다.',
      photoUri: 'https://via.placeholder.com/200',
      hasPhoto: true,
      temperaments: ['온순함', '활발함']
    };
    
    
    const createdPet = await PetService.createPet(testPetData);
    
    return createdPet;
  } catch (error) {
    return null;
  }
};
