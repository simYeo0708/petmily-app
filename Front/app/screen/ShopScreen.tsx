import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { getProductsByCategory, Product } from "../constants/ProductData";
import { RootStackParamList } from "../index";
import { headerStyles, homeScreenStyles } from "../styles/HomeScreenStyles";

type ShopScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface RouteParams {
  category: string;
}

const ShopScreen = () => {
  const navigation = useNavigation<ShopScreenNavigationProp>();
  const route = useRoute();
  const { category } = route.params as RouteParams;

  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  useEffect(() => {
    const categoryProducts = getProductsByCategory(category);
    setProducts(categoryProducts);
    setFilteredProducts(categoryProducts);
  }, [category]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.brand.toLowerCase().includes(searchQuery.toLowerCase())
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

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderRadius: 15,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
      onPress={() => console.log("Product pressed:", item.name)}
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
                  color: "#333",
                  marginBottom: 4,
                }}>
                {item.name}
              </Text>
              <Text style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>
                {item.brand}
              </Text>
              <Text style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>
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
                <Text style={{ fontSize: 11, color: "#666", marginLeft: 4 }}>
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
              onPress={() => console.log("Add to cart:", item.name)}>
              <Text style={{ color: "white", fontSize: 12, fontWeight: "600" }}>
                장바구니
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
      <View
        style={[
          headerStyles.header,
          { backgroundColor: "rgba(255, 255, 255, 0.95)" },
        ]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            paddingRight: 16,
          }}>
          <Text style={{ fontSize: 18, color: "#C59172", fontWeight: "600" }}>
            ← 뒤로
          </Text>
        </TouchableOpacity>
        <Text style={[headerStyles.logo, { flex: 1, textAlign: "center" }]}>
          🛍️ {category === "전체" ? "전체 상품" : category}
        </Text>
        <View style={{ width: 60 }} />
      </View>

      <View
        style={{ padding: 16, backgroundColor: "rgba(255, 255, 255, 0.95)" }}>
        <View style={headerStyles.searchBar}>
          <Text style={headerStyles.searchIcon}>🔍</Text>
          <TextInput
            style={headerStyles.searchInput}
            placeholder="상품명 또는 브랜드 검색"
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
        </View>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 16 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingVertical: 16,
          }}>
          <Text style={{ fontSize: 16, fontWeight: "600", color: "#333" }}>
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
    </SafeAreaView>
  );
};

export default ShopScreen;

