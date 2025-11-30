import { apiClient, API_ENDPOINTS } from './apiConfig';

export interface CreateChatRoomRequest {
  walkerId: number;
  initialMessage?: string;
}

export interface ChatRoomResponse {
  id: number;
  roomId: string;
  userId: number;
  walkerId?: number;
  bookingId?: number;
  chatType: 'PRE_BOOKING' | 'BOOKING_PROGRESS' | 'GENERAL';
  roomName?: string;
  isActive: boolean;
  createTime: string;
  modifyTime?: string;

  userName?: string;
  walkerName?: string;
  walkerProfileImageUrl?: string;

  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

export interface ChatMessageRequest {
  roomId?: string;
  messageType?: 'TEXT' | 'IMAGE' | 'SYSTEM' | 'JOIN' | 'LEAVE';
  content: string;
  action?: string;
}

export interface ChatMessageResponse {
  id: number;
  chatRoomId: number;
  senderId: number;
  messageType: 'TEXT' | 'IMAGE' | 'SYSTEM' | 'JOIN' | 'LEAVE';
  content: string;
  isSystemMessage?: boolean;
  bookingButtonData?: string;
  isRead?: boolean;
  createTime: string;

  senderName?: string;
  senderProfileImageUrl?: string;
}

export interface ChatMessageListResponse {
  content: ChatMessageResponse[];
  pageable: {
    sort: {
      sorted: boolean;
      unsorted: boolean;
    };
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  numberOfElements: number;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
  };
}

export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
}

class ChatService {
  async getUserChatRooms(): Promise<ChatRoomResponse[]> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CHAT.ROOMS);
      return response.data;
    } catch (error: any) {
      console.error('Get user chat rooms failed:', error);
      throw new Error(error.response?.data?.message || '채팅방 목록을 불러올 수 없습니다.');
    }
  }

  async getChatRoom(roomId: string): Promise<ChatRoomResponse> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CHAT.ROOM(roomId));
      return response.data;
    } catch (error: any) {
      console.error('Get chat room failed:', error);
      throw new Error(error.response?.data?.message || '채팅방 정보를 불러올 수 없습니다.');
    }
  }

  async createInquiryChatRoom(request: CreateChatRoomRequest): Promise<ChatRoomResponse> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.CHAT.CREATE_INQUIRY, request);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '문의 채팅방 생성에 실패했습니다.');
    }
  }

  async getChatMessages(roomId: string, pagination?: PaginationParams): Promise<ChatMessageListResponse> {
    try {
      const params = pagination || { page: 0, size: 50, sort: 'createTime,desc' };
      const response = await apiClient.get(API_ENDPOINTS.CHAT.MESSAGES(roomId), { params });
      return response.data;
    } catch (error: any) {
      console.error('Get chat messages failed:', error);
      throw new Error(error.response?.data?.message || '채팅 메시지를 불러올 수 없습니다.');
    }
  }

  async sendMessage(roomId: string, request: ChatMessageRequest): Promise<ChatMessageResponse> {
    try {
      request.roomId = roomId;
      const response = await apiClient.post(API_ENDPOINTS.CHAT.MESSAGES(roomId), request);
      return response.data;
    } catch (error: any) {
      console.error('Send message failed:', error);
      throw new Error(error.response?.data?.message || '메시지 전송에 실패했습니다.');
    }
  }

  async markMessagesAsRead(roomId: string): Promise<void> {
    try {
      await apiClient.put(API_ENDPOINTS.CHAT.MARK_READ(roomId));
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '메시지 읽음 처리에 실패했습니다.');
    }
  }

  async getActiveChatRooms(): Promise<ChatRoomResponse[]> {
    try {
      const chatRooms = await this.getUserChatRooms();
      return chatRooms.filter(room => room.isActive);
    } catch (error: any) {
      console.error('Get active chat rooms failed:', error);
      throw new Error('활성 채팅방 목록을 불러올 수 없습니다.');
    }
  }

  async getUnreadMessageCount(): Promise<number> {
    try {
      const chatRooms = await this.getUserChatRooms();
      return chatRooms.reduce((total, room) => total + (room.unreadCount || 0), 0);
    } catch (error: any) {
      console.error('Get unread message count failed:', error);
      return 0;
    }
  }

  async getChatRoomWithWalker(walkerId: number): Promise<ChatRoomResponse | null> {
    try {
      const chatRooms = await this.getUserChatRooms();
      return chatRooms.find(room => room.walkerId === walkerId) || null;
    } catch (error: any) {
      console.error('Get chat room with walker failed:', error);
      throw new Error('워커와의 채팅방을 찾을 수 없습니다.');
    }
  }

  async getChatRoomsByType(chatType: string): Promise<ChatRoomResponse[]> {
    try {
      const chatRooms = await this.getUserChatRooms();
      return chatRooms.filter(room => room.chatType === chatType);
    } catch (error: any) {
      console.error('Get chat rooms by type failed:', error);
      throw new Error('타입별 채팅방을 불러올 수 없습니다.');
    }
  }

  async getPreBookingChatRooms(): Promise<ChatRoomResponse[]> {
    return this.getChatRoomsByType('PRE_BOOKING');
  }

  async getBookingProgressChatRooms(): Promise<ChatRoomResponse[]> {
    return this.getChatRoomsByType('BOOKING_PROGRESS');
  }

  async getGeneralChatRooms(): Promise<ChatRoomResponse[]> {
    return this.getChatRoomsByType('GENERAL');
  }

  async sendTextMessage(roomId: string, content: string): Promise<ChatMessageResponse> {
    return this.sendMessage(roomId, {
      messageType: 'TEXT',
      content
    });
  }

  async sendImageMessage(roomId: string, imageUrl: string): Promise<ChatMessageResponse> {
    return this.sendMessage(roomId, {
      messageType: 'IMAGE',
      content: imageUrl
    });
  }

  async getRecentMessages(roomId: string, limit: number = 20): Promise<ChatMessageResponse[]> {
    try {
      const response = await this.getChatMessages(roomId, { page: 0, size: limit });
      return response.content.reverse();
    } catch (error: any) {
      console.error('Get recent messages failed:', error);
      throw new Error('최근 메시지를 불러올 수 없습니다.');
    }
  }

  async loadMoreMessages(roomId: string, page: number, size: number = 20): Promise<ChatMessageResponse[]> {
    try {
      const response = await this.getChatMessages(roomId, { page, size });
      return response.content;
    } catch (error: any) {
      console.error('Load more messages failed:', error);
      throw new Error('이전 메시지를 불러올 수 없습니다.');
    }
  }

  async searchMessages(roomId: string, keyword: string): Promise<ChatMessageResponse[]> {
    try {
      const response = await this.getChatMessages(roomId, { size: 1000 });
      return response.content.filter(message =>
        message.content.toLowerCase().includes(keyword.toLowerCase())
      );
    } catch (error: any) {
      console.error('Search messages failed:', error);
      throw new Error('메시지 검색에 실패했습니다.');
    }
  }

  async getChatRoomStats(): Promise<{
    totalRooms: number;
    activeRooms: number;
    totalUnreadMessages: number;
    preBookingRooms: number;
    bookingProgressRooms: number;
  }> {
    try {
      const chatRooms = await this.getUserChatRooms();

      return {
        totalRooms: chatRooms.length,
        activeRooms: chatRooms.filter(room => room.isActive).length,
        totalUnreadMessages: chatRooms.reduce((total, room) => total + (room.unreadCount || 0), 0),
        preBookingRooms: chatRooms.filter(room => room.chatType === 'PRE_BOOKING').length,
        bookingProgressRooms: chatRooms.filter(room => room.chatType === 'BOOKING_PROGRESS').length
      };
    } catch (error: any) {
      console.error('Get chat room stats failed:', error);
      throw new Error('채팅방 통계를 불러올 수 없습니다.');
    }
  }

  async createOrGetChatRoomWithWalker(walkerId: number, initialMessage?: string): Promise<ChatRoomResponse> {
    try {
      const existingRoom = await this.getChatRoomWithWalker(walkerId);
      if (existingRoom) {
        return existingRoom;
      }

      return await this.createInquiryChatRoom({
        walkerId,
        initialMessage
      });
    } catch (error: any) {
      console.error('Create or get chat room with walker failed:', error);
      throw new Error('워커와의 채팅방을 생성하거나 가져올 수 없습니다.');
    }
  }
}

export const chatService = new ChatService();