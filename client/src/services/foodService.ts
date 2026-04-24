import type { RecommendItem } from '../types/recommend'

export async function fetchRecipes(): Promise<RecommendItem[]> {
  const res = await fetch('/api/recommend/food')
  if (!res.ok) throw new Error('Food API fetch failed')
  const json = await res.json()
  const rows: any[] = json.COOKRCP01?.row ?? []
  return rows.map((r: any, i: number) => ({
    id: r.RCP_SEQ ?? String(i),
    title: r.RCP_NM,
    image: r.ATT_FILE_NO_MAIN || undefined,
    subtitle: r.RCP_WAY2,
    meta: r.INFO_ENG ? `${r.INFO_ENG} kcal` : undefined,
  }))
}
