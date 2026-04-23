export type CategoryId = 'movie' | 'food' | 'travel' | 'book' | 'game' | 'fashion' | 'electronics'

export interface Category {
  id: CategoryId
  label: string
  emoji: string
}

export const CATEGORIES: Category[] = [
  { id: 'movie', label: '영화', emoji: '🎬' },
  { id: 'food', label: '음식', emoji: '🍜' },
  { id: 'travel', label: '여행', emoji: '✈️' },
  { id: 'book', label: '책', emoji: '📚' },
  { id: 'game', label: '게임', emoji: '🎮' },
  { id: 'fashion', label: '패션', emoji: '👗' },
  { id: 'electronics', label: '전자기기', emoji: '💻' },
]

export const CATEGORY_MAP: Record<CategoryId, Category> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c])
) as Record<CategoryId, Category>
