/**
 * ChatList UI 업데이트 테스트
 * 핵심: addMessage 호출 후 ChatList가 실제로 re-render되어 lastMessage를 표시하는가?
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import ChatList from '../components/ChatList'
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

function resetStore() {
  useChatStore.setState({
    me: { id: 'user-a', name: '정용환' },
    onlineUsers: [],
    rooms: [],
    activeRoomId: null,
    messages: {},
    activeTab: 'chats',
    toastMessage: null,
    _toastTimer: null,
  })
}

describe('ChatList UI 렌더링 (React + Zustand)', () => {
  beforeEach(() => {
    resetStore()
  })

  it('초기 상태: 채팅방 없음 메시지 표시', () => {
    render(<ChatList onRoomClick={() => {}} />)
    expect(screen.getByText('채팅방이 없습니다')).toBeTruthy()
  })

  it('방 추가 후 방 이름이 표시되어야 함', () => {
    act(() => {
      useChatStore.getState().addRoom(mockRoom)
    })
    render(<ChatList onRoomClick={() => {}} />)
    expect(screen.getByText('김민준')).toBeTruthy()
  })

  it('addMessage 호출 후 ChatList가 lastMessage를 보여야 함 (핵심 테스트)', () => {
    act(() => {
      useChatStore.getState().addRoom(mockRoom)
    })

    render(<ChatList onRoomClick={() => {}} />)

    // 초기: lastMessage 없음
    expect(screen.queryByText('채팅목록에 뜰 메시지')).toBeNull()

    // addMessage 호출 (MESSAGE_RECEIVE 이벤트 시뮬레이션)
    act(() => {
      const message: Message = {
        id: 'msg-001',
        roomId: ROOM_ID,
        senderId: 'user-b',
        senderName: '김민준',
        content: '채팅목록에 뜰 메시지',
        type: 'text',
        createdAt: new Date().toISOString(),
      }
      useChatStore.getState().addMessage(message)
    })

    // ChatList가 re-render되어 새 메시지 내용을 표시해야 함
    expect(screen.getByText('채팅목록에 뜰 메시지')).toBeTruthy()
  })

  it('unreadCount Badge가 메시지 수신 후 증가해야 함', () => {
    act(() => {
      useChatStore.getState().addRoom(mockRoom)
    })

    const { container } = render(<ChatList onRoomClick={() => {}} />)

    act(() => {
      const message: Message = {
        id: 'msg-001',
        roomId: ROOM_ID,
        senderId: 'user-b',
        senderName: '김민준',
        content: '안 읽은 메시지',
        type: 'text',
        createdAt: new Date().toISOString(),
      }
      useChatStore.getState().addMessage(message)
    })

    // unreadCount가 1이 됐으므로 Badge(1)가 보여야 함
    expect(container.textContent).toContain('1')
    expect(container.textContent).toContain('안 읽은 메시지')
  })
})
