import { useEffect, useRef, useState } from 'react'
import Avatar from './Avatar'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? 'http://localhost:4000'

async function sendToChatbot(messages: ChatMessage[]): Promise<string> {
  const res = await fetch(`${SERVER_URL}/api/chatbot`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  })
  if (!res.ok) throw new Error('챗봇 응답 실패')
  const data = await res.json()
  return data.content
}

export default function ChatbotPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: '안녕하세요! 무엇이든 물어보세요.' },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || isLoading) return

    const userMsg: ChatMessage = { role: 'user', content: text }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput('')
    setIsLoading(true)

    try {
      const reply = await sendToChatbot(next)
      setMessages([...next, { role: 'assistant', content: reply }])
    } catch {
      setMessages([...next, { role: 'assistant', content: '오류가 발생했습니다. Ollama가 실행 중인지 확인해주세요.' }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="h-14 px-4 flex items-center border-b border-[#EBEBEB] flex-shrink-0">
        <Avatar name="AI" size={32} />
        <div className="ml-3">
          <p className="text-sm font-semibold text-[#1A1A1A]">AI 챗봇</p>
          <p className="text-xs text-[#888]">Ollama · Qwen2.5</p>
        </div>
      </div>

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((msg, i) => (
          <MessageItem key={i} message={msg} />
        ))}
        {isLoading && (
          <div className="flex items-start gap-2">
            <Avatar name="AI" size={28} />
            <div className="bg-[#F2F2F2] rounded-2xl rounded-tl-sm px-3 py-2 text-sm text-[#888]">
              <span className="animate-pulse">...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* 입력창 */}
      <div className="px-4 py-3 border-t border-[#EBEBEB] flex-shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="메시지를 입력하세요..."
            className="flex-1 bg-[#F2F2F2] rounded-full px-4 py-2 text-sm outline-none placeholder-[#AAAAAA] disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-9 h-9 bg-[#FEE500] rounded-full flex items-center justify-center disabled:opacity-40 hover:brightness-95 transition-all flex-shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="2.5">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

function MessageItem({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="bg-[#FEE500] rounded-2xl rounded-tr-sm px-3 py-2 text-sm text-[#1A1A1A] max-w-[75%] whitespace-pre-wrap break-words">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-2">
      <Avatar name="AI" size={28} />
      <div className="bg-[#F2F2F2] rounded-2xl rounded-tl-sm px-3 py-2 text-sm text-[#1A1A1A] max-w-[75%] whitespace-pre-wrap break-words">
        {message.content}
      </div>
    </div>
  )
}
