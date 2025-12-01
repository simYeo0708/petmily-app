import { API_BASE_URL } from '../config/api';
import AuthService from './AuthService';

export interface ChatRoomResponse {
  id: number;
  roomId: string;
  userId: number;
  walkerId?: number;
  bookingId?: number;
  chatType: 'PRE_BOOKING' | 'POST_BOOKING';
  isActive: boolean;
  userName?: string;
  walkerName?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

export interface CreateChatRoomRequest {
  walkerId: number;
  message?: string;
}

/**
 * 사용자의 채팅방 목록 조회
 */
export const getUserChatRooms = async (): Promise<ChatRoomResponse[]> => {
  try {
    const token = await AuthService.getAuthToken();
    if (!token) {
      throw new Error('인증이 필요합니다.');
    }
    
    const response = await AuthService.authenticatedFetch(`${API_BASE_URL}/chat-rooms/rooms`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('채팅방 목록을 불러올 수 없습니다.');
    }

    const data = await response.json() as ChatRoomResponse[];
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * 채팅방 생성 (예약 전 문의)
 */
export const createInquiryChatRoom = async (request: CreateChatRoomRequest): Promise<ChatRoomResponse> => {
  try {
    const token = await AuthService.getAuthToken();
    if (!token) {
      throw new Error('인증이 필요합니다.');
    }
    
    const response = await AuthService.authenticatedFetch(`${API_BASE_URL}/chat-rooms/room/inquiry`, {
      method: 'POST',
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('채팅방 생성에 실패했습니다.');
    }

    const data = await response.json() as ChatRoomResponse;
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * 워커와 사용자 간의 채팅방 찾기 또는 생성
 */
export const getOrCreateChatRoomWithWalker = async (
  walkerId: number,
  bookingId?: number
): Promise<ChatRoomResponse> => {
  try {
    // 먼저 기존 채팅방 찾기
    const chatRooms = await getUserChatRooms();
    const existingRoom = chatRooms.find(
      room => room.walkerId === walkerId && (bookingId ? room.bookingId === bookingId : true) && room.isActive
    );
    
    if (existingRoom) {
      return existingRoom;
    }
    
    // 없으면 새로 생성
    return await createInquiryChatRoom({ walkerId });
  } catch (error) {
    throw error;
  }
};

