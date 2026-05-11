import { useState, useEffect, useRef } from 'react'
import { useGazeTracking } from '../hooks/useGazeTracking'
import { detectGazeZone, type GazeZone } from '../utils/gazeUtils'
import CalibrationOverlay from './CalibrationOverlay'

const CONSENSUS_FRAMES = 8
const CONSENSUS_THRESHOLD = 5

const PUPIL_OFFSET: Record<GazeZone, number> = { left: -10, center: 0, right: 10 }

function Eye({ zone, isBlinking }: { zone: GazeZone | null; isBlinking: boolean }) {
  const offsetX = zone ? PUPIL_OFFSET[zone] : 0

  return (
    <div
      className="relative bg-white rounded-full overflow-hidden"
      style={{ width: 52, height: 52, border: '3px solid #111' }}
    >
      {isBlinking ? (
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 bg-[#111]" style={{ height: 4 }} />
      ) : (
        <div
          className="absolute top-1/2 left-1/2 rounded-full bg-[#111]"
          style={{
            width: 30,
            height: 30,
            transform: `translate(calc(-50% + ${offsetX}px), -50%)`,
            transition: 'transform 120ms ease',
          }}
        >
          <div
            className="absolute rounded-full bg-white"
            style={{ width: 9, height: 9, top: 4, right: 3 }}
          />
        </div>
      )}
    </div>
  )
}

export default function GazeCursor() {
  const { gazeData, connected } = useGazeTracking()
  const [calibrating, setCalibrating] = useState(false)
  const [zone, setZone] = useState<GazeZone | null>(null)
  const histRef = useRef<(GazeZone | null)[]>([])

  useEffect(() => {
    if (!gazeData) {
      histRef.current = []
      setZone(null)
      return
    }

    const detected = detectGazeZone(gazeData)
    histRef.current.push(detected)
    if (histRef.current.length > CONSENSUS_FRAMES) histRef.current.shift()

    const counts = new Map<GazeZone | null, number>()
    histRef.current.forEach(z => counts.set(z, (counts.get(z) ?? 0) + 1))
    const [winner, winCount] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]
    setZone(winCount >= CONSENSUS_THRESHOLD ? winner : null)
  }, [gazeData])

  if (!connected) return null

  return (
    <>
      <div className="pointer-events-none fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex gap-2">
        <Eye zone={zone} isBlinking={gazeData?.isBlinking ?? false} />
        <Eye zone={zone} isBlinking={gazeData?.isBlinking ?? false} />
      </div>

      <button
        onClick={() => setCalibrating(true)}
        className="fixed bottom-2 right-2 z-[9998] text-[10px] px-2 py-1 rounded bg-black/60 text-white hover:bg-black/80 transition-colors"
      >
        눈 보정
      </button>

      {calibrating && (
        <CalibrationOverlay
          gazeData={gazeData}
          onComplete={() => setCalibrating(false)}
          onCancel={() => setCalibrating(false)}
        />
      )}
    </>
  )
}
