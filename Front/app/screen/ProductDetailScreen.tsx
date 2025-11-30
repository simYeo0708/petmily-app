import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Pressable,
  StatusBar,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Product } from "../constants/ProductData";
import { RootStackParamList } from "../index";
import { rf } from "../utils/responsive";
import { useCart } from "../contexts/CartContext";
import { getProductById } from "../services/ProductService";
import { getProductReviews, getReviewSummary, ReviewResponse } from "../services/reviewService";
import { Ionicons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type ProductDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface RouteParams {
  product: Product;
}

type TabType = "detail" | "review" | "inquiry";

const ProductDetailScreen = () => {
  const navigation = useNavigation<ProductDetailScreenNavigationProp>();
  const route = useRoute();
  const { product } = route.params as RouteParams;
  const { addToCart } = useCart();
  
  const [selectedTab, setSelectedTab] = useState<TabType>("detail");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [reviewSummary, setReviewSummary] = useState<{ totalReviews: number; averageRating: number } | null>(null);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // 이미지 갤러리 (실제로는 여러 이미지가 있을 것임)
  const productImages = [product.image, product.image, product.image];

  // 상품 상세 페이지 진입 시 조회 이력 저장
  useEffect(() => {
    const saveViewHistory = async () => {
      try {
        // product.id가 숫자 또는 문자열일 수 있으므로 변환
        const productId = typeof product.id === 'string' ? parseInt(product.id) : product.id;
        if (productId && !isNaN(productId)) {
          // 백엔드 API 호출 (자동으로 조회 이력 저장됨)
          await getProductById(productId);
        }
      } catch (error) {
        // 조회 이력 저장 실패는 무시 (사용자 경험에 영향 없음)
        console.log('조회 이력 저장 실패:', error);
      }
    };

    saveViewHistory();
  }, [product.id]);

  // 리뷰 데이터 로드
  const loadReviews = useCallback(async () => {
    if (selectedTab !== 'review') return;
    
    try {
      setIsLoadingReviews(true);
      const productId = typeof product.id === 'string' ? parseInt(product.id) : product.id;
      if (productId && !isNaN(productId)) {
        try {
          const [reviewsData, summaryData] = await Promise.all([
            getProductReviews(productId, 'latest', 0, 20),
            getReviewSummary(productId).catch(() => null),
          ]);
          
          setReviews(reviewsData.content || []);
          
          if (summaryData) {
            setReviewSummary({
              totalReviews: summaryData.totalReviews,
              averageRating: summaryData.averageRating,
            });
          }
        } catch (error) {
          // 리뷰가 없을 수도 있으므로 에러는 무시
          console.log('리뷰 로드 실패:', error);
        }
      }
    } catch (error) {
      console.log('리뷰 로드 실패:', error);
    } finally {
      setIsLoadingReviews(false);
    }
  }, [product.id, selectedTab]);

  // 리뷰 탭 선택 시 리뷰 데이터 로드
  useEffect(() => {
    if (selectedTab === 'review') {
      loadReviews();
    }
  }, [selectedTab, loadReviews]);

  // 화면 포커스 시 리뷰 새로고침
  useFocusEffect(
    useCallback(() => {
      if (selectedTab === 'review') {
        loadReviews();
      }
    }, [selectedTab, loadReviews])
  );

  const handleAddToCart = () => {
    addToCart(product, quantity);
    Alert.alert(
      "장바구니 추가",
      "상품이 장바구니에 추가되었습니다.",
      [
        { text: "계속 쇼핑하기", style: "cancel" },
        {
          text: "장바구니 보기",
          onPress: () => navigation.navigate("Main", { initialTab: "CartTab" }),
        },
      ]
    );
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigation.navigate("Checkout");
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let stars = "";

    for (let i = 0; i < fullStars; i++) {
      stars += "★";
    }
    if (hasHalfStar) {
      stars += "☆";
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars += "☆";
    }
    return stars;
  };

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()}원`;
  };

  const formatFavoriteCount = (count: number) => {
    if (count >= 10000) {
      const formatted = (count / 10000).toFixed(1);
      return formatted.endsWith('.0') ? `${Math.floor(count / 10000)}만` : `${formatted}만`;
    }
    return count.toLocaleString();
  };

  const calculateDiscountedPrice = () => {
    if (product.originalPrice) {
      return product.originalPrice - product.price;
    }
    return 0;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.headerButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.7}
        >
          <Text style={styles.headerIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>상품 상세</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView ref={scrollViewRef} style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 상품 이미지 갤러리 */}
        <View style={styles.imageGalleryContainer}>
          <FlatList
            horizontal
            pagingEnabled
            data={productImages}
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setCurrentImageIndex(index);
            }}
            renderItem={({ item }) => (
              <View style={styles.imageContainer}>
                {item.startsWith('@') ? (
                  <Image
                    source={
                      item === '@dog_food.png' ? require('../../assets/images/dog_food.png') :
                      item === '@dog_snack.png' ? require('../../assets/images/dog_snack.png') :
                      item === '@cat_food.png' ? require('../../assets/images/cat_food.png') :
                      item === '@cat_snack.png' ? require('../../assets/images/cat_snack.png') :
                      item === '@toy.png' ? require('../../assets/images/toy.png') :
                      item === '@toilet.png' ? require('../../assets/images/toilet.png') :
                      item === '@grooming.png' ? require('../../assets/images/grooming.png') :
                      item === '@clothing.png' ? require('../../assets/images/clothing.png') :
                      item === '@outdoor.png' ? require('../../assets/images/outdoor.png') :
                      item === '@house.png' ? require('../../assets/images/house.png') :
                      item === '@shop.png' ? require('../../assets/images/shop.png') :
                      item === '@walker.png' ? require('../../assets/images/walker.png') :
                      require('../../assets/images/dog_food.png')
                    }
                    style={{ width: 200, height: 200 }}
                    resizeMode="contain"
                  />
                ) : (
                  <Text style={styles.productImage}>{item}</Text>
                )}
              </View>
            )}
            keyExtractor={(item, index) => index.toString()}
          />
          
          {/* 이미지 인디케이터 */}
          <View style={styles.imageIndicatorContainer}>
            {productImages.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.imageIndicator,
                  currentImageIndex === index && styles.imageIndicatorActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* 상품 기본 정보 */}
        <View style={styles.productInfoContainer}>
          <View style={styles.brandContainer}>
            <Text style={styles.brandText}>{product.brand}</Text>
          </View>
          
          <View style={styles.productNameContainer}>
            <Text style={styles.productName}>{product.name}</Text>
            <TouchableOpacity 
              style={styles.favoriteButton}
              onPress={handleToggleFavorite}>
              <Text style={styles.heartIcon}>
                {isFavorite ? "♥️" : "🤍"}
              </Text>
              <Text style={styles.favoriteCount}>{formatFavoriteCount(product.favoriteCount)}</Text>
            </TouchableOpacity>
          </View>
          
          {/* 평점 및 리뷰 */}
          <View style={styles.ratingContainer}>
            <Text style={styles.stars}>{renderStars(product.rating)}</Text>
            <Text style={styles.ratingText}>{product.rating}</Text>
            <Text style={styles.reviewCount}>리뷰 {product.reviewCount.toLocaleString()}개</Text>
          </View>

          {/* 가격 정보 */}
          <View style={styles.priceContainer}>
            {product.discount && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{product.discount}%</Text>
              </View>
            )}
            <Text style={styles.price}>{formatPrice(product.price)}</Text>
          </View>
          
          {product.originalPrice && (
            <View style={styles.originalPriceContainer}>
              <Text style={styles.originalPrice}>{formatPrice(product.originalPrice)}</Text>
              <Text style={styles.savedPrice}>
                {formatPrice(calculateDiscountedPrice())} 할인
              </Text>
            </View>
          )}

          {/* 배송 정보 */}
          <View style={styles.deliveryContainer}>
            <View style={styles.deliveryRow}>
              <Text style={styles.deliveryLabel}>배송</Text>
              <Text style={styles.deliveryText}>무료배송</Text>
            </View>
            <View style={styles.deliveryRow}>
              <Text style={styles.deliveryLabel}>도착</Text>
              <Text style={styles.deliveryText}>내일 도착 예정</Text>
            </View>
          </View>
        </View>

        {/* 탭 메뉴 */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === "detail" && styles.tabActive]}
            onPress={() => setSelectedTab("detail")}>
            <Text style={[styles.tabText, selectedTab === "detail" && styles.tabTextActive]}>
              상품상세
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === "review" && styles.tabActive]}
            onPress={() => setSelectedTab("review")}>
            <Text style={[styles.tabText, selectedTab === "review" && styles.tabTextActive]}>
              리뷰 ({product.reviewCount})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === "inquiry" && styles.tabActive]}
            onPress={() => setSelectedTab("inquiry")}>
            <Text style={[styles.tabText, selectedTab === "inquiry" && styles.tabTextActive]}>
              문의
            </Text>
          </TouchableOpacity>
        </View>

        {/* 탭 컨텐츠 */}
        <View style={styles.tabContent}>
          {selectedTab === "detail" && (
            <View style={styles.detailContent}>
              <Text style={styles.sectionTitle}>상품 설명</Text>
              <Text style={styles.descriptionText}>{product.description}</Text>
              
              <View style={styles.specContainer}>
                <Text style={styles.sectionTitle}>상품 정보</Text>
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>브랜드</Text>
                  <Text style={styles.specValue}>{product.brand}</Text>
                </View>
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>카테고리</Text>
                  <Text style={styles.specValue}>{product.category}</Text>
                </View>
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>상품 코드</Text>
                  <Text style={styles.specValue}>{product.id}</Text>
                </View>
              </View>

              {/* 상품 상세 이미지 영역 */}
              <View style={styles.detailImageContainer}>
                <Text style={styles.detailImagePlaceholder}>
                  📸 상품 상세 이미지
                </Text>
                <Text style={styles.detailImageText}>
                  실제로는 여기에 상세한 제품 설명 이미지들이 표시됩니다.
                </Text>
              </View>
            </View>
          )}

          {selectedTab === "review" && (
            <View style={styles.reviewContent}>
              <View style={styles.reviewSummary}>
                <Text style={styles.reviewSummaryTitle}>구매 만족도</Text>
                <View style={styles.reviewRatingContainer}>
                  <Text style={styles.reviewRatingScore}>
                    {reviewSummary?.averageRating?.toFixed(1) || product.rating.toFixed(1)}
                  </Text>
                  <View>
                    <Text style={styles.reviewStars}>
                      {renderStars(reviewSummary?.averageRating || product.rating)}
                    </Text>
                    <Text style={styles.reviewTotalCount}>
                      총 {(reviewSummary?.totalReviews || product.reviewCount).toLocaleString()}개 리뷰
                    </Text>
                  </View>
                </View>
              </View>

              {/* 리뷰 목록 */}
              {isLoadingReviews ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>리뷰를 불러오는 중...</Text>
                </View>
              ) : reviews.length > 0 ? (
                reviews.map((review) => (
                  <View key={review.id} style={styles.reviewItem}>
                    <View style={styles.reviewHeader}>
                      <View style={styles.reviewAuthorContainer}>
                        {review.userProfileImage ? (
                          <Image
                            source={{ uri: review.userProfileImage }}
                            style={styles.reviewAuthorImage}
                          />
                        ) : (
                          <View style={styles.reviewAuthorImagePlaceholder}>
                            <Ionicons name="person" size={20} color="#999" />
                          </View>
                        )}
                        <View>
                          <Text style={styles.reviewAuthor}>{review.userName}</Text>
                          {review.isVerifiedPurchase && (
                            <View style={styles.verifiedBadge}>
                              <Ionicons name="checkmark-circle" size={12} color="#4CAF50" />
                              <Text style={styles.verifiedText}>구매 인증</Text>
                            </View>
                          )}
                        </View>
                      </View>
                      <Text style={styles.reviewDate}>
                        {new Date(review.createdAt).toLocaleDateString('ko-KR')}
                      </Text>
                    </View>
                    <Text style={styles.reviewStars}>{renderStars(review.rating)}</Text>
                    <Text style={styles.reviewText}>{review.content}</Text>
                    
                    {/* 리뷰 이미지 */}
                    {review.imageUrls && review.imageUrls.length > 0 && (
                      <View style={styles.reviewImagesContainer}>
                        {review.imageUrls.map((imageUrl, idx) => (
                          <Image
                            key={idx}
                            source={{ uri: imageUrl }}
                            style={styles.reviewImage}
                            resizeMode="cover"
                          />
                        ))}
                      </View>
                    )}
                    
                    {/* 도움이 됨 버튼 */}
                    <View style={styles.reviewActions}>
                      <TouchableOpacity style={styles.helpfulButton}>
                        <Ionicons name="thumbs-up-outline" size={16} color="#666" />
                        <Text style={styles.helpfulText}>
                          도움이 됨 {review.helpfulCount > 0 ? review.helpfulCount : ''}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyReviewsContainer}>
                  <Ionicons name="chatbubble-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyReviewsText}>아직 작성된 리뷰가 없습니다.</Text>
                </View>
              )}
            </View>
          )}

          {selectedTab === "inquiry" && (
            <View style={styles.inquiryContent}>
              <Text style={styles.inquiryTitle}>상품 문의</Text>
              <TouchableOpacity style={styles.inquiryButton}>
                <Text style={styles.inquiryButtonText}>문의하기</Text>
              </TouchableOpacity>
              
              <View style={styles.inquiryList}>
                <Text style={styles.inquiryEmptyText}>등록된 문의가 없습니다.</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* 하단 구매 버튼 영역 */}
      <View style={styles.bottomContainer}>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => setQuantity(Math.max(1, quantity - 1))}>
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => setQuantity(quantity + 1)}>
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.cartButton} onPress={handleAddToCart}>
            <Text style={styles.cartButtonText}>장바구니</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buyButton} onPress={handleBuyNow}>
            <Text style={styles.buyButtonText}>구매하기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#fff",
    zIndex: 10,
  },
  headerButton: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  headerIcon: {
    fontSize: rf(20),
  },
  headerTitle: {
    fontSize: rf(16),
    fontWeight: "600",
    color: "#333",
  },
  scrollView: {
    flex: 1,
  },
  imageGalleryContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
    backgroundColor: "#f8f8f8",
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
    justifyContent: "center",
    alignItems: "center",
  },
  productImage: {
    fontSize: rf(120),
  },
  imageIndicatorContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  imageIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  imageIndicatorActive: {
    backgroundColor: "#fff",
  },
  productInfoContainer: {
    padding: 20,
    borderBottomWidth: 8,
    borderBottomColor: "#f8f8f8",
  },
  brandContainer: {
    marginBottom: 8,
  },
  brandText: {
    fontSize: rf(13),
    color: "#666",
    fontWeight: "500",
  },
  productNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  productName: {
    flex: 1,
    fontSize: rf(18),
    fontWeight: "700",
    color: "#333",
    lineHeight: rf(24),
    marginRight: 12,
  },
  favoriteButton: {
    padding: 4,
    alignItems: "center",
  },
  heartIcon: {
    fontSize: rf(28),
  },
  favoriteCount: {
    fontSize: rf(11),
    color: "#666",
    marginTop: -4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  stars: {
    fontSize: rf(14),
    color: "#FFD700",
    marginRight: 6,
  },
  ratingText: {
    fontSize: rf(14),
    fontWeight: "600",
    color: "#333",
    marginRight: 8,
  },
  reviewCount: {
    fontSize: rf(13),
    color: "#666",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  discountBadge: {
    backgroundColor: "#FF4444",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  discountText: {
    color: "#fff",
    fontSize: rf(16),
    fontWeight: "700",
  },
  price: {
    fontSize: rf(24),
    fontWeight: "700",
    color: "#333",
  },
  originalPriceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  originalPrice: {
    fontSize: rf(15),
    color: "#999",
    textDecorationLine: "line-through",
    marginRight: 8,
  },
  savedPrice: {
    fontSize: rf(14),
    color: "#FF4444",
    fontWeight: "600",
  },
  deliveryContainer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  deliveryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  deliveryLabel: {
    fontSize: rf(14),
    color: "#666",
    width: 60,
  },
  deliveryText: {
    fontSize: rf(14),
    color: "#333",
    fontWeight: "500",
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: "#C59172",
  },
  tabText: {
    fontSize: rf(14),
    color: "#666",
    fontWeight: "500",
  },
  tabTextActive: {
    color: "#C59172",
    fontWeight: "700",
  },
  tabContent: {
    backgroundColor: "#fff",
    minHeight: 300,
  },
  detailContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: rf(16),
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: rf(14),
    color: "#555",
    lineHeight: rf(22),
    marginBottom: 24,
  },
  specContainer: {
    marginBottom: 24,
  },
  specRow: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  specLabel: {
    fontSize: rf(14),
    color: "#666",
    width: 100,
  },
  specValue: {
    fontSize: rf(14),
    color: "#333",
    flex: 1,
  },
  detailImageContainer: {
    backgroundColor: "#f8f8f8",
    padding: 40,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  detailImagePlaceholder: {
    fontSize: rf(48),
    marginBottom: 12,
  },
  detailImageText: {
    fontSize: rf(13),
    color: "#666",
    textAlign: "center",
  },
  reviewContent: {
    padding: 20,
  },
  reviewSummary: {
    backgroundColor: "#f8f8f8",
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  reviewSummaryTitle: {
    fontSize: rf(15),
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  reviewRatingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewRatingScore: {
    fontSize: rf(48),
    fontWeight: "700",
    color: "#333",
    marginRight: 16,
  },
  reviewStars: {
    fontSize: rf(16),
    color: "#FFD700",
    marginBottom: 4,
  },
  reviewTotalCount: {
    fontSize: rf(13),
    color: "#666",
  },
  reviewItem: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  reviewAuthor: {
    fontSize: rf(14),
    fontWeight: "600",
    color: "#333",
  },
  reviewDate: {
    fontSize: rf(13),
    color: "#999",
  },
  reviewText: {
    fontSize: rf(14),
    color: "#555",
    lineHeight: rf(20),
    marginTop: 8,
  },
  reviewAuthorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewAuthorImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
  },
  reviewAuthorImagePlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  verifiedText: {
    fontSize: rf(10),
    color: '#4CAF50',
    fontWeight: '500',
  },
  reviewImagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  reviewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  reviewActions: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  helpfulText: {
    fontSize: rf(12),
    color: '#666',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: rf(14),
    color: '#999',
  },
  emptyReviewsContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyReviewsText: {
    fontSize: rf(14),
    color: '#999',
    marginTop: 12,
  },
  inquiryContent: {
    padding: 20,
  },
  inquiryTitle: {
    fontSize: rf(16),
    fontWeight: "700",
    color: "#333",
    marginBottom: 16,
  },
  inquiryButton: {
    backgroundColor: "#C59172",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  inquiryButtonText: {
    color: "#fff",
    fontSize: rf(14),
    fontWeight: "600",
  },
  inquiryList: {
    padding: 40,
    alignItems: "center",
  },
  inquiryEmptyText: {
    fontSize: rf(14),
    color: "#999",
  },
  bottomContainer: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    padding: 16,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityButtonText: {
    fontSize: rf(18),
    fontWeight: "600",
    color: "#333",
  },
  quantityText: {
    fontSize: rf(16),
    fontWeight: "600",
    color: "#333",
    marginHorizontal: 24,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  cartButton: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#C59172",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  cartButtonText: {
    color: "#C59172",
    fontSize: rf(15),
    fontWeight: "700",
  },
  buyButton: {
    flex: 1,
    backgroundColor: "#C59172",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  buyButtonText: {
    color: "#fff",
    fontSize: rf(15),
    fontWeight: "700",
  },
});

export default ProductDetailScreen;

