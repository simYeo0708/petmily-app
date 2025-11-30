import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface Walker {
  id: string | number;
  name: string;
  rating: number;
  reviewCount: number;
  profileImage?: string;
  bio?: string;
  introduction?: string;
  experience?: string | number;
  hourlyRate: number;
  isAvailable?: boolean;
  location?: string;
  distance?: number;
}

interface WalkerCardProps {
  walker: Walker;
  cardColor: string;
  onPress: () => void;
  style?: any;
}

const WalkerCard: React.FC<WalkerCardProps> = ({ walker, cardColor, onPress, style }) => {
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

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()}원/시간`;
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.card}>
        {/* 프로필 이미지 영역 */}
        <View style={styles.profileImageContainer}>
          <View style={[styles.profileImageWrapper, { borderColor: cardColor }]}>
            {walker.profileImage ? (
              <Image
                source={{ uri: walker.profileImage }}
                style={styles.profileImage}
                defaultSource={require('../../assets/images/dog-paw.png')}
              />
            ) : (
              <View style={[styles.profileImage, { backgroundColor: cardColor, justifyContent: 'center', alignItems: 'center' }]}>
                <Ionicons name="person" size={24} color="#fff" />
              </View>
            )}
          </View>
          {walker.isAvailable !== false && (
            <View style={styles.availableIndicator}>
              <View style={[styles.availableDot, { backgroundColor: '#4CAF50' }]} />
            </View>
          )}
        </View>

        {/* 워커 정보 */}
        <View style={styles.infoContainer}>
          <Text style={styles.walkerName} numberOfLines={1}>
            {walker.name}
          </Text>
          
          {/* 별점과 리뷰 */}
          <View style={styles.ratingContainer}>
            <View style={styles.starsContainer}>
              {renderStars(walker.rating)}
            </View>
            <Text style={styles.ratingText}>{walker.rating}</Text>
            <Text style={styles.reviewCount}>({walker.reviewCount})</Text>
          </View>

          {/* 경력 정보 */}
          {(walker.experience || walker.experience === 0) && (
            <Text style={styles.experience} numberOfLines={1}>
              {typeof walker.experience === 'number' ? `${walker.experience}년` : walker.experience}
            </Text>
          )}

          {/* 위치 정보 */}
          {(walker.location || walker.distance !== undefined) && (
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={10} color="#666" />
              <Text style={styles.location} numberOfLines={1}>
                {walker.distance !== undefined 
                  ? `${walker.distance.toFixed(1)}km`
                  : walker.location || '위치 정보 없음'}
              </Text>
            </View>
          )}

          {/* 가격 정보 */}
          <Text style={styles.price} numberOfLines={1}>
            {formatPrice(walker.hourlyRate)}
          </Text>
        </View>

        {/* 선택 버튼 */}
        <View style={styles.selectButtonContainer}>
          <LinearGradient
            colors={[cardColor, `${cardColor}CC`]}
            style={styles.selectButton}
          >
            <Text style={styles.selectButtonText}>선택</Text>
          </LinearGradient>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 200,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  profileImageWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    padding: 2,
    backgroundColor: '#fff',
  },
  profileImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  availableIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  availableDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  infoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  walkerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
    textAlign: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 2,
  },
  reviewCount: {
    fontSize: 10,
    color: '#666',
  },
  experience: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    textAlign: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  location: {
    fontSize: 10,
    color: '#666',
    marginLeft: 2,
  },
  price: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4A90E2',
    textAlign: 'center',
  },
  selectButtonContainer: {
    marginTop: 8,
  },
  selectButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default WalkerCard;
