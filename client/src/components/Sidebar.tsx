import { useChatStore } from '../store/useChatStore'
import type { ActiveTab } from '../types'

interface Props {
  onOpenSettings: () => void
}

export default function Sidebar({ onOpenSettings }: Props) {
  const activeTab = useChatStore((s) => s.activeTab)
  const setActiveTab = useChatStore((s) => s.setActiveTab)
  const showToast = useChatStore((s) => s.showToast)
  const rooms = useChatStore((s) => s.rooms)

  const totalUnread = rooms.reduce((sum, r) => sum + r.unreadCount, 0)
  const handleTab = (tab: ActiveTab) => setActiveTab(tab)

  return (
    <aside className="fixed left-0 top-0 h-full flex flex-col z-50 bg-sidebar-bg w-[72px] border-r border-zinc-200">
      <div className="flex flex-col items-center py-6 gap-2">
        {/* Mac window controls */}
        <div className="flex gap-1.5 mb-6">
          <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
          <div className="w-3 h-3 rounded-full bg-[#28C840]" />
        </div>

        {/* Friends tab */}
        <SidebarBtn active={activeTab === 'friends'} onClick={() => handleTab('friends')} title="친구">
          <Icon name="person" filled={activeTab === 'friends'} />
        </SidebarBtn>

        {/* Chats tab */}
        <SidebarBtn active={activeTab === 'chats'} onClick={() => handleTab('chats')} title="채팅" className="relative">
          <Icon name="chat" filled={activeTab === 'chats'} />
          {totalUnread > 0 && (
            <span className="absolute top-2 right-1 bg-badge-red text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold leading-none">
              {totalUnread > 999 ? '999+' : totalUnread}
            </span>
          )}
        </SidebarBtn>

        {/* More tab */}
        <SidebarBtn active={activeTab === 'more'} onClick={() => handleTab('more')} title="더보기">
          <Icon name="more_horiz" filled={activeTab === 'more'} />
        </SidebarBtn>

        {/* Category tab */}
        <SidebarBtn active={activeTab === 'category'} onClick={() => handleTab('category')} title="카테고리">
          <Icon name="grid_view" filled={activeTab === 'category'} />
        </SidebarBtn>
      </div>

      {/* Bottom icons */}
      <div className="mt-auto flex flex-col items-center py-6 gap-2">
        <SidebarBtn active={activeTab === 'chatbot'} onClick={() => handleTab('chatbot')} title="AI 챗봇">
          <Icon name="smart_toy" filled={activeTab === 'chatbot'} />
        </SidebarBtn>
        <SidebarBtn active={false} onClick={() => showToast('준비 중인 기능입니다')} title="알림">
          <Icon name="notifications" filled={false} />
        </SidebarBtn>
        <SidebarBtn active={false} onClick={onOpenSettings} title="설정">
          <Icon name="settings" filled={false} />
        </SidebarBtn>
      </div>
    </aside>
  )
}

function SidebarBtn({
  active,
  onClick,
  title,
  children,
  className = '',
}: {
  active: boolean
  onClick: () => void
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`flex flex-col items-center justify-center py-4 w-full transition-colors hover:bg-zinc-200 ${
        active ? 'text-on-surface' : 'text-[#474747]'
      } ${className}`}
    >
      {children}
    </button>
  )
}

function Icon({ name, filled }: { name: string; filled: boolean }) {
  return (
    <span
      className="material-symbols-outlined text-3xl"
      style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' ${filled ? 400 : 300}, 'GRAD' 0, 'opsz' 24` }}
    >
      {name}
    </span>
  )
}
