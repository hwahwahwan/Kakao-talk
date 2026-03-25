import { useState } from 'react'
import type { Message } from '../types'
import { translateToKorean } from '../services/translateService'
import { isKorean } from '../utils/language'
import { formatMessageTime } from '../utils/format'

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
      <div className="flex justify-center my-1">
        <span className="text-[12px] text-[#888888] bg-black/10 px-3 py-1 rounded-full">
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

  return (
    <div className={`mb-1 ${isMine ? '' : ''}`}>
      {!isMine && showSenderName && message.senderName && (
        <div className="text-[11px] text-[#555555] font-medium mb-0.5 ml-0.5">
          {message.senderName}
        </div>
      )}
      <div className={`flex items-end gap-1.5 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
        <div
          className={`max-w-[65%] px-3.5 py-2 text-[14px] text-[#1A1A1A] whitespace-pre-wrap break-words ${
            isMine
              ? 'bg-[#FEE500] rounded-[18px] rounded-br-[4px]'
              : 'bg-white rounded-[18px] rounded-bl-[4px]'
          }`}
          style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.08)' }}
        >
          {showTranslated && translated ? (
            <>
              <span>{translated}</span>
              <div className="mt-1 pt-1 border-t border-black/10 text-[12px] text-[#888888]">
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
              className="block mt-1 text-[11px] text-[#888888] hover:text-[#555555] transition-colors disabled:opacity-50"
            >
              {loading ? '번역 중...' : showTranslated ? '원문만 보기' : '번역'}
            </button>
          )}
        </div>
        <span className="text-[11px] text-[#888888] flex-shrink-0 mb-0.5">
          {formatMessageTime(message.createdAt)}
        </span>
      </div>
    </div>
  )
}
