import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import TabNavigator, { TabParamList } from "./navigation/TabNavigator";
import BookingScreen from "./screen/BookingScreen";
import CartScreen from "./screen/CartScreen";
import ExploreScreen from "./screen/ExploreScreen";
import HelperDashboardScreen from "./screen/HelperDashboardScreen";
import HomeScreen from "./screen/HomeScreen";
import LoginScreen from "./screen/LoginScreen";
import MatchingScreen from "./screen/MatchingScreen";
import MyPetScreen from "./screen/MyPetScreen";
import MyScreen from "./screen/MyScreen";
import ShopMainScreen from "./screen/ShopMainScreen";
import SplashScreen from "./screen/SplashScreen";

export type RootStackParamList = {
  Login: undefined;
  Main:
    | { initialTab?: keyof TabParamList }
    | undefined;
  Home: undefined;
  MyPet: undefined;
  Shop: { category?: string };
  Explore: undefined;
  My: undefined;
  Cart: { cartItems?: any[]; setCart?: (cart: any[]) => void };
  HelperDashboard: undefined;
  Matching: undefined;
  Booking: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 3000);
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator
      initialRouteName="Login"
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
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="MyPet" component={MyPetScreen} />
      <Stack.Screen name="Shop" component={ShopMainScreen} />
      <Stack.Screen name="Explore" component={ExploreScreen} />
      <Stack.Screen name="My" component={MyScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="HelperDashboard" component={HelperDashboardScreen} />
      <Stack.Screen name="Matching" component={MatchingScreen} />
      <Stack.Screen name="Booking" component={BookingScreen} />
    </Stack.Navigator>
  );
}
