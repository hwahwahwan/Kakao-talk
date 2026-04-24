import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchMovies } from '../services/movieService'
import { fetchRecipes } from '../services/foodService'
import { fetchTravel } from '../services/travelService'
import { fetchBooks } from '../services/bookService'
import { fetchGames } from '../services/gameService'
import { fetchShopping } from '../services/shoppingService'

const mockFetch = (data: unknown) =>
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => data }))

beforeEach(() => vi.unstubAllGlobals())

describe('fetchMovies', () => {
  it('RecommendItem[] 형식으로 반환한다', async () => {
    mockFetch({
      results: [
        { id: 1, title: 'Test Movie', poster_path: '/test.jpg', vote_average: 7.5, release_date: '2024-01-01' },
      ],
    })
    const items = await fetchMovies()
    expect(items).toHaveLength(1)
    expect(items[0]).toMatchObject({
      id: '1',
      title: 'Test Movie',
      image: 'https://image.tmdb.org/t/p/w780/test.jpg',
      subtitle: '2024',
      meta: '⭐ 7.5',
    })
  })

  it('poster_path가 없으면 image가 undefined다', async () => {
    mockFetch({
      results: [{ id: 2, title: 'No Poster', poster_path: null, vote_average: 6.0, release_date: '2023-05-10' }],
    })
    const items = await fetchMovies()
    expect(items[0].image).toBeUndefined()
  })

  it('API 실패 시 에러를 던진다', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
    await expect(fetchMovies()).rejects.toThrow('TMDB fetch failed')
  })
})

describe('fetchRecipes', () => {
  it('RecommendItem[] 형식으로 반환한다', async () => {
    mockFetch({
      COOKRCP01: {
        row: [
          { RCP_SEQ: '1', RCP_NM: '김치찌개', ATT_FILE_NO_MAIN: 'http://img.com/1.jpg', RCP_WAY2: '끓이기', INFO_ENG: '300' },
        ],
      },
    })
    const items = await fetchRecipes()
    expect(items[0]).toMatchObject({
      id: '1',
      title: '김치찌개',
      image: 'http://img.com/1.jpg',
      subtitle: '끓이기',
      meta: '300 kcal',
    })
  })

  it('row가 없으면 빈 배열을 반환한다', async () => {
    mockFetch({ COOKRCP01: {} })
    const items = await fetchRecipes()
    expect(items).toHaveLength(0)
  })

  it('API 실패 시 에러를 던진다', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
    await expect(fetchRecipes()).rejects.toThrow('Food API fetch failed')
  })
})

describe('fetchTravel', () => {
  it('10개 항목을 반환한다', async () => {
    const items = await fetchTravel()
    expect(items).toHaveLength(10)
  })

  it('각 항목에 id, title, image가 존재한다', async () => {
    const items = await fetchTravel()
    items.forEach((item) => {
      expect(item.id).toBeTruthy()
      expect(item.title).toBeTruthy()
      expect(item.image).toBeTruthy()
    })
  })

  it('이미지가 600x800 고해상도 URL이다', async () => {
    const items = await fetchTravel()
    expect(items[0].image).toContain('600/800')
  })
})

describe('fetchBooks', () => {
  it('RecommendItem[] 형식으로 반환한다', async () => {
    mockFetch({
      documents: [
        { isbn: '123', title: '테스트 책', thumbnail: 'http://img.com/book.jpg', authors: ['저자1'], sale_price: 15000, price: 18000 },
      ],
    })
    const items = await fetchBooks()
    expect(items[0]).toMatchObject({
      id: '123',
      title: '테스트 책',
      image: 'http://img.com/book.jpg',
      subtitle: '저자1',
      meta: '15,000원',
    })
  })

  it('sale_price가 0이면 price를 사용한다', async () => {
    mockFetch({
      documents: [{ isbn: '456', title: '책', thumbnail: '', authors: [], sale_price: 0, price: 12000 }],
    })
    const items = await fetchBooks()
    expect(items[0].meta).toBe('12,000원')
  })

  it('카카오 CDN 썸네일 URL을 고해상도로 변환한다', async () => {
    mockFetch({
      documents: [
        { isbn: '789', title: '책', thumbnail: 'https://search1.kakaocdn.net/thumb/R120x174.q85/?fname=https://t1.daumcdn.net/book/abc', authors: [], sale_price: 0, price: 10000 },
      ],
    })
    const items = await fetchBooks()
    expect(items[0].image).toContain('R480x640.q90')
  })

  it('API 실패 시 에러를 던진다', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
    await expect(fetchBooks()).rejects.toThrow('Kakao book fetch failed')
  })
})

describe('fetchGames', () => {
  it('RecommendItem[] 형식으로 반환한다', async () => {
    mockFetch({
      results: [
        { id: 10, name: 'Test Game', background_image: 'http://img.com/game.jpg', rating: 4.5, genres: [{ name: 'Action' }] },
      ],
    })
    const items = await fetchGames()
    expect(items[0]).toMatchObject({
      id: '10',
      title: 'Test Game',
      image: 'http://img.com/game.jpg',
      subtitle: 'Action',
      meta: '⭐ 4.5',
    })
  })

  it('genres가 없으면 subtitle이 빈 문자열이다', async () => {
    mockFetch({
      results: [{ id: 11, name: 'Game2', background_image: null, rating: 3.0, genres: [] }],
    })
    const items = await fetchGames()
    expect(items[0].subtitle).toBe('')
    expect(items[0].image).toBeUndefined()
  })

  it('API 실패 시 에러를 던진다', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
    await expect(fetchGames()).rejects.toThrow('RAWG fetch failed')
  })
})

describe('fetchShopping', () => {
  it('HTML 태그를 제거하고 RecommendItem[]으로 반환한다', async () => {
    mockFetch({
      items: [
        { productId: '99', title: '<b>나이키</b> 운동화', image: 'http://img.com/shoe.jpg', mallName: '쇼핑몰', lprice: '89000' },
      ],
    })
    const items = await fetchShopping('운동화')
    expect(items[0]).toMatchObject({
      id: '99',
      title: '나이키 운동화',
      image: 'http://img.com/shoe.jpg',
      subtitle: '쇼핑몰',
      meta: '89,000원',
    })
  })

  it('API 실패 시 에러를 던진다', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
    await expect(fetchShopping('test')).rejects.toThrow('Naver shopping fetch failed')
  })
})
