import { useChatStore } from '../store/useChatStore'
import Avatar from './Avatar'

interface Props {
  onFriendClick: (userId: string) => void
}

export default function FriendList({ onFriendClick }: Props) {
  const onlineUsers = useChatStore((s) => s.onlineUsers)
  const showToast = useChatStore((s) => s.showToast)

  return (
    <div className="flex flex-col h-full bg-white">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#EBEBEB]">
        <h2 className="text-[18px] font-bold text-[#1A1A1A]">친구</h2>
        <div className="flex gap-2">
          <IconBtn onClick={() => showToast('준비 중인 기능입니다')} title="친구 검색">
            <SearchIcon />
          </IconBtn>
          <IconBtn onClick={() => showToast('준비 중인 기능입니다')} title="친구 추가">
            <AddFriendIcon />
          </IconBtn>
        </div>
      </div>

      {/* 리스트 */}
      <div className="flex-1 overflow-y-auto">
        {onlineUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[#888888] text-sm gap-2">
            <span className="text-3xl">👥</span>
            <p>현재 접속 중인 친구가 없습니다</p>
          </div>
        ) : (
          <ul>
            {onlineUsers.map((user) => (
              <li key={user.id}>
                <button
                  onClick={() => onFriendClick(user.id)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#F9F9F9] transition-colors"
                  style={{ height: 60 }}
                >
                  <Avatar name={user.name} size={40} />
                  <span className="text-[14px] font-semibold text-[#1A1A1A]">{user.name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function IconBtn({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button onClick={onClick} title={title} className="w-8 h-8 flex items-center justify-center text-[#888888] hover:text-[#1A1A1A] transition-colors rounded-lg hover:bg-[#F9F9F9]">
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

function AddFriendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  )
}
