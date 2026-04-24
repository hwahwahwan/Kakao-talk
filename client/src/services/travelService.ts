import type { RecommendItem } from '../types/recommend'

const P = (seed: string) => `https://picsum.photos/seed/${seed}/600/800`

const MOCK_TRAVEL: RecommendItem[] = [
  { id: '1', title: '경복궁', subtitle: '서울 종로구', image: P('gyeongbok') },
  { id: '2', title: '해운대 해수욕장', subtitle: '부산 해운대구', image: P('haeundae') },
  { id: '3', title: '제주 성산일출봉', subtitle: '제주 서귀포시', image: P('seongsan') },
  { id: '4', title: '남산서울타워', subtitle: '서울 용산구', image: P('namsan') },
  { id: '5', title: '전주 한옥마을', subtitle: '전북 전주시', image: P('jeonju') },
  { id: '6', title: '설악산 국립공원', subtitle: '강원 속초시', image: P('seoraksan') },
  { id: '7', title: '창덕궁', subtitle: '서울 종로구', image: P('changdeok') },
  { id: '8', title: '부산 감천문화마을', subtitle: '부산 사하구', image: P('gamcheon') },
  { id: '9', title: '여수 돌산도', subtitle: '전남 여수시', image: P('yeosu') },
  { id: '10', title: '경주 불국사', subtitle: '경북 경주시', image: P('bulguksa') },
]

export async function fetchTravel(): Promise<RecommendItem[]> {
  return MOCK_TRAVEL
}
