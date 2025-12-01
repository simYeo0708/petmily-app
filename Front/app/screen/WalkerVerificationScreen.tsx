import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../index';
import AdminWalkerService, { PendingWalker, WalkerStatus } from '../services/AdminWalkerService';
import { StatusBar } from 'react-native';

type WalkerVerificationScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const WalkerVerificationScreen = () => {
  const navigation = useNavigation<WalkerVerificationScreenNavigationProp>();
  const [pendingWalkers, setPendingWalkers] = useState<PendingWalker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const loadPendingWalkers = async () => {
    try {
      setIsLoading(true);
      const walkers = await AdminWalkerService.getPendingWalkers();
      setPendingWalkers(walkers);
    } catch (error: any) {
      Alert.alert(
        '오류',
        error.message || '워커 목록을 불러오는데 실패했습니다.',
        [
          {
            text: '확인',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadPendingWalkers();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadPendingWalkers();
  };

  const handleApprove = async (walker: PendingWalker) => {
    Alert.alert(
      '워커 승인',
      `${walker.user?.name || '이 워커'}를 승인하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '승인',
          onPress: async () => {
            try {
              setProcessingId(walker.id);
              await AdminWalkerService.updateWalkerStatus(walker.id, 'APPROVED');
              Alert.alert('성공', '워커가 승인되었습니다.');
              loadPendingWalkers();
            } catch (error: any) {
              Alert.alert('오류', error.message || '워커 승인에 실패했습니다.');
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  const handleReject = async (walker: PendingWalker) => {
    Alert.alert(
      '워커 거부',
      `${walker.user?.name || '이 워커'}를 거부하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '거부',
          style: 'destructive',
          onPress: async () => {
            try {
              setProcessingId(walker.id);
              await AdminWalkerService.updateWalkerStatus(walker.id, 'REJECTED');
              Alert.alert('완료', '워커가 거부되었습니다.');
              loadPendingWalkers();
            } catch (error: any) {
              Alert.alert('오류', error.message || '워커 거부에 실패했습니다.');
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '날짜 정보 없음';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '날짜 정보 없음';
    }
  };

  if (isLoading && pendingWalkers.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>워커 등록자 관리</Text>
          <View style={styles.headerPlaceholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>워커 목록을 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>워커 등록자 관리</Text>
        <View style={styles.headerPlaceholder} />
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }>
        {pendingWalkers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="checkmark-circle-outline" size={80} color="#E0E0E0" />
            </View>
            <Text style={styles.emptyTitle}>대기 중인 워커가 없습니다</Text>
            <Text style={styles.emptySubtitle}>새로운 워커 등록 요청이 없습니다</Text>
          </View>
        ) : (
          <>
            <View style={styles.summaryCard}>
              <View style={styles.summaryIconContainer}>
                <Ionicons name="people-outline" size={24} color="#4A90E2" />
              </View>
              <View style={styles.summaryContent}>
                <Text style={styles.summaryTitle}>검증 대기 중</Text>
                <Text style={styles.summaryCount}>{pendingWalkers.length}명</Text>
              </View>
            </View>

            {pendingWalkers.map((walker, index) => (
              <View key={walker.id} style={styles.walkerCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.walkerProfileSection}>
                    <View style={styles.profileIconContainer}>
                      <Ionicons name="person" size={24} color="#4A90E2" />
                    </View>
                    <View style={styles.walkerInfo}>
                      <Text style={styles.walkerName}>
                        {walker.user?.name || '이름 없음'}
                      </Text>
                      <View style={styles.walkerContactInfo}>
                        <Ionicons name="mail-outline" size={14} color="#999" />
                        <Text style={styles.walkerEmail}>{walker.user?.email || ''}</Text>
                      </View>
                      {walker.user?.phone && (
                        <View style={styles.walkerContactInfo}>
                          <Ionicons name="call-outline" size={14} color="#999" />
                          <Text style={styles.walkerPhone}>{walker.user.phone}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <View style={styles.statusBadge}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusText}>대기중</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.detailsContainer}>
                  <View style={styles.detailItem}>
                    <View style={styles.detailIconContainer}>
                      <Ionicons name="document-text-outline" size={18} color="#4A90E2" />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>자기소개</Text>
                      <Text style={styles.detailValue}>{walker.detailDescription}</Text>
                    </View>
                  </View>

                  <View style={styles.detailItem}>
                    <View style={styles.detailIconContainer}>
                      <Ionicons name="location-outline" size={18} color="#4A90E2" />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>서비스 지역</Text>
                      <Text style={styles.detailValue}>{walker.serviceArea}</Text>
                    </View>
                  </View>

                  <View style={styles.detailItem}>
                    <View style={styles.detailIconContainer}>
                      <Ionicons name="cash-outline" size={18} color="#4A90E2" />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>시간당 요금</Text>
                      <Text style={styles.detailValue}>
                        {walker.hourlyRate?.toLocaleString() || '15,000'}원
                      </Text>
                    </View>
                  </View>

                  {walker.createdAt && (
                    <View style={styles.detailItem}>
                      <View style={styles.detailIconContainer}>
                        <Ionicons name="time-outline" size={18} color="#4A90E2" />
                      </View>
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>등록 일시</Text>
                        <Text style={styles.detailValue}>{formatDate(walker.createdAt)}</Text>
                      </View>
                    </View>
                  )}
                </View>

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.button, styles.rejectButton]}
                    onPress={() => handleReject(walker)}
                    disabled={processingId === walker.id}
                    activeOpacity={0.7}>
                    {processingId === walker.id ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Ionicons name="close-circle" size={20} color="#fff" />
                        <Text style={styles.buttonText}>거부</Text>
                      </>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.approveButton]}
                    onPress={() => handleApprove(walker)}
                    disabled={processingId === walker.id}
                    activeOpacity={0.7}>
                    {processingId === walker.id ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle" size={20} color="#fff" />
                        <Text style={styles.buttonText}>승인</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  headerPlaceholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyIconContainer: {
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  summaryContent: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  summaryCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  walkerCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  walkerProfileSection: {
    flexDirection: 'row',
    flex: 1,
  },
  profileIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  walkerInfo: {
    flex: 1,
  },
  walkerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  walkerContactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  walkerEmail: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  walkerPhone: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFB74D',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF9800',
    marginRight: 6,
  },
  statusText: {
    color: '#E65100',
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginBottom: 20,
  },
  detailsContainer: {
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  detailIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WalkerVerificationScreen;

