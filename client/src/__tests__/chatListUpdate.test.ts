/**
 * 채팅 목록 UI 업데이트 검증 테스트
 * 핵심 질문: addMessage가 호출되면 rooms[roomId].lastMessage가 실제로 업데이트되는가?
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { useChatStore } from '../store/useChatStore'
import type { Room, Message } from '../types'

const ROOM_ID = 'user-a_user-b'

const mockRoom: Room = {
  id: ROOM_ID,
  members: [
    { id: 'user-a', name: '정용환' },
    { id: 'user-b', name: '김민준' },
  ],
  unreadCount: 0,
  lastMessage: undefined,
}

const mockMessage: Message = {
  id: 'msg-001',
  roomId: ROOM_ID,
  senderId: 'user-b',
  senderName: '김민준',
  content: '채팅목록에 떠야 할 메시지',
  type: 'text',
  createdAt: new Date().toISOString(),
}

// 스토어를 깨끗하게 초기화
function resetStore() {
  useChatStore.setState({
    me: null,
    onlineUsers: [],
    rooms: [],
    activeRoomId: null,
    messages: {},
    activeTab: 'friends',
    toastMessage: null,
    _toastTimer: null,
  })
}

describe('채팅 목록 실시간 업데이트 (Zustand store)', () => {
  beforeEach(() => {
    resetStore()
  })

  it('addRoom 후 rooms에 방이 존재해야 함', () => {
    useChatStore.getState().addRoom(mockRoom)
    const { rooms } = useChatStore.getState()
    expect(rooms).toHaveLength(1)
    expect(rooms[0].id).toBe(ROOM_ID)
    expect(rooms[0].lastMessage).toBeUndefined()
  })

  it('addMessage 호출 시 rooms[roomId].lastMessage가 업데이트되어야 함', () => {
    // 방 추가
    useChatStore.getState().addRoom(mockRoom)

    // 메시지 수신 (MESSAGE_RECEIVE 이벤트 시뮬레이션)
    useChatStore.getState().addMessage(mockMessage)

    const { rooms } = useChatStore.getState()
    const room = rooms.find(r => r.id === ROOM_ID)

    expect(room).toBeDefined()
    expect(room?.lastMessage).toBeDefined()
    expect(room?.lastMessage?.content).toBe('채팅목록에 떠야 할 메시지')
    expect(room?.lastMessage?.id).toBe('msg-001')
  })

  it('addMessage 호출 시 messages[roomId]에도 추가되어야 함 (채팅창에서 보여야 함)', () => {
    useChatStore.getState().addRoom(mockRoom)
    useChatStore.getState().addMessage(mockMessage)

    const { messages } = useChatStore.getState()
    expect(messages[ROOM_ID]).toHaveLength(1)
    expect(messages[ROOM_ID][0].content).toBe('채팅목록에 떠야 할 메시지')
  })

  it('방이 없는 상태에서 addMessage 호출 시 rooms는 빈 배열 유지 (미등록 방 메시지)', () => {
    // rooms가 비어있는 상태 (방 미등록)
    useChatStore.getState().addMessage(mockMessage)

    const { rooms } = useChatStore.getState()
    // 방이 없으면 lastMessage 업데이트 안 됨 — 채팅목록에 안 뜨는 근본 원인
    expect(rooms).toHaveLength(0)
  })

  it('activeRoomId가 null일 때 addMessage 호출 시 unreadCount가 증가해야 함', () => {
    useChatStore.getState().addRoom(mockRoom)
    // activeRoomId = null (채팅 목록 뷰)
    expect(useChatStore.getState().activeRoomId).toBeNull()

    useChatStore.getState().addMessage(mockMessage)

    const { rooms } = useChatStore.getState()
    const room = rooms.find(r => r.id === ROOM_ID)
    expect(room?.unreadCount).toBe(1)
    expect(room?.lastMessage?.content).toBe('채팅목록에 떠야 할 메시지')
  })

  it('activeRoomId가 해당 방일 때 addMessage 시 unreadCount는 0 유지 (채팅창 열려있는 경우)', () => {
    useChatStore.getState().addRoom(mockRoom)
    useChatStore.setState({ activeRoomId: ROOM_ID })

    useChatStore.getState().addMessage(mockMessage)

    const { rooms } = useChatStore.getState()
    const room = rooms.find(r => r.id === ROOM_ID)
    expect(room?.unreadCount).toBe(0)  // 이미 읽는 중이므로 증가 없음
    expect(room?.lastMessage?.content).toBe('채팅목록에 떠야 할 메시지')  // lastMessage는 업데이트
  })

  it('연속 메시지 수신 시 lastMessage는 마지막 메시지여야 함', () => {
    useChatStore.getState().addRoom(mockRoom)

    const msg1: Message = { ...mockMessage, id: 'msg-001', content: '첫 번째 메시지' }
    const msg2: Message = { ...mockMessage, id: 'msg-002', content: '두 번째 메시지' }

    useChatStore.getState().addMessage(msg1)
    useChatStore.getState().addMessage(msg2)

    const { rooms } = useChatStore.getState()
    const room = rooms.find(r => r.id === ROOM_ID)
    expect(room?.lastMessage?.content).toBe('두 번째 메시지')
    expect(room?.unreadCount).toBe(2)
  })
})
