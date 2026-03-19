# 추가 기능 계획 — 채팅방 나가기 & 우측 패널 닫기

## 요구사항 정리

1. **채팅방 나가기** — 헤더 메뉴(≡) 클릭 → 드롭다운 메뉴 → "채팅방 나가기" 선택
2. **우측 패널 닫기** — 채팅방 나간 뒤 오른쪽 ChatWindow가 자동으로 닫혀야 함 (activeRoomId가 null이 되면 기존 빈 화면 표시)

---

## 검토: 현재 상태

| 항목 | 현재 | 문제 |
|---|---|---|
| `ROOM_LEAVE` 이벤트 | 서버에 핸들러 있음 (`// 향후 구현`) | 실제 로직 없음 |
| 메뉴 버튼(≡) | 클릭 시 `showToast('준비 중인 기능입니다')` | 드롭다운 없음 |
| `room:left` 이벤트 | 없음 | 나가기 완료 신호 없음 |
| `removeRoom` 스토어 액션 | 없음 | 방 제거 불가 |
| 우측 패널 고정 | activeRoomId 없으면 빈 화면 표시됨 | 나가기 후 자동 해소됨 |

---

## 추가할 소켓 이벤트

```ts
// client/src/constants/socket.ts 에 추가
ROOM_LEFT: 'room:left'
// (기존 ROOM_LEAVE: 'room:leave' 는 이미 있음)
```

---

## 서버 변경 (`server/index.js`)

### `room:leave` 핸들러 구현

```
클라이언트 → room:leave { roomId }
서버:
  1. userId = socketToUser[socket.id]
  2. room = rooms[roomId] 확인
  3. room.memberIds에서 userId 제거
  4. socket.leave(roomId) — socket.io room에서 제거
  5. 남은 멤버에게 시스템 메시지 브로드캐스트
     → io.to(roomId).emit(MESSAGE_RECEIVE, { type:'system', content:'○○님이 나갔습니다' })
  6. 나간 유저에게 확인 응답
     → socket.emit(ROOM_LEFT, { roomId })
  7. 방에 멤버가 0명이면 rooms[roomId] 삭제
```

---

## 클라이언트 변경

### 1. `client/src/constants/socket.ts`
- `ROOM_LEFT: 'room:left'` 추가

### 2. `client/src/store/useChatStore.ts`
- `removeRoom(roomId: string)` 액션 추가
  - `rooms` 에서 해당 id 제거
  - `messages` 에서 해당 roomId 제거
  - `activeRoomId === roomId` 이면 `activeRoomId = null`

### 3. `client/src/hooks/useSocket.ts`
- `room:left` 리스너 추가 → `removeRoom(roomId)` 호출
- `leaveRoom(roomId)` 함수 export

### 4. `client/src/components/ChatWindow.tsx`
- `MenuIcon` 버튼에 드롭다운 추가

  **드롭다운 구현 방식:**
  - `useState<boolean>(false)` — isMenuOpen
  - `useRef<HTMLDivElement>` — 드롭다운 컨테이너 ref
  - `useEffect` — document click 이벤트로 외부 클릭 시 닫기
  - position: absolute, right-0, top-full, z-50
  - 메뉴 항목: "채팅방 나가기" (빨간 텍스트)

  **나가기 클릭 시:**
  ```
  1. isMenuOpen = false
  2. socket.emit(ROOM_LEAVE, { roomId: activeRoomId })
  3. 서버에서 room:left 응답 오면 → removeRoom → activeRoomId = null → ChatWindow 빈 화면
  ```

### 5. `client/src/App.tsx`
- `leaveRoom` 을 useSocket에서 가져와서 ChatWindow에 prop으로 전달
- ChatWindow Props에 `onLeave: () => void` 추가

---

## 데이터 흐름 전체

```
[사용자] 메뉴(≡) 클릭
  → 드롭다운 오픈
  → "채팅방 나가기" 클릭
  → socket.emit('room:leave', { roomId })

[서버] room:leave 처리
  → memberIds에서 제거
  → socket.leave(roomId)
  → 남은 멤버에게 시스템 메시지
  → 나간 유저에게 room:left { roomId }

[클라이언트] room:left 수신
  → removeRoom(roomId)
  → activeRoomId = null
  → ChatWindow → 빈 화면("대화를 선택하거나...")
```

---

## 엣지 케이스

| 상황 | 처리 |
|---|---|
| 방에 혼자만 남아있을 때 나가기 | memberIds = [] → rooms에서 삭제 (시스템 메시지 없음) |
| 이미 오프라인인 상대와의 방 나가기 | 상관없음, memberIds에서 제거 후 정리 |
| 나가기 도중 연결 끊김 | disconnect 핸들러가 처리 (기존 시스템 메시지 로직) |
| 나간 방에 메시지 수신 | socket.leave 후엔 io.to(roomId)로 전달 안 됨 — 안전 |

---

## 변경 파일 목록

| 파일 | 변경 유형 |
|---|---|
| `server/index.js` | `room:leave` 핸들러 구현 |
| `server/constants.js` | `ROOM_LEFT` 추가 (클라이언트와 동일하게) |
| `client/src/constants/socket.ts` | `ROOM_LEFT` 추가 |
| `client/src/store/useChatStore.ts` | `removeRoom` 액션 추가 |
| `client/src/hooks/useSocket.ts` | `room:left` 리스너 + `leaveRoom` 함수 export |
| `client/src/components/ChatWindow.tsx` | 메뉴 드롭다운 + 나가기 기능 |
| `client/src/App.tsx` | `leaveRoom` prop 전달 |

총 7개 파일 수정, 신규 파일 없음.

---

## 잠재적 이슈 검토

### ✅ 문제 없음
- `socket.leave(roomId)` — socket.io 내장 메서드, 정상 작동
- `socket.leave` 후 `socket.emit(ROOM_LEFT)` — room leave는 브로드캐스트에만 영향, 직접 emit은 정상 작동
- `removeRoom` 후 ChatList 자동 갱신 — `useChatStore((s) => s.rooms)` 구독 중이므로 자동 반영
- 드롭다운 외부 클릭 닫기 — `document.addEventListener` + `useEffect` cleanup 패턴
- `disconnect` 중복 시스템 메시지 없음 — `room.memberIds.includes(userId)` 체크로 이미 나간 방은 건너뜀

### ⚠️ 주의
- `useRef` + click handler 에서 `isMenuOpen` 상태가 stale closure될 수 있음
  → 해결: `ref.current.contains(e.target)` 방식으로 드롭다운 영역 바깥 클릭 감지 (상태 불필요)
- `room:left` 응답 전 UI 즉시 닫기 X — 서버 응답 받은 후 닫아야 방 목록 정합성 유지
- 드롭다운 `position: absolute` 기준점 — 메뉴 버튼 래퍼 div에 `relative` 추가해야 올바른 위치에 붙음 (헤더 div 전체에 relative 주면 좌측 끝에 붙을 수 있음)
- `server/constants.js`에도 `ROOM_LEFT` 추가 필수 — 누락 시 서버에서 `SOCKET_EVENTS.ROOM_LEFT` 참조 시 `undefined` 로 이벤트명이 전송됨
- 시스템 메시지 전체 필드 필수 — `id`, `roomId`, `senderId: null`, `senderName: null`, `content`, `type: 'system'`, `createdAt` 모두 포함. 빠지면 `formatTime(undefined)` → `Invalid Date` 렌더링
- `ChatStore` interface(선언부)와 `create()` 구현부 **두 곳 모두** `removeRoom` 추가 필요 — 한 곳만 추가하면 TypeScript 컴파일 에러
- `ChatWindow.tsx` line 1 import에 `useState` 없음 (`import { useEffect, useRef } from 'react'`) → `useState` 추가 필수, 미추가 시 즉시 컴파일 에러
- `ChatWindow.tsx` 메뉴 버튼은 `HeaderBtn` 래퍼로 감싸져 있어 드롭다운 포함 불가 → 메뉴 버튼만 `HeaderBtn` 대신 `relative` div로 감싼 별도 구조로 교체 필요
- 드롭다운 `useState`/`useRef`/`useEffect` 는 `ChatWindow` 내 early return (line 57) **위에** 선언해야 함 (React Hooks Rule 위반 방지)
- `removeRoom` 반드시 단일 `set()` 호출 — `rooms`, `messages`, `activeRoomId` 를 한 번에 처리해야 렌더링 깜빡임 없음:
  ```ts
  set((state) => {
    const newMessages = { ...state.messages }
    delete newMessages[roomId]
    return {
      rooms: state.rooms.filter((r) => r.id !== roomId),
      messages: newMessages,
      activeRoomId: state.activeRoomId === roomId ? null : state.activeRoomId,
    }
  })
  ```

### 📌 범위 외 엣지케이스 (현재 구현 안 함)
- A가 채팅방 나간 후 B를 다시 클릭 → 서버에서 기존 roomId 재사용하지만 A가 memberIds에 없는 상태
  → `hydrateRoom` 시 A가 members에 포함 안 됨 (채팅은 되지만 멤버 표시 불완전)
  → 추후 `room:create` 핸들러에서 나간 멤버 재추가 로직 필요

---

## 결론

이슈 없음. 위 계획대로 구현 진행 가능.
