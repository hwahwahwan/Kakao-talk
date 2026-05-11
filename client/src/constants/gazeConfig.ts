// Fallback values before calibration. Based on GazeTracking library thresholds:
// is_right() <= 0.35, is_left() >= 0.65, center ~0.50-0.60.
// Run the in-app calibration (눈 보정 버튼) for accurate tracking.
export const GAZE_H_MIN = 0.30
export const GAZE_H_MAX = 0.65
export const GAZE_V_MIN = 0.25
export const GAZE_V_MAX = 0.65

// Extra px added to each side of a button's bounding rect for hit detection.
export const GAZE_HIT_PADDING = 100

// Moving-average window (frames) to smooth out sensor noise.
export const GAZE_SMOOTH_N = 15
