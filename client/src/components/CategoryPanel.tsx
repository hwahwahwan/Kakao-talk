import { CATEGORY_MAP, type CategoryId } from '../constants/categories'
import RecommendCard from './RecommendCard'

interface Props {
  categoryId: CategoryId | null
  panelIndex: 1 | 2
}

const CARD_COUNT = 3

export default function CategoryPanel({ categoryId, panelIndex }: Props) {
  const category = categoryId ? CATEGORY_MAP[categoryId] : null

  if (!category) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 border-r border-outline-variant/10 last:border-r-0 text-secondary bg-surface">
        <span
          className="material-symbols-outlined text-5xl opacity-30"
          style={{ fontVariationSettings: "'FILL' 0, 'wght' 200, 'GRAD' 0, 'opsz' 24" }}
        >
          visibility
        </span>
        <p className="text-xs text-center opacity-50 leading-relaxed">
          패널 {panelIndex}<br />카테고리를 선택하세요
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col border-r border-outline-variant/10 last:border-r-0 overflow-hidden bg-surface">
      <div className="px-4 py-3 border-b border-outline-variant/10 flex items-center gap-2 bg-surface-container-lowest">
        <span className="text-base leading-none">{category.emoji}</span>
        <span className="font-headline font-semibold text-sm text-on-surface">{category.label}</span>
        <span className="text-[10px] text-secondary ml-auto font-label">패널 {panelIndex}</span>
      </div>
      <div className="flex gap-3 p-4 overflow-x-auto hide-scrollbar">
        {Array.from({ length: CARD_COUNT }).map((_, i) => (
          <RecommendCard
            key={i}
            title={`${category.label} 추천 ${i + 1}`}
            subtitle="API 연동 예정"
            meta="Chapter 3"
          />
        ))}
      </div>
    </div>
  )
}
