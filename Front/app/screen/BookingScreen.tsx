import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MenuButton from "../components/MenuButton";
import SideMenuDrawer from "../components/SideMenuDrawer";
import { RootStackParamList } from "../index";
import {
  headerStyles,
  homeScreenStyles,
  modeStyles,
} from "../styles/HomeScreenStyles";

type BookingScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Booking"
>;

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

interface BookingData {
  duration: number;
  date: string;
  time: string;
  address: string;
  petInfo: PetInfo;
  requests: string;
}

const BookingScreen = () => {
  const navigation = useNavigation<BookingScreenNavigationProp>();
  const [bookingData, setBookingData] = useState<BookingData>({
    duration: 60,
    date: "",
    time: "",
    address: "",
    petInfo: {
      name: "",
      species: "dog",
      breed: "",
      age: "",
      weight: "",
      gender: "",
      isNeutered: false,
      medicalInfo: "",
      temperament: "",
    },
    requests: "",
  });

  const [isEditingPet, setIsEditingPet] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const durationOptions = [
    { value: 30, label: "30분" },
    { value: 60, label: "45분" },
    { value: 90, label: "60분" },
    { value: 120, label: "90분" },
  ];

  useEffect(() => {
    loadPetInfo();
  }, []);

  const loadPetInfo = async () => {
    try {
      const savedPetInfo = await AsyncStorage.getItem("petInfo");
      if (savedPetInfo) {
        const petInfo = JSON.parse(savedPetInfo);
        setBookingData((prev) => ({ ...prev, petInfo }));
      } else {
        setIsEditingPet(true); // 정보가 없으면 편집 모드로 시작
      }
    } catch (error) {
      console.error("Failed to load pet info:", error);
      setIsEditingPet(true);
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleBooking = () => {
    if (!bookingData.date || !bookingData.time || !bookingData.address) {
      Alert.alert("알림", "필수 정보를 모두 입력해주세요.");
      return;
    }

    if (!bookingData.petInfo.name || !bookingData.petInfo.breed) {
      Alert.alert("알림", "반려동물 정보를 입력해주세요.");
      return;
    }

    Alert.alert(
      "예약 완료!",
      `산책 예약이 완료되었습니다.\n\n날짜: ${bookingData.date}\n시간: ${bookingData.time}\n산책 시간: ${bookingData.duration}분\n장소: ${bookingData.address}`,
      [
        {
          text: "확인",
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const updatePetInfo = (field: keyof PetInfo, value: any) => {
    setBookingData((prev) => ({
      ...prev,
      petInfo: { ...prev.petInfo, [field]: value },
    }));
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
            style={{
              width: 40,
              height: 40,
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 20,
              backgroundColor: "rgba(0,0,0,0.1)",
            }}>
            <Text style={{ fontSize: 18, color: "#333" }}>←</Text>
          </Pressable>
          <Text style={[headerStyles.logo, { marginLeft: 10 }]}>
            🐕 산책 예약하기
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={homeScreenStyles.scrollContent}>
        {/* 산책 시간 선택 */}
        <View style={homeScreenStyles.section}>
          <Text style={homeScreenStyles.sectionTitle}>산책 시간</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {durationOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  modeStyles.modeChip,
                  {
                    flex: 0,
                    width: "48%",
                    backgroundColor:
                      bookingData.duration === option.value
                        ? "#C59172"
                        : "rgba(255, 255, 255, 0.95)",
                    borderWidth: 2,
                    borderColor:
                      bookingData.duration === option.value
                        ? "#C59172"
                        : "#E0E0E0",
                  },
                ]}
                onPress={() =>
                  setBookingData((prev) => ({
                    ...prev,
                    duration: option.value,
                  }))
                }>
                <Text
                  style={[
                    modeStyles.modeChipTitle,
                    {
                      color:
                        bookingData.duration === option.value
                          ? "white"
                          : "#333",
                    },
                  ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 날짜 및 시간 */}
        <View style={homeScreenStyles.section}>
          <Text style={homeScreenStyles.sectionTitle}>예약 날짜 및 시간</Text>

          <View style={{ marginBottom: 15 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "500",
                marginBottom: 8,
                color: "#333",
              }}>
              날짜 *
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
              placeholder="2025-09-19"
              value={bookingData.date}
              onChangeText={(text) =>
                setBookingData((prev) => ({ ...prev, date: text }))
              }
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
              시간 *
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
              placeholder="14:00"
              value={bookingData.time}
              onChangeText={(text) =>
                setBookingData((prev) => ({ ...prev, time: text }))
              }
            />
          </View>
        </View>

        {/* 방문 주소 */}
        <View style={homeScreenStyles.section}>
          <Text style={homeScreenStyles.sectionTitle}>방문 주소</Text>
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
            placeholder="산책할 장소의 주소를 입력해주세요"
            value={bookingData.address}
            onChangeText={(text) =>
              setBookingData((prev) => ({ ...prev, address: text }))
            }
            multiline
          />
        </View>

        {/* 반려동물 정보 */}
        <View style={homeScreenStyles.section}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 15,
            }}>
            <Text style={homeScreenStyles.sectionTitle}>반려동물 정보</Text>
            <TouchableOpacity
              onPress={() => setIsEditingPet(!isEditingPet)}
              style={{
                backgroundColor: "#C59172",
                paddingHorizontal: 15,
                paddingVertical: 8,
                borderRadius: 15,
              }}>
              <Text style={{ color: "white", fontWeight: "500" }}>
                {isEditingPet ? "완료" : "수정"}
              </Text>
            </TouchableOpacity>
          </View>

          {!isEditingPet && bookingData.petInfo.name ? (
            <View
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
              <Text
                style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
                {bookingData.petInfo.name}
              </Text>
              <Text style={{ fontSize: 14, color: "#666", marginBottom: 4 }}>
                {bookingData.petInfo.breed} • {bookingData.petInfo.age}세
              </Text>
              {bookingData.petInfo.weight && (
                <Text style={{ fontSize: 14, color: "#666", marginBottom: 4 }}>
                  체중: {bookingData.petInfo.weight}kg
                </Text>
              )}
              {bookingData.petInfo.temperament && (
                <Text style={{ fontSize: 14, color: "#666" }}>
                  성격: {bookingData.petInfo.temperament}
                </Text>
              )}
            </View>
          ) : (
            <View style={{ gap: 15 }}>
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
                placeholder="반려동물 이름 *"
                value={bookingData.petInfo.name}
                onChangeText={(text) => updatePetInfo("name", text)}
              />
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
                placeholder="품종 *"
                value={bookingData.petInfo.breed}
                onChangeText={(text) => updatePetInfo("breed", text)}
              />
              <View style={{ flexDirection: "row", gap: 10 }}>
                <TextInput
                  style={{
                    flex: 1,
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
                  placeholder="나이"
                  value={bookingData.petInfo.age}
                  onChangeText={(text) => updatePetInfo("age", text)}
                  keyboardType="numeric"
                />
                <TextInput
                  style={{
                    flex: 1,
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
                  placeholder="체중(kg)"
                  value={bookingData.petInfo.weight}
                  onChangeText={(text) => updatePetInfo("weight", text)}
                  keyboardType="numeric"
                />
              </View>
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
                placeholder="성격/특징"
                value={bookingData.petInfo.temperament}
                onChangeText={(text) => updatePetInfo("temperament", text)}
                multiline
              />
            </View>
          )}
        </View>

        {/* 요청사항 */}
        <View style={homeScreenStyles.section}>
          <Text style={homeScreenStyles.sectionTitle}>요청사항</Text>
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
              height: 100,
              textAlignVertical: "top",
            }}
            placeholder="워커에게 전달하고 싶은 특별한 요청사항이 있다면 입력해주세요"
            value={bookingData.requests}
            onChangeText={(text) =>
              setBookingData((prev) => ({ ...prev, requests: text }))
            }
            multiline
          />
        </View>

        {/* 예약하기 버튼 */}
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
            onPress={handleBooking}>
            <Text
              style={{
                color: "white",
                fontSize: 18,
                fontWeight: "600",
              }}>
              예약하기
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      <SideMenuDrawer isVisible={isMenuOpen} onClose={closeMenu} />
    </SafeAreaView>
  );
};

export default BookingScreen;
