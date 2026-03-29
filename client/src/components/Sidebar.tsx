import { useChatStore } from '../store/useChatStore'
import type { ActiveTab } from '../types'
import Avatar from './Avatar'
import Badge from './Badge'

interface Props {
  onOpenSettings: () => void
}

export default function Sidebar({ onOpenSettings }: Props) {
  const me = useChatStore((s) => s.me)
  const activeTab = useChatStore((s) => s.activeTab)
  const setActiveTab = useChatStore((s) => s.setActiveTab)
  const showToast = useChatStore((s) => s.showToast)
  const rooms = useChatStore((s) => s.rooms)

  const totalUnread = rooms.reduce((sum, r) => sum + r.unreadCount, 0)

  const handleTab = (tab: ActiveTab) => setActiveTab(tab)

  return (
    <div className="w-[72px] flex-shrink-0 bg-[#F9F9F9] flex flex-col items-center py-3 border-r border-[#EBEBEB]">
      {/* 내 프로필 */}
      <button
        onClick={() => showToast('준비 중인 기능입니다')}
        className="mb-4 hover:opacity-80 transition-opacity"
      >
        <Avatar name={me?.name ?? '?'} size={40} />
      </button>

      <div className="flex-1 flex flex-col items-center gap-1 w-full">
        {/* 친구 탭 */}
        <SidebarBtn
          active={activeTab === 'friends'}
          onClick={() => handleTab('friends')}
          label="친구"
        >
          <FriendsIcon active={activeTab === 'friends'} />
        </SidebarBtn>

        {/* 채팅 탭 */}
        <SidebarBtn
          active={activeTab === 'chats'}
          onClick={() => handleTab('chats')}
          label="채팅"
        >
          <div className="relative">
            <ChatIcon active={activeTab === 'chats'} />
            {totalUnread > 0 && (
              <span className="absolute -top-1.5 -right-1.5">
                <Badge count={totalUnread} />
              </span>
            )}
          </div>
        </SidebarBtn>

        {/* 더보기 탭 */}
        <SidebarBtn
          active={activeTab === 'more'}
          onClick={() => handleTab('more')}
          label="더보기"
        >
          <MoreIcon active={activeTab === 'more'} />
        </SidebarBtn>
      </div>

      {/* 하단 아이콘 */}
      <div className="flex flex-col items-center gap-1">
        <SidebarBtn active={activeTab === 'chatbot'} onClick={() => handleTab('chatbot')} label="AI 챗봇">
          <BotIcon active={activeTab === 'chatbot'} />
        </SidebarBtn>
        <SidebarBtn active={false} onClick={() => showToast('준비 중인 기능입니다')} label="알림">
          <BellIcon />
        </SidebarBtn>
        <SidebarBtn active={false} onClick={onOpenSettings} label="설정">
          <SettingsIcon />
        </SidebarBtn>
      </div>
    </div>
  )
}

function SidebarBtn({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean
  onClick: () => void
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`w-12 h-12 flex flex-col items-center justify-center rounded-xl transition-colors ${
        active ? 'text-[#1A1A1A]' : 'text-[#888888] hover:text-[#1A1A1A] hover:bg-black/5'
      }`}
    >
      {children}
    </button>
  )
}

function FriendsIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function ChatIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function MoreIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" strokeWidth={active ? 2.5 : 2}>
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
    </svg>
  )
}

function BotIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <path d="M12 11V7" />
      <circle cx="12" cy="5" r="2" />
      <path d="M8 15h.01M12 15h.01M16 15h.01" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}
