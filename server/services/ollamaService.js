const OLLAMA_URL = process.env.OLLAMA_URL ?? 'http://localhost:11434'
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? 'qwen2.5:3b'

const BASE_SYSTEM_PROMPT = '너는 친절한 AI 조교야. 반드시 한국어로만 답변해. 절대 다른 언어를 사용하지 마. 어떤 주제든 최선을 다해 답변해줘.'

function buildSystemPrompt(context) {
  if (!context || context.length === 0) return BASE_SYSTEM_PROMPT
  const contextText = context.join('\n\n---\n\n')
  return `${BASE_SYSTEM_PROMPT}\n\n아래는 관련 강의 자료야. 이 내용을 바탕으로 답변해줘:\n\n${contextText}`
}

async function generateResponse(messages, context = []) {
  const payload = {
    model: OLLAMA_MODEL,
    messages: [{ role: 'system', content: buildSystemPrompt(context) }, ...messages],
    stream: false,
  }

  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw new Error(`Ollama 오류: ${res.status}`)
  }

  const data = await res.json()
  return data.message?.content ?? ''
}

module.exports = { generateResponse }
