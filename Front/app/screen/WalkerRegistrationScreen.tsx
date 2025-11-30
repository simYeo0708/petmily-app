import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../index';
import WalkerService from '../services/WalkerService';
import * as Location from 'expo-location';
import MapService, { AddressInfo } from '../services/MapService';

type WalkerRegistrationScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'WalkerRegistration'>;

const WalkerRegistrationScreen = () => {
  const navigation = useNavigation<WalkerRegistrationScreenNavigationProp>();
  const [detailDescription, setDetailDescription] = useState('');
  const [serviceArea, setServiceArea] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const handleGetCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true);
      
      // 위치 권한 확인
      let { status } = await Location.getForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        const permissionResult = await Location.requestForegroundPermissionsAsync();
        status = permissionResult.status;
        
        if (status !== 'granted') {
          Alert.alert(
            '위치 권한 필요',
            '서비스 지역을 자동으로 가져오려면 위치 권한이 필요합니다.\n설정에서 위치 권한을 허용해주세요.',
            [{ text: '확인' }]
          );
          return;
        }
      }

      // 위치 서비스 활성화 확인
      const locationEnabled = await Location.hasServicesEnabledAsync();
      if (!locationEnabled) {
        Alert.alert(
          '위치 서비스 비활성화',
          '위치 서비스가 비활성화되어 있습니다.\n설정에서 위치 서비스를 켜주세요.',
          [{ text: '확인' }]
        );
        return;
      }

      // 현재 위치 가져오기 (타임아웃 설정)
      // 정확도를 높여서 실제 GPS 위치를 가져오도록 설정
      const location = await Promise.race([
        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High, // Balanced -> High로 변경하여 더 정확한 위치 획득
          timeInterval: 5000,
          distanceInterval: 10, // 10미터마다 업데이트
        }),
        new Promise<Location.LocationObject>((_, reject) => 
          setTimeout(() => reject(new Error('위치 요청 시간 초과')), 15000) // 타임아웃을 15초로 연장
        ),
      ]);

      if (!location || !location.coords) {
        throw new Error('위치 정보를 가져올 수 없습니다.');
      }

      // 위치 정보 검증 (기본 위치인 서울 시청 좌표와 비슷하면 경고)
      const seoulCityHallLat = 37.5665;
      const seoulCityHallLon = 126.9780;
      const latDiff = Math.abs(location.coords.latitude - seoulCityHallLat);
      const lonDiff = Math.abs(location.coords.longitude - seoulCityHallLon);
      
      // 서울 시청 좌표와 100미터 이내 차이나면 기본 위치일 가능성 높음
      if (latDiff < 0.001 && lonDiff < 0.001) {
        Alert.alert(
          '위치 확인 필요',
          '현재 위치가 기본 위치(서울 시청)로 감지되었습니다.\n실제 위치를 사용하려면:\n\n1. 시뮬레이터: Features > Location > Custom Location에서 실제 좌표 설정\n2. 실제 기기: GPS가 켜져 있는지 확인\n\n또는 직접 주소를 입력해주세요.',
          [
            { text: '직접 입력', style: 'cancel' },
            { text: '계속 사용', onPress: () => {} }
          ]
        );
      }

      // 역지오코딩으로 주소 가져오기
      try {
        const mapService = MapService.getInstance();
        
        // 디버깅: 실제 좌표 확인 (개발 환경에서만)
        if (__DEV__) {
          console.log('📍 현재 위치 좌표:', {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy,
            altitude: location.coords.altitude,
          });
        }
        
        const addressInfo = await mapService.reverseGeocode(
          location.coords.latitude,
          location.coords.longitude
        );

        if (addressInfo) {
          // AddressInfo에서 직접 주소 추출
          let address = '';
          
          // 도로명 주소 우선, 없으면 지번 주소 사용
          if (addressInfo.roadAddress) {
            address = addressInfo.roadAddress;
          } else if (addressInfo.jibunAddress) {
            address = addressInfo.jibunAddress;
          } else if (addressInfo.region2depth && addressInfo.region3depth) {
            // 시/도와 구/군만 사용
            address = `${addressInfo.region1depth || ''} ${addressInfo.region2depth} ${addressInfo.region3depth}`.trim();
          } else if (addressInfo.region1depth && addressInfo.region2depth) {
            address = `${addressInfo.region1depth} ${addressInfo.region2depth}`;
          }
          
          if (address) {
            // 시/도와 구/군만 추출 (예: "서울특별시 강남구")
            const areaMatch = address.match(/([가-힣]+(?:시|도|특별시|광역시))\s+([가-힣]+(?:구|군|시|동|자치구|자치군))/);
            if (areaMatch) {
              setServiceArea(`${areaMatch[1]} ${areaMatch[2]}`);
            } else {
              // 주소를 공백으로 분리하여 앞의 2개만 사용
              const addressParts = address.split(' ').filter(part => part.length > 0);
              if (addressParts.length >= 2) {
                setServiceArea(`${addressParts[0]} ${addressParts[1]}`);
              } else if (addressParts.length === 1) {
                setServiceArea(addressParts[0]);
              } else {
                setServiceArea(address);
              }
            }
          } else {
            Alert.alert('주소 변환 실패', '위치는 가져왔지만 주소로 변환할 수 없습니다. 직접 입력해주세요.');
          }
        } else {
          Alert.alert('주소 변환 실패', '위치는 가져왔지만 주소로 변환할 수 없습니다. 직접 입력해주세요.');
        }
      } catch (geocodeError: any) {
        // 역지오코딩 에러는 별도로 처리
        Alert.alert(
          '주소 변환 실패',
          geocodeError.message || '주소로 변환하는 중 오류가 발생했습니다. 직접 입력해주세요.'
        );
      }
    } catch (error: any) {
      let errorMessage = '위치를 가져오는 중 오류가 발생했습니다.';
      
      if (error.message) {
        if (error.message.includes('시간 초과')) {
          errorMessage = '위치 요청 시간이 초과되었습니다. GPS가 켜져 있는지 확인해주세요.';
        } else if (error.message.includes('권한')) {
          errorMessage = '위치 권한이 필요합니다. 설정에서 위치 권한을 허용해주세요.';
        } else {
          errorMessage = error.message;
        }
      }
      
      Alert.alert('오류', errorMessage);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleSubmit = async () => {
    if (!detailDescription.trim()) {
      Alert.alert('입력 필요', '자기소개를 입력해주세요.');
      return;
    }

    if (!serviceArea.trim()) {
      Alert.alert('입력 필요', '서비스 지역을 입력해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      await WalkerService.registerWalker({
        detailDescription: detailDescription.trim(),
        serviceArea: serviceArea.trim(),
      });

      Alert.alert(
        '등록 완료',
        '워커로 등록되었습니다.\n관리자 승인 후 활동을 시작할 수 있습니다.',
        [
          {
            text: '확인',
            onPress: () => {
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('등록 실패', error.message || '워커 등록 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
          keyboardVerticalOffset={0}>
          {/* 헤더 */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>워커 등록</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.infoCard}>
              <Ionicons name="information-circle" size={24} color="#4A90E2" />
              <Text style={styles.infoText}>
                워커로 등록하시면 반려동물 산책 서비스를 제공하고 수익을 얻을 수 있습니다.
              </Text>
            </View>

            {/* 자기소개 */}
            <View style={styles.inputSection}>
              <Text style={styles.label}>
                자기소개 <Text style={styles.required}>*</Text>
              </Text>
              <Text style={styles.hint}>
                경력, 전문 분야, 서비스 스타일 등을 자유롭게 작성해주세요.
              </Text>
              <TextInput
                style={styles.textArea}
                placeholder="예: 3년 경력의 반려동물 산책 전문가입니다. 대형견부터 소형견까지 다양한 견종을 돌봐왔으며, 안전하고 즐거운 산책을 제공합니다."
                placeholderTextColor="#999"
                value={detailDescription}
                onChangeText={setDetailDescription}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                maxLength={500}
              />
              <Text style={styles.charCount}>
                {detailDescription.length} / 500
              </Text>
            </View>

            {/* 서비스 지역 */}
            <View style={styles.inputSection}>
              <Text style={styles.label}>
                서비스 지역 <Text style={styles.required}>*</Text>
              </Text>
              <Text style={styles.hint}>
                산책 서비스를 제공할 지역을 입력해주세요.
              </Text>
              <View style={styles.locationInputContainer}>
                <TextInput
                  style={styles.locationInput}
                  placeholder="예: 서울특별시 강남구"
                  placeholderTextColor="#999"
                  value={serviceArea}
                  onChangeText={setServiceArea}
                />
                <TouchableOpacity
                  style={[styles.locationButton, isLoadingLocation && styles.locationButtonDisabled]}
                  onPress={handleGetCurrentLocation}
                  disabled={isLoadingLocation}
                >
                  {isLoadingLocation ? (
                    <ActivityIndicator size="small" color="#C59172" />
                  ) : (
                    <>
                      <Ionicons name="location" size={18} color="#C59172" />
                      <Text style={styles.locationButtonText}>현재 위치</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* 안내 사항 */}
            <View style={styles.noticeCard}>
              <Text style={styles.noticeTitle}>📋 등록 안내</Text>
              <View style={styles.noticeItem}>
                <Text style={styles.noticeBullet}>•</Text>
                <Text style={styles.noticeText}>
                  등록 후 관리자 승인을 받아야 활동을 시작할 수 있습니다.
                </Text>
              </View>
              <View style={styles.noticeItem}>
                <Text style={styles.noticeBullet}>•</Text>
                <Text style={styles.noticeText}>
                  승인까지 보통 1-2일 정도 소요됩니다.
                </Text>
              </View>
              <View style={styles.noticeItem}>
                <Text style={styles.noticeBullet}>•</Text>
                <Text style={styles.noticeText}>
                  등록 정보는 추후 수정할 수 있습니다.
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* 하단 버튼 */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.submitButtonText}>등록하기</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
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
    paddingVertical: 15,
    paddingTop: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 5,
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 20,
    marginLeft: 12,
  },
  inputSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#FF6B6B',
  },
  hint: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
    lineHeight: 18,
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#333',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 8,
  },
  locationInputContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  locationInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#333',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C59172',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 6,
  },
  locationButtonDisabled: {
    opacity: 0.5,
  },
  locationButtonText: {
    fontSize: 14,
    color: '#C59172',
    fontWeight: '500',
  },
  noticeCard: {
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  noticeTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  noticeItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  noticeBullet: {
    fontSize: 16,
    color: '#C59172',
    marginRight: 8,
    marginTop: 2,
  },
  noticeText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C59172',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
    shadowColor: '#C59172',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#CCC',
    shadowOpacity: 0,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default WalkerRegistrationScreen;

