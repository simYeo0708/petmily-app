import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { rf } from '../utils/responsive';
import { Ionicons } from '@expo/vector-icons';

interface SubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  productName: string;
  productPrice: number;
  onConfirm: (subscription: SubscriptionSettings) => void;
}

export interface SubscriptionSettings {
  cycle: '1주' | '2주' | '1개월' | '2개월' | '3개월';
  quantity: number;
  discount: number;
  deliveryDay?: string;
}

const SUBSCRIPTION_CYCLES = [
  { label: '1주마다', value: '1주' as const, discount: 5 },
  { label: '2주마다', value: '2주' as const, discount: 7 },
  { label: '1개월마다', value: '1개월' as const, discount: 10 },
  { label: '2개월마다', value: '2개월' as const, discount: 12 },
  { label: '3개월마다', value: '3개월' as const, discount: 15 },
];

const DELIVERY_DAYS = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  visible,
  onClose,
  productName,
  productPrice,
  onConfirm,
}) => {
  const [selectedCycle, setSelectedCycle] = useState<typeof SUBSCRIPTION_CYCLES[number]>(
    SUBSCRIPTION_CYCLES[2]
  );
  const [quantity, setQuantity] = useState(1);
  const [selectedDay, setSelectedDay] = useState<string>('월요일');

  const discountedPrice = productPrice * (1 - selectedCycle.discount / 100);
  const totalPrice = discountedPrice * quantity;

  const handleConfirm = () => {
    onConfirm({
      cycle: selectedCycle.value,
      quantity,
      discount: selectedCycle.discount,
      deliveryDay: selectedDay,
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* 헤더 */}
          <View style={styles.header}>
            <Text style={styles.title}>정기배송 설정</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* 상품 정보 */}
            <View style={styles.productInfo}>
              <Ionicons name="cube-outline" size={24} color="#C59172" />
              <View style={styles.productDetails}>
                <Text style={styles.productName}>{productName}</Text>
                <Text style={styles.productPrice}>
                  {productPrice.toLocaleString()}원
                </Text>
              </View>
            </View>

            {/* 배송 주기 선택 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>배송 주기</Text>
              <View style={styles.cycleGrid}>
                {SUBSCRIPTION_CYCLES.map((cycle) => (
                  <TouchableOpacity
                    key={cycle.value}
                    style={[
                      styles.cycleButton,
                      selectedCycle.value === cycle.value && styles.cycleButtonActive,
                    ]}
                    onPress={() => setSelectedCycle(cycle)}
                  >
                    <Text
                      style={[
                        styles.cycleText,
                        selectedCycle.value === cycle.value && styles.cycleTextActive,
                      ]}
                    >
                      {cycle.label}
                    </Text>
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>{cycle.discount}% 할인</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 수량 선택 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>배송 수량</Text>
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Ionicons name="remove" size={20} color="#333" />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => setQuantity(quantity + 1)}
                >
                  <Ionicons name="add" size={20} color="#333" />
                </TouchableOpacity>
              </View>
            </View>

            {/* 배송 요일 선택 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>선호 배송 요일</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.dayScroll}
              >
                {DELIVERY_DAYS.map((day) => (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.dayButton,
                      selectedDay === day && styles.dayButtonActive,
                    ]}
                    onPress={() => setSelectedDay(day)}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        selectedDay === day && styles.dayTextActive,
                      ]}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* 혜택 안내 */}
            <View style={styles.benefitBox}>
              <View style={styles.benefitHeader}>
                <Ionicons name="gift-outline" size={20} color="#C59172" />
                <Text style={styles.benefitTitle}>정기배송 혜택</Text>
              </View>
              <View style={styles.benefitList}>
                <View style={styles.benefitItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                  <Text style={styles.benefitText}>
                    {selectedCycle.discount}% 할인 적용
                  </Text>
                </View>
                <View style={styles.benefitItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                  <Text style={styles.benefitText}>무료 배송</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                  <Text style={styles.benefitText}>언제든지 변경/해지 가능</Text>
                </View>
              </View>
            </View>

            {/* 가격 요약 */}
            <View style={styles.priceBox}>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>정가</Text>
                <Text style={styles.priceValue}>
                  {(productPrice * quantity).toLocaleString()}원
                </Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>할인</Text>
                <Text style={styles.discountValue}>
                  -{((productPrice * quantity) - totalPrice).toLocaleString()}원
                </Text>
              </View>
              <View style={[styles.priceRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>최종 결제금액</Text>
                <Text style={styles.totalValue}>
                  {totalPrice.toLocaleString()}원
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* 하단 버튼 */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmButtonText}>정기배송 시작</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: rf(20),
    fontWeight: '700',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  productInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF9F6',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
  },
  productDetails: {
    marginLeft: 12,
    flex: 1,
  },
  productName: {
    fontSize: rf(15),
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: rf(14),
    color: '#666',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: rf(16),
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  cycleGrid: {
    gap: 10,
  },
  cycleButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  cycleButtonActive: {
    borderColor: '#C59172',
    backgroundColor: '#FFF9F6',
  },
  cycleText: {
    fontSize: rf(15),
    fontWeight: '500',
    color: '#666',
  },
  cycleTextActive: {
    color: '#C59172',
    fontWeight: '600',
  },
  discountBadge: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    fontSize: rf(11),
    fontWeight: '600',
    color: '#fff',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 8,
  },
  quantityButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  quantityText: {
    fontSize: rf(18),
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 24,
    minWidth: 30,
    textAlign: 'center',
  },
  dayScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  dayButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 8,
    backgroundColor: '#fff',
  },
  dayButtonActive: {
    borderColor: '#C59172',
    backgroundColor: '#C59172',
  },
  dayText: {
    fontSize: rf(14),
    fontWeight: '500',
    color: '#666',
  },
  dayTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  benefitBox: {
    margin: 20,
    padding: 16,
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C59172',
  },
  benefitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitTitle: {
    fontSize: rf(15),
    fontWeight: '600',
    color: '#C59172',
    marginLeft: 8,
  },
  benefitList: {
    gap: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitText: {
    fontSize: rf(13),
    color: '#666',
    marginLeft: 8,
  },
  priceBox: {
    margin: 20,
    padding: 16,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: rf(14),
    color: '#666',
  },
  priceValue: {
    fontSize: rf(14),
    fontWeight: '500',
    color: '#666',
  },
  discountValue: {
    fontSize: rf(14),
    fontWeight: '600',
    color: '#FF6B6B',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  totalLabel: {
    fontSize: rf(16),
    fontWeight: '600',
    color: '#333',
  },
  totalValue: {
    fontSize: rf(18),
    fontWeight: '700',
    color: '#C59172',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: rf(15),
    fontWeight: '600',
    color: '#666',
  },
  confirmButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#C59172',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: rf(15),
    fontWeight: '700',
    color: '#fff',
  },
});

