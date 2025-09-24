import React, { useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { homeScreenStyles } from "../../styles/HomeScreenStyles";
import { BookingData, StepProps, Walker } from "../../types/BookingTypes";

const Step2WalkerSelection: React.FC<StepProps> = ({ bookingData, onUpdate }) => {
  const [selectedWalker, setSelectedWalker] = useState<Walker | null>(bookingData.selectedWalker || null);
  const [showWalkerDetail, setShowWalkerDetail] = useState<boolean>(false);
  const [detailWalker, setDetailWalker] = useState<Walker | null>(null);

  // Mock data for walkers
  const walkers: Walker[] = [
    {
      id: "1",
      name: "김민지 워커",
      distance: "0.5km",
      rating: 4.8,
      reviewCount: 127,
      experience: "3년 경험",
      introduction: "안녕하세요! 반려동물을 사랑하는 김민지입니다. 3년간 다양한 견종의 산책을 도와드렸습니다.",
      profileImage: "👩‍🦰",
      availableTimes: ["09:00-12:00", "14:00-18:00"],
      reviews: [
        { id: "1", rating: 5, comment: "정말 친절하고 꼼꼼하게 산책해주셨어요!", date: "2024-09-20", author: "박**" },
        { id: "2", rating: 4, comment: "우리 강아지가 너무 좋아해요", date: "2024-09-18", author: "이**" },
      ],
    },
    {
      id: "2",
      name: "이준호 워커",
      distance: "0.8km",
      rating: 4.6,
      reviewCount: 89,
      experience: "2년 경험",
      introduction: "대형견 전문 워커입니다. 안전하고 즐거운 산책을 약속드려요!",
      profileImage: "👨‍💼",
      availableTimes: ["08:00-11:00", "15:00-19:00"],
      reviews: [
        { id: "3", rating: 5, comment: "대형견도 잘 다뤄주세요", date: "2024-09-19", author: "최**" },
      ],
    },
    {
      id: "3",
      name: "박서연 워커",
      distance: "1.2km",
      rating: 4.9,
      reviewCount: 203,
      experience: "5년 경험",
      introduction: "반려동물 행동 교정사 자격증을 보유하고 있어 문제행동 개선도 도와드립니다.",
      profileImage: "👩‍⚕️",
      availableTimes: ["10:00-16:00"],
      reviews: [
        { id: "4", rating: 5, comment: "전문적이고 신뢰할 수 있어요", date: "2024-09-21", author: "김**" },
        { id: "5", rating: 5, comment: "문제행동도 많이 개선되었어요", date: "2024-09-17", author: "정**" },
      ],
    },
  ];

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push("⭐");
    }
    if (hasHalfStar) {
      stars.push("⭐");
    }
    return stars.join("");
  };

  const handleWalkerSelect = (walker: Walker) => {
    setSelectedWalker(walker);
    const updatedData: BookingData = {
      ...bookingData,
      selectedWalker: walker,
    };
    onUpdate(updatedData);
  };

  const openWalkerDetail = (walker: Walker) => {
    setDetailWalker(walker);
    setShowWalkerDetail(true);
  };

  return (
    <>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={homeScreenStyles.section}>
          <Text style={homeScreenStyles.sectionTitle}>🚶‍♂️ 주변 워커 리스트</Text>
          <Text style={{ fontSize: 14, color: "#666", marginBottom: 16 }}>
            거리순으로 정렬되어 있습니다
          </Text>

          <View style={{ gap: 12 }}>
            {walkers.map((walker) => (
              <TouchableOpacity
                key={walker.id}
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  borderRadius: 15,
                  padding: 16,
                  borderWidth: 2,
                  borderColor: selectedWalker?.id === walker.id ? "#C59172" : "#E0E0E0",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
                onPress={() => handleWalkerSelect(walker)}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 30,
                      backgroundColor: "#F0F8FF",
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 16,
                    }}>
                    <Text style={{ fontSize: 32 }}>{walker.profileImage}</Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <View>
                        <Text style={{ fontSize: 16, fontWeight: "600", color: "#333", marginBottom: 4 }}>
                          {walker.name}
                        </Text>
                        <Text style={{ fontSize: 12, color: "#666", marginBottom: 2 }}>
                          📍 {walker.distance} • {walker.experience}
                        </Text>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                          <Text style={{ fontSize: 12, color: "#FFD700" }}>
                            {renderStars(walker.rating)}
                          </Text>
                          <Text style={{ fontSize: 12, color: "#666", marginLeft: 4 }}>
                            {walker.rating} ({walker.reviewCount})
                          </Text>
                        </View>
                      </View>
                      
                      <TouchableOpacity
                        style={{
                          backgroundColor: "rgba(197, 145, 114, 0.1)",
                          paddingHorizontal: 10,
                          paddingVertical: 6,
                          borderRadius: 8,
                          borderWidth: 1,
                          borderColor: "rgba(197, 145, 114, 0.3)",
                        }}
                        onPress={() => openWalkerDetail(walker)}>
                        <Text style={{ fontSize: 12, fontWeight: "600", color: "#C59172" }}>
                          상세보기
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <Text style={{ fontSize: 12, color: "#666", marginTop: 8 }} numberOfLines={2}>
                      {walker.introduction}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {selectedWalker && (
          <View style={homeScreenStyles.section}>
            <Text style={homeScreenStyles.sectionTitle}>✅ 선택된 워커</Text>
            <View
              style={{
                backgroundColor: "rgba(197, 145, 114, 0.1)",
                borderRadius: 15,
                padding: 16,
                borderWidth: 2,
                borderColor: "#C59172",
              }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    backgroundColor: "#F0F8FF",
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 12,
                  }}>
                  <Text style={{ fontSize: 28 }}>{selectedWalker.profileImage}</Text>
                </View>
                <View>
                  <Text style={{ fontSize: 16, fontWeight: "600", color: "#C59172" }}>
                    {selectedWalker.name}
                  </Text>
                  <Text style={{ fontSize: 12, color: "#666" }}>
                    📍 {selectedWalker.distance} • ⭐ {selectedWalker.rating}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Walker Detail Modal */}
      <Modal
        visible={showWalkerDetail}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowWalkerDetail(false)}>
        <View style={{ flex: 1, backgroundColor: "#FFF5F0" }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 20,
              borderBottomWidth: 1,
              borderBottomColor: "#E0E0E0",
              backgroundColor: "white",
            }}>
            <Text style={{ fontSize: 18, fontWeight: "600" }}>워커 상세정보</Text>
            <TouchableOpacity onPress={() => setShowWalkerDetail(false)}>
              <Text style={{ fontSize: 16, color: "#C59172", fontWeight: "600" }}>닫기</Text>
            </TouchableOpacity>
          </View>

          {detailWalker && (
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
              {/* 기본 정보 */}
              <View
                style={{
                  backgroundColor: "white",
                  borderRadius: 15,
                  padding: 20,
                  marginBottom: 16,
                  alignItems: "center",
                }}>
                <View
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: "#F0F8FF",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 12,
                  }}>
                  <Text style={{ fontSize: 48 }}>{detailWalker.profileImage}</Text>
                </View>
                <Text style={{ fontSize: 20, fontWeight: "600", marginBottom: 4 }}>
                  {detailWalker.name}
                </Text>
                <Text style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>
                  📍 {detailWalker.distance} • {detailWalker.experience}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={{ fontSize: 16, color: "#FFD700" }}>
                    {renderStars(detailWalker.rating)}
                  </Text>
                  <Text style={{ fontSize: 14, color: "#666", marginLeft: 8 }}>
                    {detailWalker.rating} ({detailWalker.reviewCount}개 후기)
                  </Text>
                </View>
              </View>

              {/* 소개 */}
              <View
                style={{
                  backgroundColor: "white",
                  borderRadius: 15,
                  padding: 16,
                  marginBottom: 16,
                }}>
                <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
                  💬 소개
                </Text>
                <Text style={{ fontSize: 14, color: "#666", lineHeight: 20 }}>
                  {detailWalker.introduction}
                </Text>
              </View>

              {/* 가능한 시간대 */}
              <View
                style={{
                  backgroundColor: "white",
                  borderRadius: 15,
                  padding: 16,
                  marginBottom: 16,
                }}>
                <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 12 }}>
                  ⏰ 가능한 시간대
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {detailWalker.availableTimes.map((time, index) => (
                    <View
                      key={index}
                      style={{
                        backgroundColor: "rgba(197, 145, 114, 0.1)",
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: "rgba(197, 145, 114, 0.3)",
                      }}>
                      <Text style={{ fontSize: 12, color: "#C59172", fontWeight: "600" }}>
                        {time}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* 후기 */}
              <View
                style={{
                  backgroundColor: "white",
                  borderRadius: 15,
                  padding: 16,
                  marginBottom: 20,
                }}>
                <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 12 }}>
                  ⭐ 후기 ({detailWalker.reviewCount})
                </Text>
                {detailWalker.reviews.map((review) => (
                  <View
                    key={review.id}
                    style={{
                      borderBottomWidth: 1,
                      borderBottomColor: "#F0F0F0",
                      paddingVertical: 12,
                    }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                      <Text style={{ fontSize: 12, color: "#FFD700" }}>
                        {renderStars(review.rating)}
                      </Text>
                      <Text style={{ fontSize: 12, color: "#999" }}>
                        {review.author} • {review.date}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 14, color: "#666", lineHeight: 18 }}>
                      {review.comment}
                    </Text>
                  </View>
                ))}
              </View>

              {/* 선택 버튼 */}
              <TouchableOpacity
                style={{
                  backgroundColor: "#C59172",
                  borderRadius: 15,
                  padding: 16,
                  alignItems: "center",
                  marginBottom: 20,
                }}
                onPress={() => {
                  handleWalkerSelect(detailWalker);
                  setShowWalkerDetail(false);
                }}>
                <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
                  이 워커 선택하기
                </Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </Modal>
    </>
  );
};

export default Step2WalkerSelection;
