import React, { useState, useEffect } from "react";
import { Text, View, TouchableOpacity, ScrollView, Alert, StyleSheet, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ModeConfig } from "../constants/ServiceModes";
import { homeScreenStyles } from "../styles/HomeScreenStyles";
import { CardBox } from "./CardBox";
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from "../index";
import { usePet } from "../contexts/PetContext";
import { WALKING_REQUESTS, CURRENT_WALKING, type WalkingRequest } from "../data";

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
    console.log('PetWalkerContent - myPetInfo 업데이트:', myPetInfo);
  }, [myPetInfo]);
  const [walkingRequests, setWalkingRequests] = useState<WalkingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentWalking, setCurrentWalking] = useState<any>(null);

  useEffect(() => {
    loadWalkingRequests();
    loadCurrentWalking();
  }, []);

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
      console.error('산책 요청 로드 실패:', error);
      setIsLoading(false);
    }
  };

  const loadCurrentWalking = async () => {
    try {
      // TODO: 실제 API 호출로 대체
      // 중앙 관리 샘플 데이터 사용
      setCurrentWalking(CURRENT_WALKING);
    } catch (error) {
      console.error('현재 워킹 정보 로드 실패:', error);
    }
  };

  const handleRequestWalker = () => {
    navigation.navigate('WalkingRequest');
  };

  const handleViewMap = () => {
    navigation.navigate('WalkingMap');
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

  const getSpeciesEmoji = (species: string) => {
    switch (species) {
      case 'dog': return '🐕';
      case 'cat': return '🐱';
      case 'other': return '🐾';
      default: return '🐾';
    }
  };

  return (
    <>
      {/* 현재 진행 중인 워킹 */}
      {currentWalking && (
        <View style={homeScreenStyles.section}>
          <Text style={homeScreenStyles.sectionTitle}>🚶‍♂️ 현재 진행 중인 워킹</Text>
          <View style={styles.currentWalkingCard}>
            <View style={styles.walkingParticipants}>
              <View style={styles.participantInfo}>
                <View style={styles.participantImage}>
                  <Ionicons name="person-circle" size={40} color="#C59172" />
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
              </View>
              
              <View style={styles.participantDivider} />
              
              <View style={styles.participantInfo}>
                <View style={styles.participantImage}>
                  <Ionicons name="person-circle" size={40} color="#4A90E2" />
                </View>
                <View style={styles.participantDetails}>
                  <Text style={styles.participantName}>{currentWalking.user.name}</Text>
                  <Text style={styles.participantRole}>사용자</Text>
                </View>
              </View>
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
        </View>
      )}

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
        <Text style={homeScreenStyles.sectionTitle}>🚶‍♂️ 산책 요청</Text>
        <CardBox
          icon="📝"
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
        <Text style={homeScreenStyles.sectionTitle}>📋 산책 요청 목록</Text>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>로딩 중...</Text>
          </View>
        ) : walkingRequests.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>등록된 산책 요청이 없습니다</Text>
          </View>
        ) : (
          <ScrollView style={styles.requestsList} showsVerticalScrollIndicator={false}>
            {walkingRequests.map((request) => (
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
                      <Text style={styles.petEmoji}>{getSpeciesEmoji(request.pet.species)}</Text>
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
          </ScrollView>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
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
    maxHeight: 400,
    marginBottom: 30
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
  petEmoji: {
    fontSize: 20,
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
});

export default PetWalkerContent;
