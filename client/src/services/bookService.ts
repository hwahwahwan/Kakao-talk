import type { RecommendItem } from '../types/recommend'

export async function fetchBooks(): Promise<RecommendItem[]> {
  const res = await fetch('/api/recommend/book')
  if (!res.ok) throw new Error('Kakao book fetch failed')
  const json = await res.json()
  return json.documents.map((b: any) => ({
    id: b.isbn,
    title: b.title,
    image: b.thumbnail || undefined,
    subtitle: b.authors[0] ?? '',
    meta: b.sale_price > 0 ? `${b.sale_price.toLocaleString()}원` : `${b.price.toLocaleString()}원`,
  }))
}
