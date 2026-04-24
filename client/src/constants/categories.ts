import type { RecommendItem } from '../types/recommend'
import { fetchMovies } from '../services/movieService'
import { fetchShopping } from '../services/shoppingService'
import { fetchBooks } from '../services/bookService'

export type CategoryId = 'movie' | 'shopping' | 'book'

export interface Category {
  id: CategoryId
  label: string
  emoji: string
  zone: string
  panelLabel: string
  unit: string
}

// Order matters: index 0=left zone, 1=center zone, 2=right zone
export const CATEGORIES: Category[] = [
  { id: 'movie',    label: '영화', emoji: '🎬', zone: '← 왼쪽', panelLabel: '오늘의 영화', unit: '편' },
  { id: 'shopping', label: '쇼핑', emoji: '🛍️', zone: '정면',   panelLabel: '오늘의 쇼핑', unit: '개' },
  { id: 'book',     label: '책',   emoji: '📚', zone: '오른쪽 →', panelLabel: '오늘의 책', unit: '권' },
]

export const CATEGORY_MAP: Record<CategoryId, Category> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c])
) as Record<CategoryId, Category>

export const CATEGORY_SERVICE_MAP: Record<CategoryId, () => Promise<RecommendItem[]>> = {
  movie:    fetchMovies,
  shopping: () => fetchShopping('베스트'),
  book:     fetchBooks,
}
