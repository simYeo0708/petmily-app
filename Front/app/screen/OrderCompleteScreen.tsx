import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../index";
import { rf } from "../utils/responsive";

type OrderCompleteScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface RouteParams {
  orderNumber: string;
}

const OrderCompleteScreen = () => {
  const navigation = useNavigation<OrderCompleteScreenNavigationProp>();
  const route = useRoute();
  const { orderNumber } = route.params as RouteParams;

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      
      <View style={styles.content}>
        {/* 성공 아이콘 */}
        <View style={styles.iconContainer}>
          <Text style={styles.checkIcon}>✓</Text>
        </View>

        {/* 메시지 */}
        <Text style={styles.title}>주문이 완료되었습니다!</Text>
        <Text style={styles.subtitle}>
          주문해주셔서 감사합니다.{'\n'}
          주문 내역은 나의 주문에서 확인하실 수 있습니다.
        </Text>

        {/* 주문번호 */}
        <View style={styles.orderNumberContainer}>
          <Text style={styles.orderNumberLabel}>주문번호</Text>
          <Text style={styles.orderNumberValue}>{orderNumber}</Text>
        </View>

        {/* 안내 메시지 */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>• 배송은 1-2일 소요됩니다.</Text>
          <Text style={styles.infoText}>• 배송 조회는 나의 주문에서 가능합니다.</Text>
          <Text style={styles.infoText}>• 문의사항은 고객센터로 연락주세요.</Text>
        </View>

        {/* 버튼들 */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate("MyOrders")}>
            <Text style={styles.secondaryButtonText}>주문 내역 확인</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate("Main", { initialTab: "HomeTab" })}>
            <Text style={styles.primaryButtonText}>홈으로 가기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: StatusBar.currentHeight || 0,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  checkIcon: {
    fontSize: rf(60),
    color: "#fff",
    fontWeight: "700",
  },
  title: {
    fontSize: rf(24),
    fontWeight: "700",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: rf(15),
    color: "#666",
    textAlign: "center",
    lineHeight: rf(22),
    marginBottom: 30,
  },
  orderNumberContainer: {
    backgroundColor: "#f8f8f8",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 30,
    width: "100%",
    alignItems: "center",
  },
  orderNumberLabel: {
    fontSize: rf(13),
    color: "#999",
    marginBottom: 6,
  },
  orderNumberValue: {
    fontSize: rf(18),
    fontWeight: "700",
    color: "#333",
  },
  infoBox: {
    backgroundColor: "#FFF9F0",
    padding: 20,
    borderRadius: 12,
    marginBottom: 40,
    width: "100%",
    borderWidth: 1,
    borderColor: "#FFE4B5",
  },
  infoText: {
    fontSize: rf(13),
    color: "#666",
    marginBottom: 8,
    lineHeight: rf(20),
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#C59172",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: rf(16),
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#C59172",
  },
  secondaryButtonText: {
    color: "#C59172",
    fontSize: rf(16),
    fontWeight: "700",
  },
});

export default OrderCompleteScreen;

