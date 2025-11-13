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
import { IconImage, IconName } from "../components/IconImage";
import { usePet } from "../contexts/PetContext";

type SettingsScreenNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

const SettingsScreen = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const { refreshPetInfo } = usePet();  // PetContext 사용
  const [pushNotifications, setPushNotifications] = useState(true);
  const [locationServices, setLocationServices] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  
  // 화면 포커스될 때만 펫 정보 갱신
  // SettingsScreen에서는 펫 정보를 직접 수정하지 않으므로 자동 갱신 비활성화
  // useFocusEffect(
  //   useCallback(() => {
  //     console.log('🔄 SettingsScreen focused - refreshing pet info');
  //     refreshPetInfo();
  //   }, [refreshPetInfo])
  // );

  type SettingItem = {
    title: string;
    icon: IconName;
    action?: () => void;
    hasSwitch?: boolean;
    value?: boolean;
    onToggle?: (value: boolean) => void;
  };

  const settingSections: { title: string; items: SettingItem[] }[] = [
    {
      title: "계정 설정",
      items: [
        {
          title: "프로필 편집",
          icon: "paw",
          action: () => console.log("프로필 편집"),
        },
        {
          title: "반려동물 정보",
          icon: "dog",
          action: () => console.log("반려동물 정보"),
        },
        {
          title: "비밀번호 변경",
          icon: "setting",
          action: () => console.log("비밀번호 변경"),
        },
      ],
    },
    {
      title: "알림 설정",
      items: [
        {
          title: "푸시 알림",
          icon: "setting",
          hasSwitch: true,
          value: pushNotifications,
          onToggle: setPushNotifications,
        },
        {
          title: "마케팅 수신",
          icon: "shop",
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
          icon: "map",
          hasSwitch: true,
          value: locationServices,
          onToggle: setLocationServices,
        },
        {
          title: "개인정보 처리방침",
          icon: "home",
          action: () => console.log("개인정보 처리방침"),
        },
        {
          title: "이용약관",
          icon: "paw",
          action: () => console.log("이용약관"),
        },
      ],
    },
    {
      title: "지원",
      items: [
        {
          title: "고객센터",
          icon: "cart",
          action: () => console.log("고객센터"),
        },
        { title: "FAQ", icon: "paw", action: () => console.log("FAQ") },
        { title: "앱 정보", icon: "home", action: () => console.log("앱 정보") },
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
    <SafeAreaView
      style={[homeScreenStyles.root, { backgroundColor: "#FFF5F0" }]}>
      <View
        style={[
          headerStyles.header,
          { backgroundColor: "rgba(255, 255, 255, 0.95)" },
        ]}>
        <View style={headerStyles.logoContainer}>
          <IconImage name="setting" size={22} style={headerStyles.logoIcon} />
          <Text style={headerStyles.logoText}>Settings</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={homeScreenStyles.scrollContent}>
        {settingSections.map((section, sectionIndex) => (
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
                    <IconImage name={item.icon} size={22} style={{ marginRight: 12 }} />
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

export default SettingsScreen;
