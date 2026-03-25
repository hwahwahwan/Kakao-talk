import { useChatStore } from '../store/useChatStore'
import type { Room } from '../types'
import Avatar from './Avatar'
import Badge from './Badge'
import FilterChips from './FilterChips'
import { formatChatTime } from '../utils/format'

interface Props {
  onRoomClick: (roomId: string) => void
}

export default function ChatList({ onRoomClick }: Props) {
  const me = useChatStore((s) => s.me)
  const rooms = useChatStore((s) => s.rooms)
  const activeRoomId = useChatStore((s) => s.activeRoomId)
  const showToast = useChatStore((s) => s.showToast)

  const sortedRooms = [...rooms].sort((a, b) => {
    const aTime = a.lastMessage?.createdAt ?? ''
    const bTime = b.lastMessage?.createdAt ?? ''
    return bTime.localeCompare(aTime)
  })

  const getRoomName = (room: Room) =>
    room.members.find((m) => m.id !== me?.id)?.name ?? '알 수 없음'

  return (
    <div className="flex flex-col h-full bg-white">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#EBEBEB]">
        <div className="flex items-center gap-2">
          <h2 className="text-[18px] font-bold text-[#1A1A1A]">채팅</h2>
        </div>
        <div className="flex gap-2">
          <IconBtn onClick={() => showToast('준비 중인 기능입니다')} title="오픈채팅">
            <OpenChatIcon />
          </IconBtn>
          <IconBtn onClick={() => showToast('준비 중인 기능입니다')} title="채팅 검색">
            <SearchIcon />
          </IconBtn>
          <IconBtn onClick={() => showToast('준비 중인 기능입니다')} title="새 채팅">
            <NewChatIcon />
          </IconBtn>
        </div>
      </div>

      {/* 필터 칩 */}
      <FilterChips />

      {/* 채팅방 목록 */}
      <div className="flex-1 overflow-y-auto">
        {sortedRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[#888888] text-sm gap-2">
            <span className="text-3xl">💬</span>
            <p>채팅방이 없습니다</p>
            <p className="text-xs">친구 탭에서 대화를 시작하세요</p>
          </div>
        ) : (
          <ul>
            {sortedRooms.map((room) => {
              const name = getRoomName(room)
              return (
                <li key={room.id}>
                  <button
                    onClick={() => onRoomClick(room.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                      activeRoomId === room.id ? 'bg-[#F9F9F9]' : 'hover:bg-[#F9F9F9]'
                    }`}
                  >
                    <Avatar name={name} size={40} />
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[14px] font-semibold text-[#1A1A1A] truncate">
                          {name}
                        </span>
                        <div className="flex flex-col items-end flex-shrink-0 gap-0.5">
                          {room.lastMessage && (
                            <span className="text-[12px] text-[#888888]">
                              {formatChatTime(room.lastMessage.createdAt)}
                            </span>
                          )}
                          <Badge count={room.unreadCount} />
                        </div>
                      </div>
                      <p className="text-[13px] text-[#888888] line-clamp-2 mt-0.5">
                        {room.lastMessage?.content ?? ''}
                      </p>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

function IconBtn({
  onClick,
  title,
  children,
}: {
  onClick: () => void
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="w-8 h-8 flex items-center justify-center text-[#888888] hover:text-[#1A1A1A] transition-colors rounded-lg hover:bg-[#F9F9F9]"
    >
      {children}
    </button>
  )
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function OpenChatIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M17 8h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2v4l-4-4H9a1.994 1.994 0 0 1-1.414-.586" />
      <path d="M5 4h8a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H9l-4 4V6a2 2 0 0 1 2-2z" />
    </svg>
  )
}

function NewChatIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}
