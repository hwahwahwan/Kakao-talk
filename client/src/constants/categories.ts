import type { RecommendItem } from '../types/recommend'
import { fetchMovies } from '../services/movieService'
import { fetchTravelMock } from '../services/travelService'
import { fetchBooks } from '../services/bookService'

export type CategoryId = 'movie' | 'travel' | 'book'

export interface Category {
  id: CategoryId
  label: string
  emoji: string
  zone: string
}

// Order matters: index 0=left zone, 1=center zone, 2=right zone
export const CATEGORIES: Category[] = [
  { id: 'movie', label: '영화', emoji: '🎬', zone: '← 왼쪽' },
  { id: 'travel', label: '여행', emoji: '✈️', zone: '정면' },
  { id: 'book', label: '책', emoji: '📚', zone: '오른쪽 →' },
]

export const CATEGORY_MAP: Record<CategoryId, Category> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c])
) as Record<CategoryId, Category>

export const CATEGORY_SERVICE_MAP: Record<CategoryId, () => Promise<RecommendItem[]>> = {
  movie:  fetchMovies,
  travel: fetchTravelMock,
  book:   fetchBooks,
}
