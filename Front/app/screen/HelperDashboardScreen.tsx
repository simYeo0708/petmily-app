import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useMemo } from "react";
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

type HelperDashboardScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "HelperDashboard"
>;

const HelperDashboardScreen = () => {
  const navigation = useNavigation<HelperDashboardScreenNavigationProp>();
  const { helperStatus } = useHelperStatus();

  const earningsSummary = useMemo(() => {
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
  }, [helperStatus]);

  const trendData = useMemo(
    () => [
      { label: "4주전", value: Math.max(120000, earningsSummary.week * 0.7) },
      { label: "3주전", value: Math.max(140000, earningsSummary.week * 0.85) },
      { label: "2주전", value: Math.max(160000, earningsSummary.week * 0.95) },
      { label: "지난주", value: Math.max(190000, earningsSummary.week) },
      { label: "이번주", value: Math.max(earningsSummary.week + 25000, 210000) },
    ],
    [earningsSummary.week]
  );

  const chartMaxValue = useMemo(
    () => Math.max(...trendData.map((item) => item.value), 1),
    [trendData]
  );

  const quickMetrics = useMemo(
    () => [
      {
        icon: "💼",
        label: "이번 주 수익",
        value: `${earningsSummary.week.toLocaleString()}원`,
      },
      {
        icon: "⭐",
        label: "평균 평점",
        value: `${helperStatus.rating.toFixed(1)} / 5`,
      },
      {
        icon: "👥",
        label: "총 산책 횟수",
        value: `${helperStatus.totalWalks}회`,
      },
      {
        icon: "🔁",
        label: "재요청률",
        value: "92%",
      },
    ],
    [earningsSummary.week, helperStatus.rating, helperStatus.totalWalks]
  );

  const recentReviews = useMemo(
    () => [
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
    ],
    []
  );

  const upcomingTasks = useMemo(
    () => [
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
    ],
    []
  );

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={homeScreenStyles.root}>
      <StatusBar backgroundColor="#000000" barStyle="light-content" translucent={false} />
      <View style={helperDashboardStyles.headerBar}>
        <Pressable onPress={handleBackPress} style={helperDashboardStyles.backButton}>
          <Text style={helperDashboardStyles.backIcon}>←</Text>
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
            <Text style={helperDashboardStyles.heroBadge}>
              📈 지난달 대비 {earningsSummary.growthRate}% 성장
            </Text>
            <Text style={helperDashboardStyles.heroBadge}>⭐ 평균 평점 {helperStatus.rating.toFixed(1)}</Text>
          </View>
        </View>

        <View style={helperDashboardStyles.metricRow}>
          {quickMetrics.map((metric) => (
            <View key={metric.label} style={helperDashboardStyles.metricCard}>
              <Text style={helperDashboardStyles.metricIcon}>{metric.icon}</Text>
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
            <Text style={helperDashboardStyles.sectionLink}>전체 보기</Text>
          </View>
          {upcomingTasks.map((task, index) => (
            <View
              key={task.id}
              style={[
                helperDashboardStyles.taskItem,
                index < upcomingTasks.length - 1 && helperDashboardStyles.taskDivider,
              ]}
            >
              <View style={helperDashboardStyles.taskIconBubble}>
                <Text style={helperDashboardStyles.taskIcon}>🐾</Text>
              </View>
              <View style={helperDashboardStyles.taskInfo}>
                <Text style={helperDashboardStyles.taskTime}>{task.time}</Text>
                <Text style={helperDashboardStyles.taskPet}>{task.pet}</Text>
                <Text style={helperDashboardStyles.taskNote}>{task.note}</Text>
              </View>
              <Text style={helperDashboardStyles.taskChevron}>›</Text>
            </View>
          ))}
        </View>

        <View style={helperDashboardStyles.reviewCard}>
          <View style={helperDashboardStyles.sectionHeaderRow}>
            <Text style={helperDashboardStyles.sectionTitle}>최근 리뷰</Text>
            <Text style={helperDashboardStyles.sectionLink}>모두 보기</Text>
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
                  <Text style={helperDashboardStyles.reviewRating}>⭐ {review.rating}</Text>
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
