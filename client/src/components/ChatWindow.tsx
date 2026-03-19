import { useEffect, useRef } from 'react'
import { useChatStore } from '../store/useChatStore'
import type { Message } from '../types'
import Avatar from './Avatar'
import MessageBubble from './MessageBubble'
import DateDivider from './DateDivider'
import MessageInput from './MessageInput'

interface Props {
  onSend: (content: string) => void
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

export default function ChatWindow({ onSend }: Props) {
  const me = useChatStore((s) => s.me)
  const activeRoomId = useChatStore((s) => s.activeRoomId)
  const rooms = useChatStore((s) => s.rooms)
  const messages = useChatStore((s) => s.messages)
  const showToast = useChatStore((s) => s.showToast)
  const setActiveRoom = useChatStore((s) => s.setActiveRoom)

  const bottomRef = useRef<HTMLDivElement>(null)

  const room = rooms.find((r) => r.id === activeRoomId)
  const roomMessages = activeRoomId ? (messages[activeRoomId] ?? []) : []
  const groups = groupByDate(roomMessages)

  const roomName = room?.members.find((m) => m.id !== me?.id)?.name ?? '알 수 없음'
  const memberCount = room?.members.length ?? 0

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [roomMessages.length])

  if (!activeRoomId || !room) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#B2C7D9] text-white text-sm">
        <div className="text-center">
          <div className="text-4xl mb-3">💬</div>
          <p>대화를 선택하거나 친구 탭에서 채팅을 시작하세요</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* 헤더 */}
      <div className="bg-white border-b border-[#EBEBEB] px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveRoom(null)}
            className="text-[#888888] hover:text-[#1A1A1A] mr-1 md:hidden"
          >
            ←
          </button>
          <Avatar name={roomName} size={36} />
          <div>
            <div className="text-[14px] font-semibold text-[#1A1A1A]">{roomName}</div>
            <div className="text-[12px] text-[#888888]">{memberCount}명</div>
          </div>
        </div>
        <div className="flex gap-1">
          <HeaderBtn onClick={() => showToast('준비 중인 기능입니다')} title="채팅 검색">
            <SearchIcon />
          </HeaderBtn>
          <HeaderBtn onClick={() => showToast('준비 중인 기능입니다')} title="전화">
            <PhoneIcon />
          </HeaderBtn>
          <HeaderBtn onClick={() => showToast('준비 중인 기능입니다')} title="화상통화">
            <VideoIcon />
          </HeaderBtn>
          <HeaderBtn onClick={() => showToast('준비 중인 기능입니다')} title="메뉴">
            <MenuIcon />
          </HeaderBtn>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto bg-[#B2C7D9] px-4 py-4">
        {groups.map((group) => (
          <div key={group.date}>
            <DateDivider date={group.date} />
            {group.messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isMine={msg.senderId === me?.id}
              />
            ))}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* 입력창 */}
      <MessageInput onSend={onSend} />
    </div>
  )
}

function HeaderBtn({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button onClick={onClick} title={title} className="w-8 h-8 flex items-center justify-center text-[#888888] hover:text-[#1A1A1A] transition-colors rounded-lg hover:bg-[#F9F9F9]">
      {children}
    </button>
  )
}

function SearchIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
}
function PhoneIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
}
function VideoIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>
}
function MenuIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
}
