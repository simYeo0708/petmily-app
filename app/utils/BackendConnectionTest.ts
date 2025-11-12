import { PetService } from '../services/PetService';

export const testBackendConnection = async () => {
  console.log('=== 백엔드 연결 테스트 시작 ===');
  
  try {
    // 1. 기본 펫 정보 조회 테스트
    console.log('1. 기본 펫 정보 조회 테스트...');
    const primaryPet = await PetService.getPrimaryPet();
    console.log('기본 펫 정보:', primaryPet);
    
    // 2. 모든 펫 정보 조회 테스트
    console.log('2. 모든 펫 정보 조회 테스트...');
    const allPets = await PetService.getPets();
    console.log('모든 펫 정보:', allPets);
    
    // 3. 로컬 펫 정보 조회 테스트
    console.log('3. 로컬 펫 정보 조회 테스트...');
    const localPet = await PetService.getPetFromLocal();
    console.log('로컬 펫 정보:', localPet);
    
    console.log('=== 백엔드 연결 테스트 완료 ===');
    return true;
  } catch (error) {
    console.error('=== 백엔드 연결 테스트 실패 ===');
    console.error('오류:', error);
    return false;
  }
};

export const testPetCreation = async () => {
  console.log('=== 펫 생성 테스트 시작 ===');
  
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
    
    console.log('테스트 펫 데이터:', testPetData);
    
    const createdPet = await PetService.createPet(testPetData);
    console.log('생성된 펫:', createdPet);
    
    console.log('=== 펫 생성 테스트 완료 ===');
    return createdPet;
  } catch (error) {
    console.error('=== 펫 생성 테스트 실패 ===');
    console.error('오류:', error);
    return null;
  }
};
