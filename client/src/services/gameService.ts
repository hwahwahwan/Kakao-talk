import type { RecommendItem } from '../types/recommend'

export async function fetchGames(): Promise<RecommendItem[]> {
  const res = await fetch('/api/recommend/game')
  if (!res.ok) throw new Error('RAWG fetch failed')
  const json = await res.json()
  return json.results.map((g: any) => ({
    id: String(g.id),
    title: g.name,
    image: g.background_image || undefined,
    subtitle: g.genres?.[0]?.name ?? '',
    meta: `⭐ ${g.rating.toFixed(1)}`,
  }))
}
