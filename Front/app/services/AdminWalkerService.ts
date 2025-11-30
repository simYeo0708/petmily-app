import { API_BASE_URL } from '../config/api';
import AuthService from './AuthService';

export interface PendingWalker {
  id: number;
  userId: number;
  detailDescription: string;
  serviceArea: string;
  status: string;
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  user?: {
    id: number;
    username: string;
    name: string;
    email: string;
    phone?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export type WalkerStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'INACTIVE' | 'UNAVAILABLE' | 'SUSPENDED';

const AdminWalkerService = {
  /**
   * PENDING 상태의 워커 목록 조회 (관리자 전용)
   */
  async getPendingWalkers(): Promise<PendingWalker[]> {
    try {
      const token = await AuthService.getAuthToken();
      if (!token) {
        throw new Error('인증 토큰이 없습니다.');
      }

      const response = await fetch(`${API_BASE_URL}/admin/walkers/pending`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          const newToken = await AuthService.refreshToken();
          if (newToken) {
            const retryResponse = await fetch(`${API_BASE_URL}/admin/walkers/pending`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${newToken}`,
                'Content-Type': 'application/json',
              },
            });
            if (retryResponse.ok) {
              const data = await retryResponse.json();
              return data;
            }
          }
          throw new Error('인증에 실패했습니다.');
        }
        if (response.status === 403) {
          throw new Error('관리자 권한이 필요합니다.');
        }
        throw new Error('워커 목록을 불러오는데 실패했습니다.');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 워커 상태 업데이트 (관리자 전용)
   */
  async updateWalkerStatus(walkerId: number, status: WalkerStatus): Promise<PendingWalker> {
    try {
      const token = await AuthService.getAuthToken();
      if (!token) {
        throw new Error('인증 토큰이 없습니다.');
      }

      const response = await fetch(`${API_BASE_URL}/admin/walkers/${walkerId}/status?status=${status}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          const newToken = await AuthService.refreshToken();
          if (newToken) {
            const retryResponse = await fetch(`${API_BASE_URL}/admin/walkers/${walkerId}/status?status=${status}`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${newToken}`,
                'Content-Type': 'application/json',
              },
            });
            if (retryResponse.ok) {
              const data = await retryResponse.json();
              return data;
            }
          }
          throw new Error('인증에 실패했습니다.');
        }
        if (response.status === 403) {
          throw new Error('관리자 권한이 필요합니다.');
        }
        throw new Error('워커 상태 업데이트에 실패했습니다.');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },
};

export default AdminWalkerService;

