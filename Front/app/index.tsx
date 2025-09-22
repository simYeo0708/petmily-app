import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import TabNavigator, { TabParamList } from "./navigation/TabNavigator";
import HelperDashboardScreen from "./screen/HelperDashboardScreen";
import LoginScreen from "./screen/LoginScreen";
import MatchingScreen from "./screen/MatchingScreen";
import ShopScreen from "./screen/ShopScreen";
import SplashScreen from "./screen/SplashScreen";

export type RootStackParamList = {
  Login: undefined;
  Main: { initialTab?: string } | undefined;
  Shop: { category: string };
  HelperDashboard: undefined;
  MatchingScreen: undefined;
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
      <Stack.Screen name="Shop" component={ShopScreen} />
      <Stack.Screen name="HelperDashboard" component={HelperDashboardScreen} />
      <Stack.Screen name="MatchingScreen" component={MatchingScreen} />
    </Stack.Navigator>
  );
}
