import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../index';
import WalkerService from '../services/WalkerService';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.65; // 화면 너비의 65%
const CARD_SPACING = 16;

type WalkerPreviewSliderNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Walker {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  profileImage: string;
  bio: string;
  experience: string;
  hourlyRate: number;
  isAvailable: boolean;
  location: string;
  distance?: number;
  specialties?: string[];
}

interface WalkerPreviewSliderProps {
  onWalkerPress?: (walker: Walker) => void;
}

export const WalkerPreviewSlider: React.FC<WalkerPreviewSliderProps> = ({ onWalkerPress }) => {
  const navigation = useNavigation<WalkerPreviewSliderNavigationProp>();
  const [walkers, setWalkers] = useState<Walker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    loadWalkers();
  }, []);

  const loadWalkers = async () => {
    try {
      setIsLoading(true);
      const walkerList = await WalkerService.getAllWalkers();
      // 샘플 워커 데이터가 부족하면 더미 데이터 추가
      if (walkerList.length < 6) {
        const dummyWalkers: Walker[] = [
          {
            id: 'dummy1',
            name: '김워커',
            rating: 4.8,
            reviewCount: 48,
            profileImage: '',
            bio: '안녕하세요! 3년 경력의 워커입니다.',
            experience: '3년',
            hourlyRate: 15000,
            isAvailable: true,
            location: '서울시 강남구',
            distance: 1.2,
            specialties: ['대형견', '산책 훈련'],
          },
          {
            id: 'dummy2',
            name: '이워커',
            rating: 4.9,
            reviewCount: 95,
            profileImage: '',
            bio: '사랑으로 돌보겠습니다!',
            experience: '5년',
            hourlyRate: 20000,
            isAvailable: true,
            location: '서울시 서초구',
            distance: 0.8,
            specialties: ['소형견', '노견 케어'],
          },
          {
            id: 'dummy3',
            name: '박워커',
            rating: 4.7,
            reviewCount: 32,
            profileImage: '',
            bio: '반려동물 전문 케어 서비스',
            experience: '2년',
            hourlyRate: 18000,
            isAvailable: true,
            location: '서울시 송파구',
            distance: 2.1,
            specialties: ['중형견', '산책'],
          },
          {
            id: 'dummy4',
            name: '최워커',
            rating: 5.0,
            reviewCount: 127,
            profileImage: '',
            bio: '10년 경력의 베테랑 워커',
            experience: '10년',
            hourlyRate: 25000,
            isAvailable: true,
            location: '서울시 강동구',
            distance: 1.5,
            specialties: ['대형견', '훈련', '케어'],
          },
          {
            id: 'dummy5',
            name: '정워커',
            rating: 4.6,
            reviewCount: 28,
            profileImage: '',
            bio: '친절하고 책임감 있는 워커',
            experience: '1년',
            hourlyRate: 16000,
            isAvailable: true,
            location: '서울시 마포구',
            distance: 0.5,
            specialties: ['소형견', '산책'],
          },
          {
            id: 'dummy6',
            name: '강워커',
            rating: 4.9,
            reviewCount: 78,
            profileImage: '',
            bio: '반려동물과 함께하는 즐거운 시간',
            experience: '4년',
            hourlyRate: 19000,
            isAvailable: true,
            location: '서울시 용산구',
            distance: 1.8,
            specialties: ['중형견', '산책', '케어'],
          },
        ];
        setWalkers([...walkerList, ...dummyWalkers].slice(0, 6));
      } else {
        setWalkers(walkerList.slice(0, 6)); // 최대 6개 표시 (2열 x 3행)
      }
    } catch (error) {
      // 에러 시 샘플 데이터 표시
      const sampleWalkers: Walker[] = [
        {
          id: 'sample1',
          name: '김워커',
          rating: 4.8,
          reviewCount: 48,
          profileImage: '',
          bio: '안녕하세요! 3년 경력의 워커입니다.',
          experience: '3년',
          hourlyRate: 15000,
          isAvailable: true,
          location: '서울시 강남구',
          distance: 1.2,
          specialties: ['대형견', '산책 훈련'],
        },
        {
          id: 'sample2',
          name: '이워커',
          rating: 4.9,
          reviewCount: 95,
          profileImage: '',
          bio: '사랑으로 돌보겠습니다!',
          experience: '5년',
          hourlyRate: 20000,
          isAvailable: true,
          location: '서울시 서초구',
          distance: 0.8,
          specialties: ['소형견', '노견 케어'],
        },
        {
          id: 'sample3',
          name: '박워커',
          rating: 4.7,
          reviewCount: 32,
          profileImage: '',
          bio: '반려동물 전문 케어 서비스',
          experience: '2년',
          hourlyRate: 18000,
          isAvailable: true,
          location: '서울시 송파구',
          distance: 2.1,
          specialties: ['중형견', '산책'],
        },
        {
          id: 'sample4',
          name: '최워커',
          rating: 5.0,
          reviewCount: 127,
          profileImage: '',
          bio: '10년 경력의 베테랑 워커',
          experience: '10년',
          hourlyRate: 25000,
          isAvailable: true,
          location: '서울시 강동구',
          distance: 1.5,
          specialties: ['대형견', '훈련', '케어'],
        },
        {
          id: 'sample5',
          name: '정워커',
          rating: 4.6,
          reviewCount: 28,
          profileImage: '',
          bio: '친절하고 책임감 있는 워커',
          experience: '1년',
          hourlyRate: 16000,
          isAvailable: true,
          location: '서울시 마포구',
          distance: 0.5,
          specialties: ['소형견', '산책'],
        },
        {
          id: 'sample6',
          name: '강워커',
          rating: 4.9,
          reviewCount: 78,
          profileImage: '',
          bio: '반려동물과 함께하는 즐거운 시간',
          experience: '4년',
          hourlyRate: 19000,
          isAvailable: true,
          location: '서울시 용산구',
          distance: 1.8,
          specialties: ['중형견', '산책', '케어'],
        },
      ];
      setWalkers(sampleWalkers);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / (CARD_WIDTH + CARD_SPACING));
    setCurrentIndex(index);
  };

  const handleWalkerPress = (walker: Walker) => {
    if (onWalkerPress) {
      onWalkerPress(walker);
    } else {
      // 기본 동작: 워커 상세 페이지로 이동
      navigation.navigate('WalkerDetail', {
        walker: walker,
        bookingData: {
          timeSlot: '',
          address: '',
        },
      });
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons key={i} name="star" size={12} color="#FFD700" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Ionicons key="half" name="star-half" size={12} color="#FFD700" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Ionicons key={`empty-${i}`} name="star-outline" size={12} color="#DDD" />
      );
    }

    return stars;
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>우리 동네 워커</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>로딩 중...</Text>
        </View>
      </View>
    );
  }

  if (walkers.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>우리 동네 워커</Text>
        <TouchableOpacity
          onPress={() => {
            // 전체 워커 목록으로 이동 (필요시 구현)
          }}
        >
          <Text style={styles.moreText}>더보기</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        decelerationRate="fast"
        pagingEnabled={false}
      >
        {walkers.map((walker, index) => (
          <TouchableOpacity
            key={walker.id}
            style={styles.card}
            onPress={() => handleWalkerPress(walker)}
            activeOpacity={0.8}
          >
            <View style={styles.cardContent}>
              {/* 프로필 이미지 */}
              <View style={styles.profileImageContainer}>
                {walker.name !== 'asdf' ? (
                  <Image
                    source={require('../../assets/images/user1.png')}
                    style={styles.profileImage}
                  />
                ) : walker.profileImage ? (
                  <Image
                    source={{ uri: walker.profileImage }}
                    style={styles.profileImage}
                  />
                ) : (
                  <View style={styles.profileImagePlaceholder}>
                    <Ionicons name="camera" size={32} color="#999" />
                    <Text style={styles.photoPlaceholderText}>사진 추가</Text>
                  </View>
                )}
                {walker.isAvailable && (
                  <View style={styles.availableBadge}>
                    <View style={styles.availableDot} />
                  </View>
                )}
              </View>

              {/* 워커 정보 */}
              <View style={styles.walkerInfo}>
                <Text style={styles.walkerName} numberOfLines={1}>
                  {walker.name}
                </Text>
                
                <View style={styles.ratingContainer}>
                  {renderStars(walker.rating)}
                  <Text style={styles.ratingText}>
                    {walker.rating.toFixed(1)} ({walker.reviewCount})
                  </Text>
                </View>

                <Text style={styles.experience} numberOfLines={1}>
                  경력 {walker.experience}
                </Text>

                {walker.distance !== undefined && (
                  <Text style={styles.distance} numberOfLines={1}>
                    {walker.distance.toFixed(1)}km
                  </Text>
                )}

                <Text style={styles.hourlyRate} numberOfLines={1}>
                  {walker.hourlyRate.toLocaleString()}원/시간
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 인디케이터 */}
      {walkers.length > 1 && (
        <View style={styles.indicatorContainer}>
          {walkers.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                currentIndex === index && styles.indicatorActive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  moreText: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  card: {
    width: CARD_WIDTH,
    marginRight: CARD_SPACING,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  cardContent: {
    padding: 16,
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 12,
    alignSelf: 'center',
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#f0f0f0',
  },
  profileImagePlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D0D0D0',
  },
  photoPlaceholderText: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
    marginTop: 4,
  },
  availableBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  availableDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
  },
  walkerInfo: {
    alignItems: 'center',
    width: '100%',
  },
  walkerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    justifyContent: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  experience: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  distance: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  hourlyRate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90E2',
    marginTop: 4,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ddd',
  },
  indicatorActive: {
    width: 20,
    backgroundColor: '#4A90E2',
  },
});

