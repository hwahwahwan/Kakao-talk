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
    <div className="flex flex-col h-full bg-surface">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-outline-variant/10">
        <h1 className="text-xl font-bold font-headline tracking-tight text-on-surface">Chats</h1>
        <div className="flex items-center gap-1">
          <IconBtn onClick={() => showToast('준비 중인 기능입니다')} title="검색">
            <span className="material-symbols-outlined text-[22px]">search</span>
          </IconBtn>
          <IconBtn onClick={() => showToast('준비 중인 기능입니다')} title="새 채팅">
            <span className="material-symbols-outlined text-[22px]">edit</span>
          </IconBtn>
        </div>
      </header>

      {/* Filter chips */}
      <FilterChips />

      {/* Room list */}
      <div className="flex-1 overflow-y-auto hide-scrollbar">
        {sortedRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-secondary text-sm gap-2">
            <span className="material-symbols-outlined text-4xl">chat_bubble</span>
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
                      activeRoomId === room.id
                        ? 'bg-surface-container-low'
                        : 'hover:bg-surface-container-low'
                    }`}
                  >
                    <Avatar name={name} size={44} />
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-headline font-medium text-sm text-on-surface truncate">
                          {name}
                        </span>
                        <div className="flex flex-col items-end flex-shrink-0 gap-0.5">
                          {room.lastMessage && (
                            <span className="text-[11px] text-secondary font-label">
                              {formatChatTime(room.lastMessage.createdAt)}
                            </span>
                          )}
                          <Badge count={room.unreadCount} />
                        </div>
                      </div>
                      <p className="font-body text-xs text-secondary truncate mt-0.5">
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

function IconBtn({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="p-2 hover:bg-surface-container rounded-full text-secondary transition-colors"
    >
      {children}
    </button>
  )
}
