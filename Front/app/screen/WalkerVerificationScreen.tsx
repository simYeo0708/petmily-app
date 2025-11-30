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
import { homeScreenStyles } from '../styles/HomeScreenStyles';
import Header from '../components/Header';

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
      <SafeAreaView style={styles.container}>
        <Header title="워커 검증" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>워커 목록을 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="워커 검증" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }>
        {pendingWalkers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-circle-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>대기 중인 워커가 없습니다</Text>
          </View>
        ) : (
          <>
            <View style={styles.infoContainer}>
              <Ionicons name="information-circle" size={20} color="#4A90E2" />
              <Text style={styles.infoText}>
                총 {pendingWalkers.length}명의 워커가 검증을 기다리고 있습니다.
              </Text>
            </View>
            {pendingWalkers.map((walker) => (
              <View key={walker.id} style={styles.walkerCard}>
                <View style={styles.walkerHeader}>
                  <View style={styles.walkerInfo}>
                    <Text style={styles.walkerName}>
                      {walker.user?.name || '이름 없음'}
                    </Text>
                    <Text style={styles.walkerEmail}>{walker.user?.email || ''}</Text>
                    {walker.user?.phone && (
                      <Text style={styles.walkerPhone}>{walker.user.phone}</Text>
                    )}
                  </View>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>대기중</Text>
                  </View>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>자기소개</Text>
                  <Text style={styles.sectionContent}>{walker.detailDescription}</Text>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>서비스 지역</Text>
                  <Text style={styles.sectionContent}>{walker.serviceArea}</Text>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>시간당 요금</Text>
                  <Text style={styles.sectionContent}>
                    {walker.hourlyRate?.toLocaleString() || '15,000'}원
                  </Text>
                </View>

                {walker.createdAt && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>등록 일시</Text>
                    <Text style={styles.sectionContent}>{formatDate(walker.createdAt)}</Text>
                  </View>
                )}

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.button, styles.rejectButton]}
                    onPress={() => handleReject(walker)}
                    disabled={processingId === walker.id}>
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
                    disabled={processingId === walker.id}>
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
    backgroundColor: '#FFF5F0',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
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
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#1976D2',
  },
  walkerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  walkerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  walkerInfo: {
    flex: 1,
  },
  walkerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  walkerEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  walkerPhone: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    backgroundColor: '#FFA726',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
  },
  sectionContent: {
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
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

