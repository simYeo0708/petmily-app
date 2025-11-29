import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert, Platform, Linking } from "react-native";

const SETTINGS_KEYS = {
  PUSH_NOTIFICATIONS: '@settings/pushNotifications',
  LOCATION_SERVICES: '@settings/locationServices',
  MARKETING_EMAILS: '@settings/marketingEmails',
};

export const useSettings = () => {
  const [pushNotifications, setPushNotificationsState] = useState(true);
  const [locationServices, setLocationServicesState] = useState(true);
  const [marketingEmails, setMarketingEmailsState] = useState(false);

  // 설정 로드
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [push, location, marketing] = await Promise.all([
        AsyncStorage.getItem(SETTINGS_KEYS.PUSH_NOTIFICATIONS),
        AsyncStorage.getItem(SETTINGS_KEYS.LOCATION_SERVICES),
        AsyncStorage.getItem(SETTINGS_KEYS.MARKETING_EMAILS),
      ]);

      if (push !== null) setPushNotificationsState(JSON.parse(push));
      if (location !== null) setLocationServicesState(JSON.parse(location));
      if (marketing !== null) setMarketingEmailsState(JSON.parse(marketing));
    } catch (error) {
      console.error('설정 로드 실패:', error);
    }
  };

  const setPushNotifications = async (value: boolean) => {
    try {
      if (value) {
        // 알림 권한 안내
        Alert.alert(
          "✅ 푸시 알림 활성화",
          "산책 요청, 주문 배송, 워커 매칭 등 중요한 알림을 받으실 수 있습니다.\n\n• 산책 예약 알림\n• 주문 배송 상태\n• 워커 매칭 완료\n• 특별 이벤트\n\n기기 설정에서 알림 권한을 허용해주세요.",
          [
            { text: "취소", style: "cancel" },
            { 
              text: "설정으로 이동", 
              onPress: async () => {
                await AsyncStorage.setItem(SETTINGS_KEYS.PUSH_NOTIFICATIONS, JSON.stringify(value));
                setPushNotificationsState(value);
                
                // 설정 화면으로 이동
                setTimeout(() => {
                  if (Platform.OS === 'ios') {
                    Linking.openURL('app-settings:');
                  } else {
                    Linking.openSettings();
                  }
                }, 500);
              }
            },
            { 
              text: "확인", 
              onPress: async () => {
                await AsyncStorage.setItem(SETTINGS_KEYS.PUSH_NOTIFICATIONS, JSON.stringify(value));
                setPushNotificationsState(value);
              }
            }
          ]
        );
      } else {
        Alert.alert(
          "⚠️ 푸시 알림 비활성화",
          "중요한 알림을 받지 못할 수 있습니다.\n\n비활성화하시겠습니까?",
          [
            { text: "취소", style: "cancel" },
            { 
              text: "비활성화", 
              style: "destructive",
              onPress: async () => {
                await AsyncStorage.setItem(SETTINGS_KEYS.PUSH_NOTIFICATIONS, JSON.stringify(value));
                setPushNotificationsState(value);
                Alert.alert(
                  "푸시 알림 비활성화됨",
                  "언제든지 설정에서 다시 활성화할 수 있습니다."
                );
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('푸시 알림 설정 저장 실패:', error);
      Alert.alert("오류", "설정을 저장하는데 실패했습니다.");
    }
  };

  const setLocationServices = async (value: boolean) => {
    try {
      if (value) {
        // 위치 서비스 활성화 시 권한 확인 안내
        Alert.alert(
          "📍 위치 서비스 활성화",
          "다음 기능을 사용할 수 있습니다:\n\n• 실시간 산책 경로 추적\n• 주변 워커 찾기\n• 산책 거리 및 시간 기록\n• 반려동물 활동량 분석\n\n위치 권한을 허용하시겠습니까?",
          [
            { text: "취소", style: "cancel", onPress: () => {} },
            { 
              text: "설정으로 이동", 
              onPress: async () => {
                await AsyncStorage.setItem(SETTINGS_KEYS.LOCATION_SERVICES, JSON.stringify(value));
                setLocationServicesState(value);
                
                // 설정 화면으로 이동
                setTimeout(() => {
                  if (Platform.OS === 'ios') {
                    Linking.openURL('app-settings:');
                  } else {
                    Linking.openSettings();
                  }
                }, 500);
              }
            }
          ]
        );
      } else {
        Alert.alert(
          "⚠️ 위치 서비스 비활성화",
          "다음 기능을 사용할 수 없게 됩니다:\n\n• 산책 경로 추적\n• 주변 워커 찾기\n• 실시간 위치 공유\n• 산책 기록\n\n정말 비활성화하시겠습니까?",
          [
            { text: "취소", style: "cancel", onPress: () => {} },
            { 
              text: "비활성화", 
              style: "destructive",
              onPress: async () => {
                await AsyncStorage.setItem(SETTINGS_KEYS.LOCATION_SERVICES, JSON.stringify(value));
                setLocationServicesState(value);
                Alert.alert(
                  "위치 서비스 비활성화됨",
                  "언제든지 설정에서 다시 활성화할 수 있습니다."
                );
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('위치 서비스 설정 저장 실패:', error);
      Alert.alert("오류", "설정을 저장하는데 실패했습니다.");
    }
  };

  const setMarketingEmails = async (value: boolean) => {
    try {
      if (value) {
      await AsyncStorage.setItem(SETTINGS_KEYS.MARKETING_EMAILS, JSON.stringify(value));
      setMarketingEmailsState(value);
      
        Alert.alert(
          "🎉 마케팅 수신 동의",
          "다양한 혜택을 받으실 수 있습니다!\n\n• 신규 상품 출시 소식\n• 특별 할인 쿠폰\n• 시즌 이벤트\n• 반려동물 케어 팁\n• VIP 회원 혜택\n\n언제든지 설정에서 변경 가능합니다.",
          [{ text: "확인" }]
        );
      } else {
        Alert.alert(
          "마케팅 수신 거부",
          "프로모션 및 이벤트 정보를 받지 않으시겠습니까?\n\n특별 할인과 이벤트 혜택을 놓치실 수 있습니다.",
          [
            { text: "취소", style: "cancel" },
            { 
              text: "수신 거부", 
              onPress: async () => {
                await AsyncStorage.setItem(SETTINGS_KEYS.MARKETING_EMAILS, JSON.stringify(value));
                setMarketingEmailsState(value);
                Alert.alert(
                  "마케팅 수신 거부됨",
                  "필수 알림은 계속 받으실 수 있습니다."
                );
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('마케팅 수신 설정 저장 실패:', error);
      Alert.alert("오류", "설정을 저장하는데 실패했습니다.");
    }
  };

  return {
    pushNotifications,
    setPushNotifications,
    locationServices,
    setLocationServices,
    marketingEmails,
    setMarketingEmails,
  };
};

