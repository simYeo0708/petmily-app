import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { homeScreenStyles } from "../../styles/HomeScreenStyles";
import { BookingData, CautionTemplate, NotificationSettings, PetInfo, StepProps } from "../../types/BookingTypes";

const Step3WalkSettings: React.FC<StepProps> = ({ bookingData, onUpdate }) => {
  const [petInfo, setPetInfo] = useState<PetInfo>({
    name: "",
    breed: "",
    age: "",
    weight: "",
    temperament: "",
    medicalInfo: "",
  });
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>(bookingData.cautionTemplates || []);
  const [customNotes, setCustomNotes] = useState<string>(bookingData.customNotes || "");
  const [emergencyContact, setEmergencyContact] = useState<string>(bookingData.emergencyContact || "");
  const [notifications, setNotifications] = useState<NotificationSettings>({
    departure: bookingData.notifications?.departure ?? true,
    delay: bookingData.notifications?.delay ?? true,
    completion: bookingData.notifications?.completion ?? true,
  });

  const cautionTemplates: CautionTemplate[] = [
    {
      id: "door_lock",
      title: "🚪 도어락 정보",
      description: "도어락 비밀번호 및 사용법",
    },
    {
      id: "elevator",
      title: "🏢 엘리베이터 이용",
      description: "엘리베이터 사용 시 주의사항",
    },
    {
      id: "sociability",
      title: "🐕 사회성",
      description: "다른 반려동물과의 관계",
    },
    {
      id: "leash",
      title: "🦮 목줄/하네스",
      description: "목줄 착용 및 산책 방법",
    },
    {
      id: "health",
      title: "💊 건강 상태",
      description: "복용 중인 약물이나 주의할 질병",
    },
    {
      id: "behavior",
      title: "🎾 행동 특성",
      description: "특별한 행동이나 습관",
    },
  ];

  useEffect(() => {
    loadPetInfo();
  }, []);

  useEffect(() => {
    const updatedData: BookingData = {
      ...bookingData,
      petInfo,
      cautionTemplates: selectedTemplates,
      customNotes,
      emergencyContact,
      notifications,
    };
    onUpdate(updatedData);
  }, [petInfo, selectedTemplates, customNotes, emergencyContact, notifications]);

  const loadPetInfo = async () => {
    try {
      const savedPetInfo = await AsyncStorage.getItem("petInfo");
      if (savedPetInfo) {
        setPetInfo(JSON.parse(savedPetInfo));
      }
    } catch (error) {
      console.error("Failed to load pet info:", error);
    }
  };

  const toggleTemplate = (templateId: string) => {
    setSelectedTemplates(prev => 
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  const updatePetInfo = (field: keyof PetInfo, value: string) => {
    setPetInfo(prev => ({ ...prev, [field]: value }));
  };

  const toggleNotification = (type: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [type]: !prev[type] }));
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* 반려동물 정보 확인 */}
      <View style={homeScreenStyles.section}>
        <Text style={homeScreenStyles.sectionTitle}>🐾 반려동물 정보 확인</Text>
        <Text style={{ fontSize: 14, color: "#666", marginBottom: 16 }}>
          프로필에서 가져온 정보입니다. 수정이 필요하면 직접 편집해주세요.
        </Text>

        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: "500", marginBottom: 6, color: "#333" }}>
                이름 *
              </Text>
              <TextInput
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  borderRadius: 12,
                  padding: 14,
                  fontSize: 14,
                  borderWidth: 1,
                  borderColor: "#E0E0E0",
                }}
                value={petInfo.name}
                onChangeText={(text) => updatePetInfo("name", text)}
                placeholder="반려동물 이름"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: "500", marginBottom: 6, color: "#333" }}>
                품종 *
              </Text>
              <TextInput
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  borderRadius: 12,
                  padding: 14,
                  fontSize: 14,
                  borderWidth: 1,
                  borderColor: "#E0E0E0",
                }}
                value={petInfo.breed}
                onChangeText={(text) => updatePetInfo("breed", text)}
                placeholder="품종"
              />
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: "500", marginBottom: 6, color: "#333" }}>
                나이
              </Text>
              <TextInput
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  borderRadius: 12,
                  padding: 14,
                  fontSize: 14,
                  borderWidth: 1,
                  borderColor: "#E0E0E0",
                }}
                value={petInfo.age}
                onChangeText={(text) => updatePetInfo("age", text)}
                placeholder="나이"
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: "500", marginBottom: 6, color: "#333" }}>
                체중 (kg)
              </Text>
              <TextInput
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  borderRadius: 12,
                  padding: 14,
                  fontSize: 14,
                  borderWidth: 1,
                  borderColor: "#E0E0E0",
                }}
                value={petInfo.weight}
                onChangeText={(text) => updatePetInfo("weight", text)}
                placeholder="체중"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View>
            <Text style={{ fontSize: 14, fontWeight: "500", marginBottom: 6, color: "#333" }}>
              성격/특징
            </Text>
            <TextInput
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                borderRadius: 12,
                padding: 14,
                fontSize: 14,
                borderWidth: 1,
                borderColor: "#E0E0E0",
                minHeight: 60,
                textAlignVertical: "top",
              }}
              value={petInfo.temperament}
              onChangeText={(text) => updatePetInfo("temperament", text)}
              placeholder="성격이나 특별한 특징을 입력해주세요"
              multiline
            />
          </View>
        </View>
      </View>

      {/* 주의사항 설정 */}
      <View style={homeScreenStyles.section}>
        <Text style={homeScreenStyles.sectionTitle}>⚠️ 주의사항 설정</Text>
        <Text style={{ fontSize: 14, color: "#666", marginBottom: 16 }}>
          해당되는 항목을 선택해주세요. 워커가 미리 준비할 수 있습니다.
        </Text>

        <View style={{ gap: 8 }}>
          {cautionTemplates.map((template) => (
            <TouchableOpacity
              key={template.id}
              style={{
                backgroundColor: selectedTemplates.includes(template.id)
                  ? "rgba(197, 145, 114, 0.1)"
                  : "rgba(255, 255, 255, 0.95)",
                borderRadius: 12,
                padding: 14,
                borderWidth: 1,
                borderColor: selectedTemplates.includes(template.id)
                  ? "#C59172"
                  : "#E0E0E0",
              }}
              onPress={() => toggleTemplate(template.id)}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: selectedTemplates.includes(template.id) ? "#C59172" : "#333",
                      marginBottom: 2,
                    }}>
                    {template.title}
                  </Text>
                  <Text style={{ fontSize: 12, color: "#666" }}>
                    {template.description}
                  </Text>
                </View>
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: selectedTemplates.includes(template.id) ? "#C59172" : "#E0E0E0",
                    backgroundColor: selectedTemplates.includes(template.id) ? "#C59172" : "transparent",
                    justifyContent: "center",
                    alignItems: "center",
                  }}>
                  {selectedTemplates.includes(template.id) && (
                    <Text style={{ color: "white", fontSize: 12, fontWeight: "bold" }}>✓</Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ marginTop: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: "500", marginBottom: 8, color: "#333" }}>
            추가 메모
          </Text>
          <TextInput
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              borderRadius: 12,
              padding: 14,
              fontSize: 14,
              borderWidth: 1,
              borderColor: "#E0E0E0",
              minHeight: 80,
              textAlignVertical: "top",
            }}
            value={customNotes}
            onChangeText={setCustomNotes}
            placeholder="워커에게 전달하고 싶은 추가 정보를 입력해주세요"
            multiline
          />
        </View>
      </View>

      {/* 비상연락망 설정 */}
      <View style={homeScreenStyles.section}>
        <Text style={homeScreenStyles.sectionTitle}>📞 비상연락망 설정</Text>
        <Text style={{ fontSize: 14, color: "#666", marginBottom: 16 }}>
          응급상황 시 연락받을 번호를 입력해주세요.
        </Text>

        <TextInput
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            borderRadius: 12,
            padding: 14,
            fontSize: 14,
            borderWidth: 1,
            borderColor: "#E0E0E0",
          }}
          value={emergencyContact}
          onChangeText={setEmergencyContact}
          placeholder="010-1234-5678"
          keyboardType="phone-pad"
        />
      </View>

      {/* 알림 설정 */}
      <View style={homeScreenStyles.section}>
        <Text style={homeScreenStyles.sectionTitle}>🔔 알림 설정</Text>
        <Text style={{ fontSize: 14, color: "#666", marginBottom: 16 }}>
          받고 싶은 알림을 선택해주세요.
        </Text>

        <View style={{ gap: 12 }}>
          <View
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: "#E0E0E0",
            }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 2 }}>
                  산책 출발 알림
                </Text>
                <Text style={{ fontSize: 12, color: "#666" }}>
                  워커가 산책을 시작할 때 알림을 받습니다
                </Text>
              </View>
              <Switch
                value={notifications.departure}
                onValueChange={() => toggleNotification("departure")}
                trackColor={{ false: "#E0E0E0", true: "#C59172" }}
                thumbColor={notifications.departure ? "#FFF" : "#FFF"}
              />
            </View>
          </View>

          <View
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: "#E0E0E0",
            }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 2 }}>
                  지연 알림
                </Text>
                <Text style={{ fontSize: 12, color: "#666" }}>
                  예정 시간보다 늦어질 때 알림을 받습니다
                </Text>
              </View>
              <Switch
                value={notifications.delay}
                onValueChange={() => toggleNotification("delay")}
                trackColor={{ false: "#E0E0E0", true: "#C59172" }}
                thumbColor={notifications.delay ? "#FFF" : "#FFF"}
              />
            </View>
          </View>

          <View
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: "#E0E0E0",
            }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 2 }}>
                  산책 완료 알림
                </Text>
                <Text style={{ fontSize: 12, color: "#666" }}>
                  산책이 완료되었을 때 알림을 받습니다
                </Text>
              </View>
              <Switch
                value={notifications.completion}
                onValueChange={() => toggleNotification("completion")}
                trackColor={{ false: "#E0E0E0", true: "#C59172" }}
                thumbColor={notifications.completion ? "#FFF" : "#FFF"}
              />
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default Step3WalkSettings;
