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
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProductRecommendation, getProductRecommendations, getViewHistoryCount } from '../services/ProductRecommendationService';
import { homeScreenStyles } from '../styles/HomeScreenStyles';
import { RootStackParamList } from '../index';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.85;
const CARD_SPACING = 12;

interface RecommendedProductsCarouselProps {
  onProductPress?: (product: ProductRecommendation) => void;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const RecommendedProductsCarousel: React.FC<RecommendedProductsCarouselProps> = ({
  onProductPress,
}) => {
  const navigation = useNavigation<NavigationProp>();
  const [recommendations, setRecommendations] = useState<ProductRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewHistoryCount, setViewHistoryCount] = useState<number | null>(null);
  const [hasEnoughHistory, setHasEnoughHistory] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadRecommendations();
  }, []);

  // 화면이 포커스될 때마다 추천 상품 다시 로드
  useFocusEffect(
    React.useCallback(() => {
      loadRecommendations();
    }, [])
  );

  const loadRecommendations = async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      
      // 1. 조회 이력 개수 확인
      const historyInfo = await getViewHistoryCount();
      if (historyInfo) {
        setViewHistoryCount(historyInfo.count);
        setHasEnoughHistory(historyInfo.hasEnoughHistory);
        
        // 조회 이력이 충분하지 않으면 추천 상품을 불러오지 않음
        if (!historyInfo.hasEnoughHistory) {
          setRecommendations([]);
          setIsLoading(false);
          return;
        }
      }
      
      // 2. 사용자 행동 기반 추천 (구매 이력, 좋아요, 장바구니 활용)
      const data = await getProductRecommendations();
      setRecommendations(data || []);
    } catch (error) {
      setHasError(true);
      setRecommendations([]);
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
          <View style={styles.titleContainer}>
            <Ionicons name="sparkles" size={20} color="#C59172" />
                 <Text style={styles.title}>맞춤 추천 상품</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#C59172" />
          <Text style={styles.loadingText}>AI가 맞춤 상품을 추천하고 있어요...</Text>
        </View>
      </View>
    );
  }


  // 추천 상품이 없는 경우
  if (recommendations.length === 0 && !hasError && !isLoading) {
    // 조회 이력이 부족한 경우
    if (viewHistoryCount !== null && viewHistoryCount < 3) {
      return (
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Ionicons name="sparkles" size={20} color="#C59172" />
              <Text style={styles.title}>맞춤 추천 상품</Text>
            </View>
          </View>
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={48} color="#ccc" />
            <Text style={styles.emptyTitle}>맞춤 추천을 준비 중이에요</Text>
            <Text style={styles.emptyDescription}>
              {viewHistoryCount === 0 
                ? '상품을 둘러보시면\n맞춤 추천 상품을 받아볼 수 있어요'
                : `더 많은 상품을 둘러보시면\n맞춤 추천 상품을 받아볼 수 있어요\n\n(현재 ${viewHistoryCount}개 상품 조회)`}
            </Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => navigation.navigate('Shop', { category: '전체' })}
              activeOpacity={0.7}
            >
              <Ionicons name="storefront-outline" size={18} color="#fff" />
              <Text style={styles.browseButtonText}>상품 둘러보기</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    
    // 조회 이력은 충분하지만 추천 상품이 없는 경우
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Ionicons name="sparkles" size={20} color="#C59172" />
            <Text style={styles.title}>맞춤 추천 상품</Text>
          </View>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="cube-outline" size={48} color="#ccc" />
          <Text style={styles.emptyTitle}>추천된 상품이 없습니다</Text>
          <Text style={styles.emptyDescription}>
            상품을 둘러보고 좋아요를 눌러보시면\n맞춤 추천 상품을 받아볼 수 있어요
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.navigate('Shop', { category: '전체' })}
            activeOpacity={0.7}
          >
            <Ionicons name="storefront-outline" size={18} color="#fff" />
            <Text style={styles.browseButtonText}>상품 둘러보기</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // 에러가 발생한 경우
  if (hasError) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Ionicons name="sparkles" size={20} color="#C59172" />
                 <Text style={styles.title}>맞춤 추천 상품</Text>
          </View>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#ccc" />
          <Text style={styles.emptyTitle}>추천 상품을 불러올 수 없습니다</Text>
          <Text style={styles.emptyDescription}>
            잠시 후 다시 시도해주세요
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.navigate('Shop', { category: '전체' })}
            activeOpacity={0.7}
          >
            <Ionicons name="storefront-outline" size={18} color="#fff" />
            <Text style={styles.browseButtonText}>상품 둘러보기</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Ionicons name="sparkles" size={20} color="#C59172" />
            <Text style={styles.title}>맞춤 추천 상품</Text>
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
        
        {/* 추천 이유 설명 */}
        {hasEnoughHistory && recommendations.length > 0 && (
          <View style={styles.recommendationInfoContainer}>
            <Ionicons name="information-circle-outline" size={16} color="#C59172" />
            <Text style={styles.recommendationInfoText}>
              최근에 본 상품을 기반으로 추천해드려요
            </Text>
          </View>
        )}

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
                
                {/* 알레르기 성분 표시 */}
                {product.allergyIngredients && product.allergyIngredients.length > 0 && (
                  <View style={styles.allergyWarningContainer}>
                    <Ionicons name="warning" size={14} color="#FF6B6B" />
                    <View style={styles.allergyIngredientsContainer}>
                      <Text style={styles.allergyWarningText}>주의: 알레르기 성분 포함 - </Text>
                      {product.allergyIngredients.map((ingredient, idx) => (
                        <Text key={idx} style={styles.allergyIngredient}>
                          {ingredient}
                          {idx < product.allergyIngredients!.length - 1 ? ', ' : ''}
                        </Text>
                      ))}
                    </View>
                  </View>
                )}
                
                {/* 성분 목록 표시 */}
                {product.ingredients && product.ingredients.length > 0 && (
                  <View style={styles.ingredientsContainer}>
                    <Text style={styles.ingredientsTitle}>주요 성분:</Text>
                    <View style={styles.ingredientsList}>
                      {product.ingredients.map((ingredient, idx) => {
                        const isAllergy = product.allergyIngredients?.includes(ingredient);
                        return (
                          <Text
                            key={idx}
                            style={[
                              styles.ingredientText,
                              isAllergy && styles.allergyIngredientText,
                            ]}
                          >
                            {ingredient}
                            {idx < product.ingredients!.length - 1 ? ', ' : ''}
                          </Text>
                        );
                      })}
                    </View>
                  </View>
                )}
                
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
  allergyWarningContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 8,
    padding: 10,
    backgroundColor: '#FFF5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE0E0',
  },
  allergyWarningText: {
    fontSize: 11,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  allergyIngredientsContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  allergyIngredient: {
    fontSize: 11,
    color: '#FF0000',
    fontWeight: '700',
  },
  ingredientsContainer: {
    marginTop: 8,
    padding: 10,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
  },
  ingredientsTitle: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
    marginBottom: 4,
  },
  ingredientsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  ingredientText: {
    fontSize: 11,
    color: '#666',
  },
  allergyIngredientText: {
    color: '#FF0000',
    fontWeight: '700',
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
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    marginHorizontal: 16,
    minHeight: 200,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  browseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C59172',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  recommendationInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    marginBottom: 8,
    paddingVertical: 8,
    backgroundColor: '#FFF9F0',
    borderRadius: 8,
    marginHorizontal: 16,
  },
  recommendationInfoText: {
    fontSize: 12,
    color: '#C59172',
    flex: 1,
  },
});

