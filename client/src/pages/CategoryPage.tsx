import { useState, useCallback, useMemo } from 'react'
import CategoryGrid from '../components/CategoryGrid'
import CategoryPanel from '../components/CategoryPanel'
import ZoneCalibrationOverlay from '../components/ZoneCalibrationOverlay'
import { useGazeTracking } from '../hooks/useGazeTracking'
import { useCategoryGaze } from '../hooks/useCategoryGaze'
import { loadZoneCalibration, clearZoneCalibration } from '../utils/calibrationStorage'
import { CATEGORIES, type CategoryId } from '../constants/categories'

type PanelState = [CategoryId | null, CategoryId | null]

export default function CategoryPage() {
  const [panels, setPanels] = useState<PanelState>([null, null])
  const [calibrating, setCalibrating] = useState(false)
  const { gazeData, connected } = useGazeTracking()
  const isZoneCalibrated = loadZoneCalibration() !== null

  const categoryIds = useMemo(() => CATEGORIES.map((c) => c.id), [])

  const handleSelect = useCallback((id: CategoryId) => {
    setPanels((prev) => {
      if (prev[0] === id || prev[1] === id) return prev
      return [prev[1], id]
    })
  }, [])

  const handleDeselect = useCallback((panelIndex: 1 | 2) => {
    setPanels((prev) => panelIndex === 1 ? [null, prev[1]] : [prev[0], null])
  }, [])

  const handleCalibrationComplete = useCallback(() => {
    setCalibrating(false)
  }, [])

  useCategoryGaze({ gazeData, categoryIds, onSelect: handleSelect })

  return (
    <div className="flex flex-col h-full bg-surface relative">
      <header className="h-16 flex items-center justify-between px-6 border-b border-outline-variant/10">
        <h1 className="text-xl font-bold font-headline tracking-tight text-on-surface">카테고리</h1>
        <div className="flex items-center gap-3">
          {connected && (
            <button
              onClick={() => {
                clearZoneCalibration()
                setCalibrating(true)
              }}
              className="text-xs px-2 py-1 rounded border border-outline-variant/30 text-secondary hover:text-on-surface hover:border-outline-variant/60 transition-colors"
            >
              {isZoneCalibrated ? '구역 재보정' : '구역 보정 필요'}
            </button>
          )}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${connected ? (isZoneCalibrated ? 'bg-green-500' : 'bg-yellow-400') : 'bg-zinc-300'}`} />
            <span className="text-xs text-secondary">
              {connected ? (isZoneCalibrated ? '시선 추적 연결됨' : '구역 보정 필요') : '시선 추적 대기 중'}
            </span>
          </div>
        </div>
      </header>

      <div className="border-b border-outline-variant/10 bg-surface-container-lowest">
        <CategoryGrid selectedIds={panels} onSelect={handleSelect} />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <CategoryPanel categoryId={panels[0]} panelIndex={1} onClose={() => handleDeselect(1)} />
        <CategoryPanel categoryId={panels[1]} panelIndex={2} onClose={() => handleDeselect(2)} />
      </div>

      {calibrating && (
        <ZoneCalibrationOverlay
          gazeData={gazeData}
          onComplete={handleCalibrationComplete}
          onCancel={() => setCalibrating(false)}
        />
      )}

      {gazeData && (
        <div className="pointer-events-none fixed bottom-2 left-2 z-50 bg-black/70 text-white text-[10px] font-mono px-2 py-1 rounded leading-relaxed">
          ratio: {gazeData.horizontalRatio?.toFixed(3)} | L:{gazeData.isLeft ? '●' : '○'} C:{gazeData.isCenter ? '●' : '○'} R:{gazeData.isRight ? '●' : '○'}
        </div>
      )}
    </div>
  )
}
