import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../index';
import { createReview } from '../services/reviewService';
import { rf } from '../utils/responsive';

type ReviewWriteScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ReviewWrite'>;

interface RouteParams {
  orderId: number;
  productId: number;
  productName: string;
  productImage?: string;
}

const ReviewWriteScreen = () => {
  const navigation = useNavigation<ReviewWriteScreenNavigationProp>();
  const route = useRoute();
  const { orderId, productId, productName, productImage } = (route.params as RouteParams) || {};

  const [rating, setRating] = useState<number>(5);
  const [content, setContent] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) {
      Alert.alert('알림', '리뷰 내용을 입력해주세요.');
      return;
    }

    if (content.trim().length < 10) {
      Alert.alert('알림', '리뷰 내용은 최소 10자 이상 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      await createReview({
        productId,
        orderId,
        rating,
        content: content.trim(),
      });

      Alert.alert(
        '리뷰 작성 완료',
        '리뷰가 성공적으로 작성되었습니다.',
        [
          {
            text: '확인',
            onPress: () => {
              // 리뷰 작성 완료 후 이전 화면으로 돌아감
              // ProductDetailScreen으로 돌아가면 자동으로 리뷰가 새로고침됨
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('오류', error.message || '리뷰 작성에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (selectedRating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={star <= selectedRating ? 'star' : 'star-outline'}
              size={40}
              color={star <= selectedRating ? '#FFD700' : '#E0E0E0'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>리뷰 작성</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 상품 정보 */}
        <View style={styles.productCard}>
          <Text style={styles.productCardTitle}>주문 상품</Text>
          <View style={styles.productInfo}>
            {productImage && (
              <Image
                source={
                  productImage.startsWith('@')
                    ? require('../../assets/images/dog_food.png')
                    : { uri: productImage }
                }
                style={styles.productImage}
                resizeMode="cover"
              />
            )}
            <View style={styles.productDetails}>
              <Text style={styles.productName} numberOfLines={2}>
                {productName}
              </Text>
            </View>
          </View>
        </View>

        {/* 평점 선택 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>평점을 선택해주세요</Text>
          {renderStars(rating)}
          <Text style={styles.ratingText}>{rating}점</Text>
        </View>

        {/* 리뷰 내용 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>리뷰 작성</Text>
          <TextInput
            style={styles.textInput}
            value={content}
            onChangeText={setContent}
            placeholder="상품에 대한 솔직한 리뷰를 작성해주세요. (최소 10자 이상)"
            placeholderTextColor="#999"
            multiline
            numberOfLines={8}
            textAlignVertical="top"
            maxLength={1000}
          />
          <Text style={styles.charCount}>
            {content.length} / 1000자
          </Text>
        </View>

        {/* 작성 완료 버튼 */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (isSubmitting || !content.trim() || content.trim().length < 10) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting || !content.trim() || content.trim().length < 10}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? '작성 중...' : '리뷰 작성 완료'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: rf(18),
    fontWeight: '600',
    color: '#333',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  productCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productCardTitle: {
    fontSize: rf(14),
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  productInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#F0F0F0',
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: rf(16),
    fontWeight: '600',
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: rf(16),
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  ratingText: {
    fontSize: rf(16),
    fontWeight: '600',
    color: '#C59172',
    textAlign: 'center',
  },
  textInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
    fontSize: rf(14),
    color: '#333',
    minHeight: 150,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  charCount: {
    fontSize: rf(12),
    color: '#999',
    textAlign: 'right',
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: '#C59172',
    marginHorizontal: 16,
    marginBottom: 32,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  submitButtonText: {
    fontSize: rf(16),
    fontWeight: '600',
    color: '#fff',
  },
});

export default ReviewWriteScreen;

