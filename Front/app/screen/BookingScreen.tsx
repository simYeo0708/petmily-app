import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Step1BasicInfo from "../components/booking/Step1BasicInfo";
import Step2WalkerSelection from "../components/booking/Step2WalkerSelection";
import Step3WalkSettings from "../components/booking/Step3WalkSettings";
import Step4Payment from "../components/booking/Step4Payment";
import Step5Confirmation from "../components/booking/Step5Confirmation";
import MenuButton from "../components/MenuButton";
import SideMenuDrawer from "../components/SideMenuDrawer";
import { RootStackParamList } from "../index";
import { headerStyles, homeScreenStyles } from "../styles/HomeScreenStyles";
import { BookingData } from "../types/BookingTypes";

type BookingScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Booking"
>;

const BookingScreen = () => {
  const navigation = useNavigation<BookingScreenNavigationProp>();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [bookingData, setBookingData] = useState<BookingData>({});
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const steps = [
    { id: 1, title: "기본 정보", description: "날짜, 시간, 유형 선택" },
    { id: 2, title: "워커 선택", description: "펫 워커 선택" },
    { id: 3, title: "산책 설정", description: "주의사항 및 알림 설정" },
    { id: 4, title: "결제", description: "보험 및 결제 방법" },
    { id: 5, title: "완료", description: "예약 확정" },
  ];

  const handleBackPress = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleNext = () => {
    // 각 단계별 유효성 검사
    if (currentStep === 1) {
      if (!bookingData.date || !bookingData.time) {
        Alert.alert("알림", "날짜와 시간을 선택해주세요.");
        return;
      }
    } else if (currentStep === 2) {
      if (!bookingData.selectedWalker) {
        Alert.alert("알림", "워커를 선택해주세요.");
        return;
      }
    } else if (currentStep === 3) {
      if (!bookingData.petInfo?.name || !bookingData.petInfo?.breed) {
        Alert.alert("알림", "반려동물 정보를 입력해주세요.");
        return;
      }
    } else if (currentStep === 4) {
      if (!bookingData.insuranceAgreed) {
        Alert.alert("알림", "보험 약관에 동의해주세요.");
        return;
      }
    }

    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePayment = () => {
    // 결제 처리 로직 (모의)
    Alert.alert(
      "결제 진행",
      "결제를 진행하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        {
          text: "결제",
          onPress: () => {
            // 결제 성공 후 다음 단계로
            setCurrentStep(5);
          },
        },
      ]
    );
  };

  const handleComplete = () => {
    Alert.alert(
      "예약 완료",
      "산책 예약이 성공적으로 완료되었습니다!",
      [
        {
          text: "확인",
          onPress: () => navigation.navigate("Main", { initialTab: "HomeTab" }),
        },
      ]
    );
  };

  const updateBookingData = (newData: BookingData) => {
    setBookingData(newData);
  };

  const openMenu = () => setIsMenuOpen(true);
  const closeMenu = () => setIsMenuOpen(false);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1BasicInfo bookingData={bookingData} onUpdate={updateBookingData} />;
      case 2:
        return <Step2WalkerSelection bookingData={bookingData} onUpdate={updateBookingData} />;
      case 3:
        return <Step3WalkSettings bookingData={bookingData} onUpdate={updateBookingData} />;
      case 4:
        return <Step4Payment bookingData={bookingData} onUpdate={updateBookingData} />;
      case 5:
        return <Step5Confirmation bookingData={bookingData} onComplete={handleComplete} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[homeScreenStyles.root, { backgroundColor: "#FFF5F0" }]}>
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
            style={{
              width: 40,
              height: 40,
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 20,
              backgroundColor: "rgba(197, 145, 114, 0.1)",
            }}>
            <Text style={{ fontSize: 18, color: "#C59172", fontWeight: "600" }}>←</Text>
          </Pressable>
          <Text style={[headerStyles.logo, { marginLeft: 10 }]}>
            🐕 산책 예약하기
          </Text>
        </View>
      </View>

      {/* Step Progress Indicator */}
      <View
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          paddingHorizontal: 20,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: "rgba(197, 145, 114, 0.2)",
        }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: currentStep >= step.id ? "#C59172" : "#E0E0E0",
                  justifyContent: "center",
                  alignItems: "center",
                }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: currentStep >= step.id ? "white" : "#999",
                  }}>
                  {step.id}
                </Text>
              </View>
              {index < steps.length - 1 && (
                <View
                  style={{
                    flex: 1,
                    height: 2,
                    backgroundColor: currentStep > step.id ? "#C59172" : "#E0E0E0",
                    marginHorizontal: 8,
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </View>
        <Text style={{ fontSize: 16, fontWeight: "600", color: "#333", marginBottom: 4 }}>
          {steps[currentStep - 1]?.title}
        </Text>
        <Text style={{ fontSize: 12, color: "#666" }}>
          {steps[currentStep - 1]?.description}
        </Text>
      </View>

      {/* Step Content */}
      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 16 }}>
        {renderStepContent()}
      </View>

      {/* Navigation Buttons */}
      {currentStep < 5 && (
        <View
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderTopWidth: 1,
            borderTopColor: "rgba(197, 145, 114, 0.2)",
          }}>
          <View style={{ flexDirection: "row", gap: 12 }}>
            {currentStep > 1 && (
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: "rgba(197, 145, 114, 0.1)",
                  borderRadius: 15,
                  padding: 16,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "rgba(197, 145, 114, 0.3)",
                }}
                onPress={() => setCurrentStep(currentStep - 1)}>
                <Text style={{ color: "#C59172", fontSize: 16, fontWeight: "600" }}>
                  이전
                </Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={{
                flex: currentStep === 1 ? 1 : 2,
                backgroundColor: "#C59172",
                borderRadius: 15,
                padding: 16,
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 5,
              }}
              onPress={currentStep === 4 ? handlePayment : handleNext}>
              <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
                {currentStep === 4 ? "결제하기" : "다음"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      <SideMenuDrawer isVisible={isMenuOpen} onClose={closeMenu} />
    </SafeAreaView>
  );
};

export default BookingScreen;
