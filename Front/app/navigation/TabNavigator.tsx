import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import HomeScreen from "../screen/HomeScreen";
import MyPetScreen from "../screen/MyPetScreen";
import SettingsScreen from "../screen/SettingsScreen";
import { navigationStyles } from "../styles/HomeScreenStyles";

export type TabParamList = {
  HomeTab: undefined;
  MyPetTab: undefined;
  SettingsTab: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

interface TabNavigatorProps {
  initialTab?: keyof TabParamList;
}

const TabNavigator = ({ initialTab = "HomeTab" }: TabNavigatorProps) => {
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
                case "MyPetTab":
                  return {
                    name: "My Pet",
                    icon: require("../../assets/images/paw.png"),
                  };
                case "SettingsTab":
                  return {
                    name: "Settings",
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
        name="MyPetTab"
        component={MyPetScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={require("../../assets/images/paw.png")}
              style={[navigationStyles.navIcon]}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
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
