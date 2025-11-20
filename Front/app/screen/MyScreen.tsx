import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import {
    Alert,
    SafeAreaView,
    ScrollView,
    Switch,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import Header from "../components/Header";
import { RootStackParamList } from "../index";
import { homeScreenStyles } from "../styles/HomeScreenStyles";

type MyScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

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

const MyScreen = () => {
  const navigation = useNavigation<MyScreenNavigationProp>();
  const [petInfo, setPetInfo] = useState<PetInfo | null>(null);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [locationServices, setLocationServices] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  useEffect(() => {
    loadPetInfo();
  }, []);

  useEffect(() => {
    // 펫 정보가 로드된 후 확인하여 없으면 MyPet 화면으로 이동
    if (petInfo === null) {
      // 아직 로딩 중이므로 기다림
      return;
    }
    
    // petInfo가 빈 객체이거나 필수 정보가 없으면 MyPet으로 이동
    if (!petInfo || !petInfo.name || !petInfo.breed) {
      setTimeout(() => {
        navigation.navigate("MyPet");
      }, 500); // 화면이 렌더링된 후 이동
    }
  }, [petInfo, navigation]);

  const loadPetInfo = async () => {
    try {
      const savedPetInfo = await AsyncStorage.getItem("petInfo");
      if (savedPetInfo) {
        const parsedInfo = JSON.parse(savedPetInfo);
        setPetInfo(parsedInfo);
      } else {
        // 저장된 정보가 없음을 명시적으로 표시
        setPetInfo({
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
      }
    } catch (error) {
      console.error("Failed to load pet info:", error);
      // 오류 시에도 빈 정보로 설정
      setPetInfo({
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
    }
  };

  const clearAsyncStorage = async () => {
    try {
      await AsyncStorage.clear();
      console.log("AsyncStorage cleared successfully");
    } catch (error) {
      console.error("Failed to clear AsyncStorage:", error);
      Alert.alert("오류", "로그아웃 중 문제가 발생했습니다.");
    }
  };

  const handleLogout = () => {
    Alert.alert("로그아웃", "정말 로그아웃하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: async () => {
          await clearAsyncStorage();
          navigation.navigate("Login");
        },
      },
    ]);
  };

  const navigateToMyPet = () => {
    navigation.navigate("MyPet");
  };

  const myMenuSections = [
    {
      title: "반려동물",
      items: [
        {
          title: "내 반려동물 정보",
          icon: "🐕",
          subtitle: petInfo ? `${petInfo.name} (${petInfo.breed})` : "정보를 등록해주세요",
          action: navigateToMyPet,
        },
      ],
    },
    {
      title: "계정 설정",
      items: [
        {
          title: "프로필 편집",
          icon: "👤",
          action: () => console.log("프로필 편집"),
        },
        {
          title: "비밀번호 변경",
          icon: "🔒",
          action: () => console.log("비밀번호 변경"),
        },
      ],
    },
    {
      title: "알림 설정",
      items: [
        {
          title: "푸시 알림",
          icon: "🔔",
          hasSwitch: true,
          value: pushNotifications,
          onToggle: setPushNotifications,
        },
        {
          title: "마케팅 수신",
          icon: "📧",
          hasSwitch: true,
          value: marketingEmails,
          onToggle: setMarketingEmails,
        },
      ],
    },
    {
      title: "개인정보 및 보안",
      items: [
        {
          title: "위치 서비스",
          icon: "📍",
          hasSwitch: true,
          value: locationServices,
          onToggle: setLocationServices,
        },
        {
          title: "개인정보 처리방침",
          icon: "📋",
          action: () => console.log("개인정보 처리방침"),
        },
        {
          title: "이용약관",
          icon: "📝",
          action: () => console.log("이용약관"),
        },
      ],
    },
    {
      title: "지원",
      items: [
        {
          title: "고객센터",
          icon: "💬",
          action: () => console.log("고객센터"),
        },
        { title: "FAQ", icon: "❓", action: () => console.log("FAQ") },
        { title: "앱 정보", icon: "ℹ️", action: () => console.log("앱 정보") },
      ],
    },
  ];

  return (
    <SafeAreaView
      style={[homeScreenStyles.root, { backgroundColor: "#FFF5F0" }]}>
      <Header title="👤 My" />

      <ScrollView contentContainerStyle={homeScreenStyles.scrollContent}>
        {/* 프로필 요약 카드 */}
        <View style={homeScreenStyles.section}>
          <View
            style={{
              alignItems: "center",
              marginBottom: 20,
            }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: "#C59172",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 12,
              }}>
              <Text style={{ fontSize: 32, color: "white" }}>👤</Text>
            </View>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: "#4A4A4A",
                marginBottom: 4,
              }}>
              안녕하세요!
            </Text>
            {petInfo && (
              <Text style={{ fontSize: 14, color: "#666" }}>
                {petInfo.name}의 보호자
              </Text>
            )}
          </View>
        </View>

        {/* 메뉴 섹션들 */}
        {myMenuSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={homeScreenStyles.section}>
            <Text style={homeScreenStyles.sectionTitle}>{section.title}</Text>
            <View
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                borderRadius: 20,
                marginBottom: 20,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.12,
                shadowRadius: 8,
                elevation: 4,
              }}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingVertical: 18,
                    paddingHorizontal: 20,
                    borderBottomWidth:
                      itemIndex < section.items.length - 1 ? 1 : 0,
                    borderBottomColor: "rgba(240, 240, 240, 0.5)",
                  }}
                  onPress={item.action}
                  disabled={item.hasSwitch}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      flex: 1,
                    }}>
                    <Text style={{ fontSize: 20, marginRight: 12 }}>
                      {item.icon}
                    </Text>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 16,
                          color: "#333",
                          fontWeight: "500",
                        }}>
                        {item.title}
                      </Text>
                      {item.subtitle && (
                        <Text
                          style={{
                            fontSize: 12,
                            color: "#888",
                            marginTop: 2,
                          }}>
                          {item.subtitle}
                        </Text>
                      )}
                    </View>
                  </View>

                  {item.hasSwitch ? (
                    <Switch
                      value={item.value}
                      onValueChange={item.onToggle}
                      trackColor={{ false: "#ccc", true: "#4CAF50" }}
                      thumbColor={item.value ? "#fff" : "#fff"}
                    />
                  ) : (
                    <Text style={{ fontSize: 16, color: "#999" }}>&gt;</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* 로그아웃 버튼 */}
        <View style={homeScreenStyles.section}>
          <TouchableOpacity
            style={{
              backgroundColor: "#FF6B6B",
              borderRadius: 20,
              padding: 20,
              alignItems: "center",
              marginBottom: 20,
              marginHorizontal: 20,
              shadowColor: "#FF6B6B",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 4,
            }}
            onPress={handleLogout}>
            <Text
              style={{
                color: "white",
                fontSize: 18,
                fontWeight: "bold",
              }}>
              로그아웃
            </Text>
          </TouchableOpacity>
        </View>

        {/* 앱 버전 정보 */}
        <View style={{ alignItems: "center", marginBottom: 40 }}>
          <Text style={{ fontSize: 12, color: "#999" }}>Petmily v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MyScreen;
