import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PetService, PetInfo } from '../services/PetService';

// PetInfo는 PetService에서 import하므로 중복 정의 제거

interface PetContextType {
  petInfo: PetInfo | null;
  updatePetInfo: (newPetInfo: PetInfo) => Promise<void>;
  refreshPetInfo: (forceRefresh?: boolean) => Promise<void>;
  isLoading: boolean;
}

const PetContext = createContext<PetContextType | undefined>(undefined);

interface PetProviderProps {
  children: ReactNode;
}

export const PetProvider: React.FC<PetProviderProps> = ({ children }) => {
  const [petInfo, setPetInfo] = useState<PetInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  // 반려동물 정보 로드 (useCallback으로 메모이제이션)
  const loadPetInfo = useCallback(async (forceRefresh: boolean = false) => {
    try {
      // 중복 호출 방지: 마지막 호출로부터 3초 이내면 건너뜀
      const now = Date.now();
      if (!forceRefresh && now - lastFetchTime < 3000) {
        console.log('PetContext: Skipping refresh (too soon)', (now - lastFetchTime) / 1000, 'seconds ago');
        return;
      }
      
      setLastFetchTime(now);
      setIsLoading(true);
      console.log('PetContext: Loading pet info...');
      
      // 먼저 로컬에서 로드 (즉시 UI 업데이트)
      const localPetInfo = await PetService.getPetFromLocal();
      if (localPetInfo) {
        setPetInfo(localPetInfo);
        console.log('PetContext: Loaded from local storage');
      }
      
      // 서버에서 최신 정보 가져오기
      try {
        const serverPetInfo = await PetService.getPrimaryPet();
        if (serverPetInfo) {
          setPetInfo(serverPetInfo);
          await PetService.savePetToLocal(serverPetInfo); // 로컬에도 저장
          console.log('PetContext: Loaded from server:', serverPetInfo.name);
        }
      } catch (error) {
        // 서버 연결 실패 시 로컬 데이터 사용
        console.log('PetContext: Server fetch failed, using local data');
      }
    } catch (error) {
      console.error('PetContext: Load failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [lastFetchTime]);

  // 반려동물 정보 업데이트 (useCallback으로 메모이제이션)
  const updatePetInfo = useCallback(async (newPetInfo: PetInfo) => {
    try {
      console.log('PetContext: Updating pet info...');
      
      // 먼저 Context 상태를 즉시 업데이트 (UI 반응성 향상)
      setPetInfo(newPetInfo);
      await PetService.savePetToLocal(newPetInfo);
      
      // 서버에 저장 시도
      try {
        let savedPet: PetInfo;
        if (newPetInfo.id) {
          // 기존 펫 업데이트
          console.log('PetContext: Updating existing pet:', newPetInfo.id);
          savedPet = await PetService.updatePet(newPetInfo.id, newPetInfo);
          console.log('PetContext: Pet updated successfully:', savedPet.name);
        } else {
          // 새 펫 생성
          console.log('PetContext: Creating new pet:', newPetInfo.name);
          savedPet = await PetService.createPet(newPetInfo);
          console.log('PetContext: Pet created successfully with ID:', savedPet.id);
        }
        
        // 서버 저장 성공 시 Context 상태를 서버 데이터로 업데이트
        setPetInfo(savedPet);
        await PetService.savePetToLocal(savedPet);
        
        // 강제로 다시 로드하여 최신 데이터 확보
        setLastFetchTime(0); // 타이머 리셋
        setTimeout(() => loadPetInfo(true), 500); // 0.5초 후 강제 갱신
      } catch (error) {
        // 서버 저장 실패 시 로컬에만 저장 (이미 Context는 업데이트됨)
        console.log('PetContext: Server save failed, using local only:', error);
      }
    } catch (error) {
      console.error('PetContext: Update failed:', error);
    }
  }, [loadPetInfo]);

  // 반려동물 정보 새로고침 (useCallback으로 메모이제이션하여 무한 루프 방지)
  const refreshPetInfo = useCallback(async (forceRefresh: boolean = false) => {
    await loadPetInfo(forceRefresh);
  }, [loadPetInfo]);

  // 최초 로드 (1회만)
  useEffect(() => {
    console.log('PetContext: Initial load');
    loadPetInfo(true);
  }, []); // 빈 배열로 1회만 실행

  const value: PetContextType = {
    petInfo,
    updatePetInfo,
    refreshPetInfo,
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
