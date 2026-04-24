import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react'
import CategoryGrid from '../components/CategoryGrid'
import CategoryPanel from '../components/CategoryPanel'
import CategoryPage from '../pages/CategoryPage'
import { CATEGORIES, CATEGORY_SERVICE_MAP } from '../constants/categories'
import type { RecommendItem } from '../types/recommend'

vi.mock('../hooks/useGazeTracking', () => ({
  useGazeTracking: () => ({ gazeData: null, connected: false, error: null }),
}))

// 서비스 함수를 카테고리별 Mock 데이터로 대체
vi.mock('../constants/categories', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../constants/categories')>()
  const makeMockItems = (label: string): RecommendItem[] =>
    Array.from({ length: 3 }, (_, i) => ({
      id: `${label}-${i}`,
      title: `${label} 추천 ${i + 1}`,
    }))
  return {
    ...actual,
    CATEGORY_SERVICE_MAP: Object.fromEntries(
      actual.CATEGORIES.map((c) => [c.id, () => Promise.resolve(makeMockItems(c.label))])
    ),
  }
})

beforeEach(() => cleanup())

// ──────────────────────────────────────────────
// CategoryGrid
// ──────────────────────────────────────────────
describe('CategoryGrid', () => {
  it('7개 카테고리 라벨을 모두 렌더링한다', () => {
    render(<CategoryGrid selectedIds={[null, null]} onSelect={() => {}} />)
    CATEGORIES.forEach((cat) => {
      expect(screen.getByText(cat.label)).toBeTruthy()
    })
  })

  it('카테고리 클릭 시 onSelect가 해당 id로 호출된다', () => {
    const onSelect = vi.fn()
    render(<CategoryGrid selectedIds={[null, null]} onSelect={onSelect} />)
    fireEvent.click(screen.getByText('영화'))
    expect(onSelect).toHaveBeenCalledWith('movie')
    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('선택된 카테고리 버튼에 bg-primary-container 클래스가 적용된다', () => {
    render(<CategoryGrid selectedIds={['movie', null]} onSelect={() => {}} />)
    const btn = screen.getByText('영화').closest('button')
    expect(btn?.className).toContain('bg-primary-container')
  })

  it('선택되지 않은 카테고리에는 bg-primary-container가 없다', () => {
    render(<CategoryGrid selectedIds={['movie', null]} onSelect={() => {}} />)
    const btn = screen.getByText('음식').closest('button')
    expect(btn?.className).not.toContain('bg-primary-container')
  })

  it('두 카테고리가 선택된 경우 두 버튼 모두 하이라이트된다', () => {
    render(<CategoryGrid selectedIds={['movie', 'food']} onSelect={() => {}} />)
    expect(screen.getByText('영화').closest('button')?.className).toContain('bg-primary-container')
    expect(screen.getByText('음식').closest('button')?.className).toContain('bg-primary-container')
    expect(screen.getByText('여행').closest('button')?.className).not.toContain('bg-primary-container')
  })
})

// ──────────────────────────────────────────────
// CategoryPanel
// ──────────────────────────────────────────────
describe('CategoryPanel', () => {
  it('categoryId가 null이면 빈 상태 안내 문구를 표시한다', () => {
    render(<CategoryPanel categoryId={null} panelIndex={1} />)
    expect(screen.getByText(/카테고리를 선택하세요/)).toBeTruthy()
  })

  it('categoryId가 있으면 카테고리명을 표시한다', async () => {
    render(<CategoryPanel categoryId="movie" panelIndex={1} />)
    await waitFor(() => expect(screen.getByText('영화')).toBeTruthy())
  })

  it('활성 패널에 RecommendCard가 정확히 3개 렌더링된다', async () => {
    render(<CategoryPanel categoryId="movie" panelIndex={1} />)
    await waitFor(() => expect(screen.getAllByText(/영화 추천/)).toHaveLength(3))
  })

  it('panelIndex 번호가 화면에 반영된다', () => {
    const { rerender } = render(<CategoryPanel categoryId={null} panelIndex={1} />)
    expect(screen.getByText(/패널 1/)).toBeTruthy()
    rerender(<CategoryPanel categoryId={null} panelIndex={2} />)
    expect(screen.getByText(/패널 2/)).toBeTruthy()
  })

  it('모든 카테고리에 대해 올바른 라벨과 카드 3개가 표시된다', async () => {
    for (const cat of CATEGORIES) {
      cleanup()
      render(<CategoryPanel categoryId={cat.id} panelIndex={1} />)
      await waitFor(() => {
        expect(screen.getByText(cat.label)).toBeTruthy()
        expect(screen.getAllByText(new RegExp(`${cat.label} 추천`))).toHaveLength(3)
      })
    }
  })
})

// ──────────────────────────────────────────────
// CategoryPage — 패널 상태 전환 (통합 테스트)
// ──────────────────────────────────────────────
describe('CategoryPage 패널 상태 전환', () => {
  it('초기 상태: 두 패널 모두 빈 상태', () => {
    render(<CategoryPage />)
    expect(screen.getAllByText(/카테고리를 선택하세요/)).toHaveLength(2)
  })

  it('카테고리 클릭 시 해당 패널이 활성화되고 빈 패널이 1개 남는다 (FR-04)', async () => {
    render(<CategoryPage />)
    fireEvent.click(screen.getByRole('button', { name: /영화/ }))
    await waitFor(() => {
      expect(screen.getAllByText(/영화 추천/)).toHaveLength(3)
      expect(screen.getAllByText(/카테고리를 선택하세요/)).toHaveLength(1)
    })
  })

  it('두 번째 카테고리 클릭 시 두 패널 모두 활성화된다', async () => {
    render(<CategoryPage />)
    fireEvent.click(screen.getByRole('button', { name: /영화/ }))
    fireEvent.click(screen.getByRole('button', { name: /음식/ }))
    await waitFor(() => {
      expect(screen.queryAllByText(/카테고리를 선택하세요/)).toHaveLength(0)
      expect(screen.getAllByText(/영화 추천/)).toHaveLength(3)
      expect(screen.getAllByText(/음식 추천/)).toHaveLength(3)
    })
  })

  it('3번째 카테고리 클릭 시 가장 오래된 패널이 교체된다 (FR-05)', async () => {
    render(<CategoryPage />)
    fireEvent.click(screen.getByRole('button', { name: /영화/ }))
    fireEvent.click(screen.getByRole('button', { name: /음식/ }))
    fireEvent.click(screen.getByRole('button', { name: /여행/ }))
    await waitFor(() => {
      expect(screen.queryAllByText(/영화 추천/)).toHaveLength(0)
      expect(screen.getAllByText(/음식 추천/)).toHaveLength(3)
      expect(screen.getAllByText(/여행 추천/)).toHaveLength(3)
    })
  })

  it('이미 선택된 카테고리 재클릭 시 패널 상태가 변경되지 않는다 (FR-06)', async () => {
    render(<CategoryPage />)
    fireEvent.click(screen.getByRole('button', { name: /영화/ }))
    fireEvent.click(screen.getByRole('button', { name: /음식/ }))
    await waitFor(() => expect(screen.getAllByText(/영화 추천/)).toHaveLength(3))
    fireEvent.click(screen.getByRole('button', { name: /영화/ }))
    await waitFor(() => {
      expect(screen.getAllByText(/영화 추천/)).toHaveLength(3)
      expect(screen.getAllByText(/음식 추천/)).toHaveLength(3)
    })
  })

  it('시선 추적 서버 미연결 상태 텍스트가 헤더에 표시된다 (FR-09)', () => {
    render(<CategoryPage />)
    expect(screen.getByText('시선 추적 대기 중')).toBeTruthy()
  })
})

// ──────────────────────────────────────────────
// CategoryPanel — 상태별 UI (loading / error)
// ──────────────────────────────────────────────
describe('CategoryPanel 상태별 UI', () => {
  afterEach(() => cleanup())

  it('API 호출 중 스켈레톤(animate-pulse) 3개가 표시된다', () => {
    const original = CATEGORY_SERVICE_MAP.movie
    CATEGORY_SERVICE_MAP.movie = () => new Promise(() => {})

    render(<CategoryPanel categoryId="movie" panelIndex={1} />)
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBe(3)

    CATEGORY_SERVICE_MAP.movie = original
  })

  it('API 오류 시 에러 메시지가 표시된다', async () => {
    const original = CATEGORY_SERVICE_MAP.movie
    CATEGORY_SERVICE_MAP.movie = () => Promise.reject(new Error('API error'))

    render(<CategoryPanel categoryId="movie" panelIndex={1} />)
    await waitFor(() => expect(screen.getByText(/데이터를 불러올 수 없습니다/)).toBeTruthy())

    CATEGORY_SERVICE_MAP.movie = original
  })

  it('categoryId 변경 시 이전 카드가 사라지고 스켈레톤이 표시된다', async () => {
    const { rerender } = render(<CategoryPanel categoryId="movie" panelIndex={1} />)
    await waitFor(() => expect(screen.getAllByText(/영화 추천/)).toHaveLength(3))

    const original = CATEGORY_SERVICE_MAP.food
    CATEGORY_SERVICE_MAP.food = () => new Promise(() => {})

    rerender(<CategoryPanel categoryId="food" panelIndex={1} />)

    expect(screen.queryAllByText(/영화 추천/)).toHaveLength(0)
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBe(3)

    CATEGORY_SERVICE_MAP.food = original
  })
})
