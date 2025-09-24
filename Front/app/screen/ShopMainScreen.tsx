import {
    RouteProp,
    useFocusEffect,
    useNavigation,
    useRoute,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    Image,
    SafeAreaView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import MenuButton from "../components/MenuButton";
import SideMenuDrawer from "../components/SideMenuDrawer";
import { getProductsByCategory, Product } from "../constants/ProductData";
import { RootStackParamList } from "../index";
import { TabParamList } from "../navigation/TabNavigator";
import { headerStyles, homeScreenStyles } from "../styles/HomeScreenStyles";

type ShopMainScreenNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;
type ShopMainScreenRouteProp = RouteProp<TabParamList, "ShopTab">;

interface CartItem extends Product {
  quantity: number;
  isSubscription?: boolean;
}

const ShopMainScreen = () => {
  const navigation = useNavigation<ShopMainScreenNavigationProp>();
  const route = useRoute<ShopMainScreenRouteProp>();

  const [selectedCategory, setSelectedCategory] = useState(
    route.params?.initialCategory || "전체"
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const categories = ["전체", "사료", "간식", "장난감", "용품"];

  useFocusEffect(
    useCallback(() => {
      if (route.params?.initialCategory) {
        setSelectedCategory(route.params.initialCategory);
        navigation.setParams({ initialCategory: undefined });
      }
    }, [route.params?.initialCategory, navigation])
  );

  useEffect(() => {
    const categoryProducts = getProductsByCategory(selectedCategory);
    setProducts(categoryProducts);
    setFilteredProducts(categoryProducts);
  }, [selectedCategory]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchQuery, products]);

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

  const addToCart = (product: Product, isSubscription = false) => {
    const existingItem = cart.find(
      (item) => item.id === product.id && item.isSubscription === isSubscription
    );

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id && item.isSubscription === isSubscription
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1, isSubscription }]);
    }

    Alert.alert(
      "장바구니 추가",
      `${product.name}이(가) 장바구니에 추가되었습니다.`
    );
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const openMenu = () => setIsMenuOpen(true);
  const closeMenu = () => setIsMenuOpen(false);

  const renderCategoryButton = (category: string) => (
    <TouchableOpacity
      key={category}
      style={[
        {
          paddingHorizontal: 16,
          paddingVertical: 10,
          marginRight: 8,
          borderRadius: 20,
          borderWidth: 2,
          borderColor: selectedCategory === category ? "#C59172" : "#E0E0E0",
          backgroundColor: selectedCategory === category ? "#C59172" : "#FFF",
        },
      ]}
      onPress={() => setSelectedCategory(category)}>
      <Text
        style={{
          fontSize: 14,
          fontWeight: "600",
          color: selectedCategory === category ? "#FFF" : "#4A4A4A",
        }}>
        {category}
      </Text>
    </TouchableOpacity>
  );

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderRadius: 15,
        padding: 16,
        marginBottom: 12,
        marginHorizontal: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
      onPress={() => {
        Alert.alert(item.name, item.description, [
          { text: "취소", style: "cancel" },
          {
            text: "장바구니 담기",
            onPress: () => addToCart(item),
          },
          {
            text: "정기배송 신청",
            onPress: () => addToCart(item, true),
          },
        ]);
      }}
      activeOpacity={0.7}>
      <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
        {/* 상품 이미지 */}
        <View
          style={{
            width: 80,
            height: 80,
            backgroundColor: "#F0F8FF",
            borderRadius: 12,
            justifyContent: "center",
            alignItems: "center",
            marginRight: 16,
          }}>
          <Text style={{ fontSize: 32 }}>{item.image}</Text>
        </View>

        {/* 상품 정보 */}
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#4A4A4A",
                  marginBottom: 4,
                }}>
                {item.name}
              </Text>
              <Text style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>
                {item.brand}
              </Text>
              <Text style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>
                {item.description}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 4,
                }}>
                <Text style={{ fontSize: 12, color: "#FFD700" }}>
                  {renderStars(item.rating)}
                </Text>
                <Text style={{ fontSize: 11, color: "#888", marginLeft: 4 }}>
                  {item.rating} ({item.reviewCount.toLocaleString()})
                </Text>
              </View>
            </View>

            {item.discount && (
              <View
                style={{
                  backgroundColor: "#FF6B6B",
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 4,
                }}>
                <Text
                  style={{ color: "white", fontSize: 10, fontWeight: "600" }}>
                  {item.discount}%
                </Text>
              </View>
            )}
          </View>

          {/* 가격 정보 */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
            <View>
              {item.originalPrice && (
                <Text
                  style={{
                    fontSize: 12,
                    color: "#999",
                    textDecorationLine: "line-through",
                    marginBottom: 2,
                  }}>
                  {formatPrice(item.originalPrice)}
                </Text>
              )}
              <Text
                style={{ fontSize: 16, fontWeight: "bold", color: "#C59172" }}>
                {formatPrice(item.price)}
              </Text>
            </View>

            <TouchableOpacity
              style={{
                backgroundColor: "#C59172",
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
              }}
              onPress={(e) => {
                e.stopPropagation();
                addToCart(item);
              }}>
              <Text style={{ color: "white", fontSize: 12, fontWeight: "600" }}>
                담기
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

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
          <Text style={headerStyles.logo}>🛍️ Shop</Text>
        </View>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("Cart", { cartItems: cart, setCart: setCart })
          }
          style={{
            position: "relative",
            paddingHorizontal: 10,
            paddingVertical: 8,
            marginRight: 8,
          }}>
          <Image
            source={require("../../assets/images/shopping_cart.png")}
            style={{ width: 20, height: 20 }}
          />
          {getCartItemCount() > 0 && (
            <View
              style={{
                position: "absolute",
                top: 2,
                right: 2,
                backgroundColor: "#FF6B6B",
                borderRadius: 10,
                minWidth: 20,
                height: 20,
                justifyContent: "center",
                alignItems: "center",
              }}>
              <Text
                style={{
                  color: "white",
                  fontSize: 12,
                  fontWeight: "bold",
                }}>
                {getCartItemCount()}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* 검색바 */}
      <View
        style={{
          padding: 16,
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          borderBottomWidth: 1,
          borderBottomColor: "rgba(197, 145, 114, 0.2)",
        }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#F5F5F5",
            borderRadius: 18,
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}>
          <Text style={{ fontSize: 18, marginRight: 10, color: "#888" }}>
            🔍
          </Text>
          <TextInput
            style={{
              flex: 1,
              paddingVertical: 4,
              fontSize: 16,
              color: "#4A4A4A",
            }}
            placeholder="상품명, 브랜드, 카테고리 검색"
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
        </View>
      </View>

      {/* 카테고리 버튼들 */}
      <View
        style={{
          paddingVertical: 16,
          paddingHorizontal: 16,
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          borderBottomWidth: 1,
          borderBottomColor: "rgba(197, 145, 114, 0.2)",
        }}>
        <FlatList
          data={categories}
          renderItem={({ item }) => renderCategoryButton(item)}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 0 }}
        />
      </View>

      {/* 상품 목록 */}
      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingVertical: 16,
            paddingHorizontal: 16,
          }}>
          <Text style={{ fontSize: 16, fontWeight: "600", color: "#4A4A4A" }}>
            총 {filteredProducts.length}개 상품
          </Text>
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
              backgroundColor: "rgba(197, 145, 114, 0.1)",
            }}>
            <Text style={{ fontSize: 12, color: "#C59172", fontWeight: "600" }}>
              정렬 ▼
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={filteredProducts}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 60,
                marginHorizontal: 16,
              }}>
              <Text style={{ fontSize: 48, marginBottom: 16 }}>🔍</Text>
              <Text
                style={{ fontSize: 16, color: "#666", textAlign: "center" }}>
                검색 결과가 없습니다.
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: "#999",
                  textAlign: "center",
                  marginTop: 8,
                }}>
                다른 검색어를 시도해보세요.
              </Text>
            </View>
          }
        />
      </View>
      
      <SideMenuDrawer isVisible={isMenuOpen} onClose={closeMenu} />
    </SafeAreaView>
  );
};

export default ShopMainScreen;
