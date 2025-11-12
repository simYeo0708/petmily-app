import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../index';

type WalkerDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'WalkerDetail'>;
type WalkerDetailScreenRouteProp = RouteProp<RootStackParamList, 'WalkerDetail'>;

const { width, height } = Dimensions.get('window');

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
}

interface WalkerDetailScreenProps {
  navigation: any;
  route: {
    params: {
      walker: Walker;
      bookingData: {
        timeSlot: string;
        address: string;
      };
    };
  };
}

const WalkerDetailScreen: React.FC<WalkerDetailScreenProps> = ({ navigation, route }) => {
  const { walker, bookingData } = route.params;
  const [isSelected, setIsSelected] = useState(false);

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons key={i} name="star" size={16} color="#FFD700" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Ionicons key="half" name="star-half" size={16} color="#FFD700" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Ionicons key={`empty-${i}`} name="star-outline" size={16} color="#DDD" />
      );
    }

    return stars;
  };

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()}원/시간`;
  };

  const handleSelectWalker = () => {
    setIsSelected(true);
    Alert.alert(
      '워커 선택',
      `${walker.name} 워커를 선택하시겠습니까?`,
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '선택',
          onPress: () => {
            // 예약 확인 화면으로 이동
            navigation.navigate('BookingConfirm', { walker, bookingData });
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: 0 }]}>
      <StatusBar barStyle="light-content" backgroundColor="#C59172" translucent={false} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 배경 이미지 영역 */}
        <View style={styles.backgroundImageContainer}>
          <Image
            source={{ uri: 'https://via.placeholder.com/400x200/4A90E2/FFFFFF?text=Background' }}
            style={styles.backgroundImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)']}
            style={styles.backgroundGradient}
          />
        </View>

        {/* 상단 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* 워커 정보 카드 */}
        <View style={styles.walkerInfoCard}>
          {/* 프로필 이미지 */}
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImageWrapper}>
              <Image
                source={{ uri: walker.profileImage }}
                style={styles.profileImage}
                defaultSource={require('../../assets/images/dog-paw.png')}
              />
            </View>
            {walker.isAvailable && (
              <View style={styles.availableBadge}>
                <Text style={styles.availableText}>사용 가능</Text>
              </View>
            )}
          </View>

          {/* 워커 기본 정보 */}
          <View style={styles.basicInfo}>
            <Text style={styles.walkerName}>{walker.name}</Text>
            <View style={styles.ratingContainer}>
              <View style={styles.starsContainer}>
                {renderStars(walker.rating)}
              </View>
              <Text style={styles.ratingText}>{walker.rating}</Text>
              <Text style={styles.reviewCount}>({walker.reviewCount}개 리뷰)</Text>
            </View>
          </View>

          {/* 상세 정보 */}
          <View style={styles.detailInfo}>
            <View style={styles.infoRow}>
              <Ionicons name="briefcase" size={20} color="#4A90E2" />
              <Text style={styles.infoLabel}>경력</Text>
              <Text style={styles.infoValue}>{walker.experience}</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="location" size={20} color="#4A90E2" />
              <Text style={styles.infoLabel}>활동 지역</Text>
              <Text style={styles.infoValue}>{walker.location}</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="cash" size={20} color="#4A90E2" />
              <Text style={styles.infoLabel}>시간당 요금</Text>
              <Text style={styles.infoValue}>{formatPrice(walker.hourlyRate)}</Text>
            </View>
          </View>

          {/* 소개 */}
          <View style={styles.bioSection}>
            <Text style={styles.bioTitle}>소개</Text>
            <Text style={styles.bioText}>{walker.bio}</Text>
          </View>

          {/* 예약 정보 */}
          <View style={styles.bookingInfoSection}>
            <Text style={styles.bookingInfoTitle}>예약 정보</Text>
            <View style={styles.bookingInfoCard}>
              <View style={styles.bookingInfoRow}>
                <Ionicons name="time" size={16} color="#666" />
                <Text style={styles.bookingInfoLabel}>시간</Text>
                <Text style={styles.bookingInfoValue}>{bookingData.timeSlot}</Text>
              </View>
              <View style={styles.bookingInfoRow}>
                <Ionicons name="location" size={16} color="#666" />
                <Text style={styles.bookingInfoLabel}>장소</Text>
                <Text style={styles.bookingInfoValue}>{bookingData.address}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 하단 고정 버튼 */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          style={styles.selectButton}
          onPress={handleSelectWalker}
        >
          <LinearGradient
            colors={['#4A90E2', '#357ABD']}
            style={styles.selectButtonGradient}
          >
            <Ionicons name="checkmark" size={20} color="#fff" />
            <Text style={styles.selectButtonText}>이 워커 선택하기</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  backgroundImageContainer: {
    height: height * 0.3,
    position: 'relative',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 1,
  },
  backButton: {
    padding: 5,
  },
  walkerInfoCard: {
    backgroundColor: '#fff',
    marginTop: -50,
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  profileImageWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#4A90E2',
    padding: 4,
    backgroundColor: '#fff',
  },
  profileImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  availableBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  availableText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  basicInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  walkerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 4,
  },
  reviewCount: {
    fontSize: 14,
    color: '#666',
  },
  detailInfo: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    marginRight: 12,
    minWidth: 80,
  },
  infoValue: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  bioSection: {
    marginBottom: 20,
  },
  bioTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  bioText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  bookingInfoSection: {
    marginBottom: 20,
  },
  bookingInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  bookingInfoCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  bookingInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bookingInfoLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    marginRight: 12,
    minWidth: 40,
  },
  bookingInfoValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  bottomButtonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  selectButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  selectButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default WalkerDetailScreen;
