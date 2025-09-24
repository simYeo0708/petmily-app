import React, { useState } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { homeScreenStyles } from "../../styles/HomeScreenStyles";
import { BookingData, PaymentMethod, PricingInfo, StepProps } from "../../types/BookingTypes";

const Step4Payment: React.FC<StepProps> = ({ bookingData, onUpdate }) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"card" | "kakao" | "naver" | "toss">(bookingData.paymentMethod || "card");
  const [insuranceAgreed, setInsuranceAgreed] = useState<boolean>(bookingData.insuranceAgreed || false);

  const paymentMethods: PaymentMethod[] = [
    {
      id: "card",
      name: "신용/체크카드",
      icon: "💳",
      description: "간편하고 안전한 카드 결제",
    },
    {
      id: "kakao",
      name: "카카오페이",
      icon: "💛",
      description: "카카오톡으로 간편결제",
    },
    {
      id: "naver",
      name: "네이버페이",
      icon: "💚",
      description: "네이버 간편결제",
    },
    {
      id: "toss",
      name: "토스페이",
      icon: "💙",
      description: "토스 간편결제",
    },
  ];

  // 가격 계산
  const calculatePrice = (): PricingInfo => {
    const basePrice = bookingData.duration === 30 ? 15000 : 
                     bookingData.duration === 60 ? 25000 : 
                     bookingData.duration === 90 ? 35000 : 25000;
    
    const packageDiscount = bookingData.walkType === "package" ? 0.1 : 0;
    const discountAmount = Math.floor(basePrice * packageDiscount);
    const finalPrice = basePrice - discountAmount;

    return {
      basePrice,
      discountAmount,
      finalPrice,
    };
  };

  const { basePrice, discountAmount, finalPrice } = calculatePrice();

  React.useEffect(() => {
    const updatedData: BookingData = {
      ...bookingData,
      paymentMethod: selectedPaymentMethod,
      insuranceAgreed,
      pricing: {
        basePrice,
        discountAmount,
        finalPrice,
      },
    };
    onUpdate(updatedData);
  }, [selectedPaymentMethod, insuranceAgreed, basePrice, discountAmount, finalPrice]);

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* 보험 안내 */}
      <View style={homeScreenStyles.section}>
        <Text style={homeScreenStyles.sectionTitle}>🛡️ 보험 안내</Text>
        
        <View
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            borderRadius: 15,
            padding: 18,
            borderWidth: 1,
            borderColor: "#E0E0E0",
            marginBottom: 16,
          }}>
          <Text style={{ fontSize: 16, fontWeight: "600", color: "#333", marginBottom: 12 }}>
            🏥 펫밀리 안심 보장 서비스
          </Text>
          
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
              <Text style={{ fontSize: 14, color: "#C59172", marginRight: 8 }}>✓</Text>
              <Text style={{ fontSize: 14, color: "#666", flex: 1 }}>
                산책 중 발생하는 반려동물 상해 치료비 최대 100만원 보장
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
              <Text style={{ fontSize: 14, color: "#C59172", marginRight: 8 }}>✓</Text>
              <Text style={{ fontSize: 14, color: "#666", flex: 1 }}>
                워커 과실로 인한 반려동물 분실 시 수색비 및 위로금 지원
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
              <Text style={{ fontSize: 14, color: "#C59172", marginRight: 8 }}>✓</Text>
              <Text style={{ fontSize: 14, color: "#666", flex: 1 }}>
                제3자 피해 배상책임 최대 1,000만원 보장
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
              <Text style={{ fontSize: 14, color: "#C59172", marginRight: 8 }}>✓</Text>
              <Text style={{ fontSize: 14, color: "#666", flex: 1 }}>
                24시간 응급상황 대응 서비스
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={{
            backgroundColor: insuranceAgreed ? "rgba(197, 145, 114, 0.1)" : "rgba(255, 255, 255, 0.95)",
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: insuranceAgreed ? "#C59172" : "#E0E0E0",
          }}
          onPress={() => setInsuranceAgreed(!insuranceAgreed)}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                borderWidth: 2,
                borderColor: insuranceAgreed ? "#C59172" : "#E0E0E0",
                backgroundColor: insuranceAgreed ? "#C59172" : "transparent",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 12,
              }}>
              {insuranceAgreed && (
                <Text style={{ color: "white", fontSize: 12, fontWeight: "bold" }}>✓</Text>
              )}
            </View>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: insuranceAgreed ? "#C59172" : "#333",
              }}>
              보험 약관에 동의합니다 (필수)
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 최종 금액 확인 */}
      <View style={homeScreenStyles.section}>
        <Text style={homeScreenStyles.sectionTitle}>💰 최종 금액 확인</Text>
        
        <View
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            borderRadius: 15,
            padding: 18,
            borderWidth: 1,
            borderColor: "#E0E0E0",
          }}>
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontSize: 14, color: "#666" }}>
                기본 요금 ({bookingData.duration}분)
              </Text>
              <Text style={{ fontSize: 14, color: "#333" }}>
                {basePrice.toLocaleString()}원
              </Text>
            </View>
            
            {bookingData.walkType === "package" && (
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontSize: 14, color: "#C59172" }}>
                  정기 패키지 할인 (10%)
                </Text>
                <Text style={{ fontSize: 14, color: "#C59172" }}>
                  -{discountAmount.toLocaleString()}원
                </Text>
              </View>
            )}
            
            <View
              style={{
                height: 1,
                backgroundColor: "#E0E0E0",
                marginVertical: 8,
              }}
            />
            
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontSize: 16, fontWeight: "600", color: "#333" }}>
                총 결제 금액
              </Text>
              <Text style={{ fontSize: 18, fontWeight: "700", color: "#C59172" }}>
                {finalPrice.toLocaleString()}원
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* 결제 방법 선택 */}
      <View style={homeScreenStyles.section}>
        <Text style={homeScreenStyles.sectionTitle}>💳 결제 방법 선택</Text>
        
        <View style={{ gap: 8 }}>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={{
                backgroundColor: selectedPaymentMethod === method.id
                  ? "rgba(197, 145, 114, 0.1)"
                  : "rgba(255, 255, 255, 0.95)",
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: selectedPaymentMethod === method.id ? "#C59172" : "#E0E0E0",
              }}
              onPress={() => setSelectedPaymentMethod(method.id)}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ fontSize: 24, marginRight: 12 }}>{method.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: selectedPaymentMethod === method.id ? "#C59172" : "#333",
                      marginBottom: 2,
                    }}>
                    {method.name}
                  </Text>
                  <Text style={{ fontSize: 12, color: "#666" }}>
                    {method.description}
                  </Text>
                </View>
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: selectedPaymentMethod === method.id ? "#C59172" : "#E0E0E0",
                    backgroundColor: selectedPaymentMethod === method.id ? "#C59172" : "transparent",
                    justifyContent: "center",
                    alignItems: "center",
                  }}>
                  {selectedPaymentMethod === method.id && (
                    <Text style={{ color: "white", fontSize: 12, fontWeight: "bold" }}>✓</Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 주의사항 */}
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
            ⚠️ 결제 전 확인사항
          </Text>
          <View style={{ gap: 4 }}>
            <Text style={{ fontSize: 12, color: "#856404" }}>
              • 예약 취소는 산책 시작 2시간 전까지 가능합니다
            </Text>
            <Text style={{ fontSize: 12, color: "#856404" }}>
              • 당일 취소 시 50% 수수료가 발생할 수 있습니다
            </Text>
            <Text style={{ fontSize: 12, color: "#856404" }}>
              • 워커 변경은 24시간 전까지만 가능합니다
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default Step4Payment;
