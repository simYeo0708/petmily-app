import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    loadHelperStatus();
  }, []);

  const loadHelperStatus = async () => {
    try {
      const statusData = await AsyncStorage.getItem(HELPER_STATUS_KEY);

      if (statusData) {
        setHelperStatus(JSON.parse(statusData));
      }
    } catch (error) {
      console.error("헬퍼 상태 로드 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveHelperStatus = async (status: HelperStatus) => {
    try {
      await AsyncStorage.setItem(HELPER_STATUS_KEY, JSON.stringify(status));
      setHelperStatus(status);
    } catch (error) {
      console.error("헬퍼 상태 저장 실패:", error);
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
  };
};

export default useHelperStatus;
