import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
} from 'react-native';

interface GuideTooltipProps {
  isVisible: boolean;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  onNext: () => void;
  onSkip: () => void;
  onClose: () => void;
  currentStep: number;
  totalSteps: number;
  nextButtonText: string;
  skipButtonText: string;
}

const { width, height } = Dimensions.get('window');

const GuideTooltip: React.FC<GuideTooltipProps> = ({
  isVisible,
  title,
  description,
  position,
  onNext,
  onSkip,
  onClose,
  currentStep,
  totalSteps,
  nextButtonText,
  skipButtonText,
}) => {
  if (!isVisible) return null;

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={[styles.tooltip, getTooltipPosition(position)]}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
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
            <Text style={styles.progressText}>
              {currentStep} / {totalSteps}
            </Text>
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={onSkip} style={styles.skipButton}>
              <Text style={styles.skipButtonText}>{skipButtonText}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onNext} style={styles.nextButton}>
              <Text style={styles.nextButtonText}>{nextButtonText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const getTooltipPosition = (position: string) => {
  switch (position) {
    case 'top':
      return { top: 100 };
    case 'bottom':
      return { bottom: 0 };
    case 'left':
      return { left: 20 };
    case 'right':
      return { right: 20 };
    default:
      return { bottom: 0 };
  }
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tooltip: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    margin: 0,
    width: width,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 14,
    color: '#666',
  },
  description: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 20,
    textAlign: 'center',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#C59172',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  skipButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  nextButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#C59172',
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
});

export default GuideTooltip;