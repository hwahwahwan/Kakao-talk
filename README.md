# KakaoTalk Web Clone

실시간 1:1 채팅 웹앱. 두 브라우저 탭에서 서로 메시지를 주고받을 수 있습니다.

## 빠른 시작

### 1. 의존성 설치

```bash
cd client && npm install
cd ../server && npm install
```

### 2. 서버 실행

```bash
cd server
npm run dev
# → http://localhost:4000
```

### 3. 클라이언트 실행 (새 터미널)

```bash
cd client
npm run dev
# → http://localhost:3000
```

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
