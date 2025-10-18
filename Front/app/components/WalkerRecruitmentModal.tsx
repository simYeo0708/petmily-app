import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Modal,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NotificationService, { Notification, DismissNotificationRequest } from '../services/NotificationService';

const { width, height } = Dimensions.get('window');

interface WalkerRecruitmentModalProps {
  visible: boolean;
  onClose: () => void;
  onDismiss?: () => void;
}

const WalkerRecruitmentModal: React.FC<WalkerRecruitmentModalProps> = ({ 
  visible, 
  onClose, 
  onDismiss 
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentNotificationIndex, setCurrentNotificationIndex] = useState(0);
  const [slideAnimation] = useState(new Animated.Value(0));
  const [fadeAnimation] = useState(new Animated.Value(0));
  const [scaleAnimation] = useState(new Animated.Value(0.8));

  useEffect(() => {
    if (visible) {
      loadNotifications();
      startAnimations();
    }
  }, [visible]);

  useEffect(() => {
    if (notifications.length > 0) {
      startSlideAnimation();
    }
  }, [notifications]);

  const loadNotifications = async () => {
    try {
      const notificationService = NotificationService.getInstance();
      const activeNotifications = await notificationService.getActiveNotifications();
      setNotifications(activeNotifications);
    } catch (error) {
      console.error('알림 로드 실패:', error);
    }
  };

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnimation, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const startSlideAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(slideAnimation, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnimation, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleDismiss = async (dismissType: 'never' | 'week') => {
    if (notifications.length === 0) return;

    const currentNotification = notifications[currentNotificationIndex];
    
    try {
      const notificationService = NotificationService.getInstance();
      const request: DismissNotificationRequest = {
        notificationId: currentNotification.id,
        dismissType: dismissType === 'never' ? 'never' : 'week',
      };

      const success = await notificationService.dismissNotification(request);
      
      if (success) {
        // 다음 알림으로 이동하거나 모달 닫기
        if (currentNotificationIndex < notifications.length - 1) {
          setCurrentNotificationIndex(prev => prev + 1);
        } else {
          handleClose();
        }
      }
    } catch (error) {
      console.error('알림 숨기기 실패:', error);
    }
  };

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnimation, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
      onDismiss?.();
    });
  };

  const handleAction = () => {
    // TODO: 워커 등록 화면으로 이동
    console.log('워커 등록 화면으로 이동');
    handleClose();
  };

  if (!visible || notifications.length === 0) {
    return null;
  }

  const currentNotification = notifications[currentNotificationIndex];
  const isLastNotification = currentNotificationIndex === notifications.length - 1;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
    >
      <Animated.View 
        style={[
          styles.overlay,
          {
            opacity: fadeAnimation,
          },
        ]}
      >
        <TouchableOpacity 
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />
        
        <Animated.View 
          style={[
            styles.modalContainer,
            {
              opacity: fadeAnimation,
              transform: [
                { scale: scaleAnimation },
                {
                  translateY: slideAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 5],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.modalContent}>
            {/* 헤더 */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Ionicons name="paw" size={24} color="#C59172" />
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* 내용 */}
            <View style={styles.content}>
              <Text style={styles.title}>{currentNotification.title}</Text>
              <Text style={styles.description}>{currentNotification.content}</Text>
            </View>

            {/* 액션 버튼들 */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleAction}
              >
                <Ionicons name="person-add" size={20} color="white" />
                <Text style={styles.primaryButtonText}>워커 등록하기</Text>
              </TouchableOpacity>
            </View>

            {/* 하단 옵션 */}
            <View style={styles.bottomOptions}>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => handleDismiss('week')}
              >
                <Ionicons name="time" size={16} color="#C59172" />
                <Text style={styles.optionText}>일주일 동안 보지 않기</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => handleDismiss('never')}
              >
                <Ionicons name="eye-off" size={16} color="#C59172" />
                <Text style={styles.optionText}>다시 보지 않기</Text>
              </TouchableOpacity>
            </View>

            {/* 인디케이터 */}
            {notifications.length > 1 && (
              <View style={styles.indicator}>
                {notifications.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      index === currentNotificationIndex && styles.activeDot,
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    width: width * 0.9,
    maxWidth: 400,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(197, 145, 114, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    textAlign: 'center',
  },
  actions: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#C59172',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: '#C59172',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  bottomOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  optionText: {
    fontSize: 14,
    color: '#C59172',
    marginLeft: 6,
    fontWeight: '500',
  },
  indicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(197, 145, 114, 0.3)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#C59172',
  },
});

export default WalkerRecruitmentModal;

