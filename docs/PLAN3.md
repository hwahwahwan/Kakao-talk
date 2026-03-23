# PLAN3 — 버그 수정 + 더미 유저 로그인 + 설정 계정 화면

---

## 1. 버그: 채팅방 재입장 후 나가기 안 됨

`room:create`에서 방이 이미 있으면 `memberIds` 업데이트 건너뜀 → A 재입장 시 멤버로 인식 안 됨.

**수정:** `server/index.js`
```js
if (!rooms[roomId]) {
  rooms[roomId] = { id: roomId, memberIds: [userId, targetUserId], messages: [] }
} else if (!rooms[roomId].memberIds.includes(userId)) {
  rooms[roomId].memberIds.push(userId)
}
```

---

## 2. 더미 유저 + 이메일/비밀번호 로그인

### 더미 유저 파일 위치

```
client/src/data/dummyUsers.ts   ← 실제 사용 파일
```

비밀번호 전부 `1234`

```ts
export const DUMMY_USERS = [
  { name: '정용환', email: 'yonghwan@kakao.web', password: '1234' },
  { name: '김민준', email: 'minjun@kakao.web',   password: '1234' },
  { name: '이서연', email: 'seoyeon@kakao.web',  password: '1234' },
  { name: '박지호', email: 'jiho@kakao.web',     password: '1234' },
] as const
```

### 로그인 화면

- 이메일 입력 + 비밀번호 입력만 (이름 입력 없음)
- 에러 메시지는 인풋 아래에 인라인 표시

```
┌──────────────────────────┐
│  💬 KakaoTalk            │
│  카카오계정으로 로그인   │
│                          │
│  [ 이메일 입력         ] │
│  [ 비밀번호 입력       ] │
│  [ 오류 메시지 (조건부)] │
│  [      로그인          ]│
└──────────────────────────┘
```

### 로그인 검증 로직 (클라이언트)

```
이메일 입력 → DUMMY_USERS에서 찾기
  → 없으면: "등록되지 않은 이메일입니다"
  → 있으면: 비밀번호 === '1234' 확인
    → 틀리면: "비밀번호가 올바르지 않습니다"
    → 맞으면: joinAs(user.name, user.email)
```

비밀번호 검증은 클라이언트에서만 처리 (서버 인증 없음).

### 타입 변경

```ts
// User.email 추가 (optional — me에만 세팅)
export interface User {
  id: string
  name: string
  email?: string
}
```

### 데이터 흐름

```
LoginScreen → onJoin(name, email)
App.tsx     → handleJoin(name, email)
useSocket   → joinAs(name, email) → emit('user:join', { name, email })
Server      → users[id] = { id, name, email, socketId }
           → emit('user:joined', { me: { id, name, email }, onlineUsers })
Store       → setMe({ id, name, email })
```

---

## 3. 설정 — 계정 탭

| UI | 데이터 |
|---|---|
| 계정(이메일) | `me.email` |
| ID | `me.id.slice(0, 8)` |
| 프로필 이름 | `me.name` |
| 친구 수 | `onlineUsers.length`명 |
| 버튼들 | `showToast('준비 중인 기능입니다')` |

닫기: macOS 빨간 dot (●) 스타일로 교체

---

## 이슈 검토

| # | 항목 | 결과 |
|---|---|---|
| 1 | `User.email` optional → 기존 코드 호환 | room members / onlineUsers 영향 없음 ✅ |
| 2 | `hydrateRoom` email 미포함 | `{ id, name }` 만 반환, 변경 없음 ✅ |
| 3 | 비밀번호 클라이언트 검증 | 보안 앱 아닌 테스트 클론 — 충분 ✅ |
| 4 | 같은 유저 중복 입장 | uuid 달라서 별도 유저로 처리 ✅ |
| 5 | `joinAs` 시그니처 변경 | App.tsx / LoginScreen 모두 수정 명시 ✅ |
| 6 | `me.email` undefined 가능성 | 직접 입력 없애고 DUMMY_USERS만 사용 → 항상 email 있음 ✅ |

---

## 변경 파일 목록

| 파일 | 유형 |
|---|---|
| `server/index.js` | 버그 수정 + email 수신/저장 |
| `client/src/types/index.ts` | `User.email?` 추가 |
| `client/src/data/dummyUsers.ts` | **신규** — 더미 유저 데이터 |
| `client/src/hooks/useSocket.ts` | `joinAs(name, email)` |
| `client/src/components/LoginScreen.tsx` | 이메일+비번 로그인 UI |
| `client/src/App.tsx` | `handleJoin(name, email)` |
| `client/src/components/SettingsModal.tsx` | 계정 탭 + macOS 닫기 버튼 |

총 7개 (신규 1개)
