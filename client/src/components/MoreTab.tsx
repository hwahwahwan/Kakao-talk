import type { ReactNode } from 'react'
import { useChatStore } from '../store/useChatStore'
import Avatar from './Avatar'

interface Service {
  label: string
  icon: ReactNode
  action?: 'settings'
}

const SERVICES: Service[] = [
  { label: '다음', icon: <DaumIcon /> },
  { label: '메일', icon: <MailIcon /> },
  { label: '캘린더', icon: <CalendarIcon /> },
  { label: '톡클라우드', icon: <CloudIcon /> },
  { label: '이모티콘', icon: <SmileyIcon /> },
  { label: '선물하기', icon: <GiftIcon /> },
  { label: '톡딜', icon: <DealIcon /> },
  { label: '실험실', icon: <LabIcon /> },
  { label: '내 결제', icon: <PaymentIcon /> },
  { label: '공지사항', icon: <NoticeIcon /> },
  { label: '환경설정', icon: <SettingsIcon />, action: 'settings' as const },
  { label: '도움말', icon: <HelpIcon /> },
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
    <div className="flex flex-col h-full bg-[#F9F9F9]">
      {/* 헤더 */}
      <div className="px-4 py-3 border-b border-[#EBEBEB] bg-white">
        <h2 className="text-[18px] font-bold text-[#1A1A1A]">더보기</h2>
      </div>

      {/* 내 프로필 카드 */}
      <div className="bg-white mx-4 mt-4 rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm">
        <Avatar name={me?.name ?? '?'} size={44} />
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-semibold text-[#1A1A1A]">{me?.name}</div>
          <div className="text-[12px] text-[#888888] truncate">{me?.email ?? ''}</div>
        </div>
        <KakaoShieldIcon />
      </div>

      {/* 서비스 그리드 */}
      <div className="grid grid-cols-4 gap-1 p-4">
        {SERVICES.map((svc) => (
          <button
            key={svc.label}
            onClick={() => handleServiceClick(svc.action)}
            className="flex flex-col items-center gap-1.5 py-3 px-1 rounded-xl hover:bg-white transition-colors"
          >
            <span className="text-[#1A1A1A]">{svc.icon}</span>
            <span className="text-[11px] text-[#1A1A1A]">{svc.label}</span>
          </button>
        ))}
      </div>

      {/* 하단: 카카오톡 정보 + 업데이트 */}
      <div className="mt-auto border-t border-[#EBEBEB] bg-white">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => showToast('준비 중인 기능입니다')}
            className="flex items-center gap-1.5 text-[13px] text-[#888888] hover:text-[#1A1A1A] transition-colors"
          >
            <InfoIcon />
            <span>카카오톡 정보</span>
          </button>
          <button
            onClick={() => showToast('준비 중인 기능입니다')}
            className="px-4 py-1.5 text-[13px] border border-[#EBEBEB] rounded-lg text-[#1A1A1A] hover:bg-[#F9F9F9] transition-colors"
          >
            업데이트
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── 서비스 아이콘 ── */

function DaumIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M9 8h3.5a3.5 3.5 0 0 1 0 7H9V8z" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m2 7 10 7 10-7" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
      <path d="m9 16 2 2 4-4" />
    </svg>
  )
}

function CloudIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
    </svg>
  )
}

function SmileyIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <circle cx="9" cy="9" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="9" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function GiftIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="8" width="18" height="13" rx="1" />
      <path d="M12 8v13M3 13h18" />
      <path d="M8 8a2 2 0 0 1 4 0" />
      <path d="M16 8a2 2 0 0 0-4 0" />
    </svg>
  )
}

function DealIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="5" x2="5" y2="19" />
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  )
}

function LabIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 2h6" />
      <path d="M9 2v8L4 20h16L15 10V2" />
      <path d="M7.5 16h9" />
    </svg>
  )
}

function PaymentIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
      <circle cx="7" cy="15" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function NoticeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 5H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h5l6 3V2l-6 3z" />
      <line x1="19" y1="9" x2="19" y2="15" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

function HelpIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <circle cx="12" cy="17" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

/* ── 프로필 아이콘 ── */

function KakaoShieldIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      <path d="M15 3L4 8v8c0 7 5 12.5 11 14 6-1.5 11-7 11-14V8L15 3z" fill="#3B82F6" />
      <circle cx="15" cy="17" r="5" fill="#FEE500" />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  )
}
