const { Router } = require('express')
const { translateToKorean } = require('../translate')
const chatbotRouter = require('./chatbot')

const router = Router()

router.use(chatbotRouter)

router.get('/health', (_req, res) => res.json({ status: 'ok' }))

router.get('/translate', async (req, res) => {
  const text = req.query.text
  if (!text) return res.status(400).json({ error: 'text required' })
  const translated = await translateToKorean(text)
  if (!translated) return res.status(422).json({ error: '번역 실패' })
  res.json({ translated })
})

module.exports = router
