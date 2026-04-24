import { useEffect, useState } from 'react'
import { CATEGORY_MAP, CATEGORY_SERVICE_MAP, type CategoryId } from '../constants/categories'
import type { RecommendItem } from '../types/recommend'
import RecommendCard from './RecommendCard'

const PAGE_SIZE = 4

interface Props {
  categoryId: CategoryId | null
}

type PanelStatus = 'idle' | 'loading' | 'error' | 'done'

export default function CategoryPanel({ categoryId }: Props) {
  const [status, setStatus] = useState<PanelStatus>('idle')
  const [items, setItems] = useState<RecommendItem[]>([])
  const [page, setPage] = useState(0)

  useEffect(() => {
    if (!categoryId) { setStatus('idle'); setItems([]); setPage(0); return }
    setStatus('loading'); setItems([]); setPage(0)
    CATEGORY_SERVICE_MAP[categoryId]()
      .then((data) => { setItems(data); setStatus('done') })
      .catch(() => setStatus('error'))
  }, [categoryId])

  const category = categoryId ? CATEGORY_MAP[categoryId] : null
  const totalPages = Math.ceil(items.length / PAGE_SIZE)
  const pageItems = items.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)
  const startRank = page * PAGE_SIZE + 1
  const endRank = startRank + pageItems.length - 1

  if (!category) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-secondary bg-surface">
        <span
          className="material-symbols-outlined text-5xl opacity-30"
          style={{ fontVariationSettings: "'FILL' 0, 'wght' 200, 'GRAD' 0, 'opsz' 24" }}
        >
          visibility
        </span>
        <p className="text-sm opacity-50">카테고리를 선택하세요</p>
      </div>
    )
  }

  return (
    <section className="flex-1 flex flex-col overflow-hidden bg-white px-8 py-7">
      <header className="mb-5">
        <div className="flex items-center gap-2">
          <span className="text-base leading-none">{category.emoji}</span>
          <h2 className="text-xl font-bold tracking-[-0.01em] text-[#1b1b1b]">{category.label}</h2>
        </div>
        {status === 'done' && (
          <p className="mt-1.5 ml-6 text-xs text-[#9a9a9a]">
            {category.panelLabel} · {items.length}{category.unit}
          </p>
        )}
      </header>

      <div className="flex-1 overflow-hidden">
        {status === 'loading' && (
          <div className="grid grid-cols-4 gap-[18px]">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden" style={{ aspectRatio: '3/4' }}>
                <div className="w-full h-full bg-[#f3f3f3] animate-pulse" />
              </div>
            ))}
          </div>
        )}
        {status === 'done' && (
          <div className="grid grid-cols-4 gap-[18px]">
            {pageItems.map((item, i) => (
              <RecommendCard
                key={item.id}
                rank={startRank + i}
                image={item.image}
                title={item.title}
                subtitle={item.subtitle}
              />
            ))}
          </div>
        )}
        {status === 'error' && (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-secondary opacity-60">
            <span className="material-symbols-outlined text-3xl">warning</span>
            <p className="text-xs">데이터를 불러올 수 없습니다</p>
          </div>
        )}
      </div>

      {status === 'done' && totalPages > 1 && (
        <div className="mt-5 flex items-center justify-between text-[11px] text-[#aaa]">
          <span className="font-mono">{startRank}-{endRank} / {items.length}</span>
          <div className="flex gap-1.5">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`h-1.5 rounded-full transition-all ${i === page ? 'w-[18px] bg-[#1b1b1b]' : 'w-1.5 bg-[#dcdcdc]'}`}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
