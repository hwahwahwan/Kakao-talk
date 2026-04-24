const { Router } = require('express')

const router = Router()

router.get('/api/recommend/movie', async (req, res) => {
  try {
    const key = process.env.TMDB_API_KEY
    const r = await fetch(
      `https://api.themoviedb.org/3/movie/popular?api_key=${key}&language=ko-KR`
    )
    if (!r.ok) return res.status(r.status).json({ error: 'TMDB fetch failed' })
    res.json(await r.json())
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/api/recommend/food', async (req, res) => {
  try {
    const key = process.env.FOOD_API_KEY
    const r = await fetch(
      `https://openapi.foodsafetykorea.go.kr/api/${key}/COOKRCP01/json/1/10`
    )
    if (!r.ok) return res.status(r.status).json({ error: 'Food API fetch failed' })
    res.json(await r.json())
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/api/recommend/book', async (req, res) => {
  try {
    const key = process.env.KAKAO_REST_API_KEY
    const r = await fetch(
      'https://dapi.kakao.com/v3/search/book?query=베스트셀러&sort=accuracy&size=10',
      { headers: { Authorization: `KakaoAK ${key}` } }
    )
    if (!r.ok) return res.status(r.status).json({ error: 'Kakao book fetch failed' })
    res.json(await r.json())
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/api/recommend/game', async (req, res) => {
  try {
    const key = process.env.RAWG_API_KEY
    const r = await fetch(
      `https://api.rawg.io/api/games?key=${key}&ordering=-rating&page_size=10`
    )
    if (!r.ok) return res.status(r.status).json({ error: 'RAWG fetch failed' })
    res.json(await r.json())
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/api/recommend/shopping', async (req, res) => {
  try {
    const { query } = req.query
    if (!query) return res.status(400).json({ error: 'query required' })
    const clientId = process.env.NAVER_CLIENT_ID
    const clientSecret = process.env.NAVER_CLIENT_SECRET
    const r = await fetch(
      `https://openapi.naver.com/v1/search/shop?query=${encodeURIComponent(query)}&display=10&sort=sim`,
      { headers: { 'X-Naver-Client-Id': clientId, 'X-Naver-Client-Secret': clientSecret } }
    )
    if (!r.ok) return res.status(r.status).json({ error: 'Naver shopping fetch failed' })
    res.json(await r.json())
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router
