import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCategoryGaze } from '../hooks/useCategoryGaze'
import type { GazeData } from '../hooks/useGazeTracking'

const BASE_GAZE: GazeData = {
  isBlinking: false, isRight: false, isLeft: false, isCenter: true,
  horizontalRatio: 0.5, verticalRatio: 0.5,
  pupilLeft: [100, 100], pupilRight: [200, 100],
}

const LEFT_GAZE: GazeData = { ...BASE_GAZE, isLeft: true, isCenter: false }
const RIGHT_GAZE: GazeData = { ...BASE_GAZE, isRight: true, isCenter: false }

const CATEGORY_IDS = ['movie', 'travel', 'book'] as const

describe('useCategoryGaze (zone-based)', () => {
  let nowValue = 0

  beforeEach(() => {
    nowValue = 0
    vi.spyOn(performance, 'now').mockImplementation(() => nowValue)
  })

  afterEach(() => vi.restoreAllMocks())

  const fireFrames = (
    rerender: (props: { gd: GazeData | null }) => void,
    gd: GazeData | null,
    count: number,
    startMs: number,
    stepMs = 33
  ): number => {
    for (let i = 1; i <= count; i++) {
      nowValue = startMs + i * stepMs
      act(() => rerender({ gd: gd ? { ...gd } : null }))
    }
    return startMs + count * stepMs
  }

  it('isCenter 10프레임 후 2000ms 지나면 onSelect(travel)가 호출된다', () => {
    const onSelect = vi.fn()

    const { rerender } = renderHook(
      ({ gd }: { gd: GazeData | null }) =>
        useCategoryGaze({ gazeData: gd, categoryIds: [...CATEGORY_IDS], onSelect }),
      { initialProps: { gd: BASE_GAZE as GazeData | null } }
    )

    let t = fireFrames(rerender, BASE_GAZE, 10, 0)

    nowValue = t + 2100
    act(() => rerender({ gd: { ...BASE_GAZE } }))

    expect(onSelect).toHaveBeenCalledWith('travel')
    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('isLeft → movie, isRight → book이 각각 감지된다', () => {
    const onSelect = vi.fn()

    const { rerender: rerenderLeft } = renderHook(
      ({ gd }: { gd: GazeData | null }) =>
        useCategoryGaze({ gazeData: gd, categoryIds: [...CATEGORY_IDS], onSelect }),
      { initialProps: { gd: LEFT_GAZE as GazeData | null } }
    )
    let t = fireFrames(rerenderLeft, LEFT_GAZE, 10, 0)
    nowValue = t + 2100
    act(() => rerenderLeft({ gd: { ...LEFT_GAZE } }))
    expect(onSelect).toHaveBeenCalledWith('movie')

    onSelect.mockClear()
    nowValue = 0

    const { rerender: rerenderRight } = renderHook(
      ({ gd }: { gd: GazeData | null }) =>
        useCategoryGaze({ gazeData: gd, categoryIds: [...CATEGORY_IDS], onSelect }),
      { initialProps: { gd: RIGHT_GAZE as GazeData | null } }
    )
    t = fireFrames(rerenderRight, RIGHT_GAZE, 10, 0)
    nowValue = t + 2100
    act(() => rerenderRight({ gd: { ...RIGHT_GAZE } }))
    expect(onSelect).toHaveBeenCalledWith('book')
  })

  it('응시 이탈 후 타이머가 초기화되고 다시 2초 후에 onSelect가 호출된다', () => {
    const onSelect = vi.fn()

    const { rerender } = renderHook(
      ({ gd }: { gd: GazeData | null }) =>
        useCategoryGaze({ gazeData: gd, categoryIds: [...CATEGORY_IDS], onSelect }),
      { initialProps: { gd: BASE_GAZE as GazeData | null } }
    )

    let t = fireFrames(rerender, BASE_GAZE, 10, 0)

    nowValue = t + 500
    act(() => rerender({ gd: { ...BASE_GAZE } }))
    expect(onSelect).not.toHaveBeenCalled()
    t = nowValue

    // 10프레임 이탈 (isLeft=false, isCenter=false, isRight=false)
    const noZoneGaze: GazeData = { ...BASE_GAZE, isCenter: false }
    t = fireFrames(rerender, noZoneGaze, 10, t)
    expect(onSelect).not.toHaveBeenCalled()

    // 복귀 후 재형성
    t = fireFrames(rerender, BASE_GAZE, 10, t)

    nowValue = t + 2100
    act(() => rerender({ gd: { ...BASE_GAZE } }))
    expect(onSelect).toHaveBeenCalledWith('travel')
  })

  it('gazeData가 null이면 onSelect가 호출되지 않는다', () => {
    const onSelect = vi.fn()

    const { rerender } = renderHook(
      ({ gd }: { gd: GazeData | null }) =>
        useCategoryGaze({ gazeData: gd, categoryIds: [...CATEGORY_IDS], onSelect }),
      { initialProps: { gd: null } }
    )

    nowValue = 5000
    act(() => rerender({ gd: null }))
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('thresholdMs 파라미터가 적용된다', () => {
    const onSelect = vi.fn()

    const { rerender } = renderHook(
      ({ gd }: { gd: GazeData | null }) =>
        useCategoryGaze({ gazeData: gd, categoryIds: [...CATEGORY_IDS], onSelect, thresholdMs: 500 }),
      { initialProps: { gd: BASE_GAZE as GazeData | null } }
    )

    let t = fireFrames(rerender, BASE_GAZE, 10, 0)

    nowValue = t + 600
    act(() => rerender({ gd: { ...BASE_GAZE } }))
    expect(onSelect).toHaveBeenCalledWith('travel')
  })

  it('onSelect 호출 후 타이머가 초기화되어 연속 중복 호출이 방지된다', () => {
    const onSelect = vi.fn()

    const { rerender } = renderHook(
      ({ gd }: { gd: GazeData | null }) =>
        useCategoryGaze({ gazeData: gd, categoryIds: [...CATEGORY_IDS], onSelect }),
      { initialProps: { gd: BASE_GAZE as GazeData | null } }
    )

    let t = fireFrames(rerender, BASE_GAZE, 10, 0)

    nowValue = t + 2100
    act(() => rerender({ gd: { ...BASE_GAZE } }))
    expect(onSelect).toHaveBeenCalledTimes(1)
    t = nowValue

    nowValue = t + 500
    act(() => rerender({ gd: { ...BASE_GAZE } }))
    expect(onSelect).toHaveBeenCalledTimes(1)
    t = nowValue

    nowValue = t + 2100
    act(() => rerender({ gd: { ...BASE_GAZE } }))
    expect(onSelect).toHaveBeenCalledTimes(2)
  })

  it('6프레임 이하면 consensus 미달이라 onSelect가 호출되지 않는다', () => {
    const onSelect = vi.fn()

    const { rerender } = renderHook(
      ({ gd }: { gd: GazeData | null }) =>
        useCategoryGaze({ gazeData: gd, categoryIds: [...CATEGORY_IDS], onSelect }),
      { initialProps: { gd: BASE_GAZE as GazeData | null } }
    )

    let t = fireFrames(rerender, BASE_GAZE, 5, 0)

    nowValue = t + 5000
    act(() => rerender({ gd: { ...BASE_GAZE } }))
    expect(onSelect).not.toHaveBeenCalled()
  })
})
