import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCart } from "../contexts/CartContext";
import { RootStackParamList } from "../index";
import { rf } from "../utils/responsive";

type CartScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const CartScreen = () => {
  const navigation = useNavigation<CartScreenNavigationProp>();
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice } = useCart();

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()}원`;
  };

  const deliveryFee = getTotalPrice() >= 30000 ? 0 : 3000;
  const totalAmount = getTotalPrice() + deliveryFee;

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert("알림", "장바구니가 비어있습니다");
      return;
    }
    navigation.navigate("Checkout");
  };

  const handleShop = () => {
    navigation.navigate("Shop", { category: "전체" });
  };

  return (
    <>
      <StatusBar backgroundColor="#000000" barStyle="dark-content" />
      

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>장바구니가 비어있습니다</Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={handleShop}>
            <Text style={styles.shopButtonText}>쇼핑하러 가기</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {cartItems.map((item) => (
              <View key={item.product.id} style={styles.cartItem}>
                <View style={styles.itemInfo}>
                  {item.product.image.startsWith('@') ? (
                    <Image
                      source={
                        item.product.image === '@dog_food.png' ? require('../../assets/images/dog_food.png') :
                        item.product.image === '@dog_snack.png' ? require('../../assets/images/dog_snack.png') :
                        item.product.image === '@cat_food.png' ? require('../../assets/images/cat_food.png') :
                        item.product.image === '@cat_snack.png' ? require('../../assets/images/cat_snack.png') :
                        item.product.image === '@toy.png' ? require('../../assets/images/toy.png') :
                        item.product.image === '@toilet.png' ? require('../../assets/images/toilet.png') :
                        item.product.image === '@grooming.png' ? require('../../assets/images/grooming.png') :
                        item.product.image === '@clothing.png' ? require('../../assets/images/clothing.png') :
                        item.product.image === '@outdoor.png' ? require('../../assets/images/outdoor.png') :
                        item.product.image === '@house.png' ? require('../../assets/images/house.png') :
                        item.product.image === '@shop.png' ? require('../../assets/images/shop.png') :
                        item.product.image === '@walker.png' ? require('../../assets/images/walker.png') :
                        require('../../assets/images/dog_food.png')
                      }
                      style={{ width: 60, height: 60, marginRight:7 }}
                      resizeMode="contain"
                    />
                  ) : (
                    <Text style={styles.itemImage}>{item.product.image}</Text>
                  )}
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemBrand}>{item.product.brand}</Text>
                    <Text style={styles.itemName}>{item.product.name}</Text>
                    <Text style={styles.itemPrice}>{formatPrice(item.product.price)}</Text>
                  </View>
                </View>

                <View style={styles.itemActions}>
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => updateQuantity(item.product.id, item.quantity - 1)}>
                      <Text style={styles.quantityButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => updateQuantity(item.product.id, item.quantity + 1)}>
                      <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => removeFromCart(item.product.id)}>
                    <Text style={styles.deleteButtonText}>삭제</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.itemTotal}>
                  <Text style={styles.itemTotalText}>
                    소계: {formatPrice(item.product.price * item.quantity)}
                  </Text>
                </View>
              </View>
            ))}

            {/* 가격 요약 */}
            <View style={styles.summaryContainer}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>상품 금액</Text>
                <Text style={styles.summaryValue}>{formatPrice(getTotalPrice())}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>배송비</Text>
                <Text style={styles.summaryValue}>
                  {deliveryFee === 0 ? "무료" : formatPrice(deliveryFee)}
                </Text>
              </View>
              {getTotalPrice() < 30000 && getTotalPrice() > 0 && (
                <Text style={styles.freeShippingNotice}>
                  {formatPrice(30000 - getTotalPrice())} 더 담으면 무료배송!
                </Text>
              )}
            </View>
          </ScrollView>

          {/* 하단 결제 버튼 */}
          <View style={styles.bottomContainer}>
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>총 결제금액</Text>
              <Text style={styles.totalAmount}>{formatPrice(totalAmount)}</Text>
            </View>
            <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
              <Text style={styles.checkoutButtonText}>
                {formatPrice(totalAmount)} 결제하기
              </Text>
            </TouchableOpacity>
            {/* 하단 탭 공간 확보 */}
            <View style={{ height: 80 }} />
          </View>
        </>
      )}
  </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: rf(24),
    fontWeight: "700",
    color: "#C59172",
  },
  itemCount: {
    fontSize: rf(14),
    color: "#999",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: rf(64),
    marginBottom: 20,
  },
  emptyText: {
    fontSize: rf(16),
    color: "#999",
    marginBottom: 30,
  },
  shopButton: {
    backgroundColor: "#C59172",
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  shopButtonText: {
    color: "#fff",
    fontSize: rf(15),
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  cartItem: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    marginHorizontal: 16,
    marginTop: 70,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  itemInfo: {
    flexDirection: "row",
    marginBottom: 12,
  },
  itemImage: {
    fontSize: rf(48),
    marginRight: 20,
  },
  itemDetails: {
    flex: 1,
    justifyContent: "center",
  },
  itemBrand: {
    fontSize: rf(12),
    color: "#999",
    marginBottom: 4,
  },
  itemName: {
    fontSize: rf(15),
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  itemPrice: {
    fontSize: rf(16),
    fontWeight: "700",
    color: "#C59172",
  },
  itemActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    padding: 4,
  },
  quantityButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 6,
  },
  quantityButtonText: {
    fontSize: rf(16),
    fontWeight: "600",
    color: "#333",
  },
  quantityText: {
    fontSize: rf(15),
    fontWeight: "600",
    color: "#333",
    marginHorizontal: 16,
    minWidth: 20,
    textAlign: "center",
  },
  deleteButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  deleteButtonText: {
    fontSize: rf(14),
    color: "#ff4444",
    fontWeight: "600",
  },
  itemTotal: {
    marginTop: 12,
    alignItems: "flex-end",
  },
  itemTotalText: {
    fontSize: rf(14),
    fontWeight: "600",
    color: "#333",
  },
  summaryContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: rf(14),
    color: "#666",
  },
  summaryValue: {
    fontSize: rf(14),
    fontWeight: "600",
    color: "#333",
  },
  freeShippingNotice: {
    fontSize: rf(13),
    color: "#C59172",
    marginTop: 8,
    textAlign: "center",
    fontWeight: "600",
  },
  bottomContainer: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 0,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: rf(15),
    color: "#666",
  },
  totalAmount: {
    fontSize: rf(22),
    fontWeight: "700",
    color: "#333",
  },
  checkoutButton: {
    backgroundColor: "#C59172",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  checkoutButtonText: {
    color: "#fff",
    fontSize: rf(16),
    fontWeight: "700",
  },
});

export default CartScreen;
