import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { View, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TabNavigator, { TabParamList } from "./navigation/TabNavigator";
import HelperDashboardScreen from "./screen/HelperDashboardScreen";
import WalkerReviewsScreen from "./screen/WalkerReviewsScreen";
import WalkerBookingsScreen from "./screen/WalkerBookingsScreen";
import WalkerBookingDetailScreen from "./screen/WalkerBookingDetailScreen";
import LoginScreen from "./screen/LoginScreen";
import MatchingScreen from "./screen/MatchingScreen";
import ShopScreen from "./screen/ShopScreen";
import ProductDetailScreen from "./screen/ProductDetailScreen";
import MyOrdersScreen from "./screen/MyOrdersScreen";
import CheckoutScreen from "./screen/CheckoutScreen";
import OrderCompleteScreen from "./screen/OrderCompleteScreen";
import SplashScreen from "./screen/SplashScreen";
import WalkingMapScreen from "./screen/WalkingMapScreen";
import WalkingMapScreenEnhanced from "./screen/WalkingMapScreenEnhanced";
import WalkingSimulationScreen from "./screen/WalkingSimulationScreen";
import WalkingRequestScreen from "./screen/WalkingRequestScreen";
import WalkerMatchingScreen from "./screen/WalkerMatchingScreen";
import WalkerDetailScreen from "./screen/WalkerDetailScreen";
import BookingConfirmScreen from "./screen/BookingConfirmScreen";
import PetInfoInputScreen from "./screen/PetInfoInputScreen";
import AIChatScreen from "./screen/AIChatScreen";
import ProfileEditScreen from "./screen/ProfileEditScreen";
import PasswordChangeScreen from "./screen/PasswordChangeScreen";
import PrivacyPolicyScreen from "./screen/PrivacyPolicyScreen";
import TermsOfServiceScreen from "./screen/TermsOfServiceScreen";
import CustomerServiceScreen from "./screen/CustomerServiceScreen";
import FAQScreen from "./screen/FAQScreen";
import AppInfoScreen from "./screen/AppInfoScreen";
import WalkerRegistrationScreen from "./screen/WalkerRegistrationScreen";
import WalkerVerificationScreen from "./screen/WalkerVerificationScreen";
import ReviewWriteScreen from "./screen/ReviewWriteScreen";
import { PetProvider } from "./contexts/PetContext";
import { GuideProvider } from "./contexts/GuideContext";
import { PortalProvider } from "./contexts/PortalContext";
import { CartProvider } from "./contexts/CartContext";
import { Product } from "./constants/ProductData";

export type RootStackParamList = {
  Login: undefined;
  Main: { initialTab?: string } | undefined;
  Shop: { category: string };
  ProductDetail: { product: Product };
  MyOrders: undefined;
  Checkout: undefined;
  OrderComplete: { orderNumber: string };
  HelperDashboard: undefined;
  WalkerReviews: undefined;
  WalkerBookings: undefined;
  WalkerBookingDetail: {
    bookingId?: number;
    bookingData?: {
      id: number;
      date: string;
      petName: string;
      petBreed: string;
      notes: string | null;
      status: string;
      address: string;
      pickupAddress?: string;
      dropoffAddress?: string | null;
      duration?: number;
      totalPrice?: number | null;
      ownerName?: string | null;
      ownerPhone?: string | null;
      emergencyContact?: string | null;
      isRegularPackage?: boolean;
      packageFrequency?: string | null;
    };
  };
  MatchingScreen: undefined;
  WalkingMap: undefined;
  WalkingMapEnhanced: {
    bookingId?: number;
    walkerName?: string;
    petName?: string;
    petImageUrl?: string;
  } | undefined;
  WalkingSimulation: {
    route: import('./data/walkingRoutes').WalkingRoute;
  };
  WalkingRequest: undefined;
  WalkerMatching: { bookingData: { timeSlot: string; address: string } };
  WalkerDetail: { walker: any; bookingData: { timeSlot: string; address: string } };
  BookingConfirm: { walker: any; bookingData: { timeSlot: string; address: string } };
  PetInfoInput: undefined;
  AIChat: undefined;
  ProfileEdit: undefined;
  PasswordChange: undefined;
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
  CustomerService: undefined;
  FAQ: undefined;
  AppInfo: undefined;
  WalkerRegistration: undefined;
  WalkerVerification: undefined; // 관리자 전용 워커 검증 화면
  ReviewWrite: {
    orderId: number;
    productId: number;
    productName: string;
    productImage?: string;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 앱 초기화 (자동 로그인 비활성화)
    const initApp = async () => {
      try {
        // 자동 로그인 비활성화 - 수동으로 로그인하도록 함
        // await DevTools.loginAsAsdf();
      } catch (error) {
        // 에러 처리
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
    <>
    <StatusBar barStyle="dark-content" backgroundColor={"#000000"}/>
      {/* 앱 메인 콘텐츠 */}
      <View style={{ flex: 1 }}>
        <NavigationContainer>
          <PortalProvider>
            <GuideProvider>
              <PetProvider>
                <CartProvider>
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
                <Stack.Screen name="Shop" component={ShopScreen}/>
                <Stack.Screen name="ProductDetail" component={ProductDetailScreen}/>
                <Stack.Screen name="MyOrders" component={MyOrdersScreen}/>
                <Stack.Screen name="Checkout" component={CheckoutScreen}/>
                <Stack.Screen name="OrderComplete" component={OrderCompleteScreen}/>
                <Stack.Screen name="HelperDashboard" component={HelperDashboardScreen}/>
                <Stack.Screen name="WalkerReviews" component={WalkerReviewsScreen} />
                <Stack.Screen name="WalkerBookings" component={WalkerBookingsScreen} />
                <Stack.Screen name="WalkerBookingDetail" component={WalkerBookingDetailScreen} />
                <Stack.Screen name="MatchingScreen" component={MatchingScreen} />
                <Stack.Screen name="WalkingMap" component={WalkingMapScreen} />
                <Stack.Screen name="WalkingMapEnhanced" component={WalkingMapScreenEnhanced} />
                <Stack.Screen name="WalkingSimulation" component={WalkingSimulationScreen} />
                <Stack.Screen name="WalkingRequest" component={WalkingRequestScreen} />
                <Stack.Screen name="WalkerMatching" component={WalkerMatchingScreen} />
                <Stack.Screen name="WalkerDetail" component={WalkerDetailScreen} />
                <Stack.Screen name="BookingConfirm" component={BookingConfirmScreen} />
                <Stack.Screen name="PetInfoInput" component={PetInfoInputScreen} />
                <Stack.Screen name="AIChat" component={AIChatScreen} />
                <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
                <Stack.Screen name="PasswordChange" component={PasswordChangeScreen} />
                <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
                <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
                <Stack.Screen name="CustomerService" component={CustomerServiceScreen} />
                <Stack.Screen name="FAQ" component={FAQScreen} />
                <Stack.Screen name="AppInfo" component={AppInfoScreen} />
                <Stack.Screen name="WalkerRegistration" component={WalkerRegistrationScreen} />
                <Stack.Screen name="WalkerVerification" component={WalkerVerificationScreen} />
                <Stack.Screen name="ReviewWrite" component={ReviewWriteScreen} />
                </Stack.Navigator>
                </CartProvider>
              </PetProvider>
            </GuideProvider>
          </PortalProvider>
        </NavigationContainer>
      </View>
    </>
  );
}
