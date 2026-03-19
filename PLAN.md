# KakaoTalk Web 구현 계획

## 핵심 목표
- localhost:3000 두 탭에서 실시간 채팅 가능
- DB 없이 구현
- 동작하지 않는 버튼 없음 — 미구현 기능은 반드시 "준비 중" 토스트/모달로 처리
- 친구 목록 = 현재 접속 중인 유저 (목업 없음), 채팅방은 실제 Socket.io 기반 실시간 동작

---

## 코딩 규칙 (필수)

### 절대 하드코딩 금지
- URL, 포트, 색상, 문자열, 숫자 등 **모든 고정값은 상수 또는 env로 관리**
- 코드 안에 `"http://localhost:4000"`, `3000`, `"#FEE500"` 같은 값 직접 작성 금지
- 서버(JS)는 클라이언트(TS) constants를 import 불가 → `server/constants.js`에 동일한 이벤트 이름을 별도 정의하고 값을 동기화 유지

### 상수 관리 (`client/src/constants/`)

```
client/src/constants/
├── socket.ts      # 소켓 이벤트 이름
├── colors.ts      # 색상 팔레트
├── layout.ts      # 사이즈, 여백 등 레이아웃 수치
└── index.ts       # 일괄 export
```

예시:
```ts
// constants/socket.ts
export const SOCKET_EVENTS = {
  // 유저
  USER_JOIN: 'user:join',
  USER_JOINED: 'user:joined',
  USER_LIST: 'user:list',
  USER_DISCONNECT: 'user:disconnect',
  // 채팅방
  ROOM_CREATE: 'room:create',
  ROOM_JOINED: 'room:joined',
  ROOM_INVITED: 'room:invited',
  ROOM_LIST: 'room:list',
  ROOM_LEAVE: 'room:leave',
  ROOM_ERROR: 'room:error',
  // 메시지
  MESSAGE_SEND: 'message:send',
  MESSAGE_RECEIVE: 'message:receive',
  // MESSAGE_READ / MESSAGE_READ_ACK 제거 — 서버가 unread 미추적, setActiveRoom 시 client-side clearUnread로 대체
} as const

// constants/colors.ts
export const COLORS = {
  BRAND_YELLOW: '#FEE500',
  CHAT_BG: '#B2C7D9',
  BUBBLE_RECEIVED: '#FFFFFF',
  BUBBLE_SENT: '#FEE500',
  BADGE_RED: '#FE4141',
  TEXT_PRIMARY: '#1A1A1A',
  TEXT_SECONDARY: '#888888',
  DIVIDER: '#EBEBEB',
  SIDEBAR_BG: '#F9F9F9',
} as const

// constants/layout.ts
export const LAYOUT = {
  SIDEBAR_WIDTH: 72,
  SETTINGS_SIDEBAR_WIDTH: 140,
  AVATAR_SIZE: 40,
  CHAT_ITEM_HEIGHT: 60,
  TOAST_DURATION_MS: 2000,
} as const
```

### 환경변수 관리 (`.env`)

```
client/.env
VITE_SERVER_URL=http://localhost:4000

server/.env
PORT=4000
CLIENT_URL=http://localhost:3000
```

사용 예시:
```ts
// client — Vite는 VITE_ 접두사 필수
const SERVER_URL = import.meta.env.VITE_SERVER_URL

// server — Node.js (PORT는 string이므로 parseInt 필수)
const PORT = parseInt(process.env.PORT, 10) || 4000
const CLIENT_URL = process.env.CLIENT_URL ?? 'http://localhost:3000'
```

- `.env` 파일은 `.gitignore`에 추가
- `.env.example` 파일을 만들어 키 목록만 커밋

---

## 통신 방식 결정: Socket.io (WebSocket)

### 왜 Socket.io인가?
- **DB 불필요**: 서버 메모리에만 메시지 저장 (서버 재시작 시 초기화 — 데모용으로 OK)
- **즉각적 실시간**: 클라이언트가 메시지를 보내면 서버가 받아서 연결된 모든 탭에 브로드캐스트
- **설정 최소**: npm install 몇 개면 동작

### 동작 흐름
```
[탭 A] ──send msg──▶ [Socket.io 서버 (메모리)] ──broadcast──▶ [탭 B]
[탭 B] ──send msg──▶ [Socket.io 서버 (메모리)] ──broadcast──▶ [탭 A]
```

### CORS 설정 필수
- Vite 클라이언트(3000) ↔ Express 서버(4000) 간 크로스 오리진 발생
- Socket.io 서버 초기화 시 `cors: { origin: CLIENT_URL }` 설정 필수
- Express에도 `cors` 미들웨어 적용

### 메모리 저장 (DB 대체)
```js
// 서버 메모리에 보관 (재시작하면 사라짐 — 의도적)
const rooms = {}
// { [roomId]: { id, memberIds: string[], messages: [] } }
// ❌ name 필드 없음 — name은 클라이언트에서 members로 계산
// 클라이언트에 Room 전송 시 memberIds → User[] hydration 필수:
//   const members = room.memberIds.map(id => users[id]).filter(Boolean)

const users = {}
// { [userId]: { id, name, socketId } }
// userId는 로그인 시 서버가 발급 (crypto.randomUUID()), socketId와 분리
// ⚠️ disconnect 시 users에서 삭제하면 room hydration 시 해당 유저 이름 손실
// → disconnect 시 users에서 삭제하지 않고 socketId만 null로 표시
// → user:list 브로드캐스트 시 socketId가 null인 유저는 제외 (오프라인 취급)

const socketToUser = {}
// { [socketId]: userId }  ← disconnect 시 역방향 조회에 필수
```

> socketId와 userId를 분리하는 이유: 새로고침/재연결 시 socketId는 바뀌지만 userId는 유지해야 같은 사람으로 인식 가능. 단, 이 데모에서는 새로고침 = 재로그인으로 처리 (userId 재발급)

> disconnect 이벤트는 socketId만 제공 → `socketToUser[socket.id]`로 userId 역조회 후 `users`에서 삭제

> 서버에서 `process.env.PORT`는 string 타입이므로 환경변수 사용 예시처럼 `parseInt` 필수 (`??` 연산자 사용 금지)

---

## 데이터 전략

### 친구 목록 — 접속 중인 유저 = 친구 (목업 없음)
- 로그인(이름 입력) 시 서버에 `user:join` 전송
- 서버는 현재 접속한 **다른 유저 목록**을 `user:list`로 브로드캐스트
- 친구 탭 = 나를 제외한 접속 중인 유저 목록 (실시간 갱신)
- 유저 접속/퇴장 시 목록 자동 업데이트

```
탭 A: "철수"로 로그인 → 친구 목록에 "영희" 표시
탭 B: "영희"로 로그인 → 친구 목록에 "철수" 표시
탭 C 퇴장 → 양쪽 목록에서 즉시 사라짐
```

- 목업 데이터 파일 불필요
- 빈 친구 목록일 때: "현재 접속 중인 친구가 없습니다" 안내 문구 표시

### 채팅방 — 실시간 Socket.io (서버 메모리)

**중복 방 방지:** roomId를 두 유저의 userId를 정렬 후 조합해서 생성
```js
// 항상 같은 두 유저 간에는 동일한 roomId 보장
const roomId = [userIdA, userIdB].sort().join('_')
```

**채팅방 생성 흐름:**
```
[탭 A] 친구(B) 클릭
  → A: room:create { targetUserId: B.id }
  → 서버: B가 users에 없으면 → A에게 room:error { message: '상대방이 오프라인입니다' } 반환
  → 서버: roomId 계산, 방 없으면 생성
  → 서버: A, B 모두 socket.io room에 즉시 join  ← 핵심
  → 서버 → A: room:joined { room, history[] }   ← 채팅창 오픈
  → 서버 → B: room:invited { room }             ← 채팅방 목록에 추가
  → 이 시점부터 A/B 모두 message:receive 수신 가능
  → B가 채팅방 클릭하면 채팅창 오픈 (별도 join 요청 불필요)
```

**유저 퇴장 시 처리:**
- 접속 끊기면 `user:disconnect` 브로드캐스트
- 해당 유저가 속한 채팅방의 메시지 히스토리는 서버 메모리에 유지 (방은 사라지지 않음)
- **단, 이 데모는 새로고침 = 재로그인 = 새 userId 발급** → 새 userId로는 이전 roomId(구 userId 조합)를 찾을 수 없으므로 히스토리 접근 불가
- 즉, 새로고침하면 이전 채팅 내용은 사라짐 — 데모 한계로 허용

### 미구현 기능 처리 — "준비 중" 규칙
- 모든 버튼은 반드시 onClick 핸들러 존재
- 미구현 기능 클릭 시 → `ToastMessage` 컴포넌트로 "준비 중인 기능입니다" 표시 (2초 후 자동 닫힘)
- 절대 onClick 없는 버튼 작성 금지

---

## 기술 스택

| 영역 | 기술 |
|---|---|
| 프론트엔드 | React + TypeScript + Vite |
| 스타일 | Tailwind CSS |
| 전역 상태 | Zustand |
| 실시간 통신 | Socket.io-client |
| 백엔드 | Node.js + Express + Socket.io |
| DB | ❌ 없음 (서버 in-memory) |

---

## 프로젝트 구조

```
Kakao talk/
├── client/
│   ├── vite.config.ts
│   ├── tailwind.config.ts   # .ts로 작성해야 COLORS 상수 import 가능
│   ├── postcss.config.js
│   ├── src/
│   │   ├── components/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── FriendList.tsx
│   │   │   ├── ChatList.tsx
│   │   │   ├── ChatWindow.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   ├── MessageInput.tsx
│   │   │   ├── DateDivider.tsx
│   │   │   ├── Avatar.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── FilterChips.tsx
│   │   │   ├── MoreTab.tsx
│   │   │   ├── SettingsModal.tsx
│   │   │   └── ToastMessage.tsx
│   │   ├── constants/
│   │   │   ├── socket.ts
│   │   │   ├── colors.ts
│   │   │   ├── layout.ts
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   └── useSocket.ts
│   │   ├── store/
│   │   │   └── useChatStore.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── App.tsx
│   ├── .env
│   ├── .env.example
│   ├── index.html
│   └── package.json
│
├── server/
│   ├── index.js
│   ├── constants.js     # 서버용 이벤트 상수 (client constants와 값 동일하게 유지)
│   ├── .env
│   ├── .env.example
│   └── package.json
│
├── .gitignore
├── DESIGN.md
└── PLAN.md
```

---

## 타입 정의 (`types/index.ts`)

```ts
export interface User {
  id: string
  name: string
}

export interface Message {
  id: string
  roomId: string
  senderId: string | null    // system 메시지는 null
  senderName: string | null  // system 메시지는 null
  content: string
  type: 'text' | 'system'    // system: 입장/퇴장 알림 메시지
  createdAt: string          // ISO 8601
}

export interface Room {
  id: string
  // name 없음 — 클라이언트에서 아래처럼 계산
  // const roomName = room.members.find(m => m.id !== me.id)?.name ?? '알 수 없음'
  members: User[]
  lastMessage?: Message
  unreadCount: number  // 서버가 보내지 않음 — 수신 시 클라이언트가 0으로 주입
}

export type ActiveTab = 'friends' | 'chats' | 'more'
```

---

## Zustand Store 구조 (`store/useChatStore.ts`)

```ts
interface ChatStore {
  // 내 정보
  me: User | null

  // 친구 (접속 중인 유저)
  onlineUsers: User[]

  // 채팅방
  rooms: Room[]
  activeRoomId: string | null

  // 메시지 (roomId → Message[])
  messages: Record<string, Message[]>

  // UI 상태
  activeTab: ActiveTab
  toastMessage: string | null

  // 액션
  setMe: (user: User) => void
  setOnlineUsers: (users: User[]) => void
  addRoom: (room: Room) => void  // upsert 방식: 이미 있으면 members 업데이트, 없으면 추가
  updateRoom: (roomId: string, patch: Partial<Room>) => void  // lastMessage, unreadCount 갱신
  setActiveRoom: (roomId: string | null) => void
  // addMessage 내부 처리 순서:
  //   1. messages[roomId]에 메시지 추가
  //   2. rooms에서 해당 room의 lastMessage 업데이트
  //   3. message.roomId !== activeRoomId 이면 incrementUnread 호출
  addMessage: (message: Message) => void
  setHistory: (roomId: string, messages: Message[]) => void  // room:joined 히스토리 일괄 로드
  incrementUnread: (roomId: string) => void
  clearUnread: (roomId: string) => void
  setActiveTab: (tab: ActiveTab) => void
  showToast: (message: string) => void  // 내부에서 기존 timeout 취소 후 TOAST_DURATION_MS 후 clearToast 호출
  clearToast: () => void
}
```

---

## Socket.io 이벤트 설계

### 유저
| 이벤트 | 방향 | 페이로드 | 설명 |
|---|---|---|---|
| `user:join` | C → S | `{ name }` | 입장 시 이름 등록 |
| `user:joined` | S → C | `{ me: User, onlineUsers: User[] }` | 내 정보 + 현재 접속자 목록 |
| `user:list` | S → All | `{ users: User[] }` | 접속자 변경 시 전체 갱신 |
| `user:disconnect` | S → All | `{ userId: string }` | 유저 퇴장 알림 |

### 채팅방
| 이벤트 | 방향 | 페이로드 | 설명 |
|---|---|---|---|
| `room:create` | C → S | `{ targetUserId: string }` | 1:1 채팅방 생성 요청 |
| `room:joined` | S → C | `{ room: Room, history: Message[] }` | 방 입장 완료 + 히스토리 |
| `room:invited` | S → C | `{ room: Room }` | 상대방이 방 만들었을 때 알림 |
| `room:list` | S → C | `{ rooms: Room[] }` | 내 채팅방 목록 전체 (현재 미사용 — 새로고침=재로그인=새 userId라 기존 방 복원 불가. 향후 확장용으로 정의만 유지) |
| `room:leave` | C → S | `{ roomId: string }` | 채팅방 나가기 (준비 중) |
| `room:error` | S → C | `{ message: string }` | 방 생성 실패 (상대방 오프라인 등) |

### 메시지
| 이벤트 | 방향 | 페이로드 | 설명 |
|---|---|---|---|
| `message:send` | C → S | `{ roomId: string, content: string }` | 메시지 전송 |
| `message:receive` | S → Room | `Message` | 메시지 수신 — **`io.to(roomId).emit()` 사용 (발신자 포함)** |

> **`message:receive` 발신자 포함 이유**: `io.to()` 사용 시 발신자도 수신 → 클라이언트는 `message:receive` 하나로만 처리하면 됨. `socket.to()` (발신자 제외) 사용 시 발신자는 별도로 optimistic update 필요 → 로직 복잡. 단순하게 `io.to()` 통일.

> **`message:read` / `message:read:ack` 제거** — 서버는 per-user unreadCount를 저장하지 않으므로 서버 왕복이 무의미. `setActiveRoom(roomId)` 호출 시 클라이언트에서 즉시 `clearUnread(roomId)` 호출로 대체. 이벤트 2개 불필요.

---

## 구현 단계

### Phase 1 — 프로젝트 셋업
- [ ] client/ : Vite + React + TypeScript + Tailwind 초기화
- [ ] server/ : Express + Socket.io 초기화
- [ ] `.env` / `.env.example` 생성 (client, server 각각)
- [ ] CORS 설정 (server: CLIENT_URL 허용)
- [ ] 상수 파일 생성 (`constants/socket.ts`, `colors.ts`, `layout.ts`, `index.ts`)
- [ ] `server/constants.js` 생성 — 클라이언트 socket.ts와 이벤트 이름 동일하게 유지
- [ ] `tailwind.config.js`에 커스텀 컬러 등록 (`kakao-yellow`, `chat-bg` 등) — 미등록 시 Tailwind 클래스로 사용 불가
- [ ] 타입 정의 (`types/index.ts`)
- [ ] Zustand 스토어 초기 구조 (`store/useChatStore.ts`)
- [ ] `ToastMessage` 컴포넌트 구현 (`clearToast`는 LAYOUT.TOAST_DURATION_MS 후 자동 호출)

### Phase 2 — 로그인 화면
- [ ] `LoginScreen`: 이름 입력 + 입장 버튼
- [ ] `useSocket` 훅: Socket 연결 / 이벤트 바인딩
- [ ] `user:join` 전송 → `user:joined` 수신 → 스토어에 me, onlineUsers 저장
- [ ] **useSocket 훅은 `useRef`로 socket 인스턴스 관리** — StrictMode 이중 실행으로 소켓 2개 생성 방지, useEffect cleanup에서 disconnect 호출
- [ ] `main.tsx`에서 `<StrictMode>` 제거 — 개발 중 socket 이벤트 중복 수신 방지
- [ ] 아래 리스너 모두 여기서 등록 (useSocket 훅 초기화 시 1회):
  - `user:list` — onlineUsers 갱신
  - `user:disconnect` — onlineUsers에서 제거
  - `room:joined` — addRoom(upsert) + setHistory + setActiveRoom + clearUnread
  - `room:invited` — addRoom(unreadCount=0, 채팅창 오픈 안 함)
  - `room:error` — showToast
  - `message:receive` — addMessage (unread 조건 포함)
- [ ] 로그인 후 메인 화면 진입

### Phase 3 — 채팅 기능 (핵심)
- [ ] 친구 클릭 → 스토어에 이미 해당 방이 있으면 바로 `setActiveRoom` (서버 요청 생략), 없으면 `room:create` 전송
- [ ] `room:joined` 수신 → `addRoom(room)` (upsert) + `setHistory(roomId, history)` + `setActiveRoom` → 채팅창 오픈
- [ ] `room:joined` 시 `unreadCount = 0` 으로 설정 (내가 직접 연 방이므로)
- [ ] `room:invited` 수신 → `addRoom(room)` (unreadCount=0으로 추가, 채팅창은 오픈 안 함)
- [ ] `room:error` 수신 → `showToast('상대방이 오프라인입니다')`
- [ ] `message:send` 전송: `content.trim() === ''` 이면 전송 차단
- [ ] `message:receive` 수신 실시간 동작
- [ ] roomId 기반 방별 메시지 격리
- [ ] 내 메시지(우측 노랑) / 상대 메시지(좌측 흰색) 구분

### Phase 4 — 카카오톡 UI 구현
- [ ] `Sidebar`: 탭 전환 (친구/채팅/더보기)
- [ ] `FriendList`: 접속 중인 유저 실시간 목록, 빈 상태 안내 문구
- [ ] `ChatList`: 채팅방 목록 + 마지막 메시지 미리보기 + 시간
- [ ] `ChatWindow`: 헤더 + 메시지 영역 + 자동 스크롤
- [ ] `MessageBubble` + `DateDivider`
- [ ] `MessageInput`: Enter 전송, Shift+Enter 줄바꿈
- [ ] `FilterChips`: 전체 필터만 동작, 나머지 준비 중
- [ ] `MoreTab`: 서비스 그리드 전체 준비 중
- [ ] `SettingsModal`: 탭 구조만 구현, 내용 준비 중

### Phase 5 — 실시간 디테일
- [ ] 미읽음 배지: `setActiveRoom(roomId)` 내부에서 즉시 `clearUnread(roomId)` 호출 (서버 이벤트 없음)
- [ ] 채팅방 목록 정렬: 최신 메시지 순 (lastMessage.createdAt 기준)
- [ ] 유저 퇴장 시스템 메시지: **서버**가 퇴장한 유저가 속한 모든 room에 `message:receive (type: 'system')` 전송 → 클라이언트는 `addMessage`로 처리 (별도 이벤트 없이 기존 흐름 재사용)
- [ ] `user:list` 리스너는 Phase 2에서 이미 등록 — Phase 5에서는 UI 반영 확인만

### Phase 6 — 마감 처리
- [ ] 모든 버튼 onClick 누락 없는지 확인
- [ ] 카카오 옐로우 테마 최종 확인
- [ ] 빈 상태 UI (친구 없음, 채팅방 없음)
- [ ] 기본 에러 처리 (연결 끊김 안내)

---

## 핵심 트레이드오프

| 항목 | 선택 | 이유 |
|---|---|---|
| DB vs 메모리 | **메모리** | 설정 불필요, 데모 목적으로 충분 |
| REST vs WebSocket | **WebSocket (Socket.io)** | 실시간 필수, REST는 폴링 필요 |
| 친구 데이터 | **접속 중인 유저 = 친구** | 목업 불필요, 자연스러운 2탭 시나리오 |
| 채팅방 생성 | **동적 생성 + 중복 방지** | userId 정렬 조합으로 roomId 고정 |
| 미구현 기능 | **"준비 중" 토스트** | 빈 버튼 금지 원칙 |
| 인증 | **이름만 입력** | 간단한 데모용 |
| userId vs socketId | **분리** | socketId는 재연결 시 변경되므로 userId 별도 발급 |

---

## 기능 구현 여부 정리

### ✅ 구현 (실제 동작)
| 기능 | 설명 |
|---|---|
| 로그인 | 이름 입력 → Socket 연결 → userId 발급 |
| 친구 목록 | 접속 중인 유저 실시간 표시 (나 제외) |
| 1:1 채팅방 생성 | 친구 클릭 → roomId 발급 → 양쪽 입장 |
| 실시간 메시지 송수신 | Socket.io room 기반 격리 |
| 채팅 히스토리 | 방 입장 시 이전 메시지 로드 |
| 채팅방 목록 | 참여한 방 목록 + 마지막 메시지 + 시간 |
| 미읽음 배지 | 채팅방별 미읽음 카운트 |
| 날짜 구분선 | 날짜 바뀔 때 구분 표시 |
| 탭 전환 | 친구 / 채팅 / 더보기 |
| 유저 접속/퇴장 알림 | 친구 목록 실시간 갱신 + 시스템 메시지 |

### 🚧 준비 중 (버튼 있음, 토스트 표시)
| 기능 | 위치 |
|---|---|
| 친구 추가 | 친구 탭 헤더 |
| 친구 검색 | 친구 탭 헤더 |
| 채팅 검색 | 채팅 탭 헤더 |
| 오픈채팅 | 채팅 탭 헤더 |
| 필터 칩 (전체 외) | 채팅 탭 필터 바 |
| 전화 / 화상통화 | 채팅창 헤더 |
| 채팅창 검색 | 채팅창 헤더 |
| 채팅방 메뉴 | 채팅창 헤더 |
| 이모티콘 | 메시지 입력창 |
| 파일 첨부 | 메시지 입력창 |
| 더보기 서비스 전체 | 더보기 탭 그리드 |
| 설정 세부 항목 전체 | 설정 모달 각 탭 |
| 채팅방 나가기 | (room:leave 이벤트) |

---

## 디자인 시스템

### 전체 레이아웃 구조

```
┌──────────────────────────────────────────────┐
│  사이드바  │        메인 콘텐츠 영역           │
│  (72px)   │                                  │
│           │  헤더 (탭/타이틀)                 │
│  아이콘   │  ─────────────────────────────── │
│  메뉴     │  콘텐츠 리스트 / 채팅창           │
│           │                                  │
│  (하단)   │                                  │
│  알림     │                                  │
│  설정     │                                  │
└──────────────────────────────────────────────┘
```

### 색상 시스템

| 역할 | 색상 | 비고 |
|---|---|---|
| 카카오 브랜드 | `#FEE500` | 내 말풍선, 배지, 강조 |
| 사이드바 배경 | `#F9F9F9` | 연한 회색 |
| 채팅방 배경 | `#B2C7D9` | 연한 파란 회색 |
| 받은 말풍선 | `#FFFFFF` | 흰색 |
| 보낸 말풍선 | `#FEE500` | 카카오 옐로우 |
| 텍스트 주 | `#1A1A1A` | 거의 검정 |
| 텍스트 보조 | `#888888` | 회색 |
| 헤더/패널 배경 | `#FFFFFF` | 흰색 |
| 구분선 | `#EBEBEB` | 연한 회색 |
| 미읽음 배지 | `#FE4141` | 빨간색 |

### 타이포그래피

| 요소 | 크기 | 굵기 |
|---|---|---|
| 섹션 타이틀 | 18px | Bold |
| 이름 (리스트) | 14px | SemiBold |
| 상태 메시지 | 13px | Regular |
| 메시지 시간 | 11-12px | Regular |
| 말풍선 텍스트 | 14px | Regular |
| 설정 메뉴 | 14px | Regular |
| 배지 숫자 | 11px | Bold |

---

## 화면별 UI 명세

### 사이드바
- 너비: 72px, 고정
- 상단: 내 프로필 아이콘 (이름 첫 글자로 아바타 생성)
- 중단: 채팅 아이콘 + 미읽음 총합 배지, 더보기 `···`
- 하단: 알림(벨) → 준비 중, 설정(기어) → 설정 모달 오픈

### 친구 탭
- 헤더: "친구" + 검색(준비 중), 친구추가(준비 중) 아이콘
- 리스트 아이템: `[아바타] [이름 bold]` — 상태메시지 없음 (접속 중인 유저이므로)
- 아이템 높이: 60px
- 빈 상태: "현재 접속 중인 친구가 없습니다"

### 채팅 탭
- 헤더: "채팅", 오픈채팅(준비 중), 검색(준비 중), 채팅작성(준비 중) 아이콘
- 필터 칩: 전체(동작) | 안읽음(준비 중)
- 리스트 아이템: `[아바타] [이름] [시간] / [마지막 메시지] [미읽음 배지]`
- 빈 상태: "채팅방이 없습니다. 친구 탭에서 대화를 시작하세요"

### 채팅창
- 헤더: 아바타 + 이름 + 참여자 수 / 검색(준비 중), 전화(준비 중), 화상(준비 중), 메뉴(준비 중)
- 메시지 영역: `#B2C7D9` 배경
  - 받은 메시지: 좌측, 흰색 말풍선, radius 18px
  - 보낸 메시지: 우측, `#FEE500` 말풍선, radius 18px
  - 시간: 말풍선 옆 아래, gray 11px
  - 날짜 구분선: 중앙 pill
  - 새 메시지 도착 시 자동 스크롤
- 입력창: `+`(준비 중) `😊`(준비 중) / 텍스트 입력 / `전송` 버튼

### 더보기 탭
- 상단: 내 이름 표시 카드
- 서비스 그리드 4열: 전체 준비 중 토스트

### 설정 모달
- 크기: 600x480px
- 좌측 메뉴: 계정, 보안, 알림, 친구, 채팅, 백업, 이모티콘, 화면, 통화, 실험실, 저장공간
- 모든 탭 내용: 준비 중

---

## 컴포넌트 목록

| 컴포넌트 | 동작 여부 | 설명 |
|---|---|---|
| `LoginScreen` | ✅ | 이름 입력 입장 화면 |
| `Sidebar` | ✅ | 좌측 고정 네비게이션, 탭 전환 |
| `FriendList` | ✅ | 접속 중인 유저 실시간 목록, 클릭 시 채팅방 생성 |
| `ChatList` | ✅ | 실시간 채팅방 목록 |
| `FilterChips` | 🚧 | 전체 필터만 동작, 나머지 준비 중 |
| `ChatWindow` | ✅ | 채팅창 (헤더 + 메시지 영역 + 입력창) |
| `MessageBubble` | ✅ | 말풍선 (sent / received) |
| `DateDivider` | ✅ | 날짜 구분선 |
| `MessageInput` | ✅ | 메시지 입력 (Enter 전송, Shift+Enter 줄바꿈) |
| `MoreTab` | 🚧 | 더보기 탭 (전체 준비 중) |
| `SettingsModal` | 🚧 | 설정 모달 구조만 구현 |
| `ToastMessage` | ✅ | "준비 중인 기능입니다" 공통 토스트 |
| `Avatar` | ✅ | 이름 첫 글자 기반 원형 아바타 |
| `Badge` | ✅ | 미읽음 카운트 배지 |
