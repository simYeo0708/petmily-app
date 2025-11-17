import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';

interface GuideOverlayProps {
  isVisible: boolean;
  highlightRef: React.RefObject<View | null>;
  children: React.ReactNode;
  currentStep: number;
}

const GuideOverlay: React.FC<GuideOverlayProps> = ({
  isVisible,
  highlightRef,
  children,
  currentStep,
}) => {
  const [highlightPosition, setHighlightPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });

  useEffect(() => {
    if (isVisible && highlightRef.current) {
      // 하이라이트 영역 위치 측정 (offset 조정 없이 원본 그대로)
      highlightRef.current.measure((x, y, width, height, pageX, pageY) => {
        // offset 설정 제거 - 원본 위치 그대로 사용
        setHighlightPosition({ 
          x: pageX, 
          y: pageY, 
          width, 
          height 
        });
      });
    }
  }, [isVisible, currentStep, highlightRef]);

  if (!isVisible) return <>{children}</>;

  return (
    <View style={styles.container}>
      {children}
      
      {/* 하이라이트 박스만 표시 (블러 없음, offset 없음) */}
      {highlightPosition.width > 0 && highlightPosition.height > 0 && (
        <View
          style={[
            styles.highlightBox,
            {
              top: highlightPosition.y,
              left: highlightPosition.x,
              width: highlightPosition.width,
              height: highlightPosition.height,
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  highlightBox: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: '#4A90E2',
    borderRadius: 20,
    zIndex: 1,
    backgroundColor: 'transparent',
    // 그림자, elevation 제거 - border만 표시
  },
});

export default GuideOverlay;