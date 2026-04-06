import { useState } from 'react'
import type { Message } from '../types'
import { translateToKorean } from '../services/translateService'
import { isKorean } from '../utils/language'
import { formatMessageTime } from '../utils/format'
import Avatar from './Avatar'

interface Props {
  message: Message
  isMine: boolean
  showSenderName?: boolean
}

export default function MessageBubble({ message, isMine, showSenderName = false }: Props) {
  const [translated, setTranslated] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showTranslated, setShowTranslated] = useState(false)

  if (message.type === 'system') {
    return (
      <div className="flex justify-center my-2">
        <span className="bg-black/10 text-white px-4 py-1 rounded-full text-xs font-label">
          {message.content}
        </span>
      </div>
    )
  }

  const handleTranslate = async () => {
    if (showTranslated) { setShowTranslated(false); return }
    if (translated) { setShowTranslated(true); return }
    setLoading(true)
    try {
      const result = await translateToKorean(message.content)
      if (result) { setTranslated(result); setShowTranslated(true) }
    } finally {
      setLoading(false)
    }
  }

  const showTranslateBtn = !isMine && !isKorean(message.content)
  const time = formatMessageTime(message.createdAt)

  if (isMine) {
    return (
      <div className="flex flex-row-reverse items-start gap-3 mb-3">
        <div className="flex flex-col gap-1 max-w-[70%] items-end">
          <div className="flex flex-row-reverse items-end gap-2">
            <div className="chat-bubble-me bg-primary-container px-3 py-2 rounded-lg rounded-tr-none shadow-sm text-on-primary-container font-body text-sm leading-relaxed whitespace-pre-wrap break-words">
              {showTranslated && translated ? (
                <>
                  <span>{translated}</span>
                  <div className="mt-1 pt-1 border-t border-black/10 text-xs text-on-primary-container/60">
                    {message.content}
                  </div>
                </>
              ) : (
                message.content
              )}
            </div>
            <div className="flex flex-col items-end gap-0.5 mb-1 flex-shrink-0">
              <span className="text-[10px] text-on-surface/50 font-label">{time}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3 mb-3">
      {showSenderName ? (
        <div className="size-10 rounded-xl bg-surface-container-lowest shrink-0 overflow-hidden shadow-sm">
          <Avatar name={message.senderName ?? '?'} size={40} />
        </div>
      ) : (
        <div className="w-10 shrink-0" />
      )}
      <div className="flex flex-col gap-1 max-w-[70%]">
        {showSenderName && message.senderName && (
          <span className="text-xs font-medium text-on-surface/70 ml-1">{message.senderName}</span>
        )}
        <div className="flex items-end gap-2">
          <div className="chat-bubble-them bg-surface-container-lowest px-3 py-2 rounded-lg rounded-tl-none shadow-sm text-on-surface font-body text-sm leading-relaxed whitespace-pre-wrap break-words">
            {showTranslated && translated ? (
              <>
                <span>{translated}</span>
                <div className="mt-1 pt-1 border-t border-black/10 text-xs text-secondary">
                  {message.content}
                </div>
              </>
            ) : (
              message.content
            )}
            {showTranslateBtn && (
              <button
                onClick={handleTranslate}
                disabled={loading}
                className="block mt-1 text-[11px] text-secondary hover:text-on-surface transition-colors disabled:opacity-50"
              >
                {loading ? '번역 중...' : showTranslated ? '원문만 보기' : '번역'}
              </button>
            )}
          </div>
          <span className="text-[10px] text-on-surface/50 font-label mb-1 flex-shrink-0">{time}</span>
        </div>
      </div>
    </div>
  )
}
