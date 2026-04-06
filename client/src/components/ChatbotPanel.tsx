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
      {/* Header */}
      <div className="h-16 px-6 flex items-center border-b border-outline-variant/10 flex-shrink-0 bg-white/80 backdrop-blur-md">
        <div className="size-9 rounded-xl bg-surface-container overflow-hidden flex-shrink-0">
          <Avatar name="AI" size={36} />
        </div>
        <div className="ml-3">
          <p className="text-sm font-semibold font-headline text-on-surface">AI 챗봇</p>
          <p className="text-xs text-secondary font-body">Ollama · Qwen2.5</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 bg-surface hide-scrollbar">
        {messages.map((msg, i) => (
          <MessageItem key={i} message={msg} />
        ))}
        {isLoading && (
          <div className="flex items-start gap-2">
            <div className="size-8 rounded-xl overflow-hidden flex-shrink-0">
              <Avatar name="AI" size={32} />
            </div>
            <div className="bg-surface-container-lowest rounded-lg rounded-tl-none px-3 py-2 text-sm text-secondary font-body shadow-sm">
              <span className="animate-pulse">...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-outline-variant/10 flex-shrink-0 bg-white">
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-surface-container rounded-xl px-4 py-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder="메시지를 입력하세요..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-secondary/50 font-body text-on-surface disabled:opacity-50"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="size-11 bg-primary-container text-on-primary-container flex items-center justify-center rounded-xl shadow-sm hover:brightness-95 transition-all disabled:opacity-40 flex-shrink-0"
          >
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
            >
              send
            </span>
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
        <div className="bg-primary-container text-on-primary-container rounded-lg rounded-tr-none px-3 py-2 text-sm max-w-[75%] whitespace-pre-wrap break-words font-body shadow-sm">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-2">
      <div className="size-8 rounded-xl overflow-hidden flex-shrink-0">
        <Avatar name="AI" size={32} />
      </div>
      <div className="bg-surface-container-lowest text-on-surface rounded-lg rounded-tl-none px-3 py-2 text-sm max-w-[75%] whitespace-pre-wrap break-words font-body shadow-sm">
        {message.content}
      </div>
    </div>
  )
}
