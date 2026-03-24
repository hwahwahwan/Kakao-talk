import { useState } from 'react'
import type { KeyboardEvent } from 'react'

interface Props {
  onJoin: (email: string, password: string) => void
  serverError?: string | null
  onClearServerError?: () => void
}

export default function LoginScreen({ onJoin, serverError, onClearServerError }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = () => {
    const trimmedEmail = email.trim()
    const trimmedPassword = password.trim()

    if (!trimmedEmail) {
      setError('이메일을 입력해주세요')
      return
    }
    if (!trimmedPassword) {
      setError('비밀번호를 입력해주세요')
      return
    }

    setError('')
    onJoin(trimmedEmail, trimmedPassword)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleLogin()
  }

  return (
    <div className="flex items-center justify-center w-full h-full bg-[#F9F9F9]">
      <div className="bg-white rounded-2xl shadow-md p-8 w-80 flex flex-col gap-4">
        {/* 헤더 */}
        <div className="text-center">
          <div className="text-4xl mb-2">💬</div>
          <h1 className="text-xl font-bold text-[#1A1A1A]">KakaoTalk</h1>
          <p className="text-sm text-[#888888] mt-1">카카오계정으로 로그인</p>
        </div>

        {/* 입력 필드 */}
        <div className="flex flex-col gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError('') }}
            onKeyDown={handleKeyDown}
            placeholder="이메일"
            className="border border-[#EBEBEB] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#FEE500] focus:ring-2 focus:ring-[#FEE500]/30 transition-all"
            autoFocus
          />
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError('') }}
            onKeyDown={handleKeyDown}
            placeholder="비밀번호"
            className="border border-[#EBEBEB] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#FEE500] focus:ring-2 focus:ring-[#FEE500]/30 transition-all"
          />
          {error && (
            <p className="text-[12px] text-red-500 px-1">{error}</p>
          )}
          {serverError && (
            <div className="flex items-center justify-between bg-red-50 border border-red-200 text-red-600 text-[13px] px-3 py-2 rounded-lg">
              <span>{serverError}</span>
              <button
                onClick={onClearServerError}
                className="ml-2 text-red-400 hover:text-red-600 leading-none"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* 로그인 버튼 */}
        <button
          onClick={handleLogin}
          className="bg-[#FEE500] text-[#1A1A1A] font-semibold py-2.5 rounded-lg text-sm transition-opacity hover:opacity-90 active:opacity-100"
        >
          로그인
        </button>

      </div>
    </div>
  )
}
