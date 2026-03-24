import { useEffect, useRef, useState } from 'react'
import { io, type Socket } from 'socket.io-client'
import { useChatStore } from '../store/useChatStore'
import { SOCKET_EVENTS } from '../constants'
import type { Message, Room } from '../types'

const SERVER_URL = import.meta.env.VITE_SERVER_URL as string

export function useSocket() {
  const socketRef = useRef<Socket | null>(null)
  const store = useChatStore.getState
  const [loginError, setLoginError] = useState<string | null>(null)

  useEffect(() => {
    if (socketRef.current) return

    const socket = io(SERVER_URL, { autoConnect: false })
    socketRef.current = socket

    socket.on(SOCKET_EVENTS.USER_JOINED, ({ me, onlineUsers, rooms }) => {
      store().setMe(me)
      store().setOnlineUsers(onlineUsers)
      rooms.forEach((room: Room) => {
        store().addRoom({ ...room, unreadCount: 0 })
        socket.emit(SOCKET_EVENTS.ROOM_REJOIN, { roomId: room.id })
      })
    })

    socket.on(SOCKET_EVENTS.USER_JOIN_ERROR, ({ message }: { message: string }) => {
      setLoginError(message)
    })

    socket.on(SOCKET_EVENTS.ROOM_REJOINED, ({ roomId, history }: { roomId: string; history: Message[] }) => {
      store().setHistory(roomId, history)
    })

    socket.on(SOCKET_EVENTS.USER_LIST, ({ users }) => {
      const { me } = store()
      store().setOnlineUsers(users.filter((u: { id: string }) => u.id !== me?.id))
    })

    socket.on(SOCKET_EVENTS.USER_DISCONNECT, () => {
      // user:list 이벤트에서 이미 처리됨
    })

    socket.on(SOCKET_EVENTS.ROOM_JOINED, ({ room, history }: { room: Room; history: Message[] }) => {
      const roomWithUnread: Room = { ...room, unreadCount: 0 }
      store().addRoom(roomWithUnread)
      store().setHistory(room.id, history)
      store().setActiveRoom(room.id)
      store().setActiveTab('chats')
    })

    socket.on(SOCKET_EVENTS.ROOM_INVITED, ({ room }: { room: Room }) => {
      const roomWithUnread: Room = { ...room, unreadCount: 0 }
      store().addRoom(roomWithUnread)
    })

    socket.on(SOCKET_EVENTS.ROOM_ERROR, ({ message }: { message: string }) => {
      store().showToast(message)
    })

    socket.on(SOCKET_EVENTS.MESSAGE_RECEIVE, (message: Message) => {
      store().addMessage(message)
    })

    socket.on(SOCKET_EVENTS.ROOM_LEFT, ({ roomId }: { roomId: string }) => {
      store().removeRoom(roomId)
    })

    socket.connect()

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [])

  const joinAs = (email: string, password: string) => {
    socketRef.current?.emit(SOCKET_EVENTS.USER_JOIN, { email, password })
  }

  const createRoom = (targetUserId: string) => {
    socketRef.current?.emit(SOCKET_EVENTS.ROOM_CREATE, { targetUserId })
  }

  const sendMessage = (roomId: string, content: string) => {
    if (content.trim() === '') return
    socketRef.current?.emit(SOCKET_EVENTS.MESSAGE_SEND, { roomId, content })
  }

  const leaveRoom = (roomId: string) => {
    socketRef.current?.emit(SOCKET_EVENTS.ROOM_LEAVE, { roomId })
  }

  return { joinAs, createRoom, sendMessage, leaveRoom, loginError, clearLoginError: () => setLoginError(null) }
}
