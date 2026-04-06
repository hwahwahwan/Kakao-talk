import { useEffect, useRef, useState } from 'react'
import { useChatStore } from '../store/useChatStore'
import type { Message } from '../types'
import Avatar from './Avatar'
import MessageBubble from './MessageBubble'
import DateDivider from './DateDivider'
import MessageInput from './MessageInput'

interface Props {
  onSend: (content: string) => void
  onLeave: () => void
}

function formatDateLabel(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })
}

function groupByDate(messages: Message[]) {
  const groups: { date: string; messages: Message[] }[] = []
  for (const msg of messages) {
    const date = formatDateLabel(msg.createdAt)
    const last = groups[groups.length - 1]
    if (last && last.date === date) {
      last.messages.push(msg)
    } else {
      groups.push({ date, messages: [msg] })
    }
  }
  return groups
}

export default function ChatWindow({ onSend, onLeave }: Props) {
  const me = useChatStore((s) => s.me)
  const activeRoomId = useChatStore((s) => s.activeRoomId)
  const rooms = useChatStore((s) => s.rooms)
  const messages = useChatStore((s) => s.messages)
  const showToast = useChatStore((s) => s.showToast)
  const setActiveRoom = useChatStore((s) => s.setActiveRoom)

  const bottomRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setIsMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const room = rooms.find((r) => r.id === activeRoomId)
  const roomMessages = activeRoomId ? (messages[activeRoomId] ?? []) : []
  const groups = groupByDate(roomMessages)
  const roomName = room?.members.find((m) => m.id !== me?.id)?.name ?? '알 수 없음'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [roomMessages.length])

  if (!activeRoomId || !room) {
    return (
      <div className="flex-1 flex items-center justify-center bg-chat-bg text-white text-sm">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl mb-3 block opacity-70">chat</span>
          <p className="opacity-80">대화를 선택하거나 친구 탭에서 채팅을 시작하세요</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-chat-bg">
      {/* Frosted glass header */}
      <header className="h-16 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 border-b border-outline-variant/10 z-10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveRoom(null)}
            className="text-secondary hover:text-on-surface mr-1"
            title="닫기"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="size-10 rounded-xl bg-surface-container overflow-hidden flex-shrink-0">
            <Avatar name={roomName} size={40} />
          </div>
          <div className="flex flex-col">
            <h2 className="font-headline font-semibold text-base text-on-surface">{roomName}</h2>
            <div className="flex items-center gap-1">
              <span className="size-2 bg-green-500 rounded-full" />
              <span className="text-xs font-body text-secondary">Active now</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-secondary">
          <button onClick={() => showToast('준비 중인 기능입니다')} className="hover:text-on-surface transition-colors" title="검색">
            <span className="material-symbols-outlined">search</span>
          </button>
          <button onClick={() => showToast('준비 중인 기능입니다')} className="hover:text-on-surface transition-colors" title="전화">
            <span className="material-symbols-outlined">call</span>
          </button>
          <button onClick={() => showToast('준비 중인 기능입니다')} className="hover:text-on-surface transition-colors" title="화상통화">
            <span className="material-symbols-outlined">videocam</span>
          </button>
          <div className="w-px h-4 bg-outline-variant/30" />
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setIsMenuOpen((v) => !v)}
              className="hover:text-on-surface transition-colors"
              title="메뉴"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-lg border border-outline-variant/20 z-50 overflow-hidden">
                <button
                  onClick={() => { setIsMenuOpen(false); onLeave() }}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-surface-container-low transition-colors"
                >
                  채팅방 나가기
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-1 hide-scrollbar">
        {groups.map((group) => (
          <div key={group.date}>
            <DateDivider date={group.date} />
            {group.messages.map((msg, index) => {
              const isMine = msg.senderId === me?.id
              const prev = group.messages[index - 1]
              const showSenderName = !isMine && (index === 0 || prev.senderId !== msg.senderId)
              return (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isMine={isMine}
                  showSenderName={showSenderName}
                />
              )
            })}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <MessageInput onSend={onSend} />
    </div>
  )
}
