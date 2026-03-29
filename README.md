# KakaoTalk Web Clone

실시간 1:1 채팅 웹앱. 두 브라우저 탭에서 서로 메시지를 주고받을 수 있습니다.

## 빠른 시작

### 1. 의존성 설치

```bash
npm install
cd client && npm install
cd ../server && npm install
```

### 2. Ollama 설치 및 모델 다운로드 (최초 1회)

```bash
brew install ollama
OLLAMA_MODELS="/Users/yonghwan/Desktop/Kakao talk/ollama-models" ollama serve
# 새 터미널에서:
ollama pull qwen2.5:3b
```

> 자세한 내용은 `docs/00_ollama-setup.md` 참고

### 3. 전체 실행 (루트 폴더에서)

```bash
npm run dev
```

Ollama + 서버 + 클라이언트가 한 번에 실행됩니다. 종료는 `Ctrl+C`.

### 4. 채팅 테스트

1. `http://localhost:3000` 을 **탭 2개** 열기
2. 각 탭에서 **다른 이름**으로 로그인
3. 한쪽 탭의 친구 목록에서 상대방 클릭 → 채팅 시작

## 기능 테스트

```bash
# 서버가 실행 중인 상태에서
node test.js
```

## 환경변수

| 파일 | 키 | 기본값 |
|---|---|---|
| `client/.env` | `VITE_SERVER_URL` | `http://localhost:4000` |
| `server/.env` | `PORT` | `4000` |
| `server/.env` | `CLIENT_URL` | `http://localhost:3000` |
| `server/.env` | `OLLAMA_URL` | `http://localhost:11434` |
| `server/.env` | `OLLAMA_MODEL` | `qwen2.5:3b` |
