import React, { createContext, useContext, useState, useCallback } from 'react';

interface GuideContextType {
  isGuideActive: boolean;
  currentGuideStep: number;
  setGuideActive: (active: boolean) => void;
  setGuideStep: (step: number) => void;
}

const GuideContext = createContext<GuideContextType | undefined>(undefined);

export const GuideProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isGuideActive, setIsGuideActive] = useState(false);
  const [currentGuideStep, setCurrentGuideStep] = useState(0);

  const setGuideActive = useCallback((active: boolean) => {
    setIsGuideActive(active);
  }, []);

  const setGuideStep = useCallback((step: number) => {
    setCurrentGuideStep(step);
  }, []);

  return (
    <GuideContext.Provider
      value={{
        isGuideActive,
        currentGuideStep,
        setGuideActive,
        setGuideStep,
      }}>
      {children}
    </GuideContext.Provider>
  );
};

export const useGuideContext = () => {
  const context = useContext(GuideContext);
  if (context === undefined) {
    throw new Error('useGuideContext must be used within a GuideProvider');
  }
  return context;
};


