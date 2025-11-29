import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCart } from "../contexts/CartContext";
import { RootStackParamList } from "../index";
import { rf } from "../utils/responsive";
import { Ionicons } from "@expo/vector-icons";

type CheckoutScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const CheckoutScreen = () => {
  const navigation = useNavigation<CheckoutScreenNavigationProp>();
  const { cartItems, getTotalPrice, clearCart } = useCart();

  const [recipientName, setRecipientName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [detailAddress, setDetailAddress] = useState("");
  const [deliveryRequest, setDeliveryRequest] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "transfer" | "mobile">("card");

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()}원`;
  };

  const deliveryFee = getTotalPrice() >= 30000 ? 0 : 3000;
  const totalAmount = getTotalPrice() + deliveryFee;

  const handlePayment = () => {
    // 입력 검증
    if (!recipientName || !phone || !address) {
      Alert.alert("알림", "필수 정보를 모두 입력해주세요.");
      return;
    }

    // 결제 처리 (실제로는 결제 API 호출)
    Alert.alert(
      "결제 확인",
      `${formatPrice(totalAmount)}를 결제하시겠습니까?`,
      [
        { text: "취소", style: "cancel" },
        {
          text: "결제",
          onPress: () => {
            // 주문 데이터 생성 (실제로는 서버에 전송)
            const orderData = {
              orderNumber: `${Date.now()}`,
              orderDate: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
              items: cartItems,
              totalAmount: getTotalPrice(),
              deliveryFee,
              finalAmount: totalAmount,
              recipientName,
              phone,
              address: `${address} ${detailAddress}`,
              deliveryRequest,
              paymentMethod,
            };


            // 장바구니 비우기
            clearCart();

            // 주문 완료 화면으로 이동
            navigation.navigate("OrderComplete", { orderNumber: orderData.orderNumber });
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={20} color="#C59172" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>주문/결제</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 주문 상품 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>주문 상품 ({cartItems.length}개)</Text>
          {cartItems.map((item) => (
            <View key={item.product.id} style={styles.productItem}>
              {item.product.image.startsWith('@') ? (
                <Image
                  source={
                    item.product.image === '@dog_food.png' ? require('../../assets/images/dog_food.png') :
                    item.product.image === '@dog_snack.png' ? require('../../assets/images/dog_snack.png') :
                    item.product.image === '@cat_food.png' ? require('../../assets/images/cat_food.png') :
                    item.product.image === '@cat_snack.png' ? require('../../assets/images/cat_snack.png') :
                    item.product.image === '@toy.png' ? require('../../assets/images/toy.png') :
                    item.product.image === '@toilet.png' ? require('../../assets/images/toilet.png') :
                    item.product.image === '@grooming.png' ? require('../../assets/images/grooming.png') :
                    item.product.image === '@clothing.png' ? require('../../assets/images/clothing.png') :
                    item.product.image === '@outdoor.png' ? require('../../assets/images/outdoor.png') :
                    item.product.image === '@house.png' ? require('../../assets/images/house.png') :
                    require('../../assets/images/dog_food.png')
                  }
                  style={{ width: 48, height: 48, marginRight: 12 }}
                  resizeMode="contain"
                />
              ) : (
                <Text style={styles.productImage}>{item.product.image}</Text>
              )}
              <View style={styles.productInfo}>
                <Text style={styles.productBrand}>{item.product.brand}</Text>
                <Text style={styles.productName}>{item.product.name}</Text>
                <Text style={styles.productQuantity}>수량: {item.quantity}개</Text>
              </View>
              <Text style={styles.productPrice}>
                {formatPrice(item.product.price * item.quantity)}
              </Text>
            </View>
          ))}
        </View>

        {/* 배송 정보 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>배송 정보</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>받는 사람 *</Text>
            <TextInput
              style={styles.input}
              placeholder="이름을 입력하세요"
              value={recipientName}
              onChangeText={setRecipientName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>연락처 *</Text>
            <TextInput
              style={styles.input}
              placeholder="010-0000-0000"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>배송 주소 *</Text>
            <TextInput
              style={styles.input}
              placeholder="주소를 입력하세요"
              value={address}
              onChangeText={setAddress}
            />
            <TextInput
              style={[styles.input, styles.inputMarginTop]}
              placeholder="상세 주소를 입력하세요"
              value={detailAddress}
              onChangeText={setDetailAddress}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>배송 요청사항</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="배송 시 요청사항을 입력하세요"
              value={deliveryRequest}
              onChangeText={setDeliveryRequest}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* 결제 방법 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>결제 방법</Text>
          
          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === "card" && styles.paymentOptionActive]}
            onPress={() => setPaymentMethod("card")}>
            <View style={styles.radioButton}>
              {paymentMethod === "card" && <View style={styles.radioButtonInner} />}
            </View>
            <Text style={styles.paymentOptionText}>신용/체크카드</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === "transfer" && styles.paymentOptionActive]}
            onPress={() => setPaymentMethod("transfer")}>
            <View style={styles.radioButton}>
              {paymentMethod === "transfer" && <View style={styles.radioButtonInner} />}
            </View>
            <Text style={styles.paymentOptionText}>계좌이체</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === "mobile" && styles.paymentOptionActive]}
            onPress={() => setPaymentMethod("mobile")}>
            <View style={styles.radioButton}>
              {paymentMethod === "mobile" && <View style={styles.radioButtonInner} />}
            </View>
            <Text style={styles.paymentOptionText}>휴대폰 결제</Text>
          </TouchableOpacity>
        </View>

        {/* 최종 결제 금액 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>결제 금액</Text>
          
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>상품 금액</Text>
            <Text style={styles.priceValue}>{formatPrice(getTotalPrice())}</Text>
          </View>
          
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>배송비</Text>
            <Text style={styles.priceValue}>
              {deliveryFee === 0 ? "무료" : formatPrice(deliveryFee)}
            </Text>
          </View>

          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>총 결제금액</Text>
            <Text style={styles.totalValue}>{formatPrice(totalAmount)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* 하단 결제 버튼 */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.paymentButton} onPress={handlePayment}>
          <Text style={styles.paymentButtonText}>
            {formatPrice(totalAmount)} 결제하기
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: rf(16),
    fontWeight: "600",
    color: "#333",
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: "#fff",
    marginTop: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: rf(16),
    fontWeight: "700",
    color: "#333",
    marginBottom: 16,
  },
  productItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  productImage: {
    fontSize: rf(40),
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productBrand: {
    fontSize: rf(11),
    color: "#999",
    marginBottom: 2,
  },
  productName: {
    fontSize: rf(14),
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  productQuantity: {
    fontSize: rf(12),
    color: "#666",
  },
  productPrice: {
    fontSize: rf(15),
    fontWeight: "700",
    color: "#333",
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: rf(14),
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: rf(14),
    color: "#333",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  inputMarginTop: {
    marginTop: 8,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  paymentOptionActive: {
    borderColor: "#C59172",
    backgroundColor: "rgba(197, 145, 114, 0.05)",
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#C59172",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#C59172",
  },
  paymentOptionText: {
    fontSize: rf(15),
    fontWeight: "600",
    color: "#333",
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  priceLabel: {
    fontSize: rf(14),
    color: "#666",
  },
  priceValue: {
    fontSize: rf(14),
    fontWeight: "600",
    color: "#333",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    marginTop: 10,
    paddingTop: 16,
  },
  totalLabel: {
    fontSize: rf(16),
    fontWeight: "700",
    color: "#333",
  },
  totalValue: {
    fontSize: rf(18),
    fontWeight: "700",
    color: "#C59172",
  },
  bottomContainer: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    padding: 20,
  },
  paymentButton: {
    backgroundColor: "#C59172",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  paymentButtonText: {
    color: "#fff",
    fontSize: rf(16),
    fontWeight: "700",
  },
});

export default CheckoutScreen;

