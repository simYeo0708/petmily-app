import { useEffect } from 'react';
import { ReactNode } from 'react';
import { usePortal } from '../contexts/PortalContext';

export const usePortalModal = (key: string, content: ReactNode, isVisible: boolean) => {
  const { addPortal, removePortal } = usePortal();

  useEffect(() => {
    if (isVisible) {
      // isVisible이 true일 때마다 content 업데이트
      addPortal(key, content);
    } else {
      removePortal(key);
    }

    return () => {
      removePortal(key);
    };
  }, [isVisible, key]);  // content는 제외하되, isVisible이 변경될 때마다 최신 content 전달
  
  // content가 변경될 때도 업데이트
  useEffect(() => {
    if (isVisible) {
      addPortal(key, content);
    }
  }, [content, isVisible, key]);
};

