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
  Animated,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from "../index";
import { headerStyles, homeScreenStyles } from "../styles/HomeScreenStyles";
import { IconImage, IconName } from "../components/IconImage";
import { usePet } from "../contexts/PetContext";
import { useSettings } from "../hooks/useSettings";
import { rf } from "../utils/responsive";

type SettingsScreenNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

const SettingsScreen = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const { refreshPetInfo } = usePet();  // PetContext 사용
  const {
    pushNotifications,
    setPushNotifications,
    locationServices,
    setLocationServices,
    marketingEmails,
    setMarketingEmails,
  } = useSettings();

  // 스위치 애니메이션을 위한 상태
  const [switchAnimations] = useState({
    push: new Animated.Value(1),
    location: new Animated.Value(1),
    marketing: new Animated.Value(1),
  });

  // 스위치 토글 시 애니메이션
  const animateSwitch = (key: 'push' | 'location' | 'marketing') => {
    Animated.sequence([
      Animated.timing(switchAnimations[key], {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(switchAnimations[key], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };
  
  // 화면 포커스될 때만 펫 정보 갱신
  // SettingsScreen에서는 펫 정보를 직접 수정하지 않으므로 자동 갱신 비활성화
  // useFocusEffect(
  //   useCallback(() => {
  //     
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
    description?: string;
    animationKey?: 'push' | 'location' | 'marketing';
  };

  const settingSections: { title: string; items: SettingItem[] }[] = [
    {
      title: "계정 설정",
      items: [
        {
          title: "프로필 편집",
          icon: "paw",
          action: () => navigation.navigate("ProfileEdit"),
          description: "프로필 사진 및 정보 수정",
        },
        {
          title: "반려동물 정보",
          icon: "dog",
          action: () => {
            // Main 화면으로 이동하면서 MyPetTab을 초기 탭으로 설정
            // 이렇게 하면 하단바의 MyPet 탭을 터치한 것과 동일한 화면으로 이동
            navigation.navigate("Main", { initialTab: "MyPetTab" });
          },
          description: "반려동물 프로필 관리",
        },
        {
          title: "비밀번호 변경",
          icon: "setting",
          action: () => navigation.navigate("PasswordChange"),
          description: "계정 보안 설정",
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
          onToggle: (value) => {
            animateSwitch('push');
            setPushNotifications(value);
          },
          description: "산책, 주문 등 중요 알림",
          animationKey: 'push',
        },
        {
          title: "마케팅 수신",
          icon: "shop",
          hasSwitch: true,
          value: marketingEmails,
          onToggle: (value) => {
            animateSwitch('marketing');
            setMarketingEmails(value);
          },
          description: "이벤트 및 프로모션 정보",
          animationKey: 'marketing',
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
          onToggle: (value) => {
            animateSwitch('location');
            setLocationServices(value);
          },
          description: "산책 경로 추적 및 워커 찾기",
          animationKey: 'location',
        },
        {
          title: "개인정보 처리방침",
          icon: "home",
          action: () => navigation.navigate("PrivacyPolicy"),
          description: "개인정보 보호 정책",
        },
        {
          title: "이용약관",
          icon: "paw",
          action: () => navigation.navigate("TermsOfService"),
          description: "서비스 이용 약관",
        },
      ],
    },
    {
      title: "지원",
      items: [
        {
          title: "고객센터",
          icon: "cart",
          action: () => navigation.navigate("CustomerService"),
          description: "1:1 문의 및 상담",
        },
        { 
          title: "FAQ", 
          icon: "paw", 
          action: () => navigation.navigate("FAQ"),
          description: "자주 묻는 질문",
        },
        { 
          title: "앱 정보", 
          icon: "home", 
          action: () => navigation.navigate("AppInfo"),
          description: "버전 및 라이선스 정보",
        },
      ],
    },
  ];

  const clearAsyncStorage = async () => {
    try {
      await AsyncStorage.clear();
    } catch (error) {
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
    <>
      <StatusBar barStyle="dark-content"/>
      <SafeAreaView style={{backgroundColor:"#FFFFFF"}}>
        <View
        style={[
          headerStyles.header,
          { backgroundColor: "rgba(255, 255, 255, 0.95)" },
        ]}>
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
              {section.items.map((item, itemIndex) => {
                const AnimatedTouchable = item.animationKey 
                  ? Animated.createAnimatedComponent(TouchableOpacity)
                  : TouchableOpacity;
                
                return (
                  <AnimatedTouchable
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
                      transform: item.animationKey 
                        ? [{ scale: switchAnimations[item.animationKey] }]
                        : undefined,
                  }}
                  onPress={item.action}
                    disabled={item.hasSwitch}
                    activeOpacity={0.7}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      flex: 1,
                    }}>
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          backgroundColor: item.value 
                            ? "rgba(197, 145, 114, 0.15)" 
                            : "rgba(0, 0, 0, 0.05)",
                          justifyContent: "center",
                          alignItems: "center",
                          marginRight: 12,
                        }}>
                        <IconImage 
                          name={item.icon} 
                          size={20} 
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                    <Text
                      style={{
                            fontSize: rf(16),
                        color: "#333",
                            fontWeight: "600",
                            marginBottom: 2,
                      }}>
                      {item.title}
                    </Text>
                        {item.description && (
                          <Text
                            style={{
                              fontSize: rf(12),
                              color: "#999",
                            }}>
                            {item.description}
                          </Text>
                        )}
                      </View>
                  </View>

                  {item.hasSwitch ? (
                    <Switch
                      value={item.value}
                      onValueChange={item.onToggle}
                        trackColor={{ false: "#E0E0E0", true: "#C59172" }}
                      thumbColor={item.value ? "#fff" : "#f4f3f4"}
                        ios_backgroundColor="#E0E0E0"
                    />
                  ) : (
                      <Text style={{ fontSize: 18, color: "#C59172", fontWeight: "600" }}>›</Text>
                  )}
                  </AnimatedTouchable>
                );
              })}
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
    </>
  );
};

export default SettingsScreen;
