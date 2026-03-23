import { create } from 'zustand'
import type { User, Message, Room, ActiveTab } from '../types'
import { LAYOUT } from '../constants'

interface ChatStore {
  me: User | null
  myLang: string
  onlineUsers: User[]
  rooms: Room[]
  activeRoomId: string | null
  messages: Record<string, Message[]>
  activeTab: ActiveTab
  toastMessage: string | null
  _toastTimer: ReturnType<typeof setTimeout> | null

  setMe: (user: User) => void
  setMyLang: (lang: string) => void
  setOnlineUsers: (users: User[]) => void
  addRoom: (room: Room) => void
  updateRoom: (roomId: string, patch: Partial<Room>) => void
  removeRoom: (roomId: string) => void
  setActiveRoom: (roomId: string | null) => void
  addMessage: (message: Message) => void
  setHistory: (roomId: string, messages: Message[]) => void
  incrementUnread: (roomId: string) => void
  clearUnread: (roomId: string) => void
  setActiveTab: (tab: ActiveTab) => void
  showToast: (message: string) => void
  clearToast: () => void
}

export const useChatStore = create<ChatStore>((set, get) => ({
  me: null,
  myLang: 'KO',
  onlineUsers: [],
  rooms: [],
  activeRoomId: null,
  messages: {},
  activeTab: 'friends',
  toastMessage: null,
  _toastTimer: null,

  setMe: (user) => set({ me: user }),
  setMyLang: (lang) => set({ myLang: lang }),

  setOnlineUsers: (users) => set({ onlineUsers: users }),

  addRoom: (room) =>
    set((state) => {
      const exists = state.rooms.find((r) => r.id === room.id)
      if (exists) {
        return {
          rooms: state.rooms.map((r) =>
            r.id === room.id ? { ...r, members: room.members } : r
          ),
        }
      }
      return { rooms: [...state.rooms, room] }
    }),

  updateRoom: (roomId, patch) =>
    set((state) => ({
      rooms: state.rooms.map((r) => (r.id === roomId ? { ...r, ...patch } : r)),
    })),

  removeRoom: (roomId) =>
    set((state) => {
      const newMessages = { ...state.messages }
      delete newMessages[roomId]
      return {
        rooms: state.rooms.filter((r) => r.id !== roomId),
        messages: newMessages,
        activeRoomId: state.activeRoomId === roomId ? null : state.activeRoomId,
      }
    }),

  setActiveRoom: (roomId) => {
    set({ activeRoomId: roomId })
    if (roomId) {
      get().clearUnread(roomId)
    }
  },

  addMessage: (message) => {
    const { activeRoomId } = get()
    set((state) => {
      const roomMessages = state.messages[message.roomId] ?? []
      const updatedMessages = {
        ...state.messages,
        [message.roomId]: [...roomMessages, message],
      }
      const updatedRooms = state.rooms.map((r) =>
        r.id === message.roomId ? { ...r, lastMessage: message } : r
      )
      return { messages: updatedMessages, rooms: updatedRooms }
    })
    if (message.roomId !== activeRoomId) {
      get().incrementUnread(message.roomId)
    }
  },

  setHistory: (roomId, messages) =>
    set((state) => ({
      messages: { ...state.messages, [roomId]: messages },
    })),

  incrementUnread: (roomId) =>
    set((state) => ({
      rooms: state.rooms.map((r) =>
        r.id === roomId ? { ...r, unreadCount: r.unreadCount + 1 } : r
      ),
    })),

  clearUnread: (roomId) =>
    set((state) => ({
      rooms: state.rooms.map((r) =>
        r.id === roomId ? { ...r, unreadCount: 0 } : r
      ),
    })),

  setActiveTab: (tab) => set({ activeTab: tab }),

  showToast: (message) => {
    const { _toastTimer } = get()
    if (_toastTimer) clearTimeout(_toastTimer)
    const timer = setTimeout(() => {
      get().clearToast()
    }, LAYOUT.TOAST_DURATION_MS)
    set({ toastMessage: message, _toastTimer: timer })
  },

  clearToast: () => set({ toastMessage: null, _toastTimer: null }),
}))
