import React, { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { homeScreenStyles, modeStyles } from "../../styles/HomeScreenStyles";
import { BookingData, DurationOption, StepProps, WalkType } from "../../types/BookingTypes";

const Step1BasicInfo: React.FC<StepProps> = ({ bookingData, onUpdate }) => {
  const [selectedType, setSelectedType] = useState<"single" | "package">(bookingData.walkType || "single");
  const [selectedDuration, setSelectedDuration] = useState<number>(bookingData.duration || 60);
  const [date, setDate] = useState<string>(bookingData.date || "");
  const [time, setTime] = useState<string>(bookingData.time || "");
  const [address, setAddress] = useState<string>(bookingData.address || "");

  const walkTypes: WalkType[] = [
    { value: "single", label: "일회성 산책", description: "한 번만 산책" },
    { value: "package", label: "정기 산책 패키지", description: "주기적으로 산책" },
  ];

  const durationOptions: DurationOption[] = [
    { value: 30, label: "30분" },
    { value: 60, label: "1시간" },
    { value: 90, label: "90분" },
  ];

  const handleUpdate = () => {
    const updatedData: BookingData = {
      ...bookingData,
      walkType: selectedType,
      duration: selectedDuration,
      date,
      time,
      address,
    };
    onUpdate(updatedData);
  };

  React.useEffect(() => {
    handleUpdate();
  }, [selectedType, selectedDuration, date, time, address]);

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={homeScreenStyles.section}>
        <Text style={homeScreenStyles.sectionTitle}>📅 날짜 & 시간 선택</Text>
        
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: "500", marginBottom: 8, color: "#333" }}>
            날짜 선택 *
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              borderRadius: 15,
              padding: 18,
              borderWidth: 2,
              borderColor: date ? "#C59172" : "#E0E0E0",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}>
            <TextInput
              style={{ fontSize: 16, color: "#333" }}
              placeholder="YYYY-MM-DD (예: 2024-12-25)"
              value={date}
              onChangeText={setDate}
            />
          </TouchableOpacity>
        </View>

        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: "500", marginBottom: 8, color: "#333" }}>
            시간 선택 *
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              borderRadius: 15,
              padding: 18,
              borderWidth: 2,
              borderColor: time ? "#C59172" : "#E0E0E0",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}>
            <TextInput
              style={{ fontSize: 16, color: "#333" }}
              placeholder="HH:MM (예: 14:30)"
              value={time}
              onChangeText={setTime}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={homeScreenStyles.section}>
        <Text style={homeScreenStyles.sectionTitle}>🚶‍♂️ 산책 유형 선택</Text>
        <View style={{ gap: 12 }}>
          {walkTypes.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[
                {
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  borderRadius: 15,
                  padding: 18,
                  borderWidth: 2,
                  borderColor: selectedType === type.value ? "#C59172" : "#E0E0E0",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                },
              ]}
              onPress={() => setSelectedType(type.value)}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: selectedType === type.value ? "#C59172" : "#333",
                  marginBottom: 4,
                }}>
                {type.label}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: "#666",
                }}>
                {type.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={homeScreenStyles.section}>
        <Text style={homeScreenStyles.sectionTitle}>⏰ 산책 시간</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          {durationOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                {
                  flex: 1,
                  minWidth: "30%",
                  backgroundColor: selectedDuration === option.value ? "#C59172" : "rgba(255, 255, 255, 0.95)",
                  borderRadius: 15,
                  padding: 16,
                  borderWidth: 2,
                  borderColor: selectedDuration === option.value ? "#C59172" : "#E0E0E0",
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                },
              ]}
              onPress={() => setSelectedDuration(option.value)}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: selectedDuration === option.value ? "white" : "#333",
                }}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={homeScreenStyles.section}>
        <Text style={homeScreenStyles.sectionTitle}>📍 위치 설정</Text>
        <View style={{ gap: 12 }}>
          <TouchableOpacity
            style={{
              backgroundColor: "rgba(197, 145, 114, 0.1)",
              borderRadius: 15,
              padding: 16,
              borderWidth: 1,
              borderColor: "rgba(197, 145, 114, 0.3)",
              alignItems: "center",
            }}>
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#C59172" }}>
              📍 현재 위치 사용
            </Text>
          </TouchableOpacity>
          
          <Text style={{ fontSize: 14, color: "#666", textAlign: "center", marginVertical: 8 }}>
            또는
          </Text>
          
          <View>
            <Text style={{ fontSize: 16, fontWeight: "500", marginBottom: 8, color: "#333" }}>
              주소 직접 입력
            </Text>
            <TextInput
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                borderRadius: 15,
                padding: 18,
                fontSize: 16,
                borderWidth: 2,
                borderColor: address ? "#C59172" : "#E0E0E0",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
                minHeight: 80,
                textAlignVertical: "top",
              }}
              placeholder="산책할 장소의 주소를 입력해주세요&#10;예) 서울시 강남구 역삼동 123-45"
              value={address}
              onChangeText={setAddress}
              multiline
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default Step1BasicInfo;
