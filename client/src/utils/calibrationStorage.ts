export interface GazeCalibration {
  hMin: number
  hMax: number
  vMin: number
  vMax: number
}

export interface ZoneCalibration {
  leftThreshold: number   // ratio >= this → left zone
  rightThreshold: number  // ratio <= this → right zone
}

const CAL_KEY = 'gaze-calibration-v1'
const ZONE_KEY = 'gaze-zone-calibration-v1'

let _cache: GazeCalibration | null | undefined = undefined
let _zoneCache: ZoneCalibration | null | undefined = undefined

export function saveCalibration(c: GazeCalibration): void {
  localStorage.setItem(CAL_KEY, JSON.stringify(c))
  _cache = c
}

export function loadCalibration(): GazeCalibration | null {
  if (_cache !== undefined) return _cache
  try {
    const s = localStorage.getItem(CAL_KEY)
    _cache = s ? (JSON.parse(s) as GazeCalibration) : null
    return _cache
  } catch {
    _cache = null
    return null
  }
}

export function saveZoneCalibration(c: ZoneCalibration): void {
  localStorage.setItem(ZONE_KEY, JSON.stringify(c))
  _zoneCache = c
}

export function loadZoneCalibration(): ZoneCalibration | null {
  if (_zoneCache !== undefined) return _zoneCache
  try {
    const s = localStorage.getItem(ZONE_KEY)
    _zoneCache = s ? (JSON.parse(s) as ZoneCalibration) : null
    return _zoneCache
  } catch {
    _zoneCache = null
    return null
  }
}

export function clearZoneCalibration(): void {
  localStorage.removeItem(ZONE_KEY)
  _zoneCache = undefined
}
