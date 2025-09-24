import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import ExploreScreen from "../screen/ExploreScreen";
import HomeScreen from "../screen/HomeScreen";
import MyScreen from "../screen/MyScreen";
import ShopMainScreen from "../screen/ShopMainScreen";
import { navigationStyles } from "../styles/HomeScreenStyles";

export type TabParamList = {
  HomeTab: undefined;
  ExploreTab: undefined;
  ShopTab: { initialCategory?: string } | undefined;
  MyTab: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

interface TabNavigatorProps {
  initialTab?: keyof TabParamList;
  shopTabParams?: { initialCategory: string };
}

const TabNavigator = ({
  initialTab = "HomeTab",
  shopTabParams,
}: TabNavigatorProps) => {
  return (
    <Tab.Navigator
      initialRouteName={initialTab}
      screenOptions={{
        headerShown: false,
        tabBarStyle: navigationStyles.bottomNav,
        tabBarShowLabel: false,
      }}
      tabBar={({ state, descriptors, navigation }) => (
        <View style={navigationStyles.bottomNav}>
          {state.routes.map((route, index) => {
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            // 탭 정보 매핑
            const getTabInfo = (routeName: string) => {
              switch (routeName) {
                case "HomeTab":
                  return {
                    name: "Home",
                    icon: require("../../assets/images/home.png"),
                  };
                case "ShopTab":
                  return {
                    name: "Shop",
                    icon: require("../../assets/images/shopping.png"),
                  };
                case "ExploreTab":
                  return {
                    name: "Explore",
                    icon: require("../../assets/images/explore.png"),
                  };
                case "MyTab":
                  return {
                    name: "My",
                    icon: require("../../assets/images/setting.png"),
                  };
                default:
                  return {
                    name: "Home",
                    icon: require("../../assets/images/home.png"),
                  };
              }
            };

            const tabInfo = getTabInfo(route.name);

            return (
              <TouchableOpacity
                key={route.key}
                style={[
                  navigationStyles.navBtn,
                  isFocused && navigationStyles.navBtnActive,
                ]}
                onPress={onPress}>
                <Image
                  source={tabInfo.icon}
                  style={navigationStyles.navIcon}
                  resizeMode="contain"
                />
                <Text
                  style={[
                    navigationStyles.navText,
                    isFocused && navigationStyles.navTextActive,
                  ]}>
                  {tabInfo.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}>
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={require("../../assets/images/home.png")}
              style={[navigationStyles.navIcon]}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen
        name="ShopTab"
        component={ShopMainScreen}
        initialParams={shopTabParams}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={require("../../assets/images/shopping.png")}
              style={[navigationStyles.navIcon]}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen
        name="ExploreTab"
        component={ExploreScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={require("../../assets/images/explore.png")}
              style={[navigationStyles.navIcon]}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen
        name="MyTab"
        component={MyScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={require("../../assets/images/setting.png")}
              style={[navigationStyles.navIcon]}
              resizeMode="contain"
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
