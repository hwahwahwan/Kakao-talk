// RAG 인덱스 빌드 스크립트
// 실행: node server/scripts/buildIndex.js
// 사전 조건: ollama pull nomic-embed-text

require('dotenv').config({ path: require('path').join(__dirname, '../.env') })

const fs = require('fs')
const path = require('path')
const pdfParse = require('pdf-parse')
const { embed, chunkText } = require('../common/embedding')

const DOCS_DIR = process.env.DOCS_DIR ?? path.join(__dirname, '../../WebProg')
const INDEX_PATH = path.join(__dirname, '../data/vector-index.json')

async function main() {
  const files = fs.readdirSync(DOCS_DIR).filter(f => f.endsWith('.pdf'))
  if (files.length === 0) {
    console.error(`PDF 없음: ${DOCS_DIR}`)
    process.exit(1)
  }

  console.log(`PDF ${files.length}개 처리 시작...`)
  const entries = []

  for (const file of files) {
    console.log(`  처리 중: ${file}`)
    const buf = fs.readFileSync(path.join(DOCS_DIR, file))
    const { text } = await pdfParse(buf)
    const chunks = chunkText(text, file)

    for (let i = 0; i < chunks.length; i++) {
      process.stdout.write(`    청크 ${i + 1}/${chunks.length}\r`)
      const vector = await embed(chunks[i].text)
      entries.push({ source: chunks[i].source, text: chunks[i].text, vector })
    }
    console.log(`    완료 (${chunks.length}청크)`)
  }

  fs.mkdirSync(path.dirname(INDEX_PATH), { recursive: true })
  fs.writeFileSync(INDEX_PATH, JSON.stringify(entries))
  console.log(`\n인덱스 저장 완료: ${INDEX_PATH} (${entries.length}개 청크)`)
}

main().catch(err => {
  console.error('오류:', err.message)
  process.exit(1)
})
