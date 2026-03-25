import { describe, it, expect } from 'vitest'
import { formatMessageTime, formatChatTime } from './format'

describe('formatMessageTime', () => {
  it('오전/오후 포함 12시간제 형식 반환', () => {
    const result = formatMessageTime('2024-01-15T09:30:00.000Z')
    expect(result).toMatch(/오전|오후/)
  })

  it('시:분 형식 포함', () => {
    const result = formatMessageTime('2024-01-15T15:40:00.000Z')
    expect(result).toMatch(/\d{1,2}:\d{2}/)
  })

  it('유효한 ISO 날짜 문자열 처리', () => {
    const result = formatMessageTime('2024-06-01T00:00:00.000Z')
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })
})

describe('formatChatTime', () => {
  it('오늘 날짜는 오전/오후 시간 형식 반환', () => {
    const now = new Date().toISOString()
    const result = formatChatTime(now)
    expect(result).toMatch(/오전|오후/)
    expect(result).toMatch(/\d{1,2}:\d{2}/)
  })

  it('과거 날짜는 M. D. 형식 반환', () => {
    const past = '2020-01-15T09:00:00.000Z'
    const result = formatChatTime(past)
    // 날짜 형식: "1. 15." 또는 "1월 15일" 형태
    expect(result).toMatch(/\d/)
    expect(result).not.toMatch(/오전|오후/)
  })

  it('유효한 ISO 날짜 문자열 처리', () => {
    const result = formatChatTime('2024-03-25T12:00:00.000Z')
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })
})
