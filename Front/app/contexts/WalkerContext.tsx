import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import WalkerService from '../services/WalkerService';

interface WalkerContextType {
  isWalker: boolean;
  isLoading: boolean;
  refreshWalkerStatus: () => Promise<void>;
}

const WalkerContext = createContext<WalkerContextType | undefined>(undefined);

export const WalkerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isWalker, setIsWalker] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkWalkerStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      const walker = await WalkerService.getCurrentWalker();
      setIsWalker(walker !== null);
    } catch (error) {
      // 에러 발생 시 워커가 아닌 것으로 처리
      setIsWalker(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 초기 로드
  useEffect(() => {
    checkWalkerStatus();
  }, [checkWalkerStatus]);

  return (
    <WalkerContext.Provider
      value={{
        isWalker,
        isLoading,
        refreshWalkerStatus: checkWalkerStatus,
      }}
    >
      {children}
    </WalkerContext.Provider>
  );
};

export const useWalker = () => {
  const context = useContext(WalkerContext);
  if (context === undefined) {
    throw new Error('useWalker must be used within a WalkerProvider');
  }
  return context;
};

