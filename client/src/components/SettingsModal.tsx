import { useState } from 'react'
import { useChatStore } from '../store/useChatStore'
import Avatar from './Avatar'

interface Props {
  onClose: () => void
}

const MENU_ITEMS = [
  '계정', '보안', '알림', '친구', '채팅', '백업', '이모티콘', '화면', '통화', '실험실', '저장공간',
]

export default function SettingsModal({ onClose }: Props) {
  const [activeMenu, setActiveMenu] = useState('계정')
  const me = useChatStore((s) => s.me)
  const onlineUsers = useChatStore((s) => s.onlineUsers)
  const showToast = useChatStore((s) => s.showToast)

  return (
    <div
      className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl overflow-hidden flex"
        style={{ width: 620, height: 500 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 좌측 메뉴 */}
        <div className="w-[160px] bg-surface-container-low flex flex-col flex-shrink-0">
          {/* macOS 닫기 버튼 */}
          <div className="px-4 pt-4 pb-3">
            <button
              onClick={onClose}
              className="w-3 h-3 rounded-full bg-[#FF5F57] hover:brightness-90 transition-all flex-shrink-0"
              title="닫기"
            />
          </div>
          {/* 타이틀 */}
          <div className="px-4 pb-3">
            <h2 className="text-[15px] font-bold text-on-surface">설정</h2>
          </div>
          {/* 메뉴 */}
          <ul className="flex-1 overflow-y-auto">
            {MENU_ITEMS.map((item) => (
              <li key={item}>
                <button
                  onClick={() => setActiveMenu(item)}
                  className={`w-full text-left px-4 py-2 text-[13px] flex items-center justify-between transition-colors ${
                    activeMenu === item
                      ? 'bg-surface-container-high text-on-surface font-medium'
                      : 'text-secondary hover:bg-surface-container-high/60'
                  }`}
                >
                  <span>{item}</span>
                  {item === '백업' && (
                    <span className="w-2 h-2 rounded-full bg-badge-red flex-shrink-0" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* 우측 콘텐츠 */}
        <div className="flex-1 flex flex-col bg-white overflow-y-auto">
          {activeMenu === '계정' ? (
            <AccountTab
              me={me}
              friendCount={onlineUsers.length}
              onToast={() => showToast('준비 중인 기능입니다')}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-secondary text-sm">
              <div className="text-center">
                <div className="text-3xl mb-2">🚧</div>
                <button onClick={() => showToast('준비 중인 기능입니다')} className="hover:underline">
                  준비 중인 기능입니다
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface AccountTabProps {
  me: { id: string; name: string; email?: string } | null
  friendCount: number
  onToast: () => void
}

function AccountTab({ me, friendCount, onToast }: AccountTabProps) {
  if (!me) return null

  const displayEmail = me.email || `${me.name}@kakao.web`
  const displayId = me.id.slice(0, 8)

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* 계정 정보 */}
      <section>
        <h3 className="text-[15px] font-bold text-on-surface mb-3">계정 정보</h3>
        <div className="bg-surface rounded-xl overflow-hidden">
          <div className="flex items-center px-4 py-3 border-b border-outline-variant/20">
            <span className="w-16 text-[13px] text-secondary flex-shrink-0">계정</span>
            <span className="text-[13px] text-on-surface">{displayEmail}</span>
          </div>
          <div className="flex items-center px-4 py-3">
            <span className="w-16 text-[13px] text-secondary flex-shrink-0">ID</span>
            <span className="text-[13px] text-on-surface">{displayId}</span>
          </div>
        </div>
      </section>

      {/* 기본 프로필 */}
      <section>
        <h3 className="text-[15px] font-bold text-on-surface mb-3">기본프로필</h3>
        <div className="bg-surface rounded-xl px-4 py-3 flex items-center gap-3">
          <Avatar name={me.name} size={44} />
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-semibold text-on-surface">{me.name}</div>
            <div className="text-[12px] text-secondary">친구 {friendCount}명</div>
          </div>
          <div className="flex gap-3">
            <button onClick={onToast} className="text-[12px] text-secondary hover:text-on-surface transition-colors">
              편집
            </button>
            <button onClick={onToast} className="text-[12px] text-secondary hover:text-on-surface transition-colors">
              친구관리
            </button>
          </div>
        </div>
      </section>

      {/* 멀티프로필 */}
      <section>
        <h3 className="text-[15px] font-bold text-on-surface mb-1">
          멀티프로필 <span className="font-normal text-secondary">(0/3)</span>
        </h3>
        <p className="text-[12px] text-secondary mb-3">
          내 프로필을 여러 개 만들어 가족, 지인, 직장동료 등 카카오톡 친구별로 다르게 보여줄 수 있습니다.
        </p>
        <button
          onClick={onToast}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="w-11 h-11 rounded-full bg-[#F0F0F0] flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888888" strokeWidth={2}>
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
          <span className="text-[13px] text-on-surface">멀티프로필 만들기</span>
        </button>
      </section>
    </div>
  )
}
