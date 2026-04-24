// Fallback values used before calibration. Wide range to avoid hard clipping.
// Run the in-app calibration (보정 버튼) for accurate tracking.
export const GAZE_H_MIN = 0.45
export const GAZE_H_MAX = 0.85
export const GAZE_V_MIN = 0.40
export const GAZE_V_MAX = 0.85

// Extra px added to each side of a button's bounding rect for hit detection.
export const GAZE_HIT_PADDING = 100

// Moving-average window (frames) to smooth out sensor noise.
export const GAZE_SMOOTH_N = 15
