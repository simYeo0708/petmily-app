import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { RootStackParamList } from "../index";
import { headerStyles, homeScreenStyles } from "../styles/HomeScreenStyles";
import { authService } from "../../services/authService";
import { userService, User } from "../../services/userService";

type SettingsScreenNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

const SettingsScreen = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [locationServices, setLocationServices] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);

  const loadCurrentUser = useCallback(async () => {
    try {
      const user = await userService.getCurrentUser();
      setCurrentUser(user);
    } catch (error: any) {
      console.error('Failed to load user:', error);
      // 토큰이 만료되었거나 유효하지 않을 경우 로그인 화면으로
      if (error.message.includes('401') || error.message.includes('로그인')) {
        navigation.navigate("Login");
      }
    } finally {
      setLoading(false);
    }
  }, [navigation]);

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

  const handleLogout = () => {
    Alert.alert("로그아웃", "정말 로그아웃하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: async () => {
          try {
            await authService.logout();
            navigation.navigate("Login");
          } catch (error: any) {
            console.error('Logout failed:', error);
            // 로그아웃 API 실패해도 로컬 토큰은 삭제됨
            navigation.navigate("Login");
          }
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
        <Text style={headerStyles.logo}>⚙️ Settings</Text>
      </View>

      <ScrollView contentContainerStyle={homeScreenStyles.scrollContent}>
        {/* 사용자 정보 섹션 */}
        {currentUser && (
          <View style={homeScreenStyles.section}>
            <Text style={homeScreenStyles.sectionTitle}>내 정보</Text>
            <View
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                borderRadius: 20,
                padding: 20,
                marginBottom: 20,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.12,
                shadowRadius: 8,
                elevation: 4,
              }}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                <Text style={{ fontSize: 20, marginRight: 12 }}>👤</Text>
                <View>
                  <Text style={{ fontSize: 18, fontWeight: "bold", color: "#333" }}>
                    {currentUser.name}
                  </Text>
                  <Text style={{ fontSize: 14, color: "#666", marginTop: 2 }}>
                    @{currentUser.username}
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ fontSize: 16, marginRight: 12 }}>📧</Text>
                <Text style={{ fontSize: 14, color: "#666" }}>
                  {currentUser.email}
                </Text>
              </View>
            </View>
          </View>
        )}

        {loading && (
          <View style={{ padding: 20, alignItems: "center" }}>
            <Text style={{ color: "#666" }}>사용자 정보 로딩 중...</Text>
          </View>
        )}

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
