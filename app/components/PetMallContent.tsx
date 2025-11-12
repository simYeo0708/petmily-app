import React from "react";
import { Text, TouchableOpacity, View, StyleSheet, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ModeConfig } from "../constants/ServiceModes";
import { homeScreenStyles } from "../styles/HomeScreenStyles";
import { CardBox } from "./CardBox";
import { CategoryList } from "./CategoryList";
import { RootStackParamList } from "../index";
import { ORDER_DATA, getOrderStatusText, getOrderStatusColor } from "../constants/OrderData";
import { rf } from "../utils/responsive";
import { PRODUCT_DATA, Product } from "../constants/ProductData";

interface PetMallContentProps {
  currentMode: ModeConfig;
  onCategoryPress?: (category: string) => void;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const PetMallContent: React.FC<PetMallContentProps> = ({
  currentMode,
  onCategoryPress,
}) => {
  const navigation = useNavigation<NavigationProp>();

  // 진행중인 주문 (배송중, 준비중, 결제완료)
  const ongoingOrders = ORDER_DATA.filter((order) => 
    order.status === "shipping" || 
    order.status === "preparing" || 
    order.status === "payment_complete"
  );

  // 추천순(favoriteCount) 상위 5개 상품 가져오기
  const topProducts = [...PRODUCT_DATA]
    .sort((a, b) => b.favoriteCount - a.favoriteCount)
    .slice(0, 5);

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()}원`;
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

    return stars;
  };

  return (
    <>
      <View style={homeScreenStyles.section}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 15,
          }}>
          <Text style={homeScreenStyles.sectionTitle}>카테고리별 쇼핑</Text>
          <TouchableOpacity
            style={{
              backgroundColor: "rgba(197, 145, 114, 0.1)",
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "rgba(197, 145, 114, 0.3)",
            }}
            onPress={() => onCategoryPress?.("전체")}
            activeOpacity={0.7}>
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: "#C59172",
              }}>
              전체 보기
            </Text>
          </TouchableOpacity>
        </View>
        <CategoryList onCategoryPress={onCategoryPress} />
      </View>

      <View style={homeScreenStyles.section}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 15,
          }}>
          <Text style={homeScreenStyles.sectionTitle}>인기 상품 TOP 5</Text>
          <TouchableOpacity
            style={{
              backgroundColor: "rgba(197, 145, 114, 0.1)",
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "rgba(197, 145, 114, 0.3)",
            }}
            onPress={() => onCategoryPress?.("전체")}
            activeOpacity={0.7}>
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: "#C59172",
              }}>
              전체 보기
            </Text>
          </TouchableOpacity>
        </View>
        
        {topProducts.map((product, index) => (
          <TouchableOpacity
            key={product.id}
            style={styles.productCard}
            onPress={() => navigation.navigate("ProductDetail", { product })}
            activeOpacity={0.7}>
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>{index + 1}</Text>
            </View>
            <View style={styles.productImage}>
              {product.image.startsWith('@') ? (
                <Image
                  source={
                    product.image === '@dog_food.png' ? require('../../assets/images/dog_food.png') :
                    product.image === '@dog_snack.png' ? require('../../assets/images/dog_snack.png') :
                    product.image === '@cat_food.png' ? require('../../assets/images/cat_food.png') :
                    product.image === '@cat_snack.png' ? require('../../assets/images/cat_snack.png') :
                    product.image === '@toy.png' ? require('../../assets/images/toy.png') :
                    product.image === '@toilet.png' ? require('../../assets/images/toilet.png') :
                    product.image === '@grooming.png' ? require('../../assets/images/grooming.png') :
                    product.image === '@clothing.png' ? require('../../assets/images/clothing.png') :
                    product.image === '@outdoor.png' ? require('../../assets/images/outdoor.png') :
                    product.image === '@house.png' ? require('../../assets/images/house.png') :
                    product.image === '@shop.png' ? require('../../assets/images/shop.png') :
                    product.image === '@walker.png' ? require('../../assets/images/walker.png') :
                    require('../../assets/images/dog_food.png')
                  }
                  style={{ width: 40, height: 40 }}
                  resizeMode="contain"
                />
              ) : (
                <Text style={{ fontSize: 26 }}>{product.image}</Text>
              )}
            </View>
            <View style={styles.productInfo}>
              <Text style={styles.productBrand}>{product.brand}</Text>
              <Text style={styles.productName} numberOfLines={2}>
                {product.name}
              </Text>
              <View style={styles.ratingContainer}>
                <Text style={styles.stars}>{renderStars(product.rating)}</Text>
                <Text style={styles.ratingText}>
                  {product.rating} ({product.reviewCount.toLocaleString()})
                </Text>
              </View>
              <View style={styles.priceContainer}>
                {product.originalPrice && (
                  <Text style={styles.originalPrice}>
                    {formatPrice(product.originalPrice)}
                  </Text>
                )}
                <Text style={styles.price}>{formatPrice(product.price)}</Text>
                {product.discount && (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>{product.discount}%</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={homeScreenStyles.section}>
        <View style={styles.orderHeader}>
          <Text style={homeScreenStyles.sectionTitle}>나의 주문</Text>
          <TouchableOpacity onPress={() => navigation.navigate("MyOrders")}>
            <Text style={styles.viewAllText}>전체보기 ›</Text>
          </TouchableOpacity>
        </View>

        {ongoingOrders.length > 0 ? (
          <>
            {ongoingOrders.slice(0, 2).map((order) => (
              <TouchableOpacity
                key={order.id}
                style={styles.orderCard}
                onPress={() => navigation.navigate("MyOrders")}
                activeOpacity={0.7}>
                <View style={styles.orderCardHeader}>
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderDate}>{order.orderDate}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getOrderStatusColor(order.status) }]}>
                      <Text style={styles.statusText}>{getOrderStatusText(order.status)}</Text>
                    </View>
                  </View>
                  <Text style={styles.orderNumber}>주문번호: {order.orderNumber}</Text>
                </View>

                <View style={styles.orderItems}>
                  {order.items.slice(0, 1).map((item, index) => (
                    <View key={index} style={styles.orderItem}>
                      {item.productImage.startsWith('@') ? (
                        <Image
                          source={
                            item.productImage === '@dog_food.png' ? require('../../assets/images/dog_food.png') :
                            item.productImage === '@dog_snack.png' ? require('../../assets/images/dog_snack.png') :
                            item.productImage === '@cat_food.png' ? require('../../assets/images/cat_food.png') :
                            item.productImage === '@cat_snack.png' ? require('../../assets/images/cat_snack.png') :
                            item.productImage === '@toy.png' ? require('../../assets/images/toy.png') :
                            item.productImage === '@toilet.png' ? require('../../assets/images/toilet.png') :
                            item.productImage === '@grooming.png' ? require('../../assets/images/grooming.png') :
                            item.productImage === '@clothing.png' ? require('../../assets/images/clothing.png') :
                            item.productImage === '@outdoor.png' ? require('../../assets/images/outdoor.png') :
                            item.productImage === '@house.png' ? require('../../assets/images/house.png') :
                            require('../../assets/images/dog_food.png')
                          }
                          style={{ width: 48, height: 48, marginRight: 12 }}
                          resizeMode="contain"
                        />
                      ) : (
                        <Text style={styles.itemImage}>{item.productImage}</Text>
                      )}
                      <View style={styles.itemDetails}>
                        <Text style={styles.itemBrand}>{item.brand}</Text>
                        <Text style={styles.itemName} numberOfLines={1}>
                          {item.productName}
                        </Text>
                        <Text style={styles.itemQuantity}>수량: {item.quantity}개</Text>
                      </View>
                    </View>
                  ))}
                  {order.items.length > 1 && (
                    <Text style={styles.moreItems}>외 {order.items.length - 1}개 상품</Text>
                  )}
                </View>

                <View style={styles.orderFooter}>
                  <Text style={styles.totalLabel}>총 결제금액</Text>
                  <Text style={styles.totalAmount}>{formatPrice(order.finalAmount)}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        ) : (
          <CardBox
            icon="📋"
            description="주문 내역이 없습니다"
            actionText="쇼핑하기"
            borderColor={currentMode.color}
            backgroundColor={currentMode.color}
            onPress={() => onCategoryPress?.("전체")}
          />
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  productCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 10,
    padding: 8,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#C59172",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  rankText: {
    fontSize: rf(12),
    fontWeight: "700",
    color: "#fff",
  },
  productImage: {
    width: 50,
    height: 50,
    backgroundColor: "#F0F8FF",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  productInfo: {
    flex: 1,
  },
  productBrand: {
    fontSize: rf(9),
    color: "#999",
    marginBottom: 1,
  },
  productName: {
    fontSize: rf(12),
    fontWeight: "600",
    color: "#333",
    marginBottom: 3,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  stars: {
    fontSize: rf(9),
    color: "#FFD700",
    marginRight: 3,
  },
  ratingText: {
    fontSize: rf(9),
    color: "#666",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  originalPrice: {
    fontSize: rf(10),
    color: "#999",
    textDecorationLine: "line-through",
    marginRight: 4,
  },
  price: {
    fontSize: rf(13),
    fontWeight: "700",
    color: "#C59172",
    marginRight: 4,
  },
  discountBadge: {
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
  },
  discountText: {
    fontSize: rf(8),
    color: "#fff",
    fontWeight: "600",
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  viewAllText: {
    fontSize: rf(13),
    color: "#C59172",
    fontWeight: "600",
  },
  orderCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderCardHeader: {
    marginBottom: 12,
  },
  orderInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  orderDate: {
    fontSize: rf(13),
    color: "#666",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: rf(11),
    color: "#fff",
    fontWeight: "600",
  },
  orderNumber: {
    fontSize: rf(11),
    color: "#999",
  },
  orderItems: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 12,
    marginBottom: 12,
  },
  orderItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemImage: {
    fontSize: rf(36),
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemBrand: {
    fontSize: rf(11),
    color: "#999",
    marginBottom: 2,
  },
  itemName: {
    fontSize: rf(14),
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: rf(12),
    color: "#666",
  },
  moreItems: {
    fontSize: rf(12),
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: rf(13),
    color: "#666",
  },
  totalAmount: {
    fontSize: rf(16),
    fontWeight: "700",
    color: "#C59172",
  },
});

export default PetMallContent;
