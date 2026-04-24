const { Router } = require('express')

const router = Router()

router.get('/api/recommend/movie', async (req, res) => {
  try {
    const key = process.env.TMBD_API_KEY
    const r = await fetch(
      `https://api.themoviedb.org/3/movie/popular?api_key=${key}&language=ko-KR&page=1`
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
      `https://openapi.foodsafetykorea.go.kr/api/${key}/COOKRCP01/json/1/4`
    )
    if (!r.ok) return res.status(r.status).json({ error: 'Food API fetch failed' })
    res.json(await r.json())
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/api/recommend/book', async (req, res) => {
  try {
    const key = process.env.KAKAO_API_KEY
    const r = await fetch(
      'https://dapi.kakao.com/v3/search/book?query=베스트셀러&sort=accuracy&size=4',
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
      `https://api.rawg.io/api/games?key=${key}&ordering=-rating&page_size=4&language=ko`
    )
    if (!r.ok) return res.status(r.status).json({ error: 'RAWG fetch failed' })
    res.json(await r.json())
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/api/recommend/travel', async (req, res) => {
  try {
    const key = process.env.DATA_POTAL_KEY
    const url = `https://apis.data.go.kr/B551011/KorService1/areaBasedList1?serviceKey=${encodeURIComponent(key)}&numOfRows=10&pageNo=1&MobileOS=ETC&MobileApp=App&_type=json&listYN=Y&arrange=Q&contentTypeId=12`
    const r = await fetch(url)
    if (!r.ok) return res.status(r.status).json({ error: 'Tourism API fetch failed' })
    res.json(await r.json())
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/api/recommend/shopping', async (req, res) => {
  try {
    const { query } = req.query
    if (!query) return res.status(400).json({ error: 'query required' })
    const clientId = process.env.NAVER_API_KEY_CLIENTID
    const clientSecret = process.env.NAVER_API_KEY_CLIENTSERCRET
    const r = await fetch(
      `https://openapi.naver.com/v1/search/shop?query=${encodeURIComponent(query)}&display=4&sort=sim`,
      { headers: { 'X-Naver-Client-Id': clientId, 'X-Naver-Client-Secret': clientSecret } }
    )
    if (!r.ok) return res.status(r.status).json({ error: 'Naver shopping fetch failed' })
    res.json(await r.json())
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router
