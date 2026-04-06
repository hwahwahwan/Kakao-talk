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
    <div className="flex items-center justify-center w-full h-full bg-surface">
      <div className="bg-surface-container-lowest rounded-2xl shadow-md p-8 w-80 flex flex-col gap-4" style={{ boxShadow: '0 12px 32px rgba(26,28,28,0.08)' }}>
        {/* Header */}
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-primary-container mb-2 block" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 48" }}>chat</span>
          <h1 className="text-xl font-bold font-headline text-on-surface">KakaoTalk</h1>
          <p className="text-sm text-secondary mt-1 font-body">카카오계정으로 로그인</p>
        </div>

        {/* Inputs */}
        <div className="flex flex-col gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError('') }}
            onKeyDown={handleKeyDown}
            placeholder="이메일"
            className="border border-outline-variant/40 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/30 transition-all font-body text-on-surface bg-surface"
            autoFocus
          />
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError('') }}
            onKeyDown={handleKeyDown}
            placeholder="비밀번호"
            className="border border-outline-variant/40 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/30 transition-all font-body text-on-surface bg-surface"
          />
          {error && (
            <p className="text-xs text-red-500 px-1 font-body">{error}</p>
          )}
          {serverError && (
            <div className="flex items-center justify-between bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-lg">
              <span>{serverError}</span>
              <button onClick={onClearServerError} className="ml-2 text-red-400 hover:text-red-600 leading-none">✕</button>
            </div>
          )}
        </div>

        {/* Login button */}
        <button
          onClick={handleLogin}
          className="bg-primary-container text-on-primary-container font-headline font-semibold py-2.5 rounded-lg text-sm transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #FEE500, #DEC800)' }}
        >
          로그인
        </button>
      </div>
    </div>
  )
}
