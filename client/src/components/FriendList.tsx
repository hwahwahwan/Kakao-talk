import { useChatStore } from '../store/useChatStore'
import Avatar from './Avatar'

interface Props {
  onFriendClick: (userId: string) => void
}

export default function FriendList({ onFriendClick }: Props) {
  const me = useChatStore((s) => s.me)
  const onlineUsers = useChatStore((s) => s.onlineUsers)
  const showToast = useChatStore((s) => s.showToast)

  return (
    <div className="flex flex-col h-full bg-surface">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-outline-variant/10">
        <h1 className="text-xl font-bold font-headline tracking-tight text-on-surface">Friends</h1>
        <div className="flex items-center gap-1">
          <IconBtn onClick={() => showToast('준비 중인 기능입니다')} title="검색">
            <span className="material-symbols-outlined text-[22px]">search</span>
          </IconBtn>
          <IconBtn onClick={() => showToast('준비 중인 기능입니다')} title="친구 추가">
            <span className="material-symbols-outlined text-[22px]">person_add</span>
          </IconBtn>
        </div>
      </header>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto hide-scrollbar">
        {/* My profile section */}
        {me && (
          <section className="p-4 border-b border-outline-variant/10">
            <div className="flex items-center gap-3 p-2 hover:bg-surface-container-low rounded-xl cursor-pointer transition-colors">
              <div className="relative">
                <Avatar name={me.name} size={56} />
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-surface rounded-full" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-headline font-bold text-base text-on-surface truncate">{me.name}</h2>
                <p className="font-body text-xs text-secondary truncate">{me.email ?? ''}</p>
              </div>
            </div>
          </section>
        )}

        {/* Friends list */}
        <section className="py-2">
          <div className="px-5 py-2">
            <span className="font-headline font-semibold text-[11px] uppercase tracking-wider text-secondary">
              Friends {onlineUsers.length}
            </span>
          </div>

          {onlineUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-secondary text-sm gap-2">
              <span className="material-symbols-outlined text-4xl">group</span>
              <p>현재 접속 중인 친구가 없습니다</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {onlineUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => onFriendClick(user.id)}
                  className="flex items-center gap-3 px-6 py-3 hover:bg-surface-container-low cursor-pointer transition-colors text-left"
                >
                  <Avatar name={user.name} size={44} />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-headline font-medium text-sm text-on-surface truncate">{user.name}</h3>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
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
