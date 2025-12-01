import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Text, View, TouchableOpacity, Alert, StyleSheet, Image } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ModeConfig } from "../constants/ServiceModes";
import { homeScreenStyles } from "../styles/HomeScreenStyles";
import { CardBox } from "./CardBox";
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from "../index";
import { usePet } from "../contexts/PetContext";
import { WALKING_REQUESTS, CURRENT_WALKING, type WalkingRequest } from "../data";
import { IconImage, IconName } from "./IconImage";
import { WalkerPreviewSlider } from "./WalkerPreviewSlider";

type RequestTabKey = 'mine' | 'pending' | 'accepted' | 'in_progress' | 'completed';

const WALKING_REQUEST_TABS: { key: RequestTabKey; label: string }[] = [
  { key: 'mine', label: '내 요청' },
  { key: 'pending', label: '대기중' },
  { key: 'accepted', label: '수락됨' },
  { key: 'in_progress', label: '진행중' },
  { key: 'completed', label: '완료' },
];

type PetWalkerContentNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface PetWalkerContentProps {
  currentMode: ModeConfig;
  walkRequestButtonRef?: React.RefObject<View | null>;
  walkRequestListRef?: React.RefObject<View | null>;
  showGuideOverlay?: boolean;
  currentGuideStep?: string;
}

export const PetWalkerContent: React.FC<PetWalkerContentProps> = ({
  currentMode,
  walkRequestButtonRef,
  walkRequestListRef,
  showGuideOverlay,
  currentGuideStep,
}) => {
  const navigation = useNavigation<PetWalkerContentNavigationProp>();
  const { petInfo: myPetInfo } = usePet();
  
  // 디버깅용 로그
  React.useEffect(() => {
  }, [myPetInfo]);
  const [walkingRequests, setWalkingRequests] = useState<WalkingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentWalking, setCurrentWalking] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<RequestTabKey>('pending');

  useEffect(() => {
    loadWalkingRequests();
    loadCurrentWalking();
  }, []);

  // 화면이 포커스될 때마다 저장된 산책 시간 정보 다시 로드 (지도 화면과 동기화)
  useFocusEffect(
    useCallback(() => {
      loadCurrentWalking();
    }, [])
  );

  const loadWalkingRequests = async () => {
    try {
      // TODO: 실제 API 호출로 대체
      // 중앙 관리 샘플 데이터 사용
      const mockRequests: WalkingRequest[] = [
        ...WALKING_REQUESTS,
        // 내 요청 예시 (동적 생성) - id를 고유하게 변경
        {
          id: 'my-request-1',
          user: {
            name: '나',
            profileImage: 'https://via.placeholder.com/50',
          },
          pet: {
            name: myPetInfo?.name || '내 반려동물',
            species: (myPetInfo?.species as 'dog' | 'cat' | 'other') || 'dog',
            breed: myPetInfo?.breed || '믹스',
            image: myPetInfo?.photoUri,
          },
          timeSlot: '오후 3:00-5:00',
          address: '서울시 마포구 홍대입구역',
          status: 'pending',
          createdAt: '2024-01-15 11:00',
          isMyRequest: true,
        },
      ];
      
      setWalkingRequests(mockRequests);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  const loadCurrentWalking = async () => {
    try {
      // API에서 현재 진행 중인 산책 조회
      const WalkerBookingService = require('../services/WalkerBookingService').default;
      const currentBooking = await WalkerBookingService.getCurrentWalking();
      
      if (currentBooking && currentBooking.status === 'IN_PROGRESS') {
        // 저장된 산책 시작 시간과 duration 가져오기 (지도 화면과 동일한 값 사용)
        const { getCurrentWalkingStartTime } = require('../utils/WalkingUtils');
        const { startTime: savedStartTime, duration: savedDuration } = await getCurrentWalkingStartTime();
        
        // API 데이터와 저장된 데이터를 결합
        const walkingData = {
          id: currentBooking.id.toString(),
          walker: {
            id: currentBooking.walkerId?.toString() || '1',
            walkerId: currentBooking.walkerId,
            name: currentBooking.walkerName || '워커',
            profileImage: 'https://via.placeholder.com/100',
            rating: 4.8,
            reviewCount: 127,
          },
          user: {
            id: currentBooking.userId?.toString() || '1',
            name: currentBooking.username || '사용자',
            profileImage: 'https://via.placeholder.com/100',
          },
          startTime: savedStartTime || currentBooking.actualStartTime || new Date().toISOString(),
          duration: savedDuration || currentBooking.duration || 120,
          location: currentBooking.pickupAddress || '위치 정보 없음',
          status: 'in_progress',
          distance: 0,
        };
        
        setCurrentWalking(walkingData);
      } else {
        // 저장된 값이 있으면 사용, 없으면 기본값 사용
        const { getCurrentWalkingStartTime } = require('../utils/WalkingUtils');
        const { startTime: savedStartTime, duration: savedDuration } = await getCurrentWalkingStartTime();
        
        if (savedStartTime) {
          const walkingData = {
            ...CURRENT_WALKING,
            startTime: savedStartTime,
            duration: savedDuration || CURRENT_WALKING.duration,
          };
          setCurrentWalking(walkingData);
        } else {
          setCurrentWalking(null);
        }
      }
    } catch (error) {
      // 에러 시 저장된 값 확인
      try {
        const { getCurrentWalkingStartTime } = require('../utils/WalkingUtils');
        const { startTime: savedStartTime, duration: savedDuration } = await getCurrentWalkingStartTime();
        
        if (savedStartTime) {
          const walkingData = {
            ...CURRENT_WALKING,
            startTime: savedStartTime,
            duration: savedDuration || CURRENT_WALKING.duration,
          };
          setCurrentWalking(walkingData);
        } else {
          setCurrentWalking(null);
        }
      } catch (e) {
        setCurrentWalking(null);
      }
    }
  };

  const handleRequestWalker = () => {
    navigation.navigate('WalkingRequest');
  };

  const handleViewMap = () => {
    navigation.navigate('WalkingMap');
  };

  const handleViewAllRequests = () => {
    navigation.navigate('MatchingScreen');
  };

  const handleAcceptRequest = (requestId: string) => {
    Alert.alert(
      '요청 수락',
      '이 산책 요청을 수락하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '수락', 
          onPress: () => {
            setWalkingRequests(prev => 
              prev.map(req => 
                req.id === requestId 
                  ? { ...req, status: 'accepted' as const }
                  : req
              )
            );
          }
        }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FFA726';
      case 'accepted': return '#66BB6A';
      case 'in_progress': return '#42A5F5';
      case 'completed': return '#9E9E9E';
      default: return '#9E9E9E';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '대기중';
      case 'accepted': return '수락됨';
      case 'in_progress': return '진행중';
      case 'completed': return '완료';
      default: return '알 수 없음';
    }
  };

  const getSpeciesIcon = (species: string): IconName => {
    switch (species) {
      case 'dog':
        return 'dog';
      case 'cat':
        return 'cat';
      case 'other':
        return 'paw';
      default:
        return 'paw';
    }
  };

  const filteredRequests = useMemo(() => {
    if (activeTab === 'mine') {
      return walkingRequests.filter((request) => request.isMyRequest);
    }

    const statusKey = activeTab as Exclude<RequestTabKey, 'mine'>;
    return walkingRequests.filter((request) => request.status === statusKey);
  }, [walkingRequests, activeTab]);

  const visibleRequests = useMemo(() => {
    const sorted = [...filteredRequests].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return sorted.slice(0, 4);
  }, [filteredRequests]);

  const hasMoreRequests = filteredRequests.length > visibleRequests.length;

  return (
    <>
      {/* 현재 진행 중인 워킹 */}
      <View style={homeScreenStyles.section}>
        <View style={styles.sectionTitleRow}>
          <IconImage name="walker" size={20} style={styles.sectionTitleIcon} />
          <Text style={homeScreenStyles.sectionTitle}>현재 진행 중인 산책</Text>
        </View>
        {currentWalking ? (
          <View style={styles.currentWalkingCard}>
            <View style={styles.walkingParticipants}>
              <TouchableOpacity 
                style={styles.participantInfo}
                onPress={() => {
                  // 프로필 모달 표시를 위한 콜백 전달 필요
                  // 임시로 Alert로 처리
                  Alert.alert(
                    currentWalking.walker.name,
                    '프로필 정보 보기 또는 1:1 채팅하기를 선택하세요.',
                    [
                      { text: '취소', style: 'cancel' },
                      { text: '프로필 보기', onPress: () => {} },
                      { text: '1:1 채팅', onPress: () => {} },
                    ]
                  );
                }}
                activeOpacity={0.7}
              >
                <View style={styles.participantImage}>
                  {currentWalking.walker.name !== 'asdf' ? (
                    <Image
                      source={require('../../assets/images/user1.png')}
                      style={styles.participantProfileImage}
                    />
                  ) : (
                    <Ionicons name="person-circle" size={40} color="#C59172" />
                  )}
                </View>
                <View style={styles.participantDetails}>
                  <Text style={styles.participantName}>{currentWalking.walker.name}</Text>
                  <Text style={styles.participantRole}>워커</Text>
                  <View style={styles.participantRating}>
                    <Ionicons name="star" size={12} color="#FFD700" />
                    <Text style={styles.participantRatingText}>{currentWalking.walker.rating}</Text>
                    <Text style={styles.participantReviewCount}>({currentWalking.walker.reviewCount})</Text>
                  </View>
                </View>
              </TouchableOpacity>
              
              <View style={styles.participantDivider} />
              
              <TouchableOpacity 
                style={styles.participantInfo}
                onPress={() => {
                  // 프로필 모달 표시를 위한 콜백 전달 필요
                  // 임시로 Alert로 처리
                  Alert.alert(
                    currentWalking.user.name,
                    '프로필 정보 보기 또는 1:1 채팅하기를 선택하세요.',
                    [
                      { text: '취소', style: 'cancel' },
                      { text: '프로필 보기', onPress: () => {} },
                      { text: '1:1 채팅', onPress: () => {} },
                    ]
                  );
                }}
                activeOpacity={0.7}
              >
                <View style={styles.participantImage}>
                  {currentWalking.user.name !== 'asdf' ? (
                    <Image
                      source={require('../../assets/images/user1.png')}
                      style={styles.participantProfileImage}
                    />
                  ) : (
                    <Ionicons name="person-circle" size={40} color="#4A90E2" />
                  )}
                </View>
                <View style={styles.participantDetails}>
                  <Text style={styles.participantName}>{currentWalking.user.name}</Text>
                  <Text style={styles.participantRole}>사용자</Text>
                </View>
              </TouchableOpacity>
            </View>
            
            <View style={styles.walkingDetails}>
              <View style={styles.walkingDetailRow}>
                <Ionicons name="time" size={16} color="#4A90E2" />
                <Text style={styles.walkingDetailLabel}>이용 시간:</Text>
                <Text style={styles.walkingDetailValue}>
                  {new Date(currentWalking.startTime).toLocaleTimeString('ko-KR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })} - {new Date(new Date(currentWalking.startTime).getTime() + currentWalking.duration * 60000).toLocaleTimeString('ko-KR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </Text>
              </View>
              
              <View style={styles.walkingDetailRow}>
                <Ionicons name="location" size={16} color="#4A90E2" />
                <Text style={styles.walkingDetailLabel}>현재 위치:</Text>
                <Text style={styles.walkingDetailValue}>{currentWalking.location}</Text>
              </View>
              
              <View style={styles.walkingDetailRow}>
                <Ionicons name="walk" size={16} color="#4A90E2" />
                <Text style={styles.walkingDetailLabel}>산책 거리:</Text>
                <Text style={styles.walkingDetailValue}>{currentWalking.distance}km</Text>
              </View>
            </View>
            
            <View style={styles.walkingActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.mapButton]}
                onPress={handleViewMap}
              >
                <Ionicons name="map" size={18} color="#f2f2ed" />
                <Text style={[styles.actionButtonText, styles.mapButtonText]}>지도 보기</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.noWalkingCard}>
            <Ionicons name="walk-outline" size={48} color="#ccc" />
            <Text style={styles.noWalkingText}>현재 진행 중인 산책이 없습니다</Text>
            <Text style={styles.noWalkingSubtext}>산책 요청을 등록하여 워커와 매칭해보세요</Text>
          </View>
        )}
      </View>

      {/* 워커 미리보기 슬라이더 */}
      <View style={homeScreenStyles.section}>
        <WalkerPreviewSlider />
      </View>

      {/* 산책 요청 버튼 */}
      <View 
        ref={walkRequestButtonRef}
        style={[
          homeScreenStyles.section,
          showGuideOverlay && currentGuideStep === "walk_request_button" && {
            borderWidth: 3,
            borderColor: '#4A90E2',
            borderRadius: 16,
          }
        ]}
      >
        <View style={styles.sectionTitleRow}>
          <IconImage name="walker" size={20} style={styles.sectionTitleIcon} />
          <Text style={homeScreenStyles.sectionTitle}>산책 요청</Text>
        </View>
        <CardBox
          iconName="walker"
          description="새로운 산책 요청을 등록하세요"
          actionText="요청하기"
          borderColor={currentMode.color}
          backgroundColor={currentMode.color}
          onPress={handleRequestWalker}
        />
      </View>

      {/* 산책 요청 리스트 */}
      <View 
        ref={walkRequestListRef}
        style={[
          homeScreenStyles.section,
          showGuideOverlay && currentGuideStep === "walk_request_list" && {
            borderWidth: 3,
            borderColor: '#4A90E2',
            borderRadius: 16,
          }
        ]}
      >
        <Text style={[homeScreenStyles.sectionTitle, { marginBottom: 12 }]}>📋 산책 요청 목록</Text>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>로딩 중...</Text>
          </View>
        ) : (
          <>
            <View style={styles.tabBar}>
              {WALKING_REQUEST_TABS.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    style={[
                      styles.tabButton,
                      isActive && {
                        backgroundColor: currentMode.color,
                        borderColor: currentMode.color,
                      },
                    ]}
                    activeOpacity={0.8}
                    onPress={() => setActiveTab(tab.key)}
                  >
                    <Text
                      style={[
                        styles.tabButtonLabel,
                        isActive && styles.tabButtonLabelActive,
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {visibleRequests.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {activeTab === 'mine'
                    ? '내가 등록한 요청이 없습니다'
                    : '해당 상태의 요청이 없습니다'}
                </Text>
              </View>
            ) : (
              <View style={styles.requestsList}>
                {visibleRequests.map((request) => (
              <View key={request.id} style={[
                styles.requestCard,
                request.isMyRequest && styles.myRequestCard
              ]}>
                {/* 내 요청 표시 배지 */}
                {request.isMyRequest && (
                  <View style={styles.myRequestBadge}>
                    <Ionicons name="person" size={12} color="white" />
                    <Text style={styles.myRequestText}>내 요청</Text>
                  </View>
                )}

                <View style={styles.requestHeader}>
                  <View style={styles.userInfo}>
                    <View style={styles.userAvatar}>
                      <Text style={styles.userInitial}>
                        {request.user.name.charAt(0)}
                      </Text>
                    </View>
                    <View style={styles.userDetails}>
                      <Text style={styles.userName}>{request.user.name}</Text>
                      <Text style={styles.requestTime}>{request.createdAt}</Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(request.status)}</Text>
                  </View>
                </View>

                <View style={styles.petInfo}>
                  <View style={styles.petImage}>
                    <View style={styles.petIconContainer}>
                    <IconImage
                      name={getSpeciesIcon(request.pet.species)}
                      size={24}
                      style={styles.petIcon}
                    />
                    </View>
                  </View>
                  <View style={styles.petDetails}>
                    <Text style={styles.petName}>{request.pet.name}</Text>
                    <Text style={styles.petBreed}>{request.pet.breed}</Text>
                  </View>
                </View>

                <View style={styles.requestDetails}>
                  <View style={styles.detailItem}>
                    <Ionicons name="time-outline" size={16} color="#666" />
                    <Text style={styles.detailText}>{request.timeSlot}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="location-outline" size={16} color="#666" />
                    <Text style={styles.detailText}>{request.address}</Text>
                  </View>
                </View>

                {request.status === 'pending' && (
                  <TouchableOpacity
                    style={[styles.acceptButton, { backgroundColor: currentMode.color }]}
                    onPress={() => handleAcceptRequest(request.id)}
                  >
                    <Text style={styles.acceptButtonText}>요청 수락</Text>
                  </TouchableOpacity>
                )}
              </View>
                ))}
              </View>
            )}

            {hasMoreRequests && (
              <TouchableOpacity
                style={[
                  styles.moreButton,
                  { borderColor: currentMode.color },
                ]}
                onPress={handleViewAllRequests}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.moreButtonText,
                    { color: currentMode.color },
                  ]}
                >
                  전체 {filteredRequests.length}건 보기
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom : 12
  },
  sectionTitleIcon: {
    marginRight: 8,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  requestsList: {
    marginBottom: 20,
  },
  requestCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 0,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  myRequestCard: {
    borderWidth: 2,
    borderColor: '#C59172',
    backgroundColor: 'rgba(197, 145, 114, 0.05)',
  },
  myRequestBadge: {
    position: 'absolute',
    top: -8,
    right: 10,
    backgroundColor: '#C59172',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  myRequestText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#C59172',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  userInitial: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  requestTime: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
  },
  petInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  petImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    overflow: 'hidden',
  },
  petIconContainer: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  petProfileImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  petIcon: {
    width: 24,
    height: 24,
  },
  petDetails: {
    flex: 1,
  },
  petName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  petBreed: {
    fontSize: 12,
    color: '#666',
  },
  requestDetails: {
    marginBottom: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  acceptButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  tabBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tabButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    backgroundColor: '#FFFFFF',
  },
  tabButtonLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  tabButtonLabelActive: {
    color: '#FFFFFF',
  },
  moreButton: {
    alignSelf: 'center',
    marginTop: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  moreButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // 현재 워킹 관련 스타일
  currentWalkingCard: {
    backgroundColor: 'white',
    borderRadius: 0,
    padding: 16,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  walkingParticipants: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  participantInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantImage: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderRadius: 20,
    overflow: 'hidden',
  },
  participantProfileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  participantDetails: {
    flex: 1,
  },
  participantName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  participantRole: {
    fontSize: 11,
    color: '#666',
    marginBottom: 3,
  },
  participantRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantRatingText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
    marginLeft: 2,
  },
  participantReviewCount: {
    fontSize: 9,
    color: '#666',
    marginLeft: 2,
  },
  participantDivider: {
    width: 1,
    height: 50,
    backgroundColor: '#e9ecef',
    marginHorizontal: 12,
  },
  walkingDetails: {
    marginBottom: 16,
  },
  walkingDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  walkingDetailLabel: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
    marginRight: 6,
    minWidth: 70,
  },
  walkingDetailValue: {
    fontSize: 12,
    color: '#333',
    flex: 1,
  },
  walkingActions: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4A90E2',
    backgroundColor: 'white',
  },
  mapButton: {
    backgroundColor: '#28a745',
    borderColor: '#28a745',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A90E2',
    marginLeft: 4,
  },
  mapButtonText: {
    color: 'white',
  },
  // 산책 없음 관련 스타일
  noWalkingCard: {
    backgroundColor: 'white',
    borderRadius: 0,
    padding: 32,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e9ecef',
    minHeight: 150,
  },
  noWalkingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  noWalkingSubtext: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
  },
});

export default PetWalkerContent;
