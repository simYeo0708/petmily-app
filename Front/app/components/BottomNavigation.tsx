import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { navigationStyles } from "../styles/HomeScreenStyles";

interface NavItem {
  name: string;
  icon: any;
  isActive?: boolean;
}

interface BottomNavigationProps {
  onTabPress?: (tabName: string) => void;
  activeTab?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    name: "Home",
    icon: require("../../assets/images/home.png"),
  },
  {
    name: "MyPet",
    icon: require("../../assets/images/paw.png"),
  },
  {
    name: "Shop",
    icon: require("../../assets/images/paw.png"),
  },
  {
    name: "Explore",
    icon: require("../../assets/images/explore.png"),
  },
  {
    name: "Settings",
    icon: require("../../assets/images/setting.png"),
  },
];

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  onTabPress,
  activeTab = "Home",
}) => {
  return (
    <View style={navigationStyles.bottomNav}>
      {NAV_ITEMS.map((item) => (
        <TouchableOpacity
          key={item.name}
          style={[
            navigationStyles.navBtn,
            activeTab === item.name && navigationStyles.navBtnActive,
          ]}
          onPress={() => onTabPress?.(item.name)}>
          <Image
            source={item.icon}
            style={navigationStyles.navIcon}
            resizeMode="contain"
          />
          <Text
            style={[
              navigationStyles.navText,
              activeTab === item.name && navigationStyles.navTextActive,
            ]}>
            {item.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default BottomNavigation;
