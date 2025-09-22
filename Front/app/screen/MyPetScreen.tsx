import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { headerStyles, homeScreenStyles } from "../styles/HomeScreenStyles";

interface PetInfo {
  name: string;
  species: string;
  breed: string;
  age: string;
  weight: string;
  gender: "male" | "female" | "";
  isNeutered: boolean;
  medicalInfo: string;
  temperament: string;
}

const MyPetScreen = () => {
  const [petInfo, setPetInfo] = useState<PetInfo>({
    name: "",
    species: "dog",
    breed: "",
    age: "",
    weight: "",
    gender: "",
    isNeutered: false,
    medicalInfo: "",
    temperament: "",
  });

  const [hasPhoto, setHasPhoto] = useState(false);

  useEffect(() => {
    loadPetInfo();
  }, []);

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

  const handleSave = async () => {
    if (!petInfo.name || !petInfo.breed || !petInfo.age) {
      Alert.alert("알림", "필수 정보를 모두 입력해주세요.");
      return;
    }

    try {
      await AsyncStorage.setItem("petInfo", JSON.stringify(petInfo));
      Alert.alert("성공", "반려동물 정보가 저장되었습니다!", [
        {
          text: "확인",
          onPress: () => {
            console.log("Pet Info Saved:", petInfo);
          },
        },
      ]);
    } catch (error) {
      console.error("Failed to save pet info:", error);
      Alert.alert(
        "오류",
        "정보 저장 중 문제가 발생했습니다. 다시 시도해주세요."
      );
    }
  };

  const speciesOptions = [
    { key: "dog", label: "강아지", emoji: "🐕" },
    { key: "cat", label: "고양이", emoji: "🐱" },
    { key: "other", label: "기타", emoji: "🐾" },
  ];

  return (
    <SafeAreaView
      style={[homeScreenStyles.root, { backgroundColor: "#FFF5F0" }]}>
      <View
        style={[
          headerStyles.header,
          { backgroundColor: "rgba(255, 255, 255, 0.95)" },
        ]}>
        <Text style={headerStyles.logo}>🐾 My Pet</Text>
      </View>

      <ScrollView contentContainerStyle={homeScreenStyles.scrollContent}>
        {/* 프로필 사진 섹션 */}
        <View style={homeScreenStyles.section}>
          <Text style={homeScreenStyles.sectionTitle}>프로필 사진</Text>
          <View
            style={{
              alignItems: "center",
              marginBottom: 20,
            }}>
            <TouchableOpacity
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: "#f0f0f0",
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 2,
                borderColor: "#ddd",
                borderStyle: "dashed",
              }}
              onPress={() => {
                setHasPhoto(true);
                Alert.alert("사진 추가", "사진 기능은 추후 구현 예정입니다.");
              }}>
              {hasPhoto ? (
                <Image
                  source={{ uri: "https://via.placeholder.com/120" }}
                  style={{ width: 120, height: 120, borderRadius: 60 }}
                />
              ) : (
                <View style={{ alignItems: "center" }}>
                  <Text style={{ fontSize: 32, marginBottom: 5 }}>📷</Text>
                  <Text style={{ fontSize: 12, color: "#666" }}>사진 추가</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* 기본 정보 */}
        <View style={homeScreenStyles.section}>
          <Text style={homeScreenStyles.sectionTitle}>기본 정보</Text>

          <View style={{ marginBottom: 15 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "500",
                marginBottom: 8,
                color: "#333",
              }}>
              이름 *
            </Text>
            <TextInput
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                borderRadius: 15,
                padding: 18,
                fontSize: 16,
                borderWidth: 0,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
              placeholder="반려동물의 이름을 입력하세요"
              value={petInfo.name}
              onChangeText={(text) => setPetInfo({ ...petInfo, name: text })}
            />
          </View>

          <View style={{ marginBottom: 15 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "500",
                marginBottom: 8,
                color: "#333",
              }}>
              종류 *
            </Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              {speciesOptions.map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={{
                    flex: 1,
                    backgroundColor:
                      petInfo.species === option.key
                        ? "#C59172"
                        : "rgba(255, 255, 255, 0.95)",
                    borderRadius: 15,
                    padding: 18,
                    alignItems: "center",
                    borderWidth: 0,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                  onPress={() =>
                    setPetInfo({ ...petInfo, species: option.key })
                  }>
                  <Text style={{ fontSize: 20, marginBottom: 5 }}>
                    {option.emoji}
                  </Text>
                  <Text
                    style={{
                      color: petInfo.species === option.key ? "white" : "#333",
                      fontWeight: "500",
                    }}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{ marginBottom: 15 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "500",
                marginBottom: 8,
                color: "#333",
              }}>
              품종 *
            </Text>
            <TextInput
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                borderRadius: 15,
                padding: 18,
                fontSize: 16,
                borderWidth: 0,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
              placeholder="예: 골든 리트리버, 페르시안 등"
              value={petInfo.breed}
              onChangeText={(text) => setPetInfo({ ...petInfo, breed: text })}
            />
          </View>

          <View style={{ flexDirection: "row", gap: 10, marginBottom: 15 }}>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "500",
                  marginBottom: 8,
                  color: "#333",
                }}>
                나이 *
              </Text>
              <TextInput
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  borderRadius: 15,
                  padding: 18,
                  fontSize: 16,
                  borderWidth: 0,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
                placeholder="예: 3"
                value={petInfo.age}
                onChangeText={(text) => setPetInfo({ ...petInfo, age: text })}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "500",
                  marginBottom: 8,
                  color: "#333",
                }}>
                체중 (kg)
              </Text>
              <TextInput
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  borderRadius: 15,
                  padding: 18,
                  fontSize: 16,
                  borderWidth: 0,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
                placeholder="예: 25.5"
                value={petInfo.weight}
                onChangeText={(text) =>
                  setPetInfo({ ...petInfo, weight: text })
                }
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={{ marginBottom: 15 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "500",
                marginBottom: 8,
                color: "#333",
              }}>
              성별
            </Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor:
                    petInfo.gender === "male"
                      ? "#C59172"
                      : "rgba(255, 255, 255, 0.95)",
                  borderRadius: 15,
                  padding: 18,
                  alignItems: "center",
                  borderWidth: 0,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
                onPress={() => setPetInfo({ ...petInfo, gender: "male" })}>
                <Text style={{ fontSize: 20, marginBottom: 5 }}>♂️</Text>
                <Text
                  style={{
                    color: petInfo.gender === "male" ? "white" : "#333",
                    fontWeight: "500",
                  }}>
                  수컷
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor:
                    petInfo.gender === "female"
                      ? "#C59172"
                      : "rgba(255, 255, 255, 0.95)",
                  borderRadius: 15,
                  padding: 18,
                  alignItems: "center",
                  borderWidth: 0,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
                onPress={() => setPetInfo({ ...petInfo, gender: "female" })}>
                <Text style={{ fontSize: 20, marginBottom: 5 }}>♀️</Text>
                <Text
                  style={{
                    color: petInfo.gender === "female" ? "white" : "#333",
                    fontWeight: "500",
                  }}>
                  암컷
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              borderRadius: 15,
              padding: 18,
              borderWidth: 0,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
              marginBottom: 15,
            }}>
            <Text style={{ fontSize: 16, fontWeight: "500", color: "#333" }}>
              중성화 수술 여부
            </Text>
            <Switch
              value={petInfo.isNeutered}
              onValueChange={(value) =>
                setPetInfo({ ...petInfo, isNeutered: value })
              }
              trackColor={{ false: "#ccc", true: "#C59172" }}
              thumbColor={petInfo.isNeutered ? "#fff" : "#fff"}
            />
          </View>
        </View>

        {/* 추가 정보 */}
        <View style={homeScreenStyles.section}>
          <Text style={homeScreenStyles.sectionTitle}>추가 정보</Text>

          <View style={{ marginBottom: 15 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "500",
                marginBottom: 8,
                color: "#333",
              }}>
              성격/특징
            </Text>
            <TextInput
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                borderRadius: 15,
                padding: 18,
                fontSize: 16,
                borderWidth: 0,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
                height: 80,
                textAlignVertical: "top",
              }}
              placeholder="예: 활발하고 사람을 좋아함, 다른 강아지와 잘 어울림"
              value={petInfo.temperament}
              onChangeText={(text) =>
                setPetInfo({ ...petInfo, temperament: text })
              }
              multiline
            />
          </View>

          <View style={{ marginBottom: 15 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "500",
                marginBottom: 8,
                color: "#333",
              }}>
              건강 정보/알레르기
            </Text>
            <TextInput
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                borderRadius: 15,
                padding: 18,
                fontSize: 16,
                borderWidth: 0,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
                height: 80,
                textAlignVertical: "top",
              }}
              placeholder="예: 음식 알레르기, 복용 중인 약물, 주의사항 등"
              value={petInfo.medicalInfo}
              onChangeText={(text) =>
                setPetInfo({ ...petInfo, medicalInfo: text })
              }
              multiline
            />
          </View>
        </View>

        {/* 저장 버튼 */}
        <View style={{ marginBottom: 30 }}>
          <TouchableOpacity
            style={{
              backgroundColor: "#C59172",
              borderRadius: 20,
              padding: 20,
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 5,
              marginHorizontal: 20,
            }}
            onPress={handleSave}>
            <Text
              style={{
                color: "white",
                fontSize: 18,
                fontWeight: "600",
              }}>
              저장하기
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MyPetScreen;
