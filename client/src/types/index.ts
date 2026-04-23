export interface User {
  id: string
  name: string
  email?: string
}

export interface Message {
  id: string
  roomId: string
  senderId: string | null
  senderName: string | null
  content: string
  type: 'text' | 'system'
  createdAt: string
}

export interface Room {
  id: string
  members: User[]
  lastMessage?: Message
  unreadCount: number
}

export type ActiveTab = 'friends' | 'chats' | 'more' | 'chatbot' | 'category'
