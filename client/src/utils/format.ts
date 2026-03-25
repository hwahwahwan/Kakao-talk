/** 메시지 버블용 시간 (항상 오전/오후 H:MM) */
export function formatMessageTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

/** 채팅 목록용 시간 (오늘 → 오전/오후 H:MM, 그 외 → M. D.) */
export function formatChatTime(iso: string): string {
  const d = new Date(iso)
  if (d.toDateString() === new Date().toDateString()) {
    return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: true })
  }
  return d.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })
}
