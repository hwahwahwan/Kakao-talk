import type { GazeData } from '../hooks/useGazeTracking'
import { GAZE_H_MIN, GAZE_H_MAX, GAZE_V_MIN, GAZE_V_MAX, GAZE_HIT_PADDING } from '../constants/gazeConfig'
import { loadCalibration, loadZoneCalibration } from './calibrationStorage'

export type GazeZone = 'left' | 'center' | 'right'

export function detectGazeZone(gazeData: GazeData): GazeZone | null {
  const ratio = gazeData.horizontalRatio
  const cal = loadZoneCalibration()

  if (ratio != null && cal) {
    if (ratio >= cal.leftThreshold) return 'left'
    if (ratio <= cal.rightThreshold) return 'right'
    return 'center'
  }

  if (gazeData.isLeft) return 'left'
  if (gazeData.isRight) return 'right'
  if (gazeData.isCenter) return 'center'
  return null
}

const norm = (v: number, min: number, max: number) =>
  Math.max(0, Math.min(1, (v - min) / (max - min)))

function getRange() {
  const cal = loadCalibration()
  return cal
    ? { hMin: cal.hMin, hMax: cal.hMax, vMin: cal.vMin, vMax: cal.vMax }
    : { hMin: GAZE_H_MIN, hMax: GAZE_H_MAX, vMin: GAZE_V_MIN, vMax: GAZE_V_MAX }
}

export function getGazeScreenPosition(gazeData: GazeData): { x: number; y: number } | null {
  const { horizontalRatio, verticalRatio } = gazeData
  if (horizontalRatio == null || verticalRatio == null) return null
  const { hMin, hMax, vMin, vMax } = getRange()
  // horizontal_ratio: 0=right, 1=left → invert with (1 - norm) for correct screen direction
  return {
    x: (1 - norm(horizontalRatio, hMin, hMax)) * window.innerWidth,
    y: norm(verticalRatio, vMin, vMax) * window.innerHeight,
  }
}

export function isGazingAt(element: HTMLElement | null, gazeData: GazeData): boolean {
  if (!element) return false
  const pos = getGazeScreenPosition(gazeData)
  if (!pos) return false

  const rect = element.getBoundingClientRect()
  const p = GAZE_HIT_PADDING
  return (
    pos.x >= rect.left - p &&
    pos.x <= rect.right + p &&
    pos.y >= rect.top - p &&
    pos.y <= rect.bottom + p
  )
}
