import { StyleSheet } from 'react-native';
import { rf, wp, hp } from '../utils/responsive';

export const cartScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingTop: 0,
  },
  header: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: wp(20),
    paddingVertical: hp(8),
    paddingTop: hp(4),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(197, 145, 114, 0.2)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: rf(24),
    fontWeight: '700',
    color: '#4A4A4A',
  },
  itemCount: {
    fontSize: rf(14),
    color: '#888',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: wp(16),
  },
  emptyCart: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(40),
  },
  emptyIcon: {
    fontSize: rf(50),
    marginBottom: hp(12),
  },
  emptyTitle: {
    fontSize: rf(20),
    fontWeight: 'bold',
    color: '#4A4A4A',
    marginBottom: hp(8),
  },
  emptySubtitle: {
    fontSize: rf(16),
    color: '#888',
    textAlign: 'center',
  },
  itemsList: {
    paddingVertical: hp(8),
  },
  cartItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: wp(12),
    marginBottom: hp(8),
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  itemImage: {
    width: wp(60),
    height: wp(60),
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(12),
  },
  itemImagePlaceholder: {
    fontSize: rf(24),
  },
  itemInfo: {
    flex: 1,
    marginRight: wp(12),
  },
  itemName: {
    fontSize: rf(16),
    fontWeight: '600',
    color: '#4A4A4A',
    marginBottom: hp(4),
  },
  itemDescription: {
    fontSize: rf(12),
    color: '#888',
    marginBottom: hp(8),
    lineHeight: 16,
  },
  itemPrice: {
    fontSize: rf(16),
    fontWeight: 'bold',
    color: '#C59172',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: wp(12),
  },
  quantityButton: {
    width: wp(32),
    height: wp(32),
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    fontSize: rf(18),
    fontWeight: 'bold',
    color: '#4A4A4A',
  },
  quantityText: {
    fontSize: rf(16),
    fontWeight: '600',
    color: '#4A4A4A',
    marginHorizontal: wp(12),
    minWidth: wp(20),
    textAlign: 'center',
  },
  removeButton: {
    width: wp(24),
    height: wp(24),
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    fontSize: rf(16),
    color: '#FF6B6B',
    fontWeight: 'bold',
  },
  footer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(197, 145, 114, 0.2)',
    paddingHorizontal: wp(20),
    paddingVertical: hp(16),
    paddingBottom: hp(90), // 하단탭 높이(70) + 여유공간(20) 고려
  },
  totalSection: {
    marginBottom: hp(16),
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp(4),
  },
  totalLabel: {
    fontSize: rf(14),
    color: '#888',
  },
  totalValue: {
    fontSize: rf(14),
    color: '#4A4A4A',
    fontWeight: '500',
  },
  finalTotal: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    marginTop: hp(8),
    paddingTop: hp(12),
  },
  finalTotalLabel: {
    fontSize: rf(18),
    fontWeight: 'bold',
    color: '#4A4A4A',
  },
  finalTotalValue: {
    fontSize: rf(20),
    fontWeight: 'bold',
    color: '#C59172',
  },
  paymentButton: {
    backgroundColor: '#C59172',
    borderRadius: 16,
    paddingVertical: hp(16),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  paymentButtonText: {
    color: '#FFFFFF',
    fontSize: rf(18),
    fontWeight: 'bold',
  },
});

export default cartScreenStyles;
