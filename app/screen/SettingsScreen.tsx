import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState, useCallback } from "react";
import {
  Alert,
  ScrollView,
  StatusBar,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from "../index";
import { headerStyles, homeScreenStyles } from "../styles/HomeScreenStyles";
import { usePet } from "../contexts/PetContext";

type SettingsScreenNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

const SettingsScreen = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const { refreshPetInfo } = usePet();  // PetContext 사용
  const [pushNotifications, setPushNotifications] = useState(true);
  const [locationServices, setLocationServices] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  
  // 화면 포커스될 때만 펫 정보 갱신 (필요시에만)
  // SettingsScreen에서는 펫 정보를 직접 수정하지 않으므로 자동 갱신 비활성화
  // useFocusEffect(
  //   useCallback(() => {
  //     console.log('🔄 SettingsScreen focused - refreshing pet info');
  //     refreshPetInfo();
  //   }, [refreshPetInfo])
  // );

  const settingSections = [
    {
      title: "계정 설정",
      items: [
        {
          title: "프로필 편집",
          icon: "👤",
          action: () => console.log("프로필 편집"),
        },
        {
          title: "반려동물 정보",
          icon: "🐕",
          action: () => console.log("반려동물 정보"),
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

  const clearAsyncStorage = async () => {
    try {
      await AsyncStorage.clear();
      console.log("AsyncStorage cleared successfully");
    } catch (error) {
      console.error("Failed to clear AsyncStorage:", error);
      Alert.alert("오류", "로그아웃 중 문제가 발생했습니다.");
    }
  };
  //나중에 clearAsyncStorage 함수 삭제
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

  return (
    <View
      style={[homeScreenStyles.root, { backgroundColor: "#f8f9fa" }]}>
      <StatusBar 
        backgroundColor="#fff" 
        barStyle="dark-content" 
        translucent={false}
      />
      <View
        style={{
          backgroundColor: "#fff",
          paddingHorizontal: 20,
          paddingTop: 0,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: "#f0f0f0",
        }}>
        <Text style={{
          fontSize: 24,
          fontWeight: "700",
          color: "#C59172",
        }}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={homeScreenStyles.scrollContent}>
        {settingSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={homeScreenStyles.section}>
            <Text style={homeScreenStyles.sectionTitle}>{section.title}</Text>
            <View
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                borderRadius: 16,
                marginBottom: 20,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
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
                    <Text
                      style={{
                        fontSize: 16,
                        color: "#333",
                        fontWeight: "500",
                      }}>
                      {item.title}
                    </Text>
                  </View>

                  {item.hasSwitch ? (
                    <Switch
                      value={item.value}
                      onValueChange={item.onToggle}
                      trackColor={{ false: "#ccc", true: "#C59172" }}
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
              borderRadius: 16,
              padding: 20,
              alignItems: "center",
              marginBottom: 20,
              marginHorizontal: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
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
    </View>
  );
};

export default SettingsScreen;
