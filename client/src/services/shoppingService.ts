import type { RecommendItem } from '../types/recommend'

function stripTags(str: string): string {
  return str.replace(/<[^>]+>/g, '')
}

export async function fetchShopping(query: string): Promise<RecommendItem[]> {
  const res = await fetch(`/api/recommend/shopping?query=${encodeURIComponent(query)}`)
  if (!res.ok) throw new Error('Naver shopping fetch failed')
  const json = await res.json()
  return json.items.map((item: any, i: number) => ({
    id: item.productId ?? String(i),
    title: stripTags(item.title),
    image: item.image || undefined,
    subtitle: item.mallName,
    meta: `${Number(item.lprice).toLocaleString()}원`,
  }))
}
