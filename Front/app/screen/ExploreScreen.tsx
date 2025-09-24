import React, { useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import Header from "../components/Header";
import {
    homeScreenStyles,
    modeStyles
} from "../styles/HomeScreenStyles";

const ExploreScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const exploreCategories = [
    {
      id: 1,
      title: "주변 공원",
      icon: "🌳",
      description: "반려동물과 함께 갈 수 있는 공원",
    },
    {
      id: 2,
      title: "펫카페",
      icon: "☕",
      description: "반려동물 동반 가능한 카페",
    },
    {
      id: 3,
      title: "동물병원",
      icon: "🏥",
      description: "24시간 응급 동물병원",
    },
    { id: 4, title: "펫샵", icon: "🛍️", description: "근처 펫샵 및 용품점" },
    {
      id: 5,
      title: "펫호텔",
      icon: "🏨",
      description: "반려동물 호텔 및 위탁",
    },
    { id: 6, title: "커뮤니티", icon: "👥", description: "반려동물 커뮤니티" },
  ];

  const popularPlaces = [
    { id: 1, name: "서울숲", type: "공원", rating: 4.8, distance: "1.2km" },
    { id: 2, name: "한강공원", type: "공원", rating: 4.6, distance: "2.1km" },
    {
      id: 3,
      name: "댕댕이 카페",
      type: "카페",
      rating: 4.9,
      distance: "0.8km",
    },
    {
      id: 4,
      name: "24시 동물병원",
      type: "병원",
      rating: 4.7,
      distance: "1.5km",
    },
  ];

  return (
    <SafeAreaView
      style={[homeScreenStyles.root, { backgroundColor: "#FFF5F0" }]}>
      <Header
        title="🔍 Explore"
        showSearch={true}
        searchPlaceholder="장소나 시설을 검색해보세요"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showBackButton={true}
      />

      <ScrollView contentContainerStyle={homeScreenStyles.scrollContent}>
        {/* 카테고리 섹션 */}
        <View style={homeScreenStyles.section}>
          <Text style={homeScreenStyles.sectionTitle}>카테고리</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            {exploreCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  modeStyles.modeChip,
                  {
                    flex: 0,
                    width: "48%",
                    minHeight: 80,
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    borderWidth: 2,
                    borderColor: "#E0E0E0",
                  },
                ]}>
                <Text style={[modeStyles.modeIcon, { fontSize: 24 }]}>
                  {category.icon}
                </Text>
                <View style={modeStyles.modeTextContainer}>
                  <Text style={modeStyles.modeChipTitle}>{category.title}</Text>
                  <Text style={modeStyles.modeChipSubtitle}>
                    {category.description}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 인기 장소 섹션 */}
        <View style={homeScreenStyles.section}>
          <Text style={homeScreenStyles.sectionTitle}>인기 장소</Text>
          <View style={{ gap: 12 }}>
            {popularPlaces.map((place) => (
              <TouchableOpacity
                key={place.id}
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  borderRadius: 15,
                  padding: 18,
                  borderWidth: 0,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color: "#4A4A4A",
                        marginBottom: 4,
                      }}>
                      {place.name}
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        color: "#888",
                        marginBottom: 8,
                      }}>
                      {place.type}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 12,
                      }}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 4,
                        }}>
                        <Text style={{ color: "#ffd700" }}>⭐</Text>
                        <Text style={{ fontSize: 14, color: "#4A4A4A" }}>
                          {place.rating}
                        </Text>
                      </View>
                      <Text style={{ fontSize: 14, color: "#888" }}>
                        {place.distance}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{
                      width: 60,
                      height: 60,
                      backgroundColor: "#F8F8F8",
                      borderRadius: 12,
                      justifyContent: "center",
                      alignItems: "center",
                    }}>
                    <Text style={{ fontSize: 24 }}>📍</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 최근 검색 섹션 */}
        <View style={homeScreenStyles.section}>
          <Text style={homeScreenStyles.sectionTitle}>최근 검색</Text>
          <View style={{ gap: 8 }}>
            {["서울숲", "한강공원", "동물병원"].map((search, index) => (
              <TouchableOpacity
                key={index}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  borderRadius: 12,
                  gap: 12,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}>
                <Text style={{ color: "#888" }}>🕐</Text>
                <Text style={{ flex: 1, fontSize: 14, color: "#4A4A4A" }}>
                  {search}
                </Text>
                <Text style={{ color: "#888" }}>✕</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ExploreScreen;
