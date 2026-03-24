const SERVER_URL = import.meta.env.VITE_SERVER_URL as string

export async function translateToKorean(text: string): Promise<string | null> {
  const res = await fetch(`${SERVER_URL}/translate?text=${encodeURIComponent(text)}`)
  if (!res.ok) return null
  const data = await res.json()
  return data.translated ?? null
}
