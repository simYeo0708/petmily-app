import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { rf, wp, hp } from '../utils/responsive';
import { ADVERTISEMENTS, type Advertisement } from '../data';

const { width, height } = Dimensions.get('window');
const BANNER_WIDTH = width;
const CARD_WIDTH = width;
const CARD_HEIGHT = Math.min(height * 0.24, 220);
const AUTO_SCROLL_INTERVAL = 4000; // 4초마다 자동 넘김

const adData: Advertisement[] = ADVERTISEMENTS;

const AdBanner: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const autoScrollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // 자동 스크롤 함수
  const autoScroll = () => {
    const nextIndex = (currentIndex + 1) % adData.length;
    setCurrentIndex(nextIndex);
    
    scrollViewRef.current?.scrollTo({
      x: nextIndex * BANNER_WIDTH,
      animated: true,
    });
  };

  // 자동 스크롤 타이머 시작
  useEffect(() => {
    autoScrollTimer.current = setInterval(autoScroll, AUTO_SCROLL_INTERVAL);
    
    return () => {
      if (autoScrollTimer.current) {
        clearInterval(autoScrollTimer.current);
      }
    };
  }, [currentIndex]);

  // 수동 스크롤 시 현재 인덱스 업데이트
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / BANNER_WIDTH);
    
    if (index !== currentIndex) {
      setCurrentIndex(index);
      
      // 수동 스크롤 시 타이머 리셋
      if (autoScrollTimer.current) {
        clearInterval(autoScrollTimer.current);
      }
      autoScrollTimer.current = setInterval(autoScroll, AUTO_SCROLL_INTERVAL);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={BANNER_WIDTH}
        snapToAlignment="start"
        contentContainerStyle={styles.scrollContent}>
        {adData.map((ad, index) => (
          <View key={ad.id} style={styles.slideContainer}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => {}}>
              <LinearGradient
                colors={ad.colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.adCard}>
                <View style={styles.iconContainer}>
                  <Ionicons name={ad.icon} size={32} color="white" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.adTitle}>{ad.title}</Text>
                  <Text style={styles.adSubtitle}>{ad.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* 페이지 인디케이터 */}
      <View style={styles.paginationContainer}>
        <View style={styles.pagination}>
        {adData.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === currentIndex && styles.paginationDotActive,
            ]}
          />
        ))}
      </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 0,
    marginBottom: 0,
  },
  paginationContainer: {
    position: 'absolute',
    top: hp(12),
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  scrollContent: {
    paddingHorizontal: 0,
  },
  slideContainer: {
    width: BANNER_WIDTH,
  },
  adCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 0,
    padding: wp(18),
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  iconContainer: {
    width: wp(50),
    height: wp(50),
    borderRadius: wp(25),
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(15),
  },
  textContainer: {
    flex: 1,
  },
  adTitle: {
    fontSize: rf(18),
    fontWeight: 'bold',
    color: 'white',
    marginBottom: hp(4),
  },
  adSubtitle: {
    fontSize: rf(13),
    color: 'rgba(255, 255, 255, 0.9)',
  },
  pagination: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 999,
    paddingHorizontal: wp(12),
    paddingVertical: hp(4),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paginationDot: {
    width: wp(6),
    height: wp(6),
    borderRadius: wp(3),
    backgroundColor: '#D0D0D0',
    marginHorizontal: wp(4),
  },
  paginationDotActive: {
    width: wp(20),
    height: wp(6),
    borderRadius: wp(3),
    backgroundColor: '#C59172',
  },
});

export default AdBanner;

