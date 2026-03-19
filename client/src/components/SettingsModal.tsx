import { useState } from 'react'
import { useChatStore } from '../store/useChatStore'

interface Props {
  onClose: () => void
}

const MENU_ITEMS = [
  '계정', '보안', '알림', '친구', '채팅', '백업', '이모티콘', '화면', '통화', '실험실', '저장공간',
]

export default function SettingsModal({ onClose }: Props) {
  const [activeMenu, setActiveMenu] = useState('계정')
  const showToast = useChatStore((s) => s.showToast)

  return (
    <div
      className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl overflow-hidden flex"
        style={{ width: 600, height: 480 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 좌측 메뉴 */}
        <div className="w-[140px] bg-[#F9F9F9] border-r border-[#EBEBEB] py-4 flex-shrink-0">
          <div className="px-4 mb-4">
            <h2 className="text-[16px] font-bold text-[#1A1A1A]">설정</h2>
          </div>
          <ul>
            {MENU_ITEMS.map((item) => (
              <li key={item}>
                <button
                  onClick={() => setActiveMenu(item)}
                  className={`w-full text-left px-4 py-2 text-[14px] flex items-center justify-between transition-colors ${
                    activeMenu === item
                      ? 'bg-[#EBEBEB] text-[#1A1A1A] font-medium'
                      : 'text-[#888888] hover:bg-[#EBEBEB]/50'
                  }`}
                >
                  <span>{item}</span>
                  {item === '백업' && (
                    <span className="w-2 h-2 rounded-full bg-[#FE4141] flex-shrink-0" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* 우측 콘텐츠 */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#EBEBEB]">
            <h3 className="text-[16px] font-semibold text-[#1A1A1A]">{activeMenu}</h3>
            <button
              onClick={onClose}
              className="text-[#888888] hover:text-[#1A1A1A] transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center text-[#888888] text-sm">
            <div className="text-center">
              <div className="text-3xl mb-2">🚧</div>
              <button
                onClick={() => showToast('준비 중인 기능입니다')}
                className="hover:underline"
              >
                준비 중인 기능입니다
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
