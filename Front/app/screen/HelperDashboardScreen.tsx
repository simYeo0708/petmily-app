import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MenuButton from "../components/MenuButton";
import SideMenuDrawer from "../components/SideMenuDrawer";
import { useHelperStatus } from "../hooks/useHelperStatus";
import { RootStackParamList } from "../index";
import {
  headerStyles,
  helperDashboardStyles,
  homeScreenStyles,
} from "../styles/HomeScreenStyles";

type HelperDashboardScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "HelperDashboard"
>;

const HelperDashboardScreen = () => {
  const navigation = useNavigation<HelperDashboardScreenNavigationProp>();
  const { helperStatus } = useHelperStatus();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const mockAdditionalData = {
    name: "홍길동",
    pendingRequests: 3,
  };

  const handleMatchingPress = () => {
    navigation.navigate("Matching");
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const openMenu = () => setIsMenuOpen(true);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <SafeAreaView style={homeScreenStyles.root}>
      {/* Header */}
      <View
        style={[
          headerStyles.header,
          { backgroundColor: "rgba(255, 255, 255, 0.95)" },
        ]}>
        <View style={headerStyles.headerLeft}>
          <MenuButton onPress={openMenu} style={{ marginRight: 12 }} />
          <Pressable
            onPress={handleBackPress}
            style={helperDashboardStyles.backButton}>
            <Text style={helperDashboardStyles.backButtonText}>←</Text>
          </Pressable>
          <Text style={[headerStyles.logo, { marginLeft: 10 }]}>
            🐾 헬퍼 대시보드
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={homeScreenStyles.scrollContent}>
        {/* 헬퍼 프로필 */}
        <View style={helperDashboardStyles.profileCard}>
          <View style={helperDashboardStyles.profileHeader}>
            <View style={helperDashboardStyles.avatar}>
              <Text style={helperDashboardStyles.avatarText}>👤</Text>
            </View>
            <View style={helperDashboardStyles.profileInfo}>
              <Text style={helperDashboardStyles.profileName}>
                {mockAdditionalData.name}
              </Text>
              <View style={helperDashboardStyles.ratingContainer}>
                <Text style={helperDashboardStyles.ratingText}>
                  ⭐ {helperStatus.rating}
                </Text>
                <Text style={helperDashboardStyles.walkCountText}>
                  총 {helperStatus.totalWalks}회 산책
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 수익 현황 */}
        <View style={helperDashboardStyles.earningsCard}>
          <Text style={helperDashboardStyles.cardTitle}>💰 수익 현황</Text>
          <View style={helperDashboardStyles.earningsGrid}>
            <View style={helperDashboardStyles.earningsItem}>
              <Text style={helperDashboardStyles.earningsLabel}>총 수익</Text>
              <Text style={helperDashboardStyles.earningsAmount}>
                {helperStatus.totalEarnings.toLocaleString()}원
              </Text>
            </View>
            <View style={helperDashboardStyles.earningsItem}>
              <Text style={helperDashboardStyles.earningsLabel}>이달 수익</Text>
              <Text style={helperDashboardStyles.earningsAmount}>
                {helperStatus.thisMonthEarnings.toLocaleString()}원
              </Text>
            </View>
          </View>
        </View>

        {/* 활동 통계 */}
        <View style={helperDashboardStyles.statsCard}>
          <Text style={helperDashboardStyles.cardTitle}>📊 활동 통계</Text>
          <View style={helperDashboardStyles.statsGrid}>
            <View style={helperDashboardStyles.statItem}>
              <Text style={helperDashboardStyles.statNumber}>
                {helperStatus.completedWalks}
              </Text>
              <Text style={helperDashboardStyles.statLabel}>이달 완료</Text>
            </View>
            <View style={helperDashboardStyles.statItem}>
              <Text style={helperDashboardStyles.statNumber}>
                {mockAdditionalData.pendingRequests}
              </Text>
              <Text style={helperDashboardStyles.statLabel}>대기 중</Text>
            </View>
          </View>
        </View>

        {/* 매칭 버튼 */}
        <TouchableOpacity
          style={helperDashboardStyles.matchingButton}
          onPress={handleMatchingPress}>
          <Text style={helperDashboardStyles.matchingButtonText}>
            🤝 새로운 산책 요청 보기
          </Text>
        </TouchableOpacity>

        {/* 빠른 액션 */}
        <View style={helperDashboardStyles.quickActionsCard}>
          <Text style={helperDashboardStyles.cardTitle}>빠른 액션</Text>
          <View style={helperDashboardStyles.actionGrid}>
            <TouchableOpacity style={helperDashboardStyles.actionButton}>
              <Text style={helperDashboardStyles.actionIcon}>📅</Text>
              <Text style={helperDashboardStyles.actionLabel}>일정 관리</Text>
            </TouchableOpacity>
            <TouchableOpacity style={helperDashboardStyles.actionButton}>
              <Text style={helperDashboardStyles.actionIcon}>💬</Text>
              <Text style={helperDashboardStyles.actionLabel}>메시지</Text>
            </TouchableOpacity>
            <TouchableOpacity style={helperDashboardStyles.actionButton}>
              <Text style={helperDashboardStyles.actionIcon}>⚙️</Text>
              <Text style={helperDashboardStyles.actionLabel}>설정</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      
      <SideMenuDrawer isVisible={isMenuOpen} onClose={closeMenu} />
    </SafeAreaView>
  );
};

export default HelperDashboardScreen;
