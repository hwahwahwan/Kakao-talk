import type { RecommendItem } from '../types/recommend'

function enlargeThumbnail(url: string): string {
  return url.replace(/\/thumb\/R\d+x\d+[^/]*\//, '/thumb/R480x640.q90/')
}

export async function fetchBooks(): Promise<RecommendItem[]> {
  const res = await fetch('/api/recommend/book')
  if (!res.ok) throw new Error('Kakao book fetch failed')
  const json = await res.json()
  return json.documents.slice(0, 4).map((b: any) => ({
    id: b.isbn,
    title: b.title,
    image: b.thumbnail ? enlargeThumbnail(b.thumbnail) : undefined,
    subtitle: b.authors[0] ?? '',
    meta: b.sale_price > 0 ? `${b.sale_price.toLocaleString()}원` : `${b.price.toLocaleString()}원`,
  }))
}
