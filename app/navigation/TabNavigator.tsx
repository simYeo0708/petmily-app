import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React, { useEffect, useRef } from "react";
import { Image, Text, TouchableOpacity, View, Animated } from "react-native";
import HomeScreen from "../screen/HomeScreen";
import MyPetScreen from "../screen/MyPetScreen";
import CartScreen from "../screen/CartScreen";
import SettingsScreen from "../screen/SettingsScreen";
import { navigationStyles } from "../styles/HomeScreenStyles";
import { useGuideContext } from "../contexts/GuideContext";

export type TabParamList = {
  HomeTab: undefined;
  MyPetTab: undefined;
  CartTab: undefined;
  SettingsTab: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

interface TabNavigatorProps {
  initialTab?: keyof TabParamList;
}

const TabNavigator = ({ initialTab = "HomeTab" }: TabNavigatorProps) => {
  const { isGuideActive, currentGuideStep } = useGuideContext();
  
  // Glowing 애니메이션
  const glowAnimation = useRef(new Animated.Value(0)).current;
  // 통통 튀는 애니메이션 (Bounce)
  const bounceAnimation = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    if (isGuideActive && currentGuideStep === 2) {
      // Glowing 애니메이션 시작 (0 ↔ 1 반복)
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnimation, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnimation, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: false,
          }),
        ])
      ).start();
      
      // 통통 튀는 애니메이션 시작
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnimation, {
            toValue: 1.2,    // 1.2배 커짐
            duration: 600,   // 0.6초
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnimation, {
            toValue: 1,      // 원래 크기
            duration: 600,   // 0.6초
            useNativeDriver: true,
          }),
          Animated.delay(400), // 0.4초 대기
        ])
      ).start();
    } else {
      // 애니메이션 중지 및 초기화
      glowAnimation.setValue(0);
      bounceAnimation.setValue(1);
    }
  }, [isGuideActive, currentGuideStep]);
  
  return (
    <Tab.Navigator
      id={undefined}
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
            
            // My Pet 탭 하이라이트 조건 (Step 2)
            const isMyPetHighlighted = isGuideActive && currentGuideStep === 2 && route.name === "MyPetTab";
            
            // Glowing 효과 애니메이션 값 (강도 더 약하게)
            const glowOpacity = glowAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0.15, 0.35],  // 더 약하게: 15% → 35%
            });
            
            const glowRadius = glowAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [2, 5],  // 더 약하게: 2px → 5px
            });

            const onPress = () => {
              // 가이드 모드 Step 2에서 My Pet 탭 클릭 시 특별 처리
              if (isMyPetHighlighted) {
                // 정보 입력 화면으로 이동
                (navigation as any).navigate("PetInfoInput");
                return;
              }
              
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
                    isTextIcon: false,
                  };
                case "MyPetTab":
                  return {
                    name: "My Pet",
                    icon: require("../../assets/images/paw.png"),
                    isTextIcon: false,
                  };
                case "CartTab":
                  return {
                    name: "Cart",
                    icon: require("../../assets/images/cart.png"),
                    isTextIcon: false,
                  };
                case "SettingsTab":
                  return {
                    name: "Settings",
                    icon: require("../../assets/images/setting.png"),
                    isTextIcon: false,
                  };
                default:
                  return {
                    name: "Home",
                    icon: require("../../assets/images/home.png"),
                    isTextIcon: false,
                  };
              }
            };

            const tabInfo = getTabInfo(route.name);

            // My Pet 탭을 Animated로 감싸기
            if (isMyPetHighlighted) {
              return (
                <Animated.View
                  key={route.key}
                  style={{
                    shadowColor: '#4A90E2',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: glowOpacity,
                    shadowRadius: glowRadius,
                    borderRadius: 12,
                  }}>
                  <TouchableOpacity
                    style={[
                      navigationStyles.navBtn,
                      {
                        borderWidth: 3,
                        borderColor: '#4A90E2',
                        borderRadius: 12,
                        backgroundColor: 'rgba(74, 144, 226, 0.1)',
                      },
                    ]}
                    onPress={onPress}>
                    {/* 통통 튀는 아이콘 */}
                    <Animated.View style={{ transform: [{ scale: bounceAnimation }] }}>
                      {tabInfo.isTextIcon ? (
                        <Text style={[navigationStyles.navIcon, { fontSize: 20 }]}>
                          {tabInfo.icon}
                        </Text>
                      ) : (
                        <Image
                          source={tabInfo.icon}
                          style={navigationStyles.navIcon}
                          resizeMode="contain"
                        />
                      )}
                    </Animated.View>
                    <Text
                      style={[
                        navigationStyles.navText,
                        navigationStyles.navTextActive, // 항상 활성화 폰트 (bold, #FF8C00)
                      ]}>
                      {tabInfo.name}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            }

            // 일반 탭
            // 가이드 모드 Step 2일 때 Home 탭은 비활성화 처리
            const shouldDeactivate = isGuideActive && currentGuideStep === 2 && route.name === "HomeTab";
            
            return (
              <TouchableOpacity
                key={route.key}
                style={[
                  navigationStyles.navBtn,
                  isFocused && !shouldDeactivate && navigationStyles.navBtnActive,
                ]}
                onPress={onPress}>
                {tabInfo.isTextIcon ? (
                  <Text style={[
                    navigationStyles.navIcon, 
                    { fontSize: 20 },
                    shouldDeactivate && { opacity: 0.4 }
                  ]}>
                    {tabInfo.icon}
                  </Text>
                ) : (
                  <Image
                    source={tabInfo.icon}
                    style={[
                      navigationStyles.navIcon,
                      shouldDeactivate && { opacity: 0.4 }, // Home 비활성화 시 흐리게
                    ]}
                    resizeMode="contain"
                  />
                )}
                <Text
                  style={[
                    navigationStyles.navText,
                    isFocused && !shouldDeactivate && navigationStyles.navTextActive,
                    shouldDeactivate && { color: '#CCC' }, // Home 비활성화 시 회색
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
        name="CartTab"
        component={CartScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Text style={[navigationStyles.navIcon, { fontSize: 20 }]}>
              🛒
            </Text>
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
