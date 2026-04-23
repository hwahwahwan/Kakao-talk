import type { GazeData } from '../hooks/useGazeTracking'

export function getGazeScreenPosition(gazeData: GazeData): { x: number; y: number } | null {
  const { horizontalRatio, verticalRatio } = gazeData
  if (horizontalRatio == null || verticalRatio == null) return null

  return {
    x: horizontalRatio * window.innerWidth,
    y: verticalRatio * window.innerHeight,
  }
}

export function isGazingAt(element: HTMLElement | null, gazeData: GazeData): boolean {
  if (!element) return false
  const pos = getGazeScreenPosition(gazeData)
  if (!pos) return false

  const rect = element.getBoundingClientRect()
  return (
    pos.x >= rect.left &&
    pos.x <= rect.right &&
    pos.y >= rect.top &&
    pos.y <= rect.bottom
  )
}
