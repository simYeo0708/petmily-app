import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { usePet } from '../contexts/PetContext';
import { WalkingRequestData, PreviousWalker, WalkingRequestScreenState } from '../types/WalkingRequestScreen';
import { 
  validateWalkingRequest, 
  saveAddress, 
  getSavedAddresses, 
  savePreviousWalker, 
  getPreviousWalkers,
  saveWalkingRequest,
  generateMockPreviousWalkers 
} from '../utils/WalkingUtils';
import { TIME_SLOTS, DURATION_OPTIONS } from '../constants/WalkingConstants';
import WalkerBookingService from '../services/WalkerBookingService';

export const useWalkingRequest = () => {
  const { petInfo } = usePet();
  
  const [requestData, setRequestData] = useState<WalkingRequestData>({
    timeSlot: '',
    address: '',
    specialInstructions: '',
    duration: '60',
    petId: '',
  });
  
  const [savedAddresses, setSavedAddresses] = useState<string[]>([]);
  const [previousWalkers, setPreviousWalkers] = useState<PreviousWalker[]>([]);
  const [selectedPreviousWalker, setSelectedPreviousWalker] = useState<string | null>(null);
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showPreviousWalkerModal, setShowPreviousWalkerModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadSavedData();
  }, []);

  // petInfo가 변경되면 petId 설정
  useEffect(() => {
    if (petInfo?.id) {
      setRequestData(prev => ({ ...prev, petId: petInfo.id!.toString() }));
    }
  }, [petInfo]);

  const loadSavedData = useCallback(async () => {
    try {
      const [addresses, walkers] = await Promise.all([
        getSavedAddresses(),
        getPreviousWalkers(),
      ]);
      
      setSavedAddresses(addresses);
      
      // 이전 워커가 없으면 목업 데이터 사용
      if (walkers.length === 0) {
        const mockWalkers = generateMockPreviousWalkers();
        setPreviousWalkers(mockWalkers);
      } else {
        setPreviousWalkers(walkers);
      }
    } catch (error) {
      console.error('저장된 데이터 로드 중 오류:', error);
    }
  }, []);

  const handleTimeSlotSelect = useCallback((timeSlot: string) => {
    setRequestData(prev => ({ ...prev, timeSlot }));
    setShowTimeSlotModal(false);
  }, []);

  const handleDurationSelect = useCallback((duration: string) => {
    setRequestData(prev => ({ ...prev, duration }));
    setShowDurationModal(false);
  }, []);

  const handleAddressSelect = useCallback((address: string) => {
    setRequestData(prev => ({ ...prev, address }));
    setShowAddressModal(false);
  }, []);

  const handleAddressInput = useCallback((address: string) => {
    setRequestData(prev => ({ ...prev, address }));
  }, []);

  const handlePreviousWalkerSelect = useCallback((walkerId: string) => {
    setSelectedPreviousWalker(walkerId);
    setShowPreviousWalkerModal(false);
  }, []);

  const handleSpecialInstructionsChange = useCallback((instructions: string) => {
    setRequestData(prev => ({ ...prev, specialInstructions: instructions }));
  }, []);

  const handleSubmit = useCallback(async () => {
    const validation = validateWalkingRequest(requestData);
    
    if (!validation.isValid) {
      Alert.alert('입력 오류', validation.errors.join('\n'));
      return;
    }

    setIsSubmitting(true);
    
    try {
      // 백엔드 API 호출하여 산책 예약 생성
      const bookingRequest = {
        petId: (petInfo?.id as number) || 1,
        date: new Date().toISOString(),
        duration: parseInt(requestData.duration),
        notes: requestData.specialInstructions,
        pickupAddress: requestData.address,
        emergencyContact: '',
      };
      
      const booking = await WalkerBookingService.createBooking(bookingRequest);
      console.log('산책 예약 생성 성공:', booking);
      
      // 주소 로컬 저장
      await saveAddress(requestData.address);
      
      // 산책 요청 로컬 저장
      await saveWalkingRequest(requestData);
      
      // 이전 워커가 선택된 경우 해당 워커 정보 저장
      if (selectedPreviousWalker) {
        const walker = previousWalkers.find(w => w.id === selectedPreviousWalker);
        if (walker) {
          await savePreviousWalker(walker);
        }
      }
      
      Alert.alert(
        '요청 완료',
        '산책 요청이 성공적으로 제출되었습니다.',
        [
          {
            text: '확인',
            onPress: () => {
              // 네비게이션 로직은 컴포넌트에서 처리
            },
          },
        ]
      );
    } catch (error) {
      console.error('산책 요청 제출 중 오류:', error);
      Alert.alert('오류', '산책 요청을 제출할 수 없습니다.');
    } finally {
      setIsSubmitting(false);
    }
  }, [requestData, selectedPreviousWalker, previousWalkers, petInfo]);

  const getSelectedTimeSlotLabel = useCallback(() => {
    const timeSlot = TIME_SLOTS.find(ts => ts.value === requestData.timeSlot);
    return timeSlot ? timeSlot.label : '시간대 선택';
  }, [requestData.timeSlot]);

  const getSelectedDurationLabel = useCallback(() => {
    const duration = DURATION_OPTIONS.find(d => d.value === requestData.duration);
    return duration ? duration.label : '산책 시간 선택';
  }, [requestData.duration]);

  const getSelectedPreviousWalker = useCallback(() => {
    if (!selectedPreviousWalker) return null;
    return previousWalkers.find(w => w.id === selectedPreviousWalker) || null;
  }, [selectedPreviousWalker, previousWalkers]);

  return {
    // State
    requestData,
    savedAddresses,
    previousWalkers,
    selectedPreviousWalker,
    showTimeSlotModal,
    showDurationModal,
    showAddressModal,
    showPreviousWalkerModal,
    isSubmitting,
    
    // Data
    timeSlots: TIME_SLOTS,
    durationOptions: DURATION_OPTIONS,
    petInfo,
    
    // Handlers
    handleTimeSlotSelect,
    handleDurationSelect,
    handleAddressSelect,
    handleAddressInput,
    handlePreviousWalkerSelect,
    handleSpecialInstructionsChange,
    handleSubmit,
    
    // Modal handlers
    setShowTimeSlotModal,
    setShowDurationModal,
    setShowAddressModal,
    setShowPreviousWalkerModal,
    
    // Getters
    getSelectedTimeSlotLabel,
    getSelectedDurationLabel,
    getSelectedPreviousWalker,
  };
};
