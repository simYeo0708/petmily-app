import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  FlatList,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../index';
import { USE_MOCK_DATA } from '../config/api';

type Props = NativeStackScreenProps<RootStackParamList, 'AIChat'>;

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatRoom {
  id: string;
  type: 'ai' | 'walker';
  name: string;
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
  avatar?: string;
  walkerInfo?: {
    rating: number;
    completedWalks: number;
  };
}

const AIChatScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // 채팅방 목록
  const [chatRooms] = useState<ChatRoom[]>([
    {
      id: 'ai-support',
      type: 'ai',
      name: 'AI 고객지원',
      lastMessage: '무엇을 도와드릴까요?',
      timestamp: new Date(),
      unreadCount: 0,
    },
    {
      id: 'walker-1',
      type: 'walker',
      name: '김산책 워커',
      lastMessage: '내일 오후 2시에 뵙겠습니다!',
      timestamp: new Date(Date.now() - 3600000),
      unreadCount: 2,
      avatar: 'https://via.placeholder.com/50',
      walkerInfo: {
        rating: 4.8,
        completedWalks: 127,
      },
    },
    {
      id: 'walker-2',
      type: 'walker',
      name: '이반려 워커',
      lastMessage: '산책 완료했습니다!',
      timestamp: new Date(Date.now() - 86400000),
      unreadCount: 0,
      avatar: 'https://via.placeholder.com/50',
      walkerInfo: {
        rating: 4.9,
        completedWalks: 203,
      },
    },
  ]);

  useEffect(() => {
    // 메시지가 추가될 때마다 자동 스크롤
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  // 채팅방 선택 시 초기 메시지 로드
  const handleSelectRoom = (room: ChatRoom) => {
    setSelectedRoom(room);
    
    if (room.type === 'ai') {
      setMessages([
        {
          id: '1',
          text: '안녕하세요! 🐾\nPetmily AI 고객지원입니다.\n무엇을 도와드릴까요?',
          isUser: false,
          timestamp: new Date(),
        },
      ]);
    } else {
      // 워커와의 이전 대화 내역 (Mock)
      setMessages([
        {
          id: '1',
          text: '안녕하세요! 산책 예약 확인했습니다.',
          isUser: false,
          timestamp: new Date(Date.now() - 7200000),
        },
        {
          id: '2',
          text: '감사합니다! 내일 오후 2시에 맞춰주세요.',
          isUser: true,
          timestamp: new Date(Date.now() - 7100000),
        },
        {
          id: '3',
          text: '네, 내일 오후 2시에 뵙겠습니다!',
          isUser: false,
          timestamp: new Date(Date.now() - 3600000),
        },
      ]);
    }
  };

  const handleSend = async () => {
    if (inputText.trim().length === 0) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    
    // AI 채팅방일 때만 자동 응답
    if (selectedRoom?.type === 'ai') {
      setIsTyping(true);
      setTimeout(() => {
        const aiResponse = generateAIResponse(inputText);
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: aiResponse,
          isUser: false,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
        setIsTyping(false);
      }, 1000);
    }
  };

  const generateAIResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('산책') || lowerQuery.includes('워커')) {
      return '산책 서비스에 대해 궁금하신가요?\n\n✅ 산책 요청: 홈 화면에서 Pet Walker 탭 선택 후 "산책 요청하기" 버튼을 눌러주세요.\n✅ 산책 지도: 실시간 위치 추적과 경로를 확인할 수 있습니다.\n✅ 워커 매칭: 전문 워커들과 매칭되어 안심하고 맡기실 수 있어요.\n\n더 궁금하신 점이 있으신가요?';
    }

    if (lowerQuery.includes('쇼핑') || lowerQuery.includes('상품') || lowerQuery.includes('구매')) {
      return '쇼핑 관련 도움이 필요하신가요?\n\n🛍️ Pet Mall 탭에서 다양한 반려동물 용품을 만나보세요!\n✅ 사료, 간식, 장난감, 용품 등\n✅ 인기 상품 TOP 5 추천\n✅ 카테고리별 쇼핑\n\n특정 제품을 찾으시나요?';
    }

    if (lowerQuery.includes('배송') || lowerQuery.includes('주문')) {
      return '주문 및 배송 관련 안내입니다.\n\n📦 배송 기간: 주문 후 2-3일 소요\n📍 배송 조회: 나의 주문 > 주문 상세에서 확인 가능\n💳 결제 방법: 카드, 계좌이체, 간편결제\n\n주문 내역을 확인하시려면 홈 화면의 "나의 주문" 섹션을 확인해주세요!';
    }

    if (lowerQuery.includes('펫') || lowerQuery.includes('반려동물')) {
      return '반려동물 정보 관리는 MyPet 탭에서 할 수 있어요!\n\n🐕 이름, 나이, 견종 등록\n📸 사진 등록\n🏥 건강 정보 관리\n\n더 자세한 정보가 필요하신가요?';
    }

    if (lowerQuery.includes('안녕') || lowerQuery.includes('hello') || lowerQuery.includes('hi')) {
      return '안녕하세요! 😊\nPetmily를 찾아주셔서 감사합니다.\n\n무엇을 도와드릴까요?\n• 산책 서비스\n• 쇼핑\n• 반려동물 정보\n• 주문/배송\n\n궁금하신 내용을 말씀해주세요!';
    }

    // 기본 응답
    return '죄송합니다. 질문을 정확히 이해하지 못했어요. 😅\n\n다음 주제에 대해 도움을 드릴 수 있습니다:\n• 산책 서비스\n• 쇼핑 문의\n• 반려동물 정보 관리\n• 주문 및 배송\n\n구체적으로 어떤 도움이 필요하신가요?';
  };

  // 채팅방 목록 렌더링
  const renderChatRoomList = () => (
    <FlatList
      data={chatRooms}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.chatRoomItem}
          onPress={() => handleSelectRoom(item)}
        >
          <View style={styles.chatRoomAvatar}>
            {item.type === 'ai' ? (
              <View style={styles.aiAvatarContainer}>
                <Ionicons name="sparkles" size={24} color="#C59172" />
              </View>
            ) : item.avatar ? (
              <Image source={{ uri: item.avatar }} style={styles.avatarImage} />
            ) : (
              <View style={styles.walkerAvatarPlaceholder}>
                <Ionicons name="person" size={24} color="#666" />
              </View>
            )}
            {item.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{item.unreadCount}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.chatRoomContent}>
            <View style={styles.chatRoomHeader}>
              <Text style={styles.chatRoomName}>{item.name}</Text>
              <Text style={styles.chatRoomTime}>
                {item.timestamp.toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
            
            <View style={styles.chatRoomFooter}>
              <Text
                style={styles.chatRoomLastMessage}
                numberOfLines={1}
              >
                {item.lastMessage}
              </Text>
              {item.walkerInfo && (
                <View style={styles.walkerBadge}>
                  <Ionicons name="star" size={12} color="#FFB800" />
                  <Text style={styles.walkerRating}>{item.walkerInfo.rating}</Text>
                </View>
              )}
            </View>
          </View>
          
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
      )}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      contentContainerStyle={styles.chatRoomList}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (selectedRoom) {
              setSelectedRoom(null);
            } else {
              navigation.goBack();
            }
          }}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          {selectedRoom?.type === 'ai' && (
            <Ionicons name="sparkles" size={20} color="#C59172" />
          )}
          <Text style={styles.headerTitle}>
            {selectedRoom ? selectedRoom.name : '채팅'}
          </Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      {/* 채팅방 목록 또는 채팅 화면 */}
      {!selectedRoom ? (
        renderChatRoomList()
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.chatContainer}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageBubble,
                message.isUser ? styles.userBubble : styles.aiBubble,
              ]}
            >
              {!message.isUser && (
                <View style={styles.aiIcon}>
                  <Ionicons name="sparkles" size={16} color="#C59172" />
                </View>
              )}
              <View
                style={[
                  styles.messageContent,
                  message.isUser
                    ? styles.userMessageContent
                    : styles.aiMessageContent,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    message.isUser ? styles.userMessageText : styles.aiMessageText,
                  ]}
                >
                  {message.text}
                </Text>
                <Text
                  style={[
                    styles.messageTime,
                    message.isUser ? styles.userMessageTime : styles.aiMessageTime,
                  ]}
                >
                  {message.timestamp.toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            </View>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <View style={[styles.messageBubble, styles.aiBubble]}>
              <View style={styles.aiIcon}>
                <Ionicons name="sparkles" size={16} color="#C59172" />
              </View>
              <View style={[styles.messageContent, styles.aiMessageContent]}>
                <View style={styles.typingIndicator}>
                  <View style={styles.typingDot} />
                  <View style={[styles.typingDot, styles.typingDotDelay1]} />
                  <View style={[styles.typingDot, styles.typingDotDelay2]} />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="메시지를 입력하세요..."
              placeholderTextColor="#999"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              onPress={handleSend}
              style={[
                styles.sendButton,
                inputText.trim().length === 0 && styles.sendButtonDisabled,
              ]}
              disabled={inputText.trim().length === 0}
            >
              <Ionicons
                name="send"
                size={20}
                color={inputText.trim().length > 0 ? '#fff' : '#ccc'}
              />
            </TouchableOpacity>
          </View>
        </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: -10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    padding: 4,
    width: 40,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerRight: {
    width: 40,
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
  },
  messageBubble: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  userBubble: {
    flexDirection: 'row-reverse',
  },
  aiBubble: {
    flexDirection: 'row',
  },
  aiIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e7f3ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  messageContent: {
    maxWidth: '75%',
    borderRadius: 16,
    padding: 12,
  },
  userMessageContent: {
    backgroundColor: '#C59172',
  },
  aiMessageContent: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#fff',
  },
  aiMessageText: {
    color: '#333',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  userMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  aiMessageTime: {
    color: '#999',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C59172',
    opacity: 0.4,
  },
  typingDotDelay1: {
    opacity: 0.6,
  },
  typingDotDelay2: {
    opacity: 0.8,
  },
  inputContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f8f9fa',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#C59172',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#f0f0f0',
  },
  // 채팅방 목록 스타일
  chatRoomList: {
    paddingVertical: 8,
  },
  chatRoomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  chatRoomAvatar: {
    width: 56,
    height: 56,
    marginRight: 12,
    position: 'relative',
  },
  aiAvatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f8e8dc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  walkerAvatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  chatRoomContent: {
    flex: 1,
    marginRight: 8,
  },
  chatRoomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatRoomName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  chatRoomTime: {
    fontSize: 12,
    color: '#999',
  },
  chatRoomFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatRoomLastMessage: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    marginRight: 8,
  },
  walkerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 2,
  },
  walkerRating: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFB800',
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginLeft: 84,
  },
});

export default AIChatScreen;

