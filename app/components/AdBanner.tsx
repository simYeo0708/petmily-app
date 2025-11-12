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

const { width } = Dimensions.get('window');
const BANNER_WIDTH = width; // 화면 전체 너비
const CARD_WIDTH = width - 32; // 카드를 화면 전체 너비로 설정
const AUTO_SCROLL_INTERVAL = 4000; // 4초마다 자동 넘김

interface AdData {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  colors: [string, string];
}

const adData: AdData[] = [
  {
    id: '1',
    title: '🎉 신규 회원 할인',
    subtitle: '첫 구매 시 15% 할인 혜택!',
    icon: 'gift',
    colors: ['#FF6B9D', '#C44569'],
  },
  {
    id: '2',
    title: '🐾 펫 워커 서비스',
    subtitle: '전문 워커와 안전한 산책',
    icon: 'walk',
    colors: ['#4FACFE', '#00F2FE'],
  },
  {
    id: '3',
    title: '🛍️ 프리미엄 사료 특가',
    subtitle: '건강한 먹거리를 특별가에',
    icon: 'nutrition',
    colors: ['#43E97B', '#38F9D7'],
  },
  {
    id: '4',
    title: '💊 건강 검진 이벤트',
    subtitle: '반려동물 건강 체크업 30% 할인',
    icon: 'medical',
    colors: ['#FA709A', '#FEE140'],
  },
];

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
              onPress={() => console.log('Ad clicked:', ad.title)}>
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
                
                {/* 페이지 인디케이터 - 카드 안에 위치 */}
                <View style={styles.paginationInCard}>
                  {adData.map((_, dotIndex) => (
                    <View
                      key={dotIndex}
                      style={[
                        styles.paginationDot,
                        dotIndex === index && styles.paginationDotActive,
                      ]}
                    />
                  ))}
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
    marginTop: 0,
  },
  scrollContent: {
    paddingHorizontal: 0,
  },
  slideContainer: {
    width: BANNER_WIDTH,
    paddingHorizontal: 0,
  },
  adCard: {
    width: CARD_WIDTH,
    height: hp(110),
    borderRadius: 15,
    padding: wp(18),
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
    position: 'relative',
  },
  paginationInCard: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
  paginationDot: {
    width: wp(6),
    height: wp(6),
    borderRadius: wp(3),
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: wp(3),
  },
  paginationDotActive: {
    width: wp(18),
    height: wp(6),
    borderRadius: wp(3),
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
});

export default AdBanner;

