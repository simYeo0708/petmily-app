import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../index";
import { headerStyles } from "../styles/HomeScreenStyles";
import { Ionicons } from "@expo/vector-icons";

type Props = NativeStackScreenProps<RootStackParamList, "FAQ">;

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const FAQScreen: React.FC<Props> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { id: "all", label: "전체" },
    { id: "order", label: "주문/결제" },
    { id: "delivery", label: "배송" },
    { id: "product", label: "상품" },
    { id: "service", label: "서비스" },
    { id: "account", label: "계정" },
  ];

  const faqData: FAQItem[] = [
    {
      id: "1",
      category: "order",
      question: "주문을 취소하고 싶어요",
      answer: "주문 취소는 '나의 주문' 메뉴에서 주문 내역을 선택한 후 '주문 취소' 버튼을 눌러주세요. 배송 전 주문은 즉시 취소되며, 배송 중인 주문은 고객센터로 문의해주세요.",
    },
    {
      id: "2",
      category: "delivery",
      question: "배송은 얼마나 걸리나요?",
      answer: "일반적으로 주문 후 2-3일 내 배송됩니다. 도서산간 지역은 추가 1-2일이 소요될 수 있습니다. 배송 추적은 '나의 주문'에서 확인하실 수 있습니다.",
    },
    {
      id: "3",
      category: "product",
      question: "상품을 반품하고 싶어요",
      answer: "상품 수령 후 7일 이내에 반품 신청이 가능합니다. 상품이 손상되지 않은 상태에서 원래 포장으로 반품해주세요. 반품 신청은 '나의 주문'에서 가능합니다.",
    },
    {
      id: "4",
      category: "service",
      question: "산책 서비스는 어떻게 이용하나요?",
      answer: "홈 화면에서 'Pet Walker' 탭을 선택한 후 '산책 요청하기' 버튼을 눌러주세요. 원하는 시간대와 장소를 선택하면 전문 워커와 매칭됩니다.",
    },
    {
      id: "5",
      category: "account",
      question: "비밀번호를 잊어버렸어요",
      answer: "로그인 화면에서 '비밀번호 찾기'를 선택하시거나, Settings > 비밀번호 변경 메뉴에서 변경하실 수 있습니다.",
    },
    {
      id: "6",
      category: "order",
      question: "무료배송 조건이 무엇인가요?",
      answer: "30,000원 이상 구매 시 무료배송이 적용됩니다. 장바구니에서 현재 금액과 무료배송까지 남은 금액을 확인하실 수 있습니다.",
    },
  ];

  const toggleItem = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const filteredFAQs = faqData.filter((item) => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
          FAQ
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* 검색바 */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="궁금한 내용을 검색하세요"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* 카테고리 필터 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryContainer}
          contentContainerStyle={styles.categoryContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategory === category.id && styles.categoryButtonTextActive,
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* FAQ 목록 */}
        <View style={styles.faqList}>
          {filteredFAQs.map((item) => (
            <View key={item.id} style={styles.faqItem}>
              <TouchableOpacity
                style={styles.faqQuestion}
                onPress={() => toggleItem(item.id)}
              >
                <Text style={styles.faqQuestionText}>{item.question}</Text>
                <Ionicons
                  name={expandedItems.has(item.id) ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#C59172"
                />
              </TouchableOpacity>
              {expandedItems.has(item.id) && (
                <View style={styles.faqAnswer}>
                  <Text style={styles.faqAnswerText}>{item.answer}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {filteredFAQs.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="search" size={48} color="#ccc" />
            <Text style={styles.emptyText}>검색 결과가 없습니다</Text>
          </View>
        )}
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryContent: {
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: "#C59172",
    borderColor: "#C59172",
  },
  categoryButtonText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  categoryButtonTextActive: {
    color: "#fff",
  },
  faqList: {
    gap: 12,
  },
  faqItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  faqQuestion: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginRight: 12,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  faqAnswerText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#666",
    marginTop: 12,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginTop: 16,
  },
});

export default FAQScreen;

