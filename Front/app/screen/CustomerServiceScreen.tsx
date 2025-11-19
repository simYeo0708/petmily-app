import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../index";
import { headerStyles } from "../styles/HomeScreenStyles";
import { Ionicons } from "@expo/vector-icons";

type Props = NativeStackScreenProps<RootStackParamList, "CustomerService">;

const CustomerServiceScreen: React.FC<Props> = ({ navigation }) => {
  const [inquiryType, setInquiryType] = useState<string>("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const inquiryTypes = [
    { id: "order", label: "주문/결제 문의", icon: "receipt" },
    { id: "delivery", label: "배송 문의", icon: "car" },
    { id: "product", label: "상품 문의", icon: "cube" },
    { id: "service", label: "서비스 문의", icon: "walk" },
    { id: "account", label: "계정 문의", icon: "person" },
    { id: "other", label: "기타 문의", icon: "help-circle" },
  ];

  const handleSubmit = () => {
    if (!inquiryType || !title || !content) {
      Alert.alert("입력 오류", "모든 항목을 입력해주세요.");
      return;
    }

    Alert.alert(
      "문의 접수 완료",
      "고객센터로 문의가 접수되었습니다.\n빠른 시일 내에 답변드리겠습니다.",
      [{ text: "확인", onPress: () => navigation.goBack() }]
    );
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
          고객센터
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* 연락처 정보 */}
        <View style={styles.contactInfoContainer}>
          <View style={styles.contactItem}>
            <Ionicons name="call" size={20} color="#C59172" />
            <Text style={styles.contactText}>1588-0000</Text>
          </View>
          <View style={styles.contactItem}>
            <Ionicons name="mail" size={20} color="#C59172" />
            <Text style={styles.contactText}>support@petmily.com</Text>
          </View>
          <View style={styles.contactItem}>
            <Ionicons name="time" size={20} color="#C59172" />
            <Text style={styles.contactText}>평일 09:00 - 18:00</Text>
          </View>
        </View>

        {/* 문의 유형 선택 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>문의 유형</Text>
          <View style={styles.typeGrid}>
            {inquiryTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeButton,
                  inquiryType === type.id && styles.typeButtonActive,
                ]}
                onPress={() => setInquiryType(type.id)}
              >
                <Ionicons
                  name={type.icon as any}
                  size={24}
                  color={inquiryType === type.id ? "#fff" : "#C59172"}
                />
                <Text
                  style={[
                    styles.typeButtonText,
                    inquiryType === type.id && styles.typeButtonTextActive,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 문의 작성 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>문의 내용</Text>
          <TextInput
            style={styles.titleInput}
            placeholder="제목을 입력하세요"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={styles.contentInput}
            placeholder="문의 내용을 입력하세요"
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={8}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>문의하기</Text>
        </TouchableOpacity>
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
  contactInfoContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  contactText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 12,
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
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  typeButton: {
    flex: 1,
    minWidth: "30%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#C59172",
  },
  typeButtonActive: {
    backgroundColor: "#C59172",
  },
  typeButtonText: {
    fontSize: 12,
    color: "#C59172",
    marginTop: 8,
    textAlign: "center",
  },
  typeButtonTextActive: {
    color: "#fff",
  },
  titleInput: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  contentInput: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    minHeight: 200,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  submitButton: {
    backgroundColor: "#C59172",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});

export default CustomerServiceScreen;

