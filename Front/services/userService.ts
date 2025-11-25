import { apiClient, API_ENDPOINTS } from './apiConfig';

export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserUpdateRequest {
  name?: string;
  email?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

class UserService {
  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.USERS.PROFILE);
      return response.data;
    } catch (error: any) {
      console.error('Get current user failed:', error);
      throw new Error(error.response?.data?.message || '사용자 정보를 불러올 수 없습니다.');
    }
  }

  async getUserById(id: number): Promise<User> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.USERS.GET_BY_ID(id));
      return response.data;
    } catch (error: any) {
      console.error('Get user by id failed:', error);
      throw new Error(error.response?.data?.message || '사용자 정보를 불러올 수 없습니다.');
    }
  }

  async updateCurrentUser(request: UserUpdateRequest): Promise<User> {
    try {
      const response = await apiClient.put(API_ENDPOINTS.USERS.UPDATE, request);
      return response.data;
    } catch (error: any) {
      console.error('Update current user failed:', error);
      throw new Error(error.response?.data?.message || '사용자 정보 수정에 실패했습니다.');
    }
  }

  async updateUser(id: number, request: UserUpdateRequest): Promise<User> {
    try {
      const response = await apiClient.put(API_ENDPOINTS.USERS.GET_BY_ID(id), request);
      return response.data;
    } catch (error: any) {
      console.error('Update user failed:', error);
      throw new Error(error.response?.data?.message || '사용자 정보 수정에 실패했습니다.');
    }
  }

  async changePassword(request: ChangePasswordRequest): Promise<void> {
    try {
      await apiClient.put(API_ENDPOINTS.USERS.CHANGE_PASSWORD, request);
    } catch (error: any) {
      console.error('Change password failed:', error);
      throw new Error(error.response?.data?.message || '비밀번호 변경에 실패했습니다.');
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.USERS.ALL);
      return response.data;
    } catch (error: any) {
      console.error('Get all users failed:', error);
      throw new Error(error.response?.data?.message || '사용자 목록을 불러올 수 없습니다.');
    }
  }
}

export const userService = new UserService();