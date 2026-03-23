// 테스트용 더미 유저 계정
// 비밀번호 공통: 1234

export const DUMMY_USERS = [
  { name: '정용환', email: 'yonghwan@kakao.web', password: '1234' },
  { name: '김민준', email: 'minjun@kakao.web',   password: '1234' },
  { name: '이서연', email: 'seoyeon@kakao.web',  password: '1234' },
  { name: '박지호', email: 'jiho@kakao.web',     password: '1234' },
] as const

export type DummyUser = typeof DUMMY_USERS[number]
