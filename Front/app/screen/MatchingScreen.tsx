import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
    Alert,
    Modal,
    Pressable,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import MenuButton from "../components/MenuButton";
import SideMenuDrawer from "../components/SideMenuDrawer";
import { RootStackParamList } from "../index";
import {
    headerStyles,
    homeScreenStyles,
    matchingScreenStyles,
    modalStyles,
} from "../styles/HomeScreenStyles";

type MatchingScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Matching"
>;

interface WalkRequest {
  id: string;
  ownerName: string;
  petName: string;
  petBreed: string;
  location: string;
  date: string;
  time: string;
  duration: number;
  payment: number;
  distance: string;
  specialNotes?: string;
}

const MatchingScreen = () => {
  const navigation = useNavigation<MatchingScreenNavigationProp>();
  const [selectedRequest, setSelectedRequest] = useState<WalkRequest | null>(
    null
  );
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const mockRequests: WalkRequest[] = [
    {
      id: "1",
      ownerName: "김민지",
      petName: "멍멍이",
      petBreed: "골든 리트리버",
      location: "강남구 역삼동",
      date: "2025-09-17",
      time: "14:00",
      duration: 60,
      payment: 25000,
      distance: "0.8km",
      specialNotes: "활발한 성격이에요. 다른 강아지들과 잘 어울립니다.",
    },
    {
      id: "2",
      ownerName: "박지훈",
      petName: "초코",
      petBreed: "시베리안 허스키",
      location: "서초구 반포동",
      date: "2025-09-17",
      time: "16:30",
      duration: 90,
      payment: 35000,
      distance: "1.2km",
      specialNotes: "산책을 매우 좋아해요. 에너지가 넘칩니다!",
    },
    {
      id: "3",
      ownerName: "이소영",
      petName: "복실이",
      petBreed: "포메라니안",
      location: "강남구 청담동",
      date: "2025-09-18",
      time: "10:00",
      duration: 30,
      payment: 15000,
      distance: "0.5km",
      specialNotes: "소형견이라 조심스럽게 산책해주세요.",
    },
  ];

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleRequestPress = (request: WalkRequest) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const handleAcceptRequest = () => {
    if (selectedRequest) {
      Alert.alert(
        "매칭 완료!",
        `${selectedRequest.ownerName}님의 ${selectedRequest.petName} 산책 요청을 수락했습니다.`,
        [
          {
            text: "확인",
            onPress: () => {
              setShowDetailModal(false);
              navigation.goBack();
            },
          },
        ]
      );
    }
  };

  const handleDeclineRequest = () => {
    setShowDetailModal(false);
    setSelectedRequest(null);
  };

  const openMenu = () => setIsMenuOpen(true);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <SafeAreaView style={homeScreenStyles.root}>
      {/* Header */}
      <View
        style={[
          headerStyles.header,
          { backgroundColor: "rgba(255, 255, 255, 0.95)" },
        ]}>
        <View style={headerStyles.headerLeft}>
          <MenuButton onPress={openMenu} style={{ marginRight: 12 }} />
          <Pressable
            onPress={handleBackPress}
            style={matchingScreenStyles.backButton}>
            <Text style={matchingScreenStyles.backButtonText}>←</Text>
          </Pressable>
          <Text style={[headerStyles.logo, { marginLeft: 10 }]}>
            🤝 산책 매칭
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={homeScreenStyles.scrollContent}>
        <View style={matchingScreenStyles.headerSection}>
          <Text style={matchingScreenStyles.sectionTitle}>
            새로운 산책 요청
          </Text>
          <Text style={matchingScreenStyles.sectionSubtitle}>
            {mockRequests.length}건의 새로운 요청이 있습니다
          </Text>
        </View>

        {mockRequests.map((request) => (
          <TouchableOpacity
            key={request.id}
            style={matchingScreenStyles.requestCard}
            onPress={() => handleRequestPress(request)}>
            <View style={matchingScreenStyles.cardHeader}>
              <View style={matchingScreenStyles.petInfo}>
                <Text style={matchingScreenStyles.petName}>
                  {request.petName}
                </Text>
                <Text style={matchingScreenStyles.petBreed}>
                  ({request.petBreed})
                </Text>
              </View>
              <View style={matchingScreenStyles.paymentBadge}>
                <Text style={matchingScreenStyles.paymentText}>
                  {request.payment.toLocaleString()}원
                </Text>
              </View>
            </View>

            <View style={matchingScreenStyles.requestDetails}>
              <View style={matchingScreenStyles.detailRow}>
                <Text style={matchingScreenStyles.detailIcon}>👤</Text>
                <Text style={matchingScreenStyles.detailText}>
                  {request.ownerName}
                </Text>
              </View>
              <View style={matchingScreenStyles.detailRow}>
                <Text style={matchingScreenStyles.detailIcon}>📍</Text>
                <Text style={matchingScreenStyles.detailText}>
                  {request.location}
                </Text>
                <Text style={matchingScreenStyles.distanceText}>
                  ({request.distance})
                </Text>
              </View>
              <View style={matchingScreenStyles.detailRow}>
                <Text style={matchingScreenStyles.detailIcon}>🕐</Text>
                <Text style={matchingScreenStyles.detailText}>
                  {request.date} {request.time} ({request.duration}분)
                </Text>
              </View>
            </View>

            <View style={matchingScreenStyles.cardFooter}>
              <Text style={matchingScreenStyles.tapToView}>
                탭하여 자세히 보기 →
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        {mockRequests.length === 0 && (
          <View style={matchingScreenStyles.emptyState}>
            <Text style={matchingScreenStyles.emptyIcon}>🔍</Text>
            <Text style={matchingScreenStyles.emptyTitle}>
              새로운 요청이 없습니다
            </Text>
            <Text style={matchingScreenStyles.emptySubtitle}>
              조금 후에 다시 확인해보세요!
            </Text>
          </View>
        )}
      </ScrollView>

      {/* 상세 정보 모달 */}
      <Modal visible={showDetailModal} transparent animationType="slide">
        <View style={modalStyles.overlay}>
          <View style={matchingScreenStyles.detailModal}>
            <View style={matchingScreenStyles.modalHeader}>
              <Text style={matchingScreenStyles.modalTitle}>
                산책 요청 상세
              </Text>
              <Pressable
                onPress={handleDeclineRequest}
                style={matchingScreenStyles.closeButton}>
                <Text style={matchingScreenStyles.closeButtonText}>✕</Text>
              </Pressable>
            </View>

            {selectedRequest && (
              <ScrollView style={matchingScreenStyles.modalContent}>
                <View style={matchingScreenStyles.modalSection}>
                  <Text style={matchingScreenStyles.modalSectionTitle}>
                    🐕 반려동물 정보
                  </Text>
                  <Text style={matchingScreenStyles.modalText}>
                    이름: {selectedRequest.petName}
                  </Text>
                  <Text style={matchingScreenStyles.modalText}>
                    품종: {selectedRequest.petBreed}
                  </Text>
                </View>

                <View style={matchingScreenStyles.modalSection}>
                  <Text style={matchingScreenStyles.modalSectionTitle}>
                    📍 산책 정보
                  </Text>
                  <Text style={matchingScreenStyles.modalText}>
                    위치: {selectedRequest.location}
                  </Text>
                  <Text style={matchingScreenStyles.modalText}>
                    거리: {selectedRequest.distance}
                  </Text>
                  <Text style={matchingScreenStyles.modalText}>
                    일시: {selectedRequest.date} {selectedRequest.time}
                  </Text>
                  <Text style={matchingScreenStyles.modalText}>
                    시간: {selectedRequest.duration}분
                  </Text>
                </View>

                <View style={matchingScreenStyles.modalSection}>
                  <Text style={matchingScreenStyles.modalSectionTitle}>
                    💰 결제 정보
                  </Text>
                  <Text style={matchingScreenStyles.paymentAmount}>
                    {selectedRequest.payment.toLocaleString()}원
                  </Text>
                </View>

                {selectedRequest.specialNotes && (
                  <View style={matchingScreenStyles.modalSection}>
                    <Text style={matchingScreenStyles.modalSectionTitle}>
                      📝 특이사항
                    </Text>
                    <Text style={matchingScreenStyles.modalText}>
                      {selectedRequest.specialNotes}
                    </Text>
                  </View>
                )}

                <View style={matchingScreenStyles.modalButtons}>
                  <TouchableOpacity
                    style={[
                      matchingScreenStyles.modalButton,
                      matchingScreenStyles.acceptButton,
                    ]}
                    onPress={handleAcceptRequest}>
                    <Text style={matchingScreenStyles.acceptButtonText}>
                      수락하기
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      matchingScreenStyles.modalButton,
                      matchingScreenStyles.declineButton,
                    ]}
                    onPress={handleDeclineRequest}>
                    <Text style={matchingScreenStyles.declineButtonText}>
                      거절하기
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
      
      <SideMenuDrawer isVisible={isMenuOpen} onClose={closeMenu} />
    </SafeAreaView>
  );
};

export default MatchingScreen;
