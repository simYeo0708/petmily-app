import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../index";
import { headerStyles } from "../styles/HomeScreenStyles";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";

type Props = NativeStackScreenProps<RootStackParamList, "AppInfo">;

const AppInfoScreen: React.FC<Props> = ({ navigation }) => {
  const appVersion = Constants.expoConfig?.version || "1.0.0";
  const buildNumber = Constants.expoConfig?.ios?.buildNumber || "1";

  const handleOpenURL = (url: string) => {
    Linking.openURL(url).catch((err) => {
      // 에러는 UI로만 처리 (콘솔 로그 없이)
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      
      {/* Header */}
      <View style={[headerStyles.header, { backgroundColor: "#fff" }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={[headerStyles.logoText, { flex: 1, textAlign: "center" }]}>
          앱 정보
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* 앱 로고 및 버전 */}
        <View style={styles.appInfoContainer}>
          <View style={styles.appLogo}>
            <Ionicons name="paw" size={60} color="#C59172" />
          </View>
          <Text style={styles.appName}>Petmily</Text>
          <Text style={styles.appVersion}>버전 {appVersion} (빌드 {buildNumber})</Text>
        </View>

        {/* 앱 정보 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>앱 정보</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>앱 이름</Text>
              <Text style={styles.infoValue}>Petmily</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>버전</Text>
              <Text style={styles.infoValue}>{appVersion}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>빌드 번호</Text>
              <Text style={styles.infoValue}>{buildNumber}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>플랫폼</Text>
              <Text style={styles.infoValue}>iOS</Text>
            </View>
          </View>
        </View>

        {/* 개발자 정보 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>개발자 정보</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>개발사</Text>
              <Text style={styles.infoValue}>Petmily Team</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>이메일</Text>
              <Text style={styles.infoValue}>support@petmily.com</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>웹사이트</Text>
              <TouchableOpacity onPress={() => handleOpenURL("https://petmily.com")}>
                <Text style={[styles.infoValue, styles.linkText]}>www.petmily.com</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 링크 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>관련 링크</Text>
          <View style={styles.linkCard}>
            <TouchableOpacity
              style={styles.linkItem}
              onPress={() => handleOpenURL("https://petmily.com/privacy")}
            >
              <Ionicons name="shield-checkmark" size={20} color="#C59172" />
              <Text style={styles.linkItemText}>개인정보 처리방침</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.linkItem}
              onPress={() => handleOpenURL("https://petmily.com/terms")}
            >
              <Ionicons name="document-text" size={20} color="#C59172" />
              <Text style={styles.linkItemText}>이용약관</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.linkItem}
              onPress={() => handleOpenURL("https://petmily.com/support")}
            >
              <Ionicons name="help-circle" size={20} color="#C59172" />
              <Text style={styles.linkItemText}>고객센터</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 저작권 정보 */}
        <View style={styles.copyrightContainer}>
          <Text style={styles.copyrightText}>
            © 2024 Petmily Team. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  backButton: {
    padding: 4,
    width: 40,
  },
  appInfoContainer: {
    alignItems: "center",
    marginBottom: 40,
    marginTop: 20,
  },
  appLogo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  appName: {
    fontSize: 28,
    fontWeight: "700",
    color: "#C59172",
    marginBottom: 8,
  },
  appVersion: {
    fontSize: 14,
    color: "#999",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoLabel: {
    fontSize: 16,
    color: "#666",
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  linkText: {
    color: "#C59172",
    textDecorationLine: "underline",
  },
  linkCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
  },
  linkItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  linkItemText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    marginLeft: 12,
  },
  copyrightContainer: {
    alignItems: "center",
    paddingVertical: 30,
  },
  copyrightText: {
    fontSize: 12,
    color: "#999",
  },
});

export default AppInfoScreen;

