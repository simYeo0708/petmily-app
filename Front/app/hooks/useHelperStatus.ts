import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState, useCallback } from "react";
import WalkerDashboardService from "../services/WalkerDashboardService";

const HELPER_STATUS_KEY = "petmily_helper_status";

export interface HelperStatus {
  isHelper: boolean;
  joinedDate?: string;
  totalEarnings: number;
  thisMonthEarnings: number;
  totalWalks: number;
  completedWalks: number;
  rating: number;
}

export const useHelperStatus = () => {
  const [helperStatus, setHelperStatus] = useState<HelperStatus>({
    isHelper: false,
    totalEarnings: 0,
    thisMonthEarnings: 0,
    totalWalks: 0,
    completedWalks: 0,
    rating: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadHelperStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // 백엔드 API에서 데이터 가져오기
      const dashboardData = await WalkerDashboardService.getDashboard();
      
      if (dashboardData) {
        // 백엔드 데이터로 상태 업데이트
        setHelperStatus({
          isHelper: true,
          totalEarnings: dashboardData.earningsInfo.totalEarnings || 0,
          thisMonthEarnings: dashboardData.earningsInfo.thisMonthEarnings || 0,
          totalWalks: dashboardData.statisticsInfo.totalWalks || 0,
          completedWalks: dashboardData.statisticsInfo.completedWalks || 0,
          rating: dashboardData.statisticsInfo.averageRating || 0,
        });
        
        // 로컬 스토리지에도 저장 (오프라인 대비)
        await AsyncStorage.setItem(HELPER_STATUS_KEY, JSON.stringify({
          isHelper: true,
          totalEarnings: dashboardData.earningsInfo.totalEarnings || 0,
          thisMonthEarnings: dashboardData.earningsInfo.thisMonthEarnings || 0,
          totalWalks: dashboardData.statisticsInfo.totalWalks || 0,
          completedWalks: dashboardData.statisticsInfo.completedWalks || 0,
          rating: dashboardData.statisticsInfo.averageRating || 0,
        }));
      } else {
        // API 실패 시 로컬 스토리지에서 로드
        const statusData = await AsyncStorage.getItem(HELPER_STATUS_KEY);
        if (statusData) {
          setHelperStatus(JSON.parse(statusData));
        }
      }
    } catch (error) {
      console.error('워커 상태 로드 실패:', error);
      // 에러 시 로컬 스토리지에서 로드
      try {
        const statusData = await AsyncStorage.getItem(HELPER_STATUS_KEY);
        if (statusData) {
          setHelperStatus(JSON.parse(statusData));
        }
      } catch (storageError) {
        console.error('로컬 스토리지 로드 실패:', storageError);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHelperStatus();
  }, [loadHelperStatus]);

  const saveHelperStatus = async (status: HelperStatus) => {
    try {
      await AsyncStorage.setItem(HELPER_STATUS_KEY, JSON.stringify(status));
      setHelperStatus(status);
    } catch (error) {
    }
  };

  const becomeHelper = async () => {
    const newStatus: HelperStatus = {
      isHelper: true,
      joinedDate: new Date().toISOString(),
      totalEarnings: 0,
      thisMonthEarnings: 0,
      totalWalks: 0,
      completedWalks: 0,
      rating: 5.0,
    };
    await saveHelperStatus(newStatus);
  };

  const updateEarnings = async (amount: number) => {
    const updatedStatus = {
      ...helperStatus,
      totalEarnings: helperStatus.totalEarnings + amount,
      thisMonthEarnings: helperStatus.thisMonthEarnings + amount,
    };
    await saveHelperStatus(updatedStatus);
  };

  const completeWalk = async (payment: number, rating?: number) => {
    const updatedStatus = {
      ...helperStatus,
      totalWalks: helperStatus.totalWalks + 1,
      completedWalks: helperStatus.completedWalks + 1,
      totalEarnings: helperStatus.totalEarnings + payment,
      thisMonthEarnings: helperStatus.thisMonthEarnings + payment,
      rating: rating ? (helperStatus.rating + rating) / 2 : helperStatus.rating,
    };
    await saveHelperStatus(updatedStatus);
  };

  return {
    helperStatus,
    isLoading,
    becomeHelper,
    updateEarnings,
    completeWalk,
    loadHelperStatus, // 새로고침을 위해 export
  };
};

export default useHelperStatus;
