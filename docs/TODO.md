# KakaoTalk Web 구현 TODO

## Phase 1 — 프로젝트 셋업
- [x] client/ : Vite + React + TypeScript + Tailwind 초기화
- [x] server/ : Express + Socket.io 초기화
- [x] client/.env / .env.example 생성
- [x] server/.env / .env.example 생성
- [x] server CORS 설정 (CLIENT_URL 허용)
- [x] client/src/constants/socket.ts 생성
- [x] client/src/constants/colors.ts 생성
- [x] client/src/constants/layout.ts 생성
- [x] client/src/constants/index.ts 생성
- [x] server/constants.js 생성
- [x] tailwind.config.ts 커스텀 컬러 등록
- [x] client/src/types/index.ts 생성
- [x] client/src/store/useChatStore.ts 초기 구조
- [x] ToastMessage 컴포넌트 구현
- [x] main.tsx에서 StrictMode 제거

## Phase 2 — 로그인 화면
- [x] LoginScreen 컴포넌트 (이름 입력 + 입장 버튼)
- [x] useSocket 훅 (useRef로 socket 관리, cleanup)
- [x] user:join 전송 → user:joined 수신 → me, onlineUsers 저장
- [x] useSocket에서 모든 리스너 등록
  - [x] user:list
  - [x] user:disconnect
  - [x] room:joined
  - [x] room:invited
  - [x] room:error
  - [x] message:receive
- [x] 로그인 후 메인 화면 진입

## Phase 3 — 채팅 기능 (핵심)
- [x] 친구 클릭 → 기존 방 있으면 setActiveRoom, 없으면 room:create 전송
- [x] room:joined 수신 → addRoom + setHistory + setActiveRoom + clearUnread
- [x] room:invited 수신 → addRoom (unreadCount=0, 채팅창 오픈 안 함)
- [x] room:error 수신 → showToast
- [x] message:send 전송 (trim() === '' 차단)
- [x] message:receive 수신 → addMessage (activeRoomId 비교로 unread 처리)
- [x] roomId 기반 방별 메시지 격리
- [x] 내 메시지(우측 노랑) / 상대 메시지(좌측 흰색) 구분

## Phase 4 — 카카오톡 UI 구현
- [x] Sidebar (탭 전환: 친구/채팅/더보기)
- [x] FriendList (접속 중 유저 목록, 빈 상태 안내)
- [x] ChatList (채팅방 목록 + 마지막 메시지 + 시간)
- [x] ChatWindow (헤더 + 메시지 영역 + 자동 스크롤)
- [x] MessageBubble (sent/received)
- [x] DateDivider (날짜 구분선)
- [x] MessageInput (Enter 전송, Shift+Enter 줄바꿈)
- [x] Avatar (이름 첫 글자 기반)
- [x] Badge (미읽음 카운트)
- [x] FilterChips (전체만 동작, 나머지 준비 중)
- [x] MoreTab (전체 준비 중)
- [x] SettingsModal (탭 구조만)

## Phase 5 — 실시간 디테일
- [x] setActiveRoom 시 clearUnread 호출
- [x] 채팅방 목록 최신 메시지 순 정렬
- [x] 유저 퇴장 시스템 메시지 (서버 → message:receive type:system)

## Phase 6 — 마감 처리
- [x] 모든 버튼 onClick 누락 없는지 확인
- [x] 빈 상태 UI 확인 (친구 없음, 채팅방 없음)
- [x] 기본 에러 처리 (연결 끊김 안내)
- [x] 카카오 옐로우 테마 최종 확인
