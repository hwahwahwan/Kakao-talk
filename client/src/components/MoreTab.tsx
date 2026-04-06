import { useChatStore } from '../store/useChatStore'

interface Service {
  label: string
  icon: string  // Material Symbol name
  action?: 'settings'
  badge?: boolean
}

const SERVICES: Service[] = [
  { label: '다음', icon: 'language' },
  { label: '메일', icon: 'mail' },
  { label: '캘린더', icon: 'calendar_today' },
  { label: '톡클라우드', icon: 'cloud' },
  { label: '이모티콘', icon: 'mood' },
  { label: '선물하기', icon: 'featured_seasonal_and_gifts' },
  { label: '톡딜', icon: 'percent' },
  { label: '실험실', icon: 'science' },
  { label: '내 결제', icon: 'credit_card' },
  { label: '공지사항', icon: 'campaign', badge: true },
  { label: '환경설정', icon: 'settings', action: 'settings' },
  { label: '도움말', icon: 'help' },
]

interface Props {
  onOpenSettings: () => void
}

export default function MoreTab({ onOpenSettings }: Props) {
  const me = useChatStore((s) => s.me)
  const showToast = useChatStore((s) => s.showToast)

  const handleServiceClick = (action?: 'settings') => {
    if (action === 'settings') return onOpenSettings()
    showToast('준비 중인 기능입니다')
  }

  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto hide-scrollbar">
      {/* Header */}
      <header className="px-8 pt-8 pb-4">
        <h1 className="text-lg font-bold text-on-surface">더보기</h1>
      </header>

      <div className="px-8 space-y-8">
        {/* Profile card */}
        <section className="bg-[#F8F8F8] p-6 rounded-lg border border-zinc-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-on-surface">{me?.name ?? '사용자'}</h2>
            <p className="text-secondary text-sm">{me?.email ?? ''}</p>
          </div>
          <div className="relative">
            <div className="w-12 h-12 bg-[#3667EE] rounded-xl flex items-center justify-center">
              <span
                className="material-symbols-outlined text-white text-3xl"
                style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
              >
                shield
              </span>
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary-container rounded-full border-2 border-[#F8F8F8] flex items-center justify-center">
              <div className="w-2 h-2 bg-[#3667EE] rounded-full" />
            </div>
          </div>
        </section>

        {/* Service grid (4x3) */}
        <section className="grid grid-cols-4 gap-y-10 py-4">
          {SERVICES.map((svc) => (
            <button
              key={svc.label}
              onClick={() => handleServiceClick(svc.action)}
              className="flex flex-col items-center gap-2 cursor-pointer relative"
            >
              <div className="w-10 h-10 flex items-center justify-center relative">
                <span className="material-symbols-outlined text-3xl text-zinc-800">{svc.icon}</span>
                {svc.badge && (
                  <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-badge-red rounded-full" />
                )}
              </div>
              <span className="text-xs font-medium text-secondary">{svc.label}</span>
            </button>
          ))}
        </section>

        {/* Bottom info */}
        <div className="border-t border-zinc-100">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-zinc-800">info</span>
              <span className="text-sm font-medium text-on-surface">카카오톡 정보</span>
            </div>
            <span className="text-xs text-secondary">ver. 0.0.6</span>
          </div>
        </div>
      </div>
    </div>
  )
}
