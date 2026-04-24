import { useEffect, useState } from 'react'
import { CATEGORY_MAP, CATEGORY_SERVICE_MAP, type CategoryId } from '../constants/categories'
import type { RecommendItem } from '../types/recommend'
import RecommendCard from './RecommendCard'

interface Props {
  categoryId: CategoryId | null
  panelIndex: 1 | 2
  onClose?: () => void
}

type PanelStatus = 'idle' | 'loading' | 'error' | 'done'

export default function CategoryPanel({ categoryId, panelIndex, onClose }: Props) {
  const [status, setStatus] = useState<PanelStatus>('idle')
  const [items, setItems] = useState<RecommendItem[]>([])

  useEffect(() => {
    if (!categoryId) {
      setStatus('idle')
      setItems([])
      return
    }
    setStatus('loading')
    setItems([])
    CATEGORY_SERVICE_MAP[categoryId]()
      .then((data) => { setItems(data); setStatus('done') })
      .catch(() => setStatus('error'))
  }, [categoryId])

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
        {onClose && (
          <button
            onClick={onClose}
            className="ml-2 text-secondary hover:text-on-surface transition-colors"
            aria-label="패널 닫기"
          >
            <span className="material-symbols-outlined text-base leading-none"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" }}>
              close
            </span>
          </button>
        )}
      </div>

      <div className="flex gap-3 p-4 overflow-x-auto hide-scrollbar">
        {status === 'loading' && (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-36 h-36 rounded-xl bg-surface-container-high animate-pulse"
            />
          ))
        )}
        {status === 'done' && items.map((item) => (
          <RecommendCard key={item.id} {...item} />
        ))}
        {status === 'error' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 py-8 text-secondary opacity-60">
            <span className="material-symbols-outlined text-3xl">warning</span>
            <p className="text-xs">데이터를 불러올 수 없습니다</p>
          </div>
        )}
      </div>
    </div>
  )
}
