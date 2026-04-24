import { useEffect, useRef } from 'react'
import type { GazeData } from './useGazeTracking'
import type { CategoryId } from '../constants/categories'
import { loadZoneCalibration } from '../utils/calibrationStorage'

interface UseCategoryGazeOptions {
  gazeData: GazeData | null
  categoryIds: CategoryId[]  // [leftZone, centerZone, rightZone]
  onSelect: (id: CategoryId) => void
  thresholdMs?: number
}

const CONSENSUS_FRAMES = 10
const CONSENSUS_THRESHOLD = 7

function detectZone(gazeData: GazeData, categoryIds: CategoryId[]): CategoryId | null {
  const ratio = gazeData.horizontalRatio
  const cal = loadZoneCalibration()

  if (ratio != null && cal) {
    if (ratio >= cal.leftThreshold) return categoryIds[0] ?? null
    if (ratio <= cal.rightThreshold) return categoryIds[2] ?? null
    return categoryIds[1] ?? null
  }

  // Fallback to library flags when no calibration saved
  if (gazeData.isLeft) return categoryIds[0] ?? null
  if (gazeData.isCenter) return categoryIds[1] ?? null
  if (gazeData.isRight) return categoryIds[2] ?? null
  return null
}

export function useCategoryGaze({
  gazeData,
  categoryIds,
  onSelect,
  thresholdMs = 2000,
}: UseCategoryGazeOptions): void {
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect

  const stateRef = useRef({ gazedId: null as CategoryId | null, timer: 0, lastTs: -1 })
  const histRef = useRef<(CategoryId | null)[]>([])

  useEffect(() => {
    if (!gazeData) {
      Object.assign(stateRef.current, { gazedId: null, timer: 0, lastTs: -1 })
      histRef.current = []
      return
    }

    const now = performance.now()
    const { lastTs } = stateRef.current
    const elapsed = lastTs >= 0 ? now - lastTs : 0
    stateRef.current.lastTs = now

    const detected = detectZone(gazeData, categoryIds)

    histRef.current.push(detected)
    if (histRef.current.length > CONSENSUS_FRAMES) histRef.current.shift()

    const counts = new Map<CategoryId | null, number>()
    histRef.current.forEach(id => counts.set(id, (counts.get(id) ?? 0) + 1))
    const [winner, winCount] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]
    const stable = winCount >= CONSENSUS_THRESHOLD ? winner : null

    if (stable !== stateRef.current.gazedId) {
      stateRef.current.gazedId = stable
      stateRef.current.timer = 0
      return
    }

    if (stable === null) return

    stateRef.current.timer += elapsed
    if (stateRef.current.timer >= thresholdMs) {
      onSelectRef.current(stable)
      stateRef.current.timer = 0
    }
  }, [gazeData, categoryIds, thresholdMs])
}
