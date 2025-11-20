import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PetService, PetInfo } from '../services/PetService';

// PetInfo는 PetService에서 import하므로 중복 정의 제거

interface PetContextType {
  petInfo: PetInfo | null; // 현재 선택된 반려동물
  allPets: PetInfo[]; // 모든 반려동물 목록
  updatePetInfo: (newPetInfo: PetInfo) => Promise<void>;
  refreshPetInfo: (forceRefresh?: boolean) => Promise<void>;
  selectPet: (petId: number) => void; // 반려동물 선택
  deletePet: (petId: number) => Promise<void>; // 반려동물 삭제
  isLoading: boolean;
}

const PetContext = createContext<PetContextType | undefined>(undefined);

interface PetProviderProps {
  children: ReactNode;
}

export const PetProvider: React.FC<PetProviderProps> = ({ children }) => {
  const [petInfo, setPetInfo] = useState<PetInfo | null>(null); // 현재 선택된 펫
  const [allPets, setAllPets] = useState<PetInfo[]>([]); // 모든 펫 목록
  const [isLoading, setIsLoading] = useState(true);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  // 반려동물 정보 로드 (useCallback으로 메모이제이션)
  const loadPetInfo = useCallback(async (forceRefresh: boolean = false) => {
    try {
      // 중복 호출 방지: 마지막 호출로부터 3초 이내면 건너뜀
      const now = Date.now();
      if (!forceRefresh && now - lastFetchTime < 3000) {
        return;
      }
      
      setLastFetchTime(now);
      setIsLoading(true);
      
      // 먼저 로컬에서 모든 펫 로드
      const localPetsData = await AsyncStorage.getItem('allPets');
      const selectedPetId = await AsyncStorage.getItem('selectedPetId');
      
      if (localPetsData) {
        const localPets: PetInfo[] = JSON.parse(localPetsData);
        setAllPets(localPets);
        
        // 선택된 펫 설정
        if (selectedPetId) {
          const selected = localPets.find(p => p.id === parseInt(selectedPetId));
          setPetInfo(selected || localPets[0] || null);
        } else if (localPets.length > 0) {
          setPetInfo(localPets[0]);
        }
      }
      
      // 서버에서 최신 정보 가져오기 (Mock 데이터로 대체 가능)
      try {
        const serverPetInfo = await PetService.getPrimaryPet();
        if (serverPetInfo) {
          // 서버에서 가져온 펫을 목록에 추가/업데이트
          setAllPets(prev => {
            const exists = prev.find(p => p.id === serverPetInfo.id);
            if (exists) {
              return prev.map(p => p.id === serverPetInfo.id ? serverPetInfo : p);
            } else {
              return [...prev, serverPetInfo];
            }
          });
          setPetInfo(serverPetInfo);
        }
      } catch (error) {
        // 서버 연결 실패 시 로컬 데이터 사용
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  }, [lastFetchTime]);

  // 반려동물 정보 업데이트 (useCallback으로 메모이제이션)
  const updatePetInfo = useCallback(async (newPetInfo: PetInfo) => {
    try {
      // 먼저 Context 상태를 즉시 업데이트 (UI 반응성 향상)
      setPetInfo(newPetInfo);
      
      // allPets 목록 업데이트
      setAllPets(prev => {
        const exists = prev.find(p => p.id === newPetInfo.id);
        const updated = exists 
          ? prev.map(p => p.id === newPetInfo.id ? newPetInfo : p)
          : [...prev, newPetInfo];
        
        // 로컬에 저장
        AsyncStorage.setItem('allPets', JSON.stringify(updated));
        return updated;
      });
      
      // 선택된 펫 ID 저장
      if (newPetInfo.id) {
        await AsyncStorage.setItem('selectedPetId', newPetInfo.id.toString());
      }
      
      // 서버에 저장 시도
      try {
        let savedPet: PetInfo;
        if (newPetInfo.id) {
          // 기존 펫 업데이트
          savedPet = await PetService.updatePet(newPetInfo.id, newPetInfo);
        } else {
          // 새 펫 생성
          savedPet = await PetService.createPet(newPetInfo);
        }
        
        // 서버 저장 성공 시 Context 상태를 서버 데이터로 업데이트
        setPetInfo(savedPet);
        setAllPets(prev => {
          const updated = prev.map(p => p.id === newPetInfo.id ? savedPet : p);
          AsyncStorage.setItem('allPets', JSON.stringify(updated));
          return updated;
        });
      } catch (error) {
        // 서버 저장 실패 시 로컬에만 저장 (이미 Context는 업데이트됨)
      }
    } catch (error) {
    }
  }, []);

  // 반려동물 정보 새로고침 (useCallback으로 메모이제이션하여 무한 루프 방지)
  const refreshPetInfo = useCallback(async (forceRefresh: boolean = false) => {
    await loadPetInfo(forceRefresh);
  }, [loadPetInfo]);

  // 반려동물 선택
  const selectPet = useCallback((petId: number) => {
    const selected = allPets.find(p => p.id === petId);
    if (selected) {
      setPetInfo(selected);
      AsyncStorage.setItem('selectedPetId', petId.toString());
    }
  }, [allPets]);

  // 반려동물 삭제
  const deletePet = useCallback(async (petId: number) => {
    try {
      // allPets에서 제거
      const updated = allPets.filter(p => p.id !== petId);
      setAllPets(updated);
      await AsyncStorage.setItem('allPets', JSON.stringify(updated));
      
      // 삭제한 펫이 선택된 펫이면 다른 펫 선택
      if (petInfo?.id === petId) {
        if (updated.length > 0) {
          setPetInfo(updated[0]);
          await AsyncStorage.setItem('selectedPetId', updated[0].id!.toString());
        } else {
          setPetInfo(null);
          await AsyncStorage.removeItem('selectedPetId');
        }
      }
      
      // 서버에서도 삭제 시도
      try {
        await PetService.deletePet(petId);
      } catch (error) {
        // 서버 삭제 실패 시 로컬에서만 삭제됨
      }
    } catch (error) {
    }
  }, [allPets, petInfo]);

  // 최초 로드 (1회만)
  useEffect(() => {
    loadPetInfo(true);
  }, []); // 빈 배열로 1회만 실행

  const value: PetContextType = {
    petInfo,
    allPets,
    updatePetInfo,
    refreshPetInfo,
    selectPet,
    deletePet,
    isLoading,
  };

  return (
    <PetContext.Provider value={value}>
      {children}
    </PetContext.Provider>
  );
};

export const usePet = (): PetContextType => {
  const context = useContext(PetContext);
  if (context === undefined) {
    throw new Error('usePet must be used within a PetProvider');
  }
  return context;
};
