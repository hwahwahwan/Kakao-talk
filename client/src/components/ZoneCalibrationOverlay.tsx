import { useState, useEffect, useRef } from 'react'
import type { GazeData } from '../hooks/useGazeTracking'
import { saveZoneCalibration } from '../utils/calibrationStorage'

const STEPS = [
  { label: '왼쪽 카드를 봐주세요', hint: '영화 🎬 카드를 바라보세요', x: 0.17, y: 0.22 },
  { label: '가운데 카드를 봐주세요', hint: '여행 ✈️ 카드를 바라보세요', x: 0.50, y: 0.22 },
  { label: '오른쪽 카드를 봐주세요', hint: '책 📚 카드를 바라보세요', x: 0.83, y: 0.22 },
]

const HOLD_MS = 2000
const CIRCUMFERENCE = 2 * Math.PI * 20

interface Props {
  gazeData: GazeData | null
  onComplete: () => void
  onCancel: () => void
}

const median = (arr: number[]) => {
  const s = [...arr].sort((a, b) => a - b)
  return s[Math.floor(s.length / 2)]
}

export default function ZoneCalibrationOverlay({ gazeData, onComplete, onCancel }: Props) {
  const [step, setStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const startRef = useRef<number | null>(null)
  const samplesRef = useRef<number[]>([])
  const recordedRef = useRef<number[]>([])

  useEffect(() => {
    if (step >= STEPS.length) return
    const ratio = gazeData?.horizontalRatio
    if (ratio == null || gazeData?.isBlinking) return

    const now = performance.now()
    if (startRef.current === null) startRef.current = now
    const elapsed = now - startRef.current
    setProgress(Math.min(elapsed / HOLD_MS, 1))

    samplesRef.current.push(ratio)

    if (elapsed >= HOLD_MS) {
      if (samplesRef.current.length === 0) { startRef.current = null; return }

      recordedRef.current.push(median(samplesRef.current))
      samplesRef.current = []
      startRef.current = null

      if (step + 1 >= STEPS.length) {
        const [leftRatio, centerRatio, rightRatio] = recordedRef.current
        saveZoneCalibration({
          leftThreshold: (leftRatio + centerRatio) / 2,
          rightThreshold: (rightRatio + centerRatio) / 2,
        })
        onComplete()
      } else {
        setStep(s => s + 1)
        setProgress(0)
      }
    }
  }, [gazeData, step, onComplete])

  if (step >= STEPS.length) return null
  const current = STEPS[step]

  return (
    <div className="fixed inset-0 z-50 bg-black/90">
      {/* 중앙 안내 텍스트 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none gap-2">
        <p className="text-white text-xl font-semibold">{current.label}</p>
        <p className="text-gray-400 text-sm">{current.hint}</p>
        <p className="text-gray-500 text-xs mt-1">{step + 1} / {STEPS.length} — 원이 채워질 때까지 유지</p>
        {gazeData?.horizontalRatio != null && (
          <p className="text-gray-600 text-xs font-mono mt-2">ratio: {gazeData.horizontalRatio.toFixed(3)}</p>
        )}
      </div>

      {/* 카드 위치에 맞춘 보정 원 */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${current.x * 100}%`, top: `${current.y * 100}%` }}
        >
          <svg width="64" height="64" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
            <circle cx="24" cy="24" r="4" fill="white" />
            <circle
              cx="24" cy="24" r="20"
              fill="none" stroke="#22c55e" strokeWidth="3"
              strokeDasharray={`${progress * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
              strokeLinecap="round"
              transform="rotate(-90 24 24)"
            />
          </svg>
        </div>
      </div>

      <button
        onClick={onCancel}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-400 hover:text-white text-sm"
      >
        취소
      </button>
    </div>
  )
}
