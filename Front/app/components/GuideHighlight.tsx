import React from 'react';
import { View, StyleSheet } from 'react-native';

interface GuideHighlightProps {
  children: React.ReactNode;
  isActive: boolean;
}

const GuideHighlight: React.FC<GuideHighlightProps> = ({ children, isActive }) => {
  return (
    <View style={[styles.container, isActive && styles.highlight]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  highlight: {
    borderWidth: 3,
    borderColor: '#4A90E2',
    borderRadius: 16,
    // 그림자, 배경색, transform 모두 제거 - border만 표시
  },
});

export default GuideHighlight;