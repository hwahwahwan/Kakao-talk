import { useChatStore } from '../store/useChatStore'

export default function FilterChips() {
  const showToast = useChatStore((s) => s.showToast)

  return (
    <div className="flex gap-2 px-4 py-2 overflow-x-auto border-b border-[#EBEBEB]">
      <Chip active={true} onClick={() => {}}>전체</Chip>
      <Chip active={false} onClick={() => showToast('준비 중인 기능입니다')}>안읽음</Chip>
      <Chip active={false} onClick={() => showToast('준비 중인 기능입니다')}>즐겨찾기</Chip>
    </div>
  )
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-sm font-medium flex-shrink-0 transition-colors ${
        active
          ? 'bg-[#1A1A1A] text-white'
          : 'bg-[#F9F9F9] text-[#888888] hover:bg-[#EBEBEB]'
      }`}
    >
      {children}
    </button>
  )
}
