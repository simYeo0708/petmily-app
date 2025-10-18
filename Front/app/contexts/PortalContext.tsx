import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface PortalContextType {
  portals: Map<string, ReactNode>;
  addPortal: (key: string, content: ReactNode) => void;
  removePortal: (key: string) => void;
}

const PortalContext = createContext<PortalContextType | undefined>(undefined);

export const PortalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [portals, setPortals] = useState<Map<string, ReactNode>>(new Map());

  const addPortal = useCallback((key: string, content: ReactNode) => {
    setPortals((prev) => {
      const newMap = new Map(prev);
      newMap.set(key, content);
      return newMap;
    });
  }, []);

  const removePortal = useCallback((key: string) => {
    setPortals((prev) => {
      const newMap = new Map(prev);
      newMap.delete(key);
      return newMap;
    });
  }, []);

  const contextValue = React.useMemo(
    () => ({ portals, addPortal, removePortal }),
    [portals, addPortal, removePortal]
  );

  return (
    <PortalContext.Provider value={contextValue}>
      {children}
      {/* Portal Host - 모든 portal 렌더링 */}
      {Array.from(portals.entries()).map(([key, content]) => (
        <React.Fragment key={key}>{content}</React.Fragment>
      ))}
    </PortalContext.Provider>
  );
};

export const usePortal = () => {
  const context = useContext(PortalContext);
  if (!context) {
    throw new Error('usePortal must be used within PortalProvider');
  }
  return context;
};

