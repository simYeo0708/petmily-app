import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { IconImage, IconName } from './IconImage';

interface GuideStepModalProps {
  isVisible: boolean;
  title: string;
  description: string;
  onNext: () => void;
  onSkip: () => void;
  currentStep: number;
  totalSteps: number;
  nextButtonText?: string;
  iconName?: IconName;
}

const { width } = Dimensions.get('window');

const GuideStepModal: React.FC<GuideStepModalProps> = ({
  isVisible,
  title,
  description,
  onNext,
  onSkip,
  currentStep,
  totalSteps,
  nextButtonText = "다음",
  iconName,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 100,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, fadeAnim, slideAnim]);

  // 내용 변경 시 부드러운 전환 효과
  useEffect(() => {
    if (isVisible) {
      // 내용 변경 시 약간의 페이드 효과
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.7,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [title, description, currentStep, fadeAnim]);

  if (!isVisible) return null;

  return (
    <View style={styles.overlay}>
      <Animated.View
        style={[
          styles.modal,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            {iconName && (
              <IconImage name={iconName} size={24} style={styles.titleIcon} />
            )}
            <Text style={styles.title}>{title}</Text>
          </View>
          <View style={styles.stepIndicator}>
            <Text style={styles.stepText}>
              {currentStep} / {totalSteps}
            </Text>
          </View>
        </View>
        
        <Text style={styles.description}>{description}</Text>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(currentStep / totalSteps) * 100}%` }
              ]} 
            />
          </View>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={onSkip} style={styles.skipButton}>
            <Text style={styles.skipButtonText}>건너뛰기</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onNext} style={styles.nextButton}>
            <Text style={styles.nextButtonText}>{nextButtonText}</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 9999,
    justifyContent: 'flex-end',
    paddingBottom: 20, // 하단에서 20px 위로 올리기
  },
  modal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 18,
    width: width,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    minHeight: 280,
    maxHeight: 350,
    marginBottom: 0, // 모달 하단에 여백 추가
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  titleIcon: {
    marginRight: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  stepIndicator: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  stepText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 15,
    textAlign: 'center',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4A90E2',
    borderRadius: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    paddingBottom: 10, // 하단 여백 추가
  },
  skipButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    minHeight: 48, // 최소 높이 보장
  },
  skipButtonText: {
    fontSize: 15,
    color: '#666',
    fontWeight: '600',
  },
  nextButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginLeft: 8,
    borderRadius: 12,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    minHeight: 48, // 최소 높이 보장
  },
  nextButtonText: {
    fontSize: 15,
    color: 'white',
    fontWeight: '700',
  },
});

export default GuideStepModal;
