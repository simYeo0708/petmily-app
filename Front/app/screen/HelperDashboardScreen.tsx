import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useMemo, useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useHelperStatus } from "../hooks/useHelperStatus";
import { RootStackParamList } from "../index";
import { helperDashboardStyles, homeScreenStyles } from "../styles/HomeScreenStyles";
import { Ionicons } from "@expo/vector-icons";
import { IconImage } from "../components/IconImage";
import WalkerDashboardService, { WalkerDashboardResponse } from "../services/WalkerDashboardService";

type HelperDashboardScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "HelperDashboard"
>;

const HelperDashboardScreen = () => {
  const navigation = useNavigation<HelperDashboardScreenNavigationProp>();
  const { helperStatus, loadHelperStatus } = useHelperStatus();
  const [dashboardData, setDashboardData] = useState<WalkerDashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const data = await WalkerDashboardService.getDashboard();
      if (data) {
        setDashboardData(data);
        // helperStatus도 업데이트
        await loadHelperStatus();
      }
    } catch (error) {
      console.error('대시보드 데이터 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const earningsSummary = useMemo(() => {
    if (dashboardData?.earningsInfo) {
      const nextPayoutDate = dashboardData.earningsInfo.nextPayoutDate 
        ? new Date(dashboardData.earningsInfo.nextPayoutDate)
        : null;
      const nextPayoutStr = nextPayoutDate 
        ? `${nextPayoutDate.getMonth() + 1}월 ${nextPayoutDate.getDate()}일`
        : "미정";

      return {
        total: dashboardData.earningsInfo.totalEarnings ?? 0,
        month: dashboardData.earningsInfo.thisMonthEarnings ?? 0,
        week: dashboardData.earningsInfo.thisWeekEarnings ?? 0,
        today: dashboardData.earningsInfo.todayEarnings ?? 0,
        growthRate: dashboardData.earningsInfo.growthRate ?? 0,
        nextPayout: nextPayoutStr,
      };
    }
    
    // Fallback to helperStatus
    const todayEstimate = Math.max(0, Math.floor(helperStatus.thisMonthEarnings / 20));
    const weekEstimate = Math.max(
      todayEstimate,
      Math.floor(helperStatus.thisMonthEarnings / 4)
    );

    return {
      total: helperStatus.totalEarnings ?? 0,
      month: helperStatus.thisMonthEarnings ?? 0,
      week: weekEstimate,
      today: todayEstimate,
      growthRate: 12.4,
      nextPayout: helperStatus.thisMonthEarnings > 0 ? "4월 28일" : "미정",
    };
  }, [dashboardData, helperStatus]);

  const trendData = useMemo(() => {
    if (dashboardData?.weeklyEarnings && dashboardData.weeklyEarnings.length > 0) {
      return dashboardData.weeklyEarnings.map(week => ({
        label: week.weekLabel,
        value: week.earnings,
      }));
    }
    
    // Fallback
    return [
      { label: "4주전", value: Math.max(120000, earningsSummary.week * 0.7) },
      { label: "3주전", value: Math.max(140000, earningsSummary.week * 0.85) },
      { label: "2주전", value: Math.max(160000, earningsSummary.week * 0.95) },
      { label: "지난주", value: Math.max(190000, earningsSummary.week) },
      { label: "이번주", value: Math.max(earningsSummary.week + 25000, 210000) },
    ];
  }, [dashboardData, earningsSummary.week]);

  const chartMaxValue = useMemo(
    () => Math.max(...trendData.map((item) => item.value), 1),
    [trendData]
  );

  const quickMetrics = useMemo(
    () => [
      {
        ionIcon: "briefcase-outline" as const,
        label: "이번 주 수익",
        value: `${earningsSummary.week.toLocaleString()}원`,
      },
      {
        ionIcon: "star" as const,
        label: "평균 평점",
        value: `${(dashboardData?.statisticsInfo?.averageRating ?? helperStatus.rating).toFixed(1)} / 5`,
      },
      {
        ionIcon: "people-outline" as const,
        label: "총 산책 횟수",
        value: `${dashboardData?.statisticsInfo?.totalWalks ?? helperStatus.totalWalks}회`,
      },
      {
        ionIcon: "refresh" as const,
        label: "재요청률",
        value: `${(dashboardData?.statisticsInfo?.repeatRate ?? 92).toFixed(0)}%`,
      },
    ],
    [earningsSummary.week, dashboardData, helperStatus.rating, helperStatus.totalWalks]
  );

  const recentReviews = useMemo(() => {
    if (dashboardData?.recentReviews && dashboardData.recentReviews.length > 0) {
      return dashboardData.recentReviews.map(review => ({
        id: review.id.toString(),
        name: review.userName,
        rating: review.rating,
        comment: review.comment,
        date: new Date(review.createdAt).toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }).replace(/\./g, '.').replace(/\s/g, ''),
      }));
    }
    
    // Fallback
    return [
      {
        id: "review-1",
        name: "이루다 보호자",
        rating: 5,
        comment: "산책 내내 사진을 보내주셔서 안심됐어요! 다음에도 부탁드릴게요.",
        date: "2025.04.18",
      },
      {
        id: "review-2",
        name: "김보호자",
        rating: 4.5,
        comment: "강아지 성향을 잘 파악해주셔서 만족합니다. 약속 시간도 정확했어요.",
        date: "2025.04.15",
      },
      {
        id: "review-3",
        name: "오보호자",
        rating: 4.8,
        comment: "비 오는 날에도 꼼꼼히 케어해주셔서 감사했습니다.",
        date: "2025.04.12",
      },
    ];
  }, [dashboardData]);

  const upcomingTasks = useMemo(() => {
    if (dashboardData?.upcomingBookings && dashboardData.upcomingBookings.length > 0) {
      return dashboardData.upcomingBookings.map(booking => {
        const bookingDate = new Date(booking.date);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const bookingDay = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate());
        
        const diffDays = Math.floor((bookingDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        let timeLabel = "";
        if (diffDays === 0) {
          timeLabel = `오늘 · ${bookingDate.getHours().toString().padStart(2, '0')}:${bookingDate.getMinutes().toString().padStart(2, '0')}`;
        } else if (diffDays === 1) {
          timeLabel = `내일 · ${bookingDate.getHours().toString().padStart(2, '0')}:${bookingDate.getMinutes().toString().padStart(2, '0')}`;
        } else {
          const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
          timeLabel = `${dayNames[bookingDate.getDay()]}요일 · ${bookingDate.getHours().toString().padStart(2, '0')}:${bookingDate.getMinutes().toString().padStart(2, '0')}`;
        }

        return {
          id: booking.id.toString(),
          time: timeLabel,
          pet: `${booking.petName}${booking.petBreed ? ` (${booking.petBreed})` : ''}`,
          note: booking.notes || "",
        };
      });
    }
    
    // Fallback
    return [
      {
        id: "task-1",
        time: "오늘 · 18:00",
        pet: "루이 (시고르자브종)",
        note: "비 예보 40%, 우비 준비",
      },
      {
        id: "task-2",
        time: "내일 · 07:30",
        pet: "모찌 (스피츠)",
        note: "아침 산책 + 약 복용 확인",
      },
      {
        id: "task-3",
        time: "토요일 · 11:00",
        pet: "쁘띠 (푸들)",
        note: "첫 산책, 집 앞 10분 전 도착",
      },
    ];
  }, [dashboardData]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={homeScreenStyles.root}>
      <StatusBar backgroundColor="#000000" barStyle="light-content" translucent={false} />
      <View style={helperDashboardStyles.headerBar}>
        <Pressable onPress={handleBackPress} style={helperDashboardStyles.backButton}>
          <Ionicons name="chevron-back" size={20} color="#333" />
        </Pressable>
        <Text style={helperDashboardStyles.headerTitle}>대시보드</Text>
        <View style={helperDashboardStyles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={helperDashboardStyles.scrollContent}>
        <View style={helperDashboardStyles.heroCard}>
          <Text style={helperDashboardStyles.heroLabel}>총 누적 수익</Text>
          <Text style={helperDashboardStyles.heroAmount}>
            {earningsSummary.total.toLocaleString()}원
          </Text>
          <View style={helperDashboardStyles.heroMetaRow}>
            <View style={helperDashboardStyles.heroMetaItem}>
              <Text style={helperDashboardStyles.heroMetaLabel}>이번 달 수익</Text>
              <Text style={helperDashboardStyles.heroMetaValue}>
                {earningsSummary.month.toLocaleString()}원
              </Text>
            </View>
            <View style={helperDashboardStyles.heroMetaDivider} />
            <View style={helperDashboardStyles.heroMetaItem}>
              <Text style={helperDashboardStyles.heroMetaLabel}>다음 정산 예정</Text>
              <Text style={helperDashboardStyles.heroMetaValue}>
                {earningsSummary.nextPayout}
              </Text>
            </View>
          </View>
          <View style={helperDashboardStyles.heroBadgeRow}>
            <View style={helperDashboardStyles.heroBadge}>
              <Ionicons name="trending-up" size={14} color="#2E7D32" style={helperDashboardStyles.heroBadgeIcon} />
              <Text style={helperDashboardStyles.heroBadgeText}>
                지난달 대비 {earningsSummary.growthRate}% 성장
              </Text>
            </View>
            <View style={helperDashboardStyles.heroBadge}>
              <Ionicons name="star" size={14} color="#FFC107" style={helperDashboardStyles.heroBadgeIcon} />
              <Text style={helperDashboardStyles.heroBadgeText}>
                평균 평점 {(dashboardData?.statisticsInfo?.averageRating ?? helperStatus.rating).toFixed(1)}
              </Text>
            </View>
          </View>
        </View>

        <View style={helperDashboardStyles.metricRow}>
          {quickMetrics.map((metric) => (
            <View key={metric.label} style={helperDashboardStyles.metricCard}>
              <Ionicons
                name={metric.ionIcon}
                size={22}
                color="#C59172"
                style={helperDashboardStyles.metricIcon}
              />
              <Text style={helperDashboardStyles.metricValue}>{metric.value}</Text>
              <Text style={helperDashboardStyles.metricLabel}>{metric.label}</Text>
            </View>
          ))}
        </View>

        <View style={helperDashboardStyles.chartCard}>
          <View style={helperDashboardStyles.chartHeader}>
            <View>
              <Text style={helperDashboardStyles.sectionTitle}>최근 5주 수익 추이</Text>
              <Text style={helperDashboardStyles.sectionSubtitle}>
                주간 평균 +{earningsSummary.growthRate}% 상승 중
              </Text>
            </View>
            <Text style={helperDashboardStyles.chartHighlight}>
              이번 주 {earningsSummary.week.toLocaleString()}원
            </Text>
          </View>

          <View style={helperDashboardStyles.chartBody}>
            {trendData.map((item, index) => {
              const barHeight = Math.max(
                12,
                Math.round((item.value / chartMaxValue) * 140)
              );
              const isLatest = index === trendData.length - 1;
              return (
                <View key={item.label} style={helperDashboardStyles.chartColumn}>
                  <View style={helperDashboardStyles.chartValueBadge}>
                    <Text style={helperDashboardStyles.chartValueText}>
                      {(item.value / 1000).toFixed(0)}k
                    </Text>
                  </View>
                  <View
                    style={[
                      helperDashboardStyles.chartBar,
                      {
                        height: barHeight,
                        backgroundColor: isLatest ? "#C59172" : "#E5D3C5",
                      },
                    ]}
                  />
                  <Text style={helperDashboardStyles.chartLabel}>{item.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={helperDashboardStyles.tasksCard}>
          <View style={helperDashboardStyles.sectionHeaderRow}>
            <Text style={helperDashboardStyles.sectionTitle}>다가오는 산책 일정</Text>
            <Pressable onPress={() => navigation.navigate('WalkerBookings')}>
              <Text style={helperDashboardStyles.sectionLink}>전체 보기</Text>
            </Pressable>
          </View>
          {upcomingTasks.map((task, index) => {
            const booking = dashboardData?.upcomingBookings?.find(b => b.id.toString() === task.id);
            return (
              <Pressable
                key={task.id}
                onPress={() => {
                  if (booking) {
                    navigation.navigate('WalkerBookingDetail', {
                      bookingId: booking.id,
                      bookingData: {
                        id: booking.id,
                        date: booking.date,
                        petName: booking.petName,
                        petBreed: booking.petBreed,
                        notes: booking.notes,
                        status: booking.status,
                        address: booking.address,
                      },
                    });
                  }
                }}
                style={[
                  helperDashboardStyles.taskItem,
                  index < upcomingTasks.length - 1 && helperDashboardStyles.taskDivider,
                ]}
              >
                <View style={helperDashboardStyles.taskIconBubble}>
                  <IconImage name="paw" size={18} style={helperDashboardStyles.taskIcon} />
                </View>
                <View style={helperDashboardStyles.taskInfo}>
                  <Text style={helperDashboardStyles.taskTime}>{task.time}</Text>
                  <Text style={helperDashboardStyles.taskPet}>{task.pet}</Text>
                  <Text style={helperDashboardStyles.taskNote}>{task.note}</Text>
                </View>
                <Text style={helperDashboardStyles.taskChevron}>›</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={helperDashboardStyles.reviewCard}>
          <View style={helperDashboardStyles.sectionHeaderRow}>
            <Text style={helperDashboardStyles.sectionTitle}>최근 리뷰</Text>
            <Pressable onPress={() => navigation.navigate('WalkerReviews')}>
              <Text style={helperDashboardStyles.sectionLink}>모두 보기</Text>
            </Pressable>
          </View>
          {recentReviews.map((review, index) => (
            <View
              key={review.id}
              style={[
                helperDashboardStyles.reviewItem,
                index < recentReviews.length - 1 && helperDashboardStyles.reviewDivider,
              ]}
            >
              <View style={helperDashboardStyles.reviewAvatar}>
                <Text style={helperDashboardStyles.reviewAvatarText}>
                  {review.name.slice(0, 1)}
                </Text>
              </View>
              <View style={helperDashboardStyles.reviewInfo}>
                <View style={helperDashboardStyles.reviewHeader}>
                  <Text style={helperDashboardStyles.reviewName}>{review.name}</Text>
                  <View style={helperDashboardStyles.reviewRatingRow}>
                    <Ionicons name="star" size={14} color="#FFC107" style={helperDashboardStyles.reviewRatingIcon} />
                    <Text style={helperDashboardStyles.reviewRating}>{review.rating}</Text>
                  </View>
                </View>
                <Text style={helperDashboardStyles.reviewComment} numberOfLines={2}>
                  {review.comment}
                </Text>
                <Text style={helperDashboardStyles.reviewDate}>{review.date}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HelperDashboardScreen;
