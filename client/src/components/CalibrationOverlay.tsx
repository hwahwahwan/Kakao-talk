import { useState, useEffect, useRef } from 'react'
import type { GazeData } from '../hooks/useGazeTracking'
import { saveCalibration } from '../utils/calibrationStorage'

const STEPS = [
  { x: 0.1, y: 0.1, label: '좌상단' },
  { x: 0.9, y: 0.1, label: '우상단' },
  { x: 0.9, y: 0.9, label: '우하단' },
  { x: 0.1, y: 0.9, label: '좌하단' },
]
const HOLD_MS = 2500
const SAMPLE_WINDOW_MS = 1500
const CIRCUMFERENCE = 2 * Math.PI * 20

interface Props {
  gazeData: GazeData | null
  onComplete: () => void
  onCancel: () => void
}

export default function CalibrationOverlay({ gazeData, onComplete, onCancel }: Props) {
  const [step, setStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const startRef = useRef<number | null>(null)
  const samplesRef = useRef<{ h: number; v: number }[]>([])
  const recordedRef = useRef<{ h: number; v: number }[]>([])

  useEffect(() => {
    if (step >= STEPS.length) return
    const h = gazeData?.horizontalRatio
    const v = gazeData?.verticalRatio
    if (h == null || v == null) return

    const now = performance.now()
    if (startRef.current === null) startRef.current = now
    const elapsed = now - startRef.current
    setProgress(Math.min(elapsed / HOLD_MS, 1))

    if (elapsed >= HOLD_MS - SAMPLE_WINDOW_MS && !gazeData?.isBlinking) {
      samplesRef.current.push({ h, v })
    }

    if (elapsed >= HOLD_MS) {
      const n = samplesRef.current.length
      if (n === 0) { startRef.current = null; return }

      const medianOf = (arr: number[]) => {
        const s = [...arr].sort((a, b) => a - b)
        return s[Math.floor(s.length / 2)]
      }
      const hs = samplesRef.current.map(s => s.h)
      const vs = samplesRef.current.map(s => s.v)
      recordedRef.current = [...recordedRef.current, { h: medianOf(hs), v: medianOf(vs) }]
      samplesRef.current = []
      startRef.current = null

      if (step + 1 >= STEPS.length) {
        const [tl, tr, br, bl] = recordedRef.current
        const M = 0.04
        saveCalibration({
          hMin: Math.min(tr.h, br.h) - M,
          hMax: Math.max(tl.h, bl.h) + M,
          vMin: Math.min(tl.v, tr.v) - M,
          vMax: Math.max(br.v, bl.v) + M,
        })
        onComplete()
      } else {
        setStep(s => s + 1)
        setProgress(0)
      }
    }
  }, [gazeData, step, onComplete])

  if (step >= STEPS.length) return null
  const pt = STEPS[step]

  return (
    <div className="fixed inset-0 z-50 bg-black/90">
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
        <p className="text-white text-lg font-semibold mb-1">{pt.label}의 원을 바라보세요</p>
        <p className="text-gray-400 text-sm">{step + 1} / {STEPS.length} — 원이 채워질 때까지 고정</p>
      </div>

      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${pt.x * 100}%`, top: `${pt.y * 100}%` }}
        >
          <svg width="56" height="56" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
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
