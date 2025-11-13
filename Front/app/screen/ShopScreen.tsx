import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Image,
} from "react-native";
import { getProductsByCategory, Product } from "../constants/ProductData";
import { RootStackParamList } from "../index";
import { headerStyles, homeScreenStyles } from "../styles/HomeScreenStyles";
import { IconImage } from "../components/IconImage";

type ShopScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface RouteParams {
  category: string;
}

type SortType = 'recommended' | 'price_asc' | 'price_desc' | 'rating';
type CategoryType = '전체' | '강아지 사료' | '강아지 간식' | '고양이 사료' | '고양이 간식' | '장난감' | '배변용품' | '미용 용품' | '의류' | '외출 용품' | '하우스/침대';

const ShopScreen = () => {
  const navigation = useNavigation<ShopScreenNavigationProp>();
  const route = useRoute();
  const { category } = route.params as RouteParams;

  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>(category as CategoryType);
  const [sortType, setSortType] = useState<SortType>('recommended');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const categories: CategoryType[] = ['전체', '강아지 사료', '강아지 간식', '고양이 사료', '고양이 간식', '장난감', '배변용품', '미용 용품', '의류', '외출 용품', '하우스/침대'];
  const sortOptions = [
    { key: 'recommended', label: '추천순' },
    { key: 'price_asc', label: '가격 낮은순' },
    { key: 'price_desc', label: '가격 높은순' },
    { key: 'rating', label: '별점순' },
  ];

  useEffect(() => {
    const categoryProducts = getProductsByCategory(selectedCategory);
    setProducts(categoryProducts);
  }, [selectedCategory]);

  useEffect(() => {
    let filtered = products;
    
    // 검색 필터링
    if (searchQuery.trim() !== "") {
      filtered = products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 정렬
    const sorted = [...filtered].sort((a, b) => {
      switch (sortType) {
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'recommended':
        default:
          return b.favoriteCount - a.favoriteCount; // 찜 많은 순으로 추천
      }
    });

    setFilteredProducts(sorted);
  }, [searchQuery, products, sortType]);

  const handleCategoryChange = (newCategory: CategoryType) => {
    setSelectedCategory(newCategory);
  };

  const handleSortChange = (newSortType: SortType) => {
    setSortType(newSortType);
    setShowSortDropdown(false);
  };

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
      onPress={() => navigation.navigate("ProductDetail", { product: item })}
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
          {item.image.startsWith('@') ? (
            <Image
              source={
                item.image === '@dog_food.png' ? require('../../assets/images/dog_food.png') :
                item.image === '@dog_snack.png' ? require('../../assets/images/dog_snack.png') :
                item.image === '@cat_food.png' ? require('../../assets/images/cat_food.png') :
                item.image === '@cat_snack.png' ? require('../../assets/images/cat_snack.png') :
                item.image === '@toy.png' ? require('../../assets/images/toy.png') :
                item.image === '@toilet.png' ? require('../../assets/images/toilet.png') :
                item.image === '@grooming.png' ? require('../../assets/images/grooming.png') :
                item.image === '@clothing.png' ? require('../../assets/images/clothing.png') :
                item.image === '@outdoor.png' ? require('../../assets/images/outdoor.png') :
                item.image === '@house.png' ? require('../../assets/images/house.png') :
                item.image === '@shop.png' ? require('../../assets/images/shop.png') :
                item.image === '@walker.png' ? require('../../assets/images/walker.png') :
                require('../../assets/images/dog_food.png')
              }
              style={{ width: 50, height: 50 }}
              resizeMode="contain"
            />
          ) : (
            <Text style={{ fontSize: 32 }}>{item.image}</Text>
          )}
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
    <View
      style={[homeScreenStyles.root, { backgroundColor: "#FFF5F0", paddingTop: 0 }]}>
      <StatusBar backgroundColor="#C59172" barStyle="light-content" translucent={false} />
      <View
        style={[
          headerStyles.header,
          { backgroundColor: "rgba(255, 255, 255, 0.95)", marginTop: 0, paddingTop: 8 },
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
        <View style={[headerStyles.logoContainer, { flex: 1, justifyContent: "center" }]}>
          <IconImage name="shop" size={22} style={headerStyles.logoIcon} />
          <Text style={headerStyles.logoText}>Shop</Text>
        </View>
        <View style={{ width: 60 }} />
      </View>

      {/* 검색바 */}
      <View
        style={{ padding: 16, backgroundColor: "rgba(255, 255, 255, 0.95)" }}>
        <View style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#F5F5F5",
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 8,
        }}>
          <IconImage name="map" size={18} style={{ marginRight: 8 }} />
          <TextInput
            style={{
              flex: 1,
              fontSize: 16,
              color: "#333",
              paddingVertical: 4,
            }}
            placeholder="상품명 또는 브랜드 검색"
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
        </View>
      </View>

      {/* 카테고리 선택 */}
      <View style={{ backgroundColor: "rgba(255, 255, 255, 0.95)", paddingBottom: 8 }}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                marginRight: 8,
                borderRadius: 20,
                backgroundColor: selectedCategory === cat ? "#C59172" : "#F0F0F0",
                borderWidth: 1,
                borderColor: selectedCategory === cat ? "#C59172" : "#E0E0E0",
              }}
              onPress={() => handleCategoryChange(cat)}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: selectedCategory === cat ? "#FFF" : "#666",
                }}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <TouchableOpacity 
        style={{ flex: 1, paddingHorizontal: 16 }}
        activeOpacity={1}
        onPress={() => setShowSortDropdown(false)}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingVertical: 16,
            position: 'relative',
          }}>
          <Text style={{ fontSize: 16, fontWeight: "600", color: "#333" }}>
            총 {filteredProducts.length}개 상품
          </Text>
          <View style={{ position: 'relative' }}>
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 8,
                backgroundColor: "rgba(197, 145, 114, 0.1)",
                borderWidth: 1,
                borderColor: showSortDropdown ? "#C59172" : "rgba(197, 145, 114, 0.3)",
              }}
              onPress={(e) => {
                e.stopPropagation();
                setShowSortDropdown(!showSortDropdown);
              }}>
              <Text style={{ fontSize: 14, color: "#C59172", fontWeight: "600", marginRight: 4 }}>
                {sortOptions.find(option => option.key === sortType)?.label}
              </Text>
              <Text style={{ fontSize: 12, color: "#C59172" }}>
                {showSortDropdown ? "▲" : "▼"}
              </Text>
            </TouchableOpacity>
            
            {/* 드롭다운 메뉴 */}
            {showSortDropdown && (
              <View
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  backgroundColor: 'white',
                  borderRadius: 8,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 8,
                  elevation: 5,
                  zIndex: 1000,
                  minWidth: 120,
                  marginTop: 4,
                }}>
                {sortOptions.map((option, index) => (
                  <TouchableOpacity
                    key={option.key}
                    style={{
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      borderBottomWidth: index < sortOptions.length - 1 ? 1 : 0,
                      borderBottomColor: '#F0F0F0',
                      backgroundColor: sortType === option.key ? 'rgba(197, 145, 114, 0.1)' : 'transparent',
                    }}
                    onPress={() => handleSortChange(option.key as SortType)}>
                    <Text
                      style={{
                        fontSize: 14,
                        color: sortType === option.key ? '#C59172' : '#333',
                        fontWeight: sortType === option.key ? '600' : '400',
                      }}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        <FlatList
          data={filteredProducts}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          style={{ zIndex: 1 }}
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
      </TouchableOpacity>

    </View>
  );
};

export default ShopScreen;

