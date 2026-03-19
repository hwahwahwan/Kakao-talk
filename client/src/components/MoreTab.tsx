import { useChatStore } from '../store/useChatStore'
import Avatar from './Avatar'

const SERVICES = [
  { label: '다음', icon: '🌐' },
  { label: '메일', icon: '✉️' },
  { label: '캘린더', icon: '📅' },
  { label: '톡클라우드', icon: '☁️' },
  { label: '이모티콘', icon: '😊' },
  { label: '선물하기', icon: '🎁' },
  { label: '톡딜', icon: '🏷️' },
  { label: '실험실', icon: '🧪' },
  { label: '내 결제', icon: '💳' },
  { label: '공지사항', icon: '📢' },
  { label: '환경설정', icon: '⚙️' },
  { label: '도움말', icon: '❓' },
]

export default function MoreTab() {
  const me = useChatStore((s) => s.me)
  const showToast = useChatStore((s) => s.showToast)

  return (
    <div className="flex flex-col h-full bg-[#F9F9F9]">
      {/* 헤더 */}
      <div className="px-4 py-3 border-b border-[#EBEBEB] bg-white">
        <h2 className="text-[18px] font-bold text-[#1A1A1A]">더보기</h2>
      </div>

      {/* 내 프로필 카드 */}
      <div className="bg-white mx-4 mt-4 rounded-xl p-4 flex items-center gap-3 shadow-sm">
        <Avatar name={me?.name ?? '?'} size={44} />
        <div>
          <div className="text-[15px] font-semibold text-[#1A1A1A]">{me?.name}</div>
          <div className="text-[12px] text-[#888888]">카카오계정</div>
        </div>
      </div>

      {/* 서비스 그리드 */}
      <div className="grid grid-cols-4 gap-3 p-4">
        {SERVICES.map((svc) => (
          <button
            key={svc.label}
            onClick={() => showToast('준비 중인 기능입니다')}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white transition-colors"
          >
            <span className="text-2xl">{svc.icon}</span>
            <span className="text-[11px] text-[#1A1A1A]">{svc.label}</span>
          </button>
        ))}
      </div>

      {/* 카카오톡 정보 */}
      <div className="mt-auto px-4 pb-4">
        <button
          onClick={() => showToast('준비 중인 기능입니다')}
          className="w-full py-2 border border-[#EBEBEB] rounded-lg text-sm text-[#888888] hover:bg-white transition-colors"
        >
          ℹ️ KakaoTalk 정보
        </button>
      </div>
    </div>
  )
}
