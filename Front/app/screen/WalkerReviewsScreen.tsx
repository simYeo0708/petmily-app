import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RootStackParamList } from "../index";
import { Ionicons } from "@expo/vector-icons";
import WalkerDashboardService, { WalkerDashboardResponse } from "../services/WalkerDashboardService";
import WalkerService from "../services/WalkerService";
import { API_BASE_URL } from "../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

type WalkerReviewsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "WalkerReviews"
>;

interface ReviewItem {
  id: number;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  petName: string;
}

const WalkerReviewsScreen = () => {
  const navigation = useNavigation<WalkerReviewsScreenNavigationProp>();
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [walkerId, setWalkerId] = useState<number | null>(null);

  useEffect(() => {
    loadWalkerIdAndReviews();
  }, []);

  const loadWalkerIdAndReviews = async () => {
    try {
      setIsLoading(true);
      
      // 현재 워커 정보 가져오기
      const walker = await WalkerService.getCurrentWalker();
      if (walker && walker.id) {
        setWalkerId(parseInt(walker.id));
        await loadReviews(parseInt(walker.id));
      } else {
        // 대시보드 데이터에서 가져오기
        const dashboardData = await WalkerDashboardService.getDashboard();
        if (dashboardData && dashboardData.recentReviews.length > 0) {
          // 최근 리뷰가 있으면 모든 리뷰 로드
          await loadAllReviews();
        }
      }
    } catch (error) {
      // 에러는 UI로만 처리 (콘솔 로그 없이)
      await loadAllReviews();
    } finally {
      setIsLoading(false);
    }
  };

  const loadReviews = async (id: number) => {
    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_BASE_URL}/walker/reviews/walker/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json() as any[];
        const reviewsList: ReviewItem[] = data.map((review: any) => ({
          id: review.id,
          userName: review.userName || review.user?.name || '익명',
          rating: review.rating || 0,
          comment: review.comment || '',
          createdAt: review.createdAt || new Date().toISOString(),
          petName: review.petName || review.pet?.name || '반려동물',
        }));
        setReviews(reviewsList);
      }
    } catch (error) {
      // 에러는 UI로만 처리 (콘솔 로그 없이)
    }
  };

  const loadAllReviews = async () => {
    try {
      const dashboardData = await WalkerDashboardService.getDashboard();
      if (dashboardData && dashboardData.recentReviews) {
        // 대시보드에서 최근 리뷰만 가져왔으므로, 전체 리뷰는 API로 다시 로드
        // 일단 대시보드 데이터를 사용하고, 추후 전체 API 호출로 확장 가능
        const reviewsList: ReviewItem[] = dashboardData.recentReviews.map(review => ({
          id: review.id,
          userName: review.userName,
          rating: review.rating,
          comment: review.comment,
          createdAt: review.createdAt,
          petName: review.petName,
        }));
        setReviews(reviewsList);
      }
    } catch (error) {
      // 에러는 UI로만 처리 (콘솔 로그 없이)
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadWalkerIdAndReviews();
    setRefreshing(false);
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\./g, '.').replace(/\s/g, '');
  };

  const renderReviewItem = ({ item }: { item: ReviewItem }) => (
    <View style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewAvatar}>
          <Text style={styles.reviewAvatarText}>
            {item.userName.slice(0, 1)}
          </Text>
        </View>
        <View style={styles.reviewInfo}>
          <View style={styles.reviewNameRow}>
            <Text style={styles.reviewName}>{item.userName}</Text>
            <View style={styles.reviewRatingRow}>
              <Ionicons name="star" size={14} color="#FFC107" />
              <Text style={styles.reviewRating}>{item.rating.toFixed(1)}</Text>
            </View>
          </View>
          <Text style={styles.reviewPetName}>{item.petName}</Text>
        </View>
        <Text style={styles.reviewDate}>{formatDate(item.createdAt)}</Text>
      </View>
      <Text style={styles.reviewComment}>{item.comment}</Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#000000" />
        <View style={styles.header}>
          <Pressable onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#333" />
          </Pressable>
          <Text style={styles.headerTitle}>전체 리뷰</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#C59172" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#000000" />
      <View style={styles.header}>
        <Pressable onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </Pressable>
        <Text style={styles.headerTitle}>전체 리뷰</Text>
        <View style={styles.headerSpacer} />
      </View>

      {reviews.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="star-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>아직 리뷰가 없습니다</Text>
        </View>
      ) : (
        <FlatList
          data={reviews}
          renderItem={renderReviewItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
};

const getAuthToken = async (): Promise<string> => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    return token || 'test-token-for-user-1';
  } catch (error) {
    return 'test-token-for-user-1';
  }
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#333',
    textAlign: 'center' as const,
  },
  headerSpacer: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  listContent: {
    padding: 16,
  },
  reviewItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#C59172',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: 12,
  },
  reviewAvatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  reviewInfo: {
    flex: 1,
  },
  reviewNameRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 4,
  },
  reviewName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#333',
    marginRight: 8,
  },
  reviewRatingRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  reviewRating: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFC107',
    marginLeft: 4,
  },
  reviewPetName: {
    fontSize: 13,
    color: '#666',
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
  },
  reviewComment: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
};

export default WalkerReviewsScreen;

