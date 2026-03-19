import { useState } from 'react'
import type { KeyboardEvent } from 'react'

interface Props {
  onJoin: (name: string) => void
}

export default function LoginScreen({ onJoin }: Props) {
  const [name, setName] = useState('')

  const handleJoin = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    onJoin(trimmed)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleJoin()
  }

  return (
    <div className="flex items-center justify-center w-full h-full bg-[#F9F9F9]">
      <div className="bg-white rounded-2xl shadow-md p-8 w-80 flex flex-col gap-4">
        <div className="text-center">
          <div className="text-4xl mb-2">💬</div>
          <h1 className="text-xl font-bold text-[#1A1A1A]">KakaoTalk</h1>
          <p className="text-sm text-[#888888] mt-1">이름을 입력하고 입장하세요</p>
        </div>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="이름 입력"
          maxLength={20}
          className="border border-[#EBEBEB] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#FEE500] focus:ring-2 focus:ring-[#FEE500]/30 transition-all"
          autoFocus
        />
        <button
          onClick={handleJoin}
          disabled={!name.trim()}
          className="bg-[#FEE500] text-[#1A1A1A] font-semibold py-2.5 rounded-lg text-sm transition-opacity disabled:opacity-40 hover:opacity-90 active:opacity-100"
        >
          입장하기
        </button>
      </div>
    </div>
  )
}
