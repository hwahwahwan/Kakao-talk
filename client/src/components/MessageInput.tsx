import { useState, useRef, useEffect } from 'react'
import type { KeyboardEvent } from 'react'
import { useChatStore } from '../store/useChatStore'

interface Props {
  onSend: (content: string) => void
}

export default function MessageInput({ onSend }: Props) {
  const [content, setContent] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const showToast = useChatStore((s) => s.showToast)

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  const handleSend = () => {
    if (content.trim() === '') return
    onSend(content)
    setContent('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }

  return (
    <div className="bg-white border-t border-[#EBEBEB] px-3 py-2.5 flex items-end gap-2">
      {/* 왼쪽 아이콘들 */}
      <div className="flex gap-1 mb-0.5">
        <ActionBtn onClick={() => showToast('준비 중인 기능입니다')} title="파일 첨부">
          <PlusIcon />
        </ActionBtn>
        <ActionBtn onClick={() => showToast('준비 중인 기능입니다')} title="이모티콘">
          <EmojiIcon />
        </ActionBtn>
      </div>

      {/* 텍스트 입력 */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        placeholder="메시지 입력"
        rows={1}
        className="flex-1 resize-none outline-none text-[14px] text-[#1A1A1A] placeholder-[#888888] leading-relaxed py-1 max-h-[120px] overflow-y-auto"
        style={{ lineHeight: '1.5' }}
      />

      {/* 전송 버튼 */}
      <button
        onClick={handleSend}
        disabled={!content.trim()}
        className="bg-[#FEE500] text-[#1A1A1A] text-[13px] font-semibold px-3 py-1.5 rounded-lg mb-0.5 transition-opacity disabled:opacity-40 hover:opacity-90 flex-shrink-0"
      >
        전송
      </button>
    </div>
  )
}

function ActionBtn({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="w-8 h-8 flex items-center justify-center text-[#888888] hover:text-[#1A1A1A] transition-colors"
    >
      {children}
    </button>
  )
}

function PlusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  )
}

function EmojiIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  )
}
