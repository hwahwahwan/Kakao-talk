import type { Message } from '../types'

interface Props {
  message: Message
  isMine: boolean
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

export default function MessageBubble({ message, isMine }: Props) {
  if (message.type === 'system') {
    return (
      <div className="flex justify-center my-1">
        <span className="text-[12px] text-[#888888] bg-black/10 px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    )
  }

  return (
    <div className={`flex items-end gap-1.5 mb-1 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
      <div
        className={`max-w-[65%] px-3.5 py-2 text-[14px] text-[#1A1A1A] whitespace-pre-wrap break-words ${
          isMine
            ? 'bg-[#FEE500] rounded-[18px] rounded-br-[4px]'
            : 'bg-white rounded-[18px] rounded-bl-[4px]'
        }`}
        style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.08)' }}
      >
        {message.content}
      </div>
      <span className="text-[11px] text-[#888888] flex-shrink-0 mb-0.5">
        {formatTime(message.createdAt)}
      </span>
    </div>
  )
}
