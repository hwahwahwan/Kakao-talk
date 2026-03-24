// 한글, 숫자, 공백, 구두점으로만 이루어진 텍스트인지 확인
export function isKorean(text: string): boolean {
  return /^[\uAC00-\uD7A3\s\d\p{P}]+$/u.test(text)
}
