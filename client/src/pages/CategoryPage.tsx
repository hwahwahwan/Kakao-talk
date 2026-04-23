import { useState } from 'react'
import CategoryGrid from '../components/CategoryGrid'
import CategoryPanel from '../components/CategoryPanel'
import { useGazeTracking } from '../hooks/useGazeTracking'
import type { CategoryId } from '../constants/categories'

type PanelState = [CategoryId | null, CategoryId | null]

export default function CategoryPage() {
  const [panels, setPanels] = useState<PanelState>([null, null])
  const { connected } = useGazeTracking()

  const handleSelect = (id: CategoryId) => {
    setPanels((prev) => {
      if (prev[0] === id || prev[1] === id) return prev
      return [prev[1], id]
    })
  }

  return (
    <div className="flex flex-col h-full bg-surface">
      <header className="h-16 flex items-center justify-between px-6 border-b border-outline-variant/10">
        <h1 className="text-xl font-bold font-headline tracking-tight text-on-surface">카테고리</h1>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-zinc-300'}`} />
          <span className="text-xs text-secondary">
            {connected ? '시선 추적 연결됨' : '시선 추적 대기 중'}
          </span>
        </div>
      </header>

      <div className="border-b border-outline-variant/10 bg-surface-container-lowest">
        <CategoryGrid selectedIds={panels} onSelect={handleSelect} />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <CategoryPanel categoryId={panels[0]} panelIndex={1} />
        <CategoryPanel categoryId={panels[1]} panelIndex={2} />
      </div>
    </div>
  )
}
