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
    <footer className="bg-white p-4 border-t border-outline-variant/10 flex-shrink-0">
      {/* Icon toolbar */}
      <div className="flex items-center gap-4 text-secondary/60 mb-3">
        <button onClick={() => showToast('준비 중인 기능입니다')} className="hover:text-on-surface transition-colors" title="파일 첨부">
          <span className="material-symbols-outlined !text-[22px]">add_circle</span>
        </button>
        <button onClick={() => showToast('준비 중인 기능입니다')} className="hover:text-on-surface transition-colors" title="이모티콘">
          <span className="material-symbols-outlined !text-[22px]">mood</span>
        </button>
        <button onClick={() => showToast('준비 중인 기능입니다')} className="hover:text-on-surface transition-colors" title="이미지">
          <span className="material-symbols-outlined !text-[22px]">image</span>
        </button>
        <button onClick={() => showToast('준비 중인 기능입니다')} className="hover:text-on-surface transition-colors" title="파일">
          <span className="material-symbols-outlined !text-[22px]">attach_file</span>
        </button>
      </div>

      {/* Input row */}
      <div className="flex items-end gap-3">
        <div className="flex-1 min-h-[44px] bg-surface-container rounded-xl px-4 py-2 flex items-center">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder="메시지 입력..."
            rows={1}
            className="w-full bg-transparent border-none focus:ring-0 resize-none font-body text-sm text-on-surface placeholder:text-secondary/50 p-0 outline-none max-h-[120px] overflow-y-auto leading-relaxed"
          />
        </div>
        <button
          onClick={handleSend}
          disabled={!content.trim()}
          className="size-11 bg-primary-container text-on-primary-container flex items-center justify-center rounded-xl shadow-sm hover:brightness-95 transition-all disabled:opacity-40 flex-shrink-0"
        >
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
          >
            send
          </span>
        </button>
      </div>
    </footer>
  )
}
