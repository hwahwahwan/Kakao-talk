const fs = require('fs')
const path = require('path')
const pdfParse = require('pdf-parse')
const { embed, chunkText } = require('../common/embedding')

const DOCS_DIR = process.env.DOCS_DIR ?? path.join(__dirname, '../../WebProg')
const INDEX_PATH = path.join(__dirname, '../data/vector-index.json')
const TOP_K = 3
const SIMILARITY_THRESHOLD = 0.3 // 이 점수 미만이면 관련 없다고 판단 → 컨텍스트 미주입

let index = [] // [{source, text, vector}]

// ── 코사인 유사도 ──────────────────────────────────────────
function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB) || 1)
}

// ── 키워드 폴백 검색 (임베딩 불가 시) ─────────────────────
function keywordSearch(query, topK) {
  const tokens = query.toLowerCase().split(/\s+/).filter(t => t.length > 1)
  return index
    .map(c => {
      const lower = c.text.toLowerCase()
      const score = tokens.reduce((sum, t) => sum + (lower.split(t).length - 1), 0)
      return { ...c, score }
    })
    .filter(c => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(c => `[출처: ${c.source}]\n${c.text}`)
}

// ── 문서 로드 (벡터 인덱스 우선, 없으면 PDF 직접 로드) ──────
async function loadDocuments() {
  if (fs.existsSync(INDEX_PATH)) {
    try {
      index = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf-8'))
      console.log(`[RAG] 벡터 인덱스 로드: ${index.length}개 청크`)
      return
    } catch {
      console.warn('[RAG] 벡터 인덱스 손상, PDF 직접 로드로 전환')
    }
  }

  if (!fs.existsSync(DOCS_DIR)) {
    console.warn(`[RAG] 문서 폴더 없음: ${DOCS_DIR}`)
    return
  }

  const files = fs.readdirSync(DOCS_DIR).filter(f => f.endsWith('.pdf'))
  if (files.length === 0) { console.warn('[RAG] PDF 없음'); return }

  index = []
  for (const file of files) {
    try {
      const buf = fs.readFileSync(path.join(DOCS_DIR, file))
      const { text } = await pdfParse(buf)
      chunkText(text, file).forEach(c => index.push({ ...c, vector: null }))
    } catch (err) {
      console.error(`[RAG] ${file} 로드 실패:`, err.message)
    }
  }
  console.log(`[RAG] PDF ${files.length}개 로드 (키워드 검색 모드, ${index.length}청크)`)
  console.log('[RAG] 팁: node server/scripts/buildIndex.js 실행 시 임베딩 검색으로 업그레이드')
}

// ── 검색 ────────────────────────────────────────────────
async function search(query, topK = TOP_K) {
  if (index.length === 0) return []

  if (index[0].vector) {
    try {
      const queryVec = await embed(query)
      return index
        .map(c => ({ source: c.source, text: c.text, score: cosineSimilarity(queryVec, c.vector) }))
        .filter(c => c.score >= SIMILARITY_THRESHOLD)
        .sort((a, b) => b.score - a.score)
        .slice(0, topK)
        .map(c => `[출처: ${c.source}]\n${c.text}`)
    } catch {
      // 임베딩 실패 시 키워드 폴백
    }
  }

  return keywordSearch(query, topK)
}

module.exports = { loadDocuments, search }
