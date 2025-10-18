import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import TabNavigator, { TabParamList } from "./navigation/TabNavigator";
import HelperDashboardScreen from "./screen/HelperDashboardScreen";
import LoginScreen from "./screen/LoginScreen";
import MatchingScreen from "./screen/MatchingScreen";
import ShopScreen from "./screen/ShopScreen";
import SplashScreen from "./screen/SplashScreen";
import WalkingMapScreen from "./screen/WalkingMapScreen";
import WalkingMapScreenEnhanced from "./screen/WalkingMapScreenEnhanced";
import WalkingRequestScreen from "./screen/WalkingRequestScreen";
import WalkerMatchingScreen from "./screen/WalkerMatchingScreen";
import WalkerDetailScreen from "./screen/WalkerDetailScreen";
import BookingConfirmScreen from "./screen/BookingConfirmScreen";
import PetInfoInputScreen from "./screen/PetInfoInputScreen";
import { PetProvider } from "./contexts/PetContext";
import { GuideProvider } from "./contexts/GuideContext";
import { PortalProvider } from "./contexts/PortalContext";
import DevTools from "./utils/DevTools";

export type RootStackParamList = {
  Login: undefined;
  Main: { initialTab?: string } | undefined;
  Shop: { category: string };
  HelperDashboard: undefined;
  MatchingScreen: undefined;
  WalkingMap: undefined;
  WalkingMapEnhanced: {
    bookingId?: number;
    walkerName?: string;
    petName?: string;
    petImageUrl?: string;
  } | undefined;
  WalkingRequest: undefined;
  WalkerMatching: { bookingData: { timeSlot: string; address: string } };
  WalkerDetail: { walker: any; bookingData: { timeSlot: string; address: string } };
  BookingConfirm: { walker: any; bookingData: { timeSlot: string; address: string } };
  PetInfoInput: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 앱 초기화 (자동 로그인 비활성화)
    const initApp = async () => {
      try {
        console.log('[DEV] 앱 초기화 중...');
        // 자동 로그인 비활성화 - 수동으로 로그인하도록 함
        // await DevTools.loginAsAsdf();
        console.log('[DEV] ✅ 앱 초기화 완료');
      } catch (error) {
        console.error('[DEV] 앱 초기화 실패:', error);
      } finally {
        setTimeout(() => {
          setIsLoading(false);
        }, 1000); // 로딩 시간 단축
      }
    };
    
    initApp();
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <PortalProvider>
      <GuideProvider>
        <PetProvider>
          <Stack.Navigator
          id={undefined}
          initialRouteName="Login" // 로그인 스크린부터 시작
          screenOptions={{
            headerShown: false,
          }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Main">
            {({ route }) => (
              <TabNavigator
                initialTab={route.params?.initialTab as keyof TabParamList}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="Shop" component={ShopScreen} />
          <Stack.Screen name="HelperDashboard" component={HelperDashboardScreen} />
          <Stack.Screen name="MatchingScreen" component={MatchingScreen} />
          <Stack.Screen name="WalkingMap" component={WalkingMapScreen} />
          <Stack.Screen name="WalkingMapEnhanced" component={WalkingMapScreenEnhanced} />
          <Stack.Screen name="WalkingRequest" component={WalkingRequestScreen} />
          <Stack.Screen name="WalkerMatching" component={WalkerMatchingScreen} />
          <Stack.Screen name="WalkerDetail" component={WalkerDetailScreen} />
          <Stack.Screen name="BookingConfirm" component={BookingConfirmScreen} />
          <Stack.Screen name="PetInfoInput" component={PetInfoInputScreen} />
          </Stack.Navigator>
        </PetProvider>
      </GuideProvider>
    </PortalProvider>
  );
}
