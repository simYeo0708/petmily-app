import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { RootStackParamList } from "../../index";
import { homeScreenStyles } from "../../styles/HomeScreenStyles";
import { BookingData } from "../../types/BookingTypes";

interface Step5Props {
  bookingData: BookingData;
  onComplete: () => void;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const Step5Confirmation: React.FC<Step5Props> = ({ bookingData, onComplete }) => {
  const navigation = useNavigation<NavigationProp>();

  const formatDate = (date: string | undefined) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  };

  const handleComplete = () => {
    onComplete();
    // 예약 완료 후 홈으로 이동
    navigation.navigate("Main", { initialTab: "HomeTab" });
  };

  const handleChat = () => {
    // 채팅방으로 이동 (추후 구현)
    console.log("채팅방 이동");
  };

  const handleViewBooking = () => {
    // 예약 내역으로 이동 (추후 구현)
    console.log("예약 내역 보기");
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* 예약 완료 헤더 */}
      <View style={[homeScreenStyles.section, { alignItems: "center" }]}>
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: "rgba(197, 145, 114, 0.1)",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 16,
          }}>
          <Text style={{ fontSize: 40 }}>🎉</Text>
        </View>
        <Text style={{ fontSize: 20, fontWeight: "700", color: "#C59172", marginBottom: 8 }}>
          예약이 완료되었습니다!
        </Text>
        <Text style={{ fontSize: 14, color: "#666", textAlign: "center" }}>
          워커와의 매칭이 완료되었습니다.{"\n"}곧 연락을 드릴 예정입니다.
        </Text>
      </View>

      {/* 예약 정보 요약 */}
      <View style={homeScreenStyles.section}>
        <Text style={homeScreenStyles.sectionTitle}>📋 예약 정보</Text>
        
        <View
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            borderRadius: 15,
            padding: 18,
            borderWidth: 1,
            borderColor: "#E0E0E0",
          }}>
          <View style={{ gap: 12 }}>
            <View>
              <Text style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>예약 날짜</Text>
              <Text style={{ fontSize: 14, fontWeight: "600", color: "#333" }}>
                {formatDate(bookingData.date)} {bookingData.time}
              </Text>
            </View>
            
            <View>
              <Text style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>산책 정보</Text>
              <Text style={{ fontSize: 14, fontWeight: "600", color: "#333" }}>
                {bookingData.walkType === "single" ? "일회성 산책" : "정기 산책 패키지"} • {bookingData.duration}분
              </Text>
            </View>
            
            <View>
              <Text style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>산책 장소</Text>
              <Text style={{ fontSize: 14, fontWeight: "600", color: "#333" }}>
                {bookingData.address || "현재 위치"}
              </Text>
            </View>
            
            <View>
              <Text style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>결제 금액</Text>
              <Text style={{ fontSize: 16, fontWeight: "700", color: "#C59172" }}>
                {bookingData.pricing?.finalPrice?.toLocaleString()}원
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* 선택된 워커 정보 */}
      {bookingData.selectedWalker && (
        <View style={homeScreenStyles.section}>
          <Text style={homeScreenStyles.sectionTitle}>🚶‍♂️ 담당 워커</Text>
          
          <View
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              borderRadius: 15,
              padding: 18,
              borderWidth: 1,
              borderColor: "#E0E0E0",
            }}>
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
                <Text style={{ fontSize: 32 }}>{bookingData.selectedWalker.profileImage}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: "600", color: "#333", marginBottom: 4 }}>
                  {bookingData.selectedWalker.name}
                </Text>
                <Text style={{ fontSize: 12, color: "#666", marginBottom: 2 }}>
                  📍 {bookingData.selectedWalker.distance} • {bookingData.selectedWalker.experience}
                </Text>
                <Text style={{ fontSize: 12, color: "#FFD700" }}>
                  ⭐ {bookingData.selectedWalker.rating} ({bookingData.selectedWalker.reviewCount})
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* 반려동물 정보 */}
      {bookingData.petInfo && (
        <View style={homeScreenStyles.section}>
          <Text style={homeScreenStyles.sectionTitle}>🐾 반려동물 정보</Text>
          
          <View
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              borderRadius: 15,
              padding: 18,
              borderWidth: 1,
              borderColor: "#E0E0E0",
            }}>
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#333", marginBottom: 8 }}>
              {bookingData.petInfo.name}
            </Text>
            <Text style={{ fontSize: 14, color: "#666", marginBottom: 4 }}>
              {bookingData.petInfo.breed} • {bookingData.petInfo.age}세 • {bookingData.petInfo.weight}kg
            </Text>
            {bookingData.petInfo.temperament && (
              <Text style={{ fontSize: 12, color: "#666" }}>
                특징: {bookingData.petInfo.temperament}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* 액션 버튼들 */}
      <View style={homeScreenStyles.section}>
        <View style={{ gap: 12 }}>
          <TouchableOpacity
            style={{
              backgroundColor: "#C59172",
              borderRadius: 15,
              padding: 18,
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 5,
            }}
            onPress={handleChat}>
            <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
              💬 워커와 채팅하기
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={{
              backgroundColor: "rgba(197, 145, 114, 0.1)",
              borderRadius: 15,
              padding: 18,
              alignItems: "center",
              borderWidth: 1,
              borderColor: "rgba(197, 145, 114, 0.3)",
            }}
            onPress={handleViewBooking}>
            <Text style={{ color: "#C59172", fontSize: 16, fontWeight: "600" }}>
              📋 예약 내역 보기
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              borderRadius: 15,
              padding: 18,
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#E0E0E0",
            }}
            onPress={handleComplete}>
            <Text style={{ color: "#666", fontSize: 16, fontWeight: "600" }}>
              홈으로 돌아가기
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 예약 변경/취소 안내 */}
      <View style={homeScreenStyles.section}>
        <View
          style={{
            backgroundColor: "rgba(255, 243, 205, 0.5)",
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: "rgba(255, 193, 7, 0.3)",
          }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: "#856404", marginBottom: 8 }}>
            📝 예약 변경 및 취소
          </Text>
          <View style={{ gap: 4 }}>
            <Text style={{ fontSize: 12, color: "#856404" }}>
              • 예약 변경은 산책 시작 24시간 전까지 가능합니다
            </Text>
            <Text style={{ fontSize: 12, color: "#856404" }}>
              • 예약 취소는 산책 시작 2시간 전까지 가능합니다
            </Text>
            <Text style={{ fontSize: 12, color: "#856404" }}>
              • 문의사항은 워커와의 채팅 또는 고객센터를 이용해주세요
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default Step5Confirmation;
