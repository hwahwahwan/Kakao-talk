import type { RecommendItem } from '../types/recommend'

const IMG = 'https://image.tmdb.org/t/p/w200'

export async function fetchMovies(): Promise<RecommendItem[]> {
  const res = await fetch('/api/recommend/movie')
  if (!res.ok) throw new Error('TMDB fetch failed')
  const json = await res.json()
  return json.results.slice(0, 10).map((m: any) => ({
    id: String(m.id),
    title: m.title,
    image: m.poster_path ? IMG + m.poster_path : undefined,
    subtitle: m.release_date?.slice(0, 4),
    meta: `⭐ ${m.vote_average.toFixed(1)}`,
  }))
}
