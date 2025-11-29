import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProductRecommendation, getProductRecommendations } from '../services/ProductRecommendationService';
import { usePet } from '../contexts/PetContext';
import { homeScreenStyles } from '../styles/HomeScreenStyles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.85;
const CARD_SPACING = 12;

interface RecommendedProductsCarouselProps {
  onProductPress?: (product: ProductRecommendation) => void;
}

export const RecommendedProductsCarousel: React.FC<RecommendedProductsCarouselProps> = ({
  onProductPress,
}) => {
  const { petInfo } = usePet();
  const [recommendations, setRecommendations] = useState<ProductRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadRecommendations();
  }, [petInfo?.id]);

  const loadRecommendations = async () => {
    if (!petInfo?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await getProductRecommendations(parseInt(petInfo.id));
      setRecommendations(data);
    } catch (error) {
      console.error('추천 상품 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / (CARD_WIDTH + CARD_SPACING));
    setCurrentIndex(index);
  };

  const scrollToIndex = (index: number) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: index * (CARD_WIDTH + CARD_SPACING),
        animated: true,
      });
    }
  };

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()}원`;
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let stars = '';

    for (let i = 0; i < fullStars; i++) {
      stars += '★';
    }
    if (hasHalfStar) {
      stars += '☆';
    }

    return stars;
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {petInfo?.name ? `${petInfo.name}을 위한 추천 상품` : '추천 상품'}
          </Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#C59172" />
          <Text style={styles.loadingText}>AI가 맞춤 상품을 추천하고 있어요...</Text>
        </View>
      </View>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="sparkles" size={20} color="#C59172" />
          <Text style={styles.title}>
            {petInfo?.name ? `${petInfo.name}을 위한 추천 상품` : '추천 상품'}
          </Text>
        </View>
        {recommendations.length > 1 && (
          <View style={styles.indicatorContainer}>
            {recommendations.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  index === currentIndex && styles.indicatorActive,
                ]}
              />
            ))}
          </View>
        )}
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        decelerationRate="fast"
      >
        {recommendations.map((product, index) => (
          <TouchableOpacity
            key={product.id}
            style={[styles.card, { width: CARD_WIDTH }]}
            onPress={() => onProductPress?.(product)}
            activeOpacity={0.8}
          >
            <View style={styles.cardContent}>
              <View style={styles.productImageContainer}>
                {product.imageUrl ? (
                  <Image
                    source={{ uri: product.imageUrl }}
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.productImagePlaceholder}>
                    <Ionicons name="cube-outline" size={40} color="#ccc" />
                  </View>
                )}
                <View style={styles.recommendationBadge}>
                  <Ionicons name="star" size={12} color="#fff" />
                  <Text style={styles.recommendationBadgeText}>추천</Text>
                </View>
              </View>

              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>
                  {product.name}
                </Text>
                <View style={styles.ratingContainer}>
                  <Text style={styles.stars}>{renderStars(product.averageRating)}</Text>
                  <Text style={styles.ratingText}>
                    {product.averageRating.toFixed(1)}
                  </Text>
                </View>
                <Text style={styles.price}>{formatPrice(product.price)}</Text>
                <View style={styles.reasonContainer}>
                  <Ionicons name="chatbubble-ellipses" size={14} color="#C59172" />
                  <Text style={styles.reasonText} numberOfLines={2}>
                    {product.reason}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  indicatorContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ddd',
  },
  indicatorActive: {
    backgroundColor: '#C59172',
    width: 20,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingRight: 4,
  },
  card: {
    marginRight: CARD_SPACING,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 16,
  },
  productImageContainer: {
    position: 'relative',
    width: '100%',
    height: 180,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    marginBottom: 12,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  recommendationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C59172',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  recommendationBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  productInfo: {
    gap: 6,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stars: {
    fontSize: 14,
    color: '#FFC107',
  },
  ratingText: {
    fontSize: 13,
    color: '#666',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#C59172',
    marginTop: 4,
  },
  reasonContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 8,
    padding: 10,
    backgroundColor: '#F5E6D3',
    borderRadius: 8,
  },
  reasonText: {
    flex: 1,
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#999',
  },
});

