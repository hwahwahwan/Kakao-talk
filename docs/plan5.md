# Plan 5: SQLite 데이터베이스 연동

## 목표

현재 인메모리 방식(`server/store.js`)으로 관리하는 유저·룸·메시지 데이터를 SQLite로 영속화한다.
별도 DB 서버 없이 파일 하나(`server/data/chat.db`)로 동작하므로 설치·운영 부담이 없다.

---

## 현재 구조 요약

```
server/store.js
├── users: { [userId]: { id, name, email, socketId } }
├── rooms: { [roomId]: { id, memberIds: [], messages: [] } }
└── socketToUser: { [socketId]: userId }
```

모든 데이터가 메모리에만 존재 → 서버 재시작 시 전부 소멸

---

## 사용 패키지

| 패키지 | 이유 |
|--------|------|
| `better-sqlite3` | 동기 API → 기존 코드와 호환성 높음, 빠름, 설치 간단 |

```bash
cd server && npm install better-sqlite3
```

> `better-sqlite3`는 C++ 네이티브 모듈이지만 `npm install` 하나로 끝난다.
> 별도 DB 서버(MySQL, PostgreSQL 등) 불필요.

---

## DB 스키마

```sql
-- 유저 테이블 (socketId는 런타임 메모리에만 보관, DB에는 저장하지 않음)
CREATE TABLE IF NOT EXISTS users (
  id       TEXT PRIMARY KEY,
  name     TEXT NOT NULL,
  email    TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);

-- 채팅방 테이블
CREATE TABLE IF NOT EXISTS rooms (
  id         TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- 채팅방 멤버 (N:M)
-- rooms 삭제 시 CASCADE로 자동 삭제
CREATE TABLE IF NOT EXISTS room_members (
  room_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  PRIMARY KEY (room_id, user_id),
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 메시지 테이블
-- sender_name은 JOIN으로 가져오므로 별도 컬럼 없음
-- sender_id가 NULL이면 시스템 메시지
-- rooms 삭제 시 CASCADE로 메시지도 함께 삭제
CREATE TABLE IF NOT EXISTS messages (
  id          TEXT PRIMARY KEY,
  room_id     TEXT NOT NULL,
  sender_id   TEXT,
  content     TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'text',  -- 'text' | 'system'
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (room_id)   REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id)
);
```

> **CASCADE 정책**: 멤버가 0명이 된 룸을 `deleteRoom()`으로 삭제하면
> `room_members`와 `messages`가 CASCADE로 함께 삭제된다.
>
> **`created_at` 타입**: 기존 코드가 `new Date().toISOString()` (ISO string)을 사용하므로
> DB도 TEXT로 통일. DEFAULT도 동일 포맷으로 지정.

---

## 파일 구조 변경

```
server/
├── db/
│   ├── index.js       # DB 연결 & 초기화 (테이블 생성, data 폴더 자동 생성)
│   └── queries.js     # SQL 쿼리 함수 모음
├── data/
│   └── chat.db        # SQLite 파일 (gitignore)
├── seed.js            # 테스트 유저 초기 데이터 INSERT 스크립트 (node server/seed.js 로 1회 실행)
├── store.js           # 소켓 런타임 상태만 관리 (socketToUser, onlineSockets)
├── handlers/
│   └── socketHandlers.js  # DB 쿼리 함수 사용하도록 수정
├── routes/
│   └── index.js           # 변경 없음
└── index.js               # 변경 없음
```

---

## 구현 단계

### Step 1 — `server/db/index.js` 생성

`data/` 폴더가 없으면 에러나므로 `fs.mkdirSync`로 자동 생성한다.

```js
const Database = require('better-sqlite3')
const path = require('path')
const fs = require('fs')

const dataDir = path.join(__dirname, '../data')
fs.mkdirSync(dataDir, { recursive: true })  // 폴더 없으면 자동 생성

const db = new Database(path.join(dataDir, 'chat.db'))

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')   // CASCADE가 동작하려면 반드시 필요

db.exec(`
  CREATE TABLE IF NOT EXISTS users ( ... );
  CREATE TABLE IF NOT EXISTS rooms ( ... );
  CREATE TABLE IF NOT EXISTS room_members ( ... );
  CREATE TABLE IF NOT EXISTS messages ( ... );
`)

module.exports = db
```

---

### Step 2 — `server/db/queries.js` 생성

| 함수 | 역할 | 비고 |
|------|------|------|
| `findUserByCredentials(email, password)` | email + password로 유저 조회. 불일치 시 `null` 반환 | 로그인 인증용 |
| `getUserById(id)` | ID로 유저 조회 | 없으면 `undefined` 반환 |
| `getUsersByIds(ids)` | ID 배열로 유저 목록 조회 | `IN` 절에 배열 직접 바인딩 불가 — `ids.map(() => '?').join(',')` 으로 placeholder 동적 생성. `ids`가 빈 배열이면 빈 배열 반환(쿼리 실행 안 함) |
| `getOrCreateRoom(roomId, userIds)` | 룸 생성 + 멤버 INSERT OR IGNORE를 `db.transaction()`으로 묶어 원자적으로 처리 | |
| `getRoomWithDetails(roomId)` | 룸 1개를 `{ id, members, lastMessage }` 형태로 반환. 룸이 없으면 `null` | `getRoomMembers` + `getLastMessage` 조합. 존재 여부 판단에도 활용 |
| `getRoomMembers(roomId)` | 룸 멤버 목록 (`{ id, name }`) | users JOIN |
| `getLastMessage(roomId)` | 룸의 마지막 메시지 1개 | users LEFT JOIN으로 senderName 포함 |
| `getRoomsByUserId(userId)` | 유저가 속한 roomId 목록 반환 | disconnect 시스템 메시지 / 재접속 룸 복원용 |
| `isMember(roomId, userId)` | 해당 유저가 룸 멤버인지 확인 | `room:rejoin` 보안 검증용. `room_members`에 `(roomId, userId)` 쌍 존재 여부 |
| `removeMember(roomId, userId)` | room_members에서 멤버 제거 | room:leave 처리 |
| `getMemberCount(roomId)` | 룸의 현재 멤버 수 조회. 룸이 존재하지 않아도 0 반환 | 삭제 여부 판단용 |
| `deleteRoom(roomId)` | 룸 삭제 (room_members, messages CASCADE 삭제) | 멤버 0명일 때 |
| `saveMessage(msg)` | 메시지 저장 | `{ id, roomId, senderId, content, type, createdAt }` — senderName은 저장 안 함 |
| `getMessagesByRoomId(roomId, limit)` | 메시지 조회 (`ORDER BY created_at ASC LIMIT 50`) | users LEFT JOIN으로 senderName 포함해서 반환 |

> **`senderName` 처리 흐름**:
> 1. `saveMessage()`에는 `senderName` 없이 `senderId`만 저장
> 2. broadcast할 메시지 객체는 핸들러에서 `{ ...saved, senderName: getUserById(userId)?.name ?? null }` 로 조합
> 3. `getMessagesByRoomId()` / `getLastMessage()`는 `LEFT JOIN users ON sender_id = users.id`로 `name`을 포함해서 반환 → 클라이언트 `Message` 타입의 `senderName`과 일치
>
> **`getUsersByIds` 빈 배열 처리**: `getOnlineUserIds()`가 빈 배열을 반환할 수 있으므로
> `ids.length === 0`이면 빈 배열을 즉시 반환해 쿼리를 실행하지 않는다.

---

### Step 3 — `server/store.js` 축소

DB로 이전 후 `store.js`는 **런타임 소켓 상태만** 관리한다.

```js
// socketId → userId
const socketToUser = {}

// userId → socketId  (온라인 여부 판단용)
const onlineSockets = {}

function getOnlineUserIds() {
  return Object.keys(onlineSockets)
}

module.exports = { socketToUser, onlineSockets, getOnlineUserIds }
```

> 온라인 유저 이름 목록은 `getOnlineUserIds()`로 ID 목록을 얻은 뒤
> `getUsersByIds(ids)`로 한 번에 조회한다.

---

### Step 4 — `socketHandlers.js` 수정

#### `user:join`

이벤트 페이로드가 `{ name, email }` → `{ email, password }` 로 변경됨.
서버에서 email + password를 DB와 대조해 인증.

```
1. user = findUserByCredentials(email, password)
   - null이면 → socket.emit(USER_JOIN_ERROR, { message: '이메일 또는 비밀번호가 올바르지 않습니다' }), return
   - 있으면: { id, name, email } = user  → DB 저장값 사용
2. onlineSockets[userId] = socket.id
3. socketToUser[socket.id] = userId
4. getRoomsByUserId(userId) → 각 roomId에 대해 getRoomWithDetails(roomId) → Room 객체 배열
5. onlineUsers = getUsersByIds(getOnlineUserIds()).filter(u => u.id !== userId)
   → 자신을 제외한 온라인 유저 목록
6. socket.emit(USER_JOINED, { me: { id, name, email }, onlineUsers, rooms })
7. io.emit(USER_LIST, { users: getUsersByIds(getOnlineUserIds()) })
   → 기존 접속자들에게 신규 유저 포함한 전체 목록 broadcast
```
>
> **`USER_LIST` vs `USER_JOINED` 온라인 목록 차이**:
> `USER_JOINED`는 자신 제외, `USER_LIST`는 전체 포함.
> 클라이언트의 `USER_LIST` 핸들러가 자신(`me.id`)을 직접 필터링하므로 서버는 전체를 보낸다.

#### `room:rejoin` (신규 이벤트)

클라이언트가 `USER_JOINED` 수신 후 기존 룸마다 emit. 서버에서 `socket.join` 재실행 + 히스토리 응답.

```
1. userId = socketToUser[socket.id] — 없으면 return
2. isMember(roomId, userId) 확인 → false이면 return (보안: 타인 룸 무단 접근 차단)
3. socket.join(roomId)
4. getMessagesByRoomId(roomId) → history 조회
5. socket.emit(ROOM_REJOINED, { roomId, history })
```

> **`disconnect` 시 room_members를 건드리지 않는 이유**: 유저가 끊겨도 room_members는 그대로 유지해서 재접속 시 룸 목록 복원 및 `isMember` 검증에 활용한다. 멤버에서 완전히 제거하려면 명시적으로 `room:leave`를 emit해야 한다.

#### `room:create`

```
1. userId = socketToUser[socket.id] — 없으면 return
2. getUserById(targetUserId) → null이면 ROOM_ERROR("존재하지 않는 사용자"), return
3. roomId = [userId, targetUserId].sort().join('_')
4. existingRoom = getRoomWithDetails(roomId)  → null이면 신규 룸
5. 신규 룸인데 onlineSockets[targetUserId] 없으면 → ROOM_ERROR("상대방이 오프라인"), return
6. getOrCreateRoom(roomId, [userId, targetUserId])  ← 항상 호출 (트랜잭션)
   INSERT OR IGNORE이므로 기존 룸/멤버가 있어도 안전. 나갔다 재입장 시에도 멤버 재추가됨.
7. room = getRoomWithDetails(roomId)
8. history = getMessagesByRoomId(roomId)
9. socket.join(roomId)
10. targetSocketId = onlineSockets[targetUserId]
11. targetSocket = io.sockets.sockets.get(targetSocketId)
12. targetSocket?.join(roomId)
13. socket.emit(ROOM_JOINED, { room, history })
14. targetSocket?.emit(ROOM_INVITED, { room })
```

> **기존 룸 + 오프라인**: `existingRoom`이 있으면 오프라인이어도 히스토리 조회 허용.
> 새 메시지 전송 시 `io.to(roomId).emit`이 소켓 룸에 join된 유저에게만 도달하므로
> 오프라인 상대방은 자연히 수신 불가.

#### `message:send`

```
1. userId = socketToUser[socket.id] — 없으면 return
2. !content || content.trim() === '' 이면 return
3. !isMember(roomId, userId) 이면 return (룸 없음 또는 멤버 아님)
4. createdAt = new Date().toISOString()
5. saved = { id: randomUUID(), roomId, senderId: userId, content: content.trim(), type: 'text', createdAt }
6. saveMessage(saved)
7. broadcastMsg = { ...saved, senderName: getUserById(userId)?.name ?? null }
8. io.to(roomId).emit(MESSAGE_RECEIVE, broadcastMsg)
```

#### `room:leave`

```
1. userId = socketToUser[socket.id] — 없으면 return
2. !isMember(roomId, userId) 이면 return (룸 없음 또는 이미 나간 멤버)
3. userName = getUserById(userId)?.name ?? '알 수 없음'
4. removeMember(roomId, userId)
5. socket.leave(roomId)   ← 먼저 나간 뒤 broadcast → 나간 사람은 시스템 메시지 수신 안 함 (기존 동작과 동일)
6. remaining = getMemberCount(roomId)
7. remaining > 0 이면:
   - sysMsg = { id, roomId, senderId: null, senderName: null, content: `${userName}님이 나갔습니다`, type: 'system', createdAt }
   - saveMessage(sysMsg)
   - io.to(roomId).emit(MESSAGE_RECEIVE, sysMsg)
8. remaining === 0 이면:
   - deleteRoom(roomId)  → room_members + messages CASCADE 삭제
9. socket.emit(ROOM_LEFT, { roomId })
```

#### `disconnect`

소켓 매핑 제거 + 속한 모든 룸에 시스템 메시지. **room_members는 건드리지 않음** (재접속 룸 복원용).

```
1. userId = socketToUser[socket.id] — 없으면 return
2. delete socketToUser[socket.id], delete onlineSockets[userId]
3. io.emit(USER_LIST, { users: getUsersByIds(getOnlineUserIds()) })
4. io.emit(USER_DISCONNECT, { userId })
5. userName = getUserById(userId)?.name ?? '알 수 없음'
6. getRoomsByUserId(userId) → roomIds
7. 각 roomId에 대해:
   - sysMsg = { id, roomId, senderId: null, senderName: null, content: `${userName}님이 나갔습니다`, type: 'system', createdAt }
   - saveMessage(sysMsg)
   - io.to(roomId).emit(MESSAGE_RECEIVE, sysMsg)
```

---

### Step 5 — `server/seed.js` 생성

서버 최초 실행 전 `node server/seed.js`로 1회 실행. 이미 있는 유저는 INSERT OR IGNORE로 건너뜀.

```js
// node server/seed.js
const db = require('./db/index')
const crypto = require('crypto')

const users = [
  { name: '정용환', email: 'yonghwan@kakao.web', password: '1234' },
  { name: '김민준', email: 'minjun@kakao.web',   password: '1234' },
  { name: '이서연', email: 'seoyeon@kakao.web',  password: '1234' },
  { name: '박지호', email: 'jiho@kakao.web',     password: '1234' },
]

const insert = db.prepare(
  'INSERT OR IGNORE INTO users (id, name, email, password) VALUES (?, ?, ?, ?)'
)

for (const u of users) {
  insert.run(crypto.randomUUID(), u.name, u.email, u.password)
}

console.log('Seed complete')
```

---

### Step 6 — 클라이언트 수정 (`useSocket.ts`, `LoginScreen.tsx`)

#### `useSocket.ts` — `joinAs` 시그니처 변경

`{ name, email }` → `{ email, password }` 로 변경.

```ts
// 변경 전
const joinAs = (name: string, email: string) => {
  socketRef.current?.emit(SOCKET_EVENTS.USER_JOIN, { name, email })
}

// 변경 후
const joinAs = (email: string, password: string) => {
  socketRef.current?.emit(SOCKET_EVENTS.USER_JOIN, { email, password })
}
```

#### `LoginScreen.tsx` — 클라이언트 인증 로직 제거

현재: `DUMMY_USERS`로 클라이언트에서 email+password 검증 후 `onJoin(name, email)` 호출.
변경 후: 검증 없이 바로 `onJoin(email, password)` 호출 → 서버가 인증.
`DUMMY_USERS` import 및 검증 로직 삭제. `onJoin` Props 타입도 변경.

```ts
// Props 변경
interface Props {
  onJoin: (email: string, password: string) => void
}

// handleLogin 변경 — 서버 응답(USER_JOIN_ERROR)으로 에러 처리
const handleLogin = () => {
  if (!trimmedEmail) { setError('이메일을 입력해주세요'); return }
  if (!trimmedPassword) { setError('비밀번호를 입력해주세요'); return }
  onJoin(trimmedEmail, trimmedPassword)
}
```

`USER_JOIN_ERROR` 수신 시 `LoginScreen`의 에러 박스에 표시. X 버튼으로 닫기 가능.
→ `useSocket`이 `loginError: string | null`과 `clearLoginError: () => void`를 return
  (LoginScreen에서 useSocket을 직접 호출하면 소켓이 두 번 생기므로, App.tsx 경유)
→ `App.tsx`가 이를 LoginScreen에 props로 전달
→ `LoginScreen`은 폼 하단에 에러 박스(빨간 배경 + X 버튼)로 표시

#### `useSocket.ts` — `USER_JOIN_ERROR` 핸들러 & return 추가

```ts
// 내부 state
const [loginError, setLoginError] = useState<string | null>(null)

// 핸들러 (useEffect 내부)
socket.on(SOCKET_EVENTS.USER_JOIN_ERROR, ({ message }: { message: string }) => {
  setLoginError(message)
})

// return에 추가
return { joinAs, createRoom, sendMessage, leaveRoom, loginError, clearLoginError: () => setLoginError(null) }
```

#### `USER_JOINED` 핸들러 — 기존 룸 복원 + 소켓 룸 재가입

```ts
socket.on(SOCKET_EVENTS.USER_JOINED, ({ me, onlineUsers, rooms }) => {
  store().setMe(me)
  store().setOnlineUsers(onlineUsers)
  rooms.forEach((room: Room) => {
    store().addRoom({ ...room, unreadCount: 0 })
    socket.emit(SOCKET_EVENTS.ROOM_REJOIN, { roomId: room.id })
  })
})
```

#### `ROOM_REJOINED` 핸들러 (신규) — 히스토리 복원

```ts
socket.on(SOCKET_EVENTS.ROOM_REJOINED, ({ roomId, history }: { roomId: string; history: Message[] }) => {
  store().setHistory(roomId, history)
})
```

#### `App.tsx` 수정

```tsx
const { joinAs, createRoom, sendMessage, leaveRoom, loginError, clearLoginError } = useSocket()

// handleJoin 시그니처 변경
const handleJoin = (email: string, password: string) => {
  joinAs(email, password)
}

// LoginScreen props 변경
<LoginScreen
  onJoin={(email, password) => handleJoin(email, password)}
  serverError={loginError}
  onClearServerError={clearLoginError}
/>
```

#### `LoginScreen.tsx` 수정

```tsx
// Props 변경
interface Props {
  onJoin: (email: string, password: string) => void
  serverError?: string | null
  onClearServerError?: () => void
}

// 에러 UI — 기존 로컬 validation 에러(작은 텍스트) + 서버 에러(박스 + X 버튼)
{error && <p className="text-[12px] text-red-500 px-1">{error}</p>}
{serverError && (
  <div className="flex items-center justify-between bg-red-50 border border-red-200 text-red-600 text-[13px] px-3 py-2 rounded-lg">
    <span>{serverError}</span>
    <button onClick={onClearServerError} className="ml-2 text-red-400 hover:text-red-600">✕</button>
  </div>
)}
```

---

### Step 7 — `constants` 추가

서버 `server/constants.js` 와 클라이언트 `client/src/constants/socket.ts` 양쪽에 추가:

```js
ROOM_REJOIN:    'room:rejoin',    // 클라이언트 → 서버: 소켓 룸 재가입 요청
ROOM_REJOINED:  'room:rejoined',  // 서버 → 클라이언트: 재가입 완료 + 히스토리
USER_JOIN_ERROR: 'user:join_error', // 서버 → 클라이언트: 로그인 실패 (미등록 이메일)
```

---

## `.gitignore` 추가

```
server/data/
```

---

## 예상 작업량

| 단계 | 파일 | 난이도 |
|------|------|--------|
| 패키지 설치 | `server/package.json` | 쉬움 |
| DB 초기화 | `server/db/index.js` | 쉬움 |
| 쿼리 함수 | `server/db/queries.js` | 보통 |
| seed 스크립트 | `server/seed.js` | 쉬움 |
| store 축소 | `server/store.js` | 쉬움 |
| constants 추가 | `server/constants.js`, `client/src/constants/socket.ts` | 쉬움 |
| 핸들러 수정 | `server/handlers/socketHandlers.js` | 보통 |
| 클라이언트 수정 | `client/src/hooks/useSocket.ts`, `client/src/components/LoginScreen.tsx` | 보통 |

---

## 이점

- 서버 재시작해도 **유저·룸·메시지 히스토리 유지**
- 같은 email로 재접속 시 **기존 대화 이어서 보기** + **소켓 룸 자동 재가입** 가능
- 오프라인 유저와의 **기존 대화 히스토리 조회** 가능
- 별도 DB 서버 불필요 (파일 하나)
- 기존 동기 방식 코드와 `better-sqlite3` 동기 API가 자연스럽게 호환
- 추후 PostgreSQL 등으로 마이그레이션 시 `queries.js`만 교체하면 됨
