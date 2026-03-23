import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import { DUMMY_USERS } from '../data/dummyUsers'

interface Props {
  onJoin: (name: string, email: string) => void
}

export default function LoginScreen({ onJoin }: Props) {
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

    const user = DUMMY_USERS.find((u) => u.email === trimmedEmail)
    if (!user) {
      setError('등록되지 않은 이메일입니다')
      return
    }
    if (trimmedPassword !== user.password) {
      setError('비밀번호가 올바르지 않습니다')
      return
    }

    setError('')
    onJoin(user.name, user.email)
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
