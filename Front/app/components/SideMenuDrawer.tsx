import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import type { RootStackParamList } from '../index';
import type { TabParamList } from '../navigation/TabNavigator';

interface SideMenuDrawerProps {
  isVisible: boolean;
  onClose: () => void;
}

type StackNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type TabNavigationProp = BottomTabNavigationProp<TabParamList>;

const SideMenuDrawer: React.FC<SideMenuDrawerProps> = ({ isVisible, onClose }) => {
  const stackNavigation = useNavigation<StackNavigationProp>();
  const tabNavigation = useNavigation<TabNavigationProp>();
  const slideAnim = useRef(new Animated.Value(-280)).current; // 사이드바 너비만큼 왼쪽으로 시작
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [shouldRender, setShouldRender] = React.useState(false);

  const menuItems = [
    {
      id: 'home',
      title: '홈',
      icon: '🏠',
      onPress: () => {
        tabNavigation.navigate('HomeTab');
        onClose();
      },
    },
    {
      id: 'shop',
      title: '펫몰',
      icon: '🛒',
      onPress: () => {
        tabNavigation.navigate('ShopTab');
        onClose();
      },
    },
    {
      id: 'explore',
      title: '탐색',
      icon: '🔍',
      onPress: () => {
        tabNavigation.navigate('ExploreTab');
        onClose();
      },
    },
    {
      id: 'my',
      title: 'My',
      icon: '👤',
      onPress: () => {
        tabNavigation.navigate('MyTab');
        onClose();
      },
    },
    {
      id: 'myPet',
      title: '내 반려동물',
      icon: '🐾',
      onPress: () => {
        stackNavigation.navigate('MyPet');
        onClose();
      },
    },
    {
      id: 'booking',
      title: '예약 관리',
      icon: '📅',
      onPress: () => {
        stackNavigation.navigate('Booking');
        onClose();
      },
    },
    {
      id: 'cart',
      title: '장바구니',
      icon: '🛍️',
      onPress: () => {
        stackNavigation.navigate('Cart', { cartItems: [], setCart: () => {} });
        onClose();
      },
    },
    {
      id: 'matching',
      title: '매칭',
      icon: '💝',
      onPress: () => {
        stackNavigation.navigate('Matching');
        onClose();
      },
    },
  ];

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      // 사이드바가 열릴 때: 왼쪽에서 오른쪽으로 슬라이드
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (shouldRender) {
      // 사이드바가 닫힐 때: 오른쪽에서 왼쪽으로 슬라이드
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -280,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShouldRender(false);
      });
    }
  }, [isVisible, slideAnim, opacityAnim, shouldRender]);

  if (!shouldRender) return null;

  return (
    <View style={styles.overlay}>
      {/* Background overlay */}
      <Animated.View style={[styles.backgroundOverlay, { opacity: opacityAnim }]}>
        <TouchableOpacity 
          style={{ flex: 1 }} 
          onPress={onClose}
          activeOpacity={1}
        />
      </Animated.View>
      
      {/* Sidebar content */}
      <Animated.View 
        style={[
          styles.sidebarContainer,
          {
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <SafeAreaView style={styles.sidebar}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.logo}>🐾 PetMily</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Menu Items */}
          <ScrollView style={styles.menuContainer}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={item.onPress}
              >
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text style={styles.menuText}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>PetMily v1.0.0</Text>
            <Text style={styles.footerSubText}>반려동물과 함께하는 행복한 시간</Text>
          </View>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    flexDirection: 'row',
  },
  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sidebarContainer: {
    width: 280,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sidebar: {
    flex: 1,
  },
  header: {
    backgroundColor: '#C59172',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  menuContainer: {
    flex: 1,
    paddingTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 15,
    width: 25,
    textAlign: 'center',
  },
  menuText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  footer: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#f8f9fa',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    textAlign: 'center',
  },
  footerSubText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 2,
  },
});

export default SideMenuDrawer;
