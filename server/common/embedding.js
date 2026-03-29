const OLLAMA_URL = process.env.OLLAMA_URL ?? 'http://localhost:11434'

const EMBED_MODEL = 'nomic-embed-text'
const CHUNK_SIZE = 600
const CHUNK_OVERLAP = 100

async function embed(text) {
  const res = await fetch(`${OLLAMA_URL}/api/embeddings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: EMBED_MODEL, prompt: text }),
  })
  if (!res.ok) throw new Error(`임베딩 오류: ${res.status}`)
  const data = await res.json()
  return data.embedding
}

function chunkText(text, source) {
  const chunks = []
  let start = 0
  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length)
    chunks.push({ source, text: text.slice(start, end) })
    if (end === text.length) break
    start += CHUNK_SIZE - CHUNK_OVERLAP
  }
  return chunks
}

module.exports = { embed, chunkText, EMBED_MODEL, CHUNK_SIZE, CHUNK_OVERLAP }
