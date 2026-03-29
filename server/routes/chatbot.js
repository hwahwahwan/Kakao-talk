const { Router } = require('express')
const { generateResponse } = require('../services/ollamaService')
const { search } = require('../services/ragService')

const router = Router()

router.post('/api/chatbot', async (req, res) => {
  const { messages } = req.body
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages 필드가 필요합니다' })
  }

  try {
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')
    const context = lastUserMessage ? await search(lastUserMessage.content) : []
    const content = await generateResponse(messages, context)
    res.json({ content })
  } catch (err) {
    console.error('[chatbot]', err.message)
    res.status(503).json({ error: 'Ollama 서버에 연결할 수 없습니다. ollama가 실행 중인지 확인하세요.' })
  }
})

module.exports = router
