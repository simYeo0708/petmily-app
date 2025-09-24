import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
    Alert,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import MenuButton from "../components/MenuButton";
import SideMenuDrawer from "../components/SideMenuDrawer";
import { Product } from "../constants/ProductData";
import { RootStackParamList } from "../index";
import { headerStyles, homeScreenStyles } from "../styles/HomeScreenStyles";

type CartScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface CartItem extends Product {
  quantity: number;
  isSubscription?: boolean;
}

interface RouteParams {
  cartItems: CartItem[];
  setCart: (cart: CartItem[]) => void;
}

const CartScreen = () => {
  const navigation = useNavigation<CartScreenNavigationProp>();
  const route = useRoute();
  const { cartItems, setCart } = route.params as RouteParams;

  const [cart, setLocalCart] = useState<CartItem[]>(cartItems || []);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()}원`;
  };

  const updateCartQuantity = (
    productId: string,
    quantity: number,
    isSubscription = false
  ) => {
    if (quantity <= 0) {
      removeFromCart(productId, isSubscription);
      return;
    }

    const updatedCart = cart.map((item) =>
      item.id === productId && item.isSubscription === isSubscription
        ? { ...item, quantity }
        : item
    );
    setLocalCart(updatedCart);
    setCart(updatedCart);
  };

  const removeFromCart = (productId: string, isSubscription = false) => {
    const updatedCart = cart.filter(
      (item) =>
        !(item.id === productId && item.isSubscription === isSubscription)
    );
    setLocalCart(updatedCart);
    setCart(updatedCart);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleCheckout = () => {
    const totalAmount = getTotalPrice() + (getTotalPrice() >= 50000 ? 0 : 3000);

    Alert.alert(
      "주문 확인",
      `총 ${formatPrice(totalAmount)}을(를) 결제하시겠습니까?`,
      [
        { text: "취소", style: "cancel" },
        {
          text: "결제하기",
          onPress: () => {
            Alert.alert(
              "주문 완료",
              "주문이 완료되었습니다! 주문 내역은 홈화면의 '나의 주문'에서 확인하실 수 있습니다.",
              [
                {
                  text: "확인",
                  onPress: () => {
                    setLocalCart([]);
                    setCart([]);
                    navigation.goBack();
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const openMenu = () => setIsMenuOpen(true);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <SafeAreaView
      style={[homeScreenStyles.root, { backgroundColor: "#FFF5F0" }]}>
      {/* 헤더 */}
      <View
        style={[
          headerStyles.header,
          { backgroundColor: "rgba(255, 255, 255, 0.95)" },
        ]}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <MenuButton onPress={openMenu} style={{ marginRight: 12 }} />
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              paddingRight: 16,
            }}>
            <Text style={{ fontSize: 18, color: "#C59172", fontWeight: "600" }}>
              ← 뒤로
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={[headerStyles.logo, { flex: 1, textAlign: "center" }]}>
          🛒 장바구니 ({getCartItemCount()})
        </Text>
        <View style={{ width: 60 }} />
      </View>

      {cart.length === 0 ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ fontSize: 60, marginBottom: 20 }}>🛒</Text>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: "#4A4A4A",
              marginBottom: 8,
            }}>
            장바구니가 비어있습니다
          </Text>
          <Text style={{ fontSize: 14, color: "#888", textAlign: "center" }}>
            원하는 상품을 장바구니에 담아보세요!
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: "#C59172",
              borderRadius: 12,
              paddingHorizontal: 24,
              paddingVertical: 12,
              marginTop: 20,
            }}
            onPress={() => navigation.goBack()}>
            <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
              쇼핑 계속하기
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView style={{ flex: 1 }}>
            <View style={{ padding: 16 }}>
              {cart.map((item) => (
                <View
                  key={`${item.id}-${item.isSubscription ? "sub" : "normal"}`}
                  style={[homeScreenStyles.section, { marginBottom: 12 }]}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}>
                    <View
                      style={{
                        width: 60,
                        height: 60,
                        backgroundColor: "#F0F8FF",
                        borderRadius: 12,
                        justifyContent: "center",
                        alignItems: "center",
                        marginRight: 16,
                      }}>
                      <Text style={{ fontSize: 24 }}>{item.image}</Text>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "600",
                          color: "#4A4A4A",
                          marginBottom: 4,
                        }}>
                        {item.name}
                        {item.isSubscription && (
                          <Text style={{ color: "#C59172", fontSize: 14 }}>
                            {" "}
                            (정기배송)
                          </Text>
                        )}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: "#888",
                          marginBottom: 4,
                        }}>
                        {item.brand}
                      </Text>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "bold",
                          color: "#C59172",
                        }}>
                        {formatPrice(item.price)}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginTop: 12,
                      paddingTop: 12,
                      borderTopWidth: 1,
                      borderTopColor: "#F0F0F0",
                    }}>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}>
                      <TouchableOpacity
                        onPress={() =>
                          updateCartQuantity(
                            item.id,
                            item.quantity - 1,
                            item.isSubscription
                          )
                        }
                        style={{
                          backgroundColor: "#DDD",
                          borderRadius: 8,
                          width: 36,
                          height: 36,
                          justifyContent: "center",
                          alignItems: "center",
                        }}>
                        <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                          -
                        </Text>
                      </TouchableOpacity>
                      <Text
                        style={{
                          marginHorizontal: 16,
                          fontSize: 18,
                          fontWeight: "600",
                        }}>
                        {item.quantity}
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          updateCartQuantity(
                            item.id,
                            item.quantity + 1,
                            item.isSubscription
                          )
                        }
                        style={{
                          backgroundColor: "#C59172",
                          borderRadius: 8,
                          width: 36,
                          height: 36,
                          justifyContent: "center",
                          alignItems: "center",
                        }}>
                        <Text
                          style={{
                            fontSize: 18,
                            fontWeight: "bold",
                            color: "white",
                          }}>
                          +
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <View style={{ alignItems: "flex-end" }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "bold",
                          color: "#4A4A4A",
                        }}>
                        {formatPrice(item.price * item.quantity)}
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          removeFromCart(item.id, item.isSubscription)
                        }
                        style={{
                          marginTop: 4,
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                        }}>
                        <Text style={{ fontSize: 12, color: "#FF6B6B" }}>
                          삭제
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>

          {/* 결제 정보 */}
          <View
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              padding: 20,
              borderTopWidth: 1,
              borderTopColor: "rgba(197, 145, 114, 0.2)",
            }}>
            <View
              style={{
                backgroundColor: "#F8F8F8",
                borderRadius: 12,
                padding: 16,
                marginBottom: 16,
              }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}>
                <Text style={{ fontSize: 14, color: "#666" }}>상품금액</Text>
                <Text style={{ fontSize: 14, color: "#666" }}>
                  {formatPrice(getTotalPrice())}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}>
                <Text style={{ fontSize: 14, color: "#666" }}>배송비</Text>
                <Text style={{ fontSize: 14, color: "#666" }}>
                  {getTotalPrice() >= 50000 ? "무료" : "3,000원"}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingTop: 8,
                  borderTopWidth: 1,
                  borderTopColor: "#DDD",
                }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    color: "#4A4A4A",
                  }}>
                  총 결제금액
                </Text>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    color: "#C59172",
                  }}>
                  {formatPrice(
                    getTotalPrice() + (getTotalPrice() >= 50000 ? 0 : 3000)
                  )}
                </Text>
              </View>
              {getTotalPrice() < 50000 && (
                <Text
                  style={{
                    fontSize: 12,
                    color: "#888",
                    marginTop: 4,
                    textAlign: "center",
                  }}>
                  {formatPrice(50000 - getTotalPrice())} 더 구매하시면 무료배송!
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={{
                backgroundColor: "#C59172",
                borderRadius: 12,
                padding: 16,
                alignItems: "center",
              }}
              onPress={handleCheckout}>
              <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
                {formatPrice(
                  getTotalPrice() + (getTotalPrice() >= 50000 ? 0 : 3000)
                )}{" "}
                결제하기
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
      
      <SideMenuDrawer isVisible={isMenuOpen} onClose={closeMenu} />
    </SafeAreaView>
  );
};

export default CartScreen;
