import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Order,
  ORDER_DATA,
  OrderStatus,
  getOrderStatusText,
  getOrderStatusColor,
} from "../constants/OrderData";
import { RootStackParamList } from "../index";
import { rf } from "../utils/responsive";

type MyOrdersScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

type FilterType = "all" | OrderStatus;

const MyOrdersScreen = () => {
  const navigation = useNavigation<MyOrdersScreenNavigationProp>();
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");

  // 진행중인 주문 (배송중, 준비중, 결제완료)
  const ongoingOrders = ORDER_DATA.filter((order) => 
    order.status === "shipping" || 
    order.status === "preparing" || 
    order.status === "payment_complete"
  );

  // 필터링된 주문 목록
  const filteredOrders = ORDER_DATA.filter((order) => {
    if (selectedFilter === "all") return true;
    return order.status === selectedFilter;
  });

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()}원`;
  };

  const renderOrderItem = (order: Order) => {
    const statusColor = getOrderStatusColor(order.status);
    const statusText = getOrderStatusText(order.status);

    return (
      <TouchableOpacity
        key={order.id}
        style={styles.orderCard}
        onPress={() => {}}
        activeOpacity={0.7}>
        {/* 주문 헤더 */}
        <View style={styles.orderHeader}>
          <Text style={styles.orderDate}>{order.orderDate}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{statusText}</Text>
          </View>
        </View>

        <Text style={styles.orderNumber}>주문번호: {order.orderNumber}</Text>

        {/* 주문 상품 목록 */}
        <View style={styles.itemsContainer}>
          {order.items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              {item.productImage.startsWith('@') ? (
                <Image
                  source={
                    item.productImage === '@dog_food.png' ? require('../../assets/images/dog_food.png') :
                    item.productImage === '@dog_snack.png' ? require('../../assets/images/dog_snack.png') :
                    item.productImage === '@cat_food.png' ? require('../../assets/images/cat_food.png') :
                    item.productImage === '@cat_snack.png' ? require('../../assets/images/cat_snack.png') :
                    item.productImage === '@toy.png' ? require('../../assets/images/toy.png') :
                    item.productImage === '@toilet.png' ? require('../../assets/images/toilet.png') :
                    item.productImage === '@grooming.png' ? require('../../assets/images/grooming.png') :
                    item.productImage === '@clothing.png' ? require('../../assets/images/clothing.png') :
                    item.productImage === '@outdoor.png' ? require('../../assets/images/outdoor.png') :
                    item.productImage === '@house.png' ? require('../../assets/images/house.png') :
                    require('../../assets/images/dog_food.png')
                  }
                  style={{ width: 48, height: 48, marginRight: 12 }}
                  resizeMode="contain"
                />
              ) : (
                <Text style={styles.itemImage}>{item.productImage}</Text>
              )}
              <View style={styles.itemInfo}>
                <Text style={styles.itemBrand}>{item.brand}</Text>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.productName}
                </Text>
                {item.options && (
                  <Text style={styles.itemOptions}>{item.options}</Text>
                )}
                <Text style={styles.itemQuantity}>수량: {item.quantity}개</Text>
              </View>
              <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
            </View>
          ))}
        </View>

        {/* 배송 정보 */}
        {order.trackingNumber && (
          <View style={styles.deliveryInfo}>
            <Text style={styles.deliveryLabel}>송장번호</Text>
            <Text style={styles.deliveryValue}>{order.trackingNumber}</Text>
          </View>
        )}

        {order.estimatedDelivery && (
          <View style={styles.deliveryInfo}>
            <Text style={styles.deliveryLabel}>배송 정보</Text>
            <Text style={styles.deliveryValue}>{order.estimatedDelivery}</Text>
          </View>
        )}

        {/* 결제 금액 */}
        <View style={styles.priceContainer}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>상품 금액</Text>
            <Text style={styles.priceValue}>{formatPrice(order.totalAmount)}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>배송비</Text>
            <Text style={styles.priceValue}>
              {order.deliveryFee === 0 ? "무료" : formatPrice(order.deliveryFee)}
            </Text>
          </View>
          <View style={[styles.priceRow, styles.totalPriceRow]}>
            <Text style={styles.totalLabel}>총 결제금액</Text>
            <Text style={styles.totalValue}>{formatPrice(order.finalAmount)}</Text>
          </View>
        </View>

        {/* 액션 버튼 */}
        <View style={styles.actionButtons}>
          {order.status === "shipping" && (
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>배송 조회</Text>
            </TouchableOpacity>
          )}
          {order.status === "delivered" && (
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>리뷰 작성</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonPrimary]}
            onPress={() => {}}>
            <Text style={[styles.actionButtonText, styles.actionButtonTextPrimary]}>
              주문 상세
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerButton}>
          <Text style={styles.headerIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>나의 주문</Text>
        <View style={styles.headerButton} />
      </View>

      {/* 필터 탭 */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedFilter === "all" && styles.filterChipActive,
            ]}
            onPress={() => setSelectedFilter("all")}>
            <Text
              style={[
                styles.filterText,
                selectedFilter === "all" && styles.filterTextActive,
              ]}>
              전체 ({ORDER_DATA.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedFilter === "shipping" && styles.filterChipActive,
            ]}
            onPress={() => setSelectedFilter("shipping")}>
            <Text
              style={[
                styles.filterText,
                selectedFilter === "shipping" && styles.filterTextActive,
              ]}>
              배송중
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedFilter === "delivered" && styles.filterChipActive,
            ]}
            onPress={() => setSelectedFilter("delivered")}>
            <Text
              style={[
                styles.filterText,
                selectedFilter === "delivered" && styles.filterTextActive,
              ]}>
              배송완료
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedFilter === "preparing" && styles.filterChipActive,
            ]}
            onPress={() => setSelectedFilter("preparing")}>
            <Text
              style={[
                styles.filterText,
                selectedFilter === "preparing" && styles.filterTextActive,
              ]}>
              준비중
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedFilter === "cancelled" && styles.filterChipActive,
            ]}
            onPress={() => setSelectedFilter("cancelled")}>
            <Text
              style={[
                styles.filterText,
                selectedFilter === "cancelled" && styles.filterTextActive,
              ]}>
              취소됨
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* 주문 목록 */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 진행중인 주문 섹션 */}
        {selectedFilter === "all" && ongoingOrders.length > 0 && (
          <View style={styles.ongoingSection}>
            <Text style={styles.ongoingSectionTitle}>🚚 진행중인 주문</Text>
            {ongoingOrders.map((order) => renderOrderItem(order))}
          </View>
        )}

        {/* 전체 주문 섹션 */}
        {selectedFilter === "all" && (
          <View style={styles.allOrdersSection}>
            <Text style={styles.sectionTitle}>📋 전체 주문</Text>
          </View>
        )}

        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => {
            // "전체" 필터에서 진행중인 주문은 이미 위에 표시했으므로 제외
            if (selectedFilter === "all" && ongoingOrders.includes(order)) {
              return null;
            }
            return <View key={order.id}>{renderOrderItem(order)}</View>;
          })
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyText}>주문 내역이 없습니다</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    paddingTop: StatusBar.currentHeight || 0,
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
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerIcon: {
    fontSize: rf(20),
  },
  headerTitle: {
    fontSize: rf(16),
    fontWeight: "600",
    color: "#333",
  },
  filterContainer: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingVertical: 12,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: "#f5f5f5",
    marginRight: 8,
    minWidth: 80,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  filterChipActive: {
    backgroundColor: "#C59172",
    borderColor: "#C59172",
  },
  filterText: {
    fontSize: rf(13),
    color: "#666",
    fontWeight: "600",
  },
  filterTextActive: {
    color: "#fff",
    fontWeight: "700",
  },
  scrollView: {
    flex: 1,
  },
  ongoingSection: {
    marginTop: 8,
    marginBottom: 8,
  },
  ongoingSectionTitle: {
    fontSize: rf(16),
    fontWeight: "700",
    color: "#333",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  allOrdersSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: rf(16),
    fontWeight: "700",
    color: "#333",
    marginHorizontal: 16,
    marginBottom: 8,
  },
  orderCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  orderDate: {
    fontSize: rf(13),
    color: "#666",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: rf(12),
    color: "#fff",
    fontWeight: "600",
  },
  orderNumber: {
    fontSize: rf(12),
    color: "#999",
    marginBottom: 16,
  },
  itemsContainer: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 16,
  },
  itemRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  itemImage: {
    fontSize: rf(40),
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemBrand: {
    fontSize: rf(11),
    color: "#999",
    marginBottom: 2,
  },
  itemName: {
    fontSize: rf(14),
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  itemOptions: {
    fontSize: rf(12),
    color: "#666",
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: rf(12),
    color: "#666",
  },
  itemPrice: {
    fontSize: rf(14),
    fontWeight: "600",
    color: "#333",
  },
  deliveryInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  deliveryLabel: {
    fontSize: rf(13),
    color: "#666",
  },
  deliveryValue: {
    fontSize: rf(13),
    color: "#333",
    fontWeight: "500",
  },
  priceContainer: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 12,
    marginTop: 12,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: rf(13),
    color: "#666",
  },
  priceValue: {
    fontSize: rf(13),
    color: "#333",
  },
  totalPriceRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  totalLabel: {
    fontSize: rf(15),
    fontWeight: "700",
    color: "#333",
  },
  totalValue: {
    fontSize: rf(16),
    fontWeight: "700",
    color: "#C59172",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
  },
  actionButtonPrimary: {
    backgroundColor: "#C59172",
  },
  actionButtonText: {
    fontSize: rf(14),
    fontWeight: "600",
    color: "#666",
  },
  actionButtonTextPrimary: {
    color: "#fff",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: rf(64),
    marginBottom: 16,
  },
  emptyText: {
    fontSize: rf(15),
    color: "#999",
  },
});

export default MyOrdersScreen;

