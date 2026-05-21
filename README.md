# 💬 KakaoTalk Web Clone

> 카카오톡 UI를 모방한 실시간 채팅 웹앱입니다. AI 챗봇(RAG), 시선 추적(Eye Tracking), 카테고리별 콘텐츠 추천 기능을 포함합니다.

<br>

## 미리보기

| 홈화면 | 채팅화면 |
|:---:|:---:|
| <img width="488" alt="홈화면" src="https://github.com/user-attachments/assets/bfe89c26-5a1e-41f8-9ebf-bb1c50b827ce" /> | <img width="488" alt="채팅화면" src="https://github.com/user-attachments/assets/de1bd073-0626-4a64-98f8-c3a58d448022" /> |

| 더보기 탭 | 카테고리 · 시선 추적 |
|:---:|:---:|
| <img width="488" alt="더보기" src="https://github.com/user-attachments/assets/1e11c67a-9637-4bfe-bb4d-e01bb1e57e8d" /> | <img width="488" alt="카테고리 시선추적" src="https://github.com/user-attachments/assets/f3900a93-3d0a-4eef-b509-8dde1ee8e34f" /> |

| AI 챗봇 | 설정 화면 |
|:---:|:---:|
| <img width="488" alt="AI 챗봇" src="https://github.com/user-attachments/assets/9f939b49-07d2-4f39-b2ad-1a3fe4722984" /> | <img width="488" alt="설정" src="https://github.com/user-attachments/assets/03adcd16-8f81-43dc-bad4-8be644b239a7" /> |

<br>

## 팀원 구성

<div align="center">

| **정용환** |
|:---:|
| [<img src="https://github.com/hwahwahwan.png" width=100>](https://github.com/hwahwahwan) <br> [@hwahwahwan](https://github.com/hwahwahwan) |

</div>

<br>

## 개발 환경

- **Frontend** : React 19, TypeScript 5, Vite 8, Tailwind CSS 3, Zustand 5
- **Backend** : Node.js, Express 5, Socket.io 4, SQLite (better-sqlite3)
- **AI / LLM** : Ollama (qwen2.5:3b), RAG (nomic-embed-text + pdf-parse)
- **Gaze Server** : Python, OpenCV, dlib, GazeTracking, websockets
- **버전 및 이슈 관리** : GitHub

<br>

## 채택한 기술

### React 19 + TypeScript + Vite
- 컴포넌트 단위로 채팅 UI를 분리해 유지보수성을 높이고, TypeScript로 Socket 이벤트 페이로드와 상태 타입을 명확히 정의
- Vite의 HMR과 `/api → :4000` 프록시로 개발 피드백 사이클을 단축

### Zustand
- Redux보다 보일러플레이트가 적고, 채팅방·메시지·온라인 유저처럼 자주 변하는 전역 상태를 하나의 스토어에서 관리
- 구독 단위가 세분화되어 불필요한 리렌더링 방지

### Socket.io
- 이벤트 기반 양방향 통신으로 메시지 수신·채팅방 초대·유저 목록 브로드캐스트를 명확한 이벤트 이름으로 처리
- 재연결 로직이 내장되어 브라우저 새로고침 후 소켓 룸 재가입을 안정적으로 처리

### Express 5 + better-sqlite3
- 별도 DB 서버 없이 SQLite로 채팅 메시지·유저·방 정보를 영속 저장
- WAL 모드로 읽기 성능을 높이고 동시 접근 충돌을 방지

### Ollama + RAG
- 로컬 LLM(qwen2.5:3b)을 사용해 외부 API 비용 없이 챗봇 응답 생성
- PDF 강의 자료를 청크 분할 → nomic-embed-text 임베딩 → 코사인 유사도 검색 → 컨텍스트 주입 순서로 처리
- 임베딩 서버 불가 시 키워드 빈도 검색으로 자동 폴백

### Python + OpenCV + GazeTracking
- 웹캠 프레임을 ~30fps로 캡처해 눈동자 좌표·시선 방향·깜빡임을 실시간 검출
- 결과를 WebSocket(ws://localhost:8765)으로 브라우저에 브로드캐스트하고, React 훅이 수신해 시선 기반 UI 제어에 활용

<br>

## 프로젝트 구조

```
Kakao-talk/
├── client/                    # React 프론트엔드
│   └── src/
│       ├── components/        # Avatar, ChatList, ChatWindow, GazeCursor 등
│       ├── hooks/             # useSocket, useGazeTracking, useCategoryGaze
│       ├── store/             # useChatStore (Zustand)
│       ├── services/          # 카테고리별 API 호출 (movie, food, book …)
│       ├── constants/         # 색상, 레이아웃, 소켓 이벤트, gaze 설정
│       ├── types/             # 공유 타입 정의
│       └── utils/             # format, gazeUtils, calibrationStorage
├── server/                    # Node.js 백엔드
│   ├── handlers/              # socketHandlers (채팅 이벤트 처리)
│   ├── routes/                # chatbot, recommend API
│   ├── services/              # ollamaService, ragService
│   ├── common/                # embedding (청킹·벡터화 공통 모듈)
│   ├── db/                    # SQLite 연결, prepared queries
│   └── data/                  # chat.db, vector-index.json
├── gaze-server/               # Python 시선 추적 서버
│   ├── GazeTracking/          # 오픈소스 라이브러리
│   └── server.py              # WebSocket 서버 (ws://localhost:8765)
├── WebProg/                   # RAG 소스 문서 (PDF 강의 자료)
├── tests/                     # 서버 통합 테스트
└── package.json               # 루트: concurrently로 4개 서비스 동시 실행
```

<br>

## 역할 분담

### 👤 정용환
- React 프론트엔드 전체 구현 (컴포넌트, hooks, Zustand 스토어, API 연결)
- Node.js 백엔드 구현 (Socket.io 이벤트 처리, REST API, SQLite 연동)
- Ollama 기반 RAG 챗봇 구현 (PDF 파싱, 임베딩, 코사인 유사도 검색)
- Python Gaze Server 구현 (OpenCV + GazeTracking → WebSocket 브로드캐스트)
- 외부 API 6종 연동 (영화, 음식, 도서, 게임, 여행, 쇼핑)

<br>

## 개발 기간

- **전체** : 2026.03 ~ 2026.05
- 1주차 : 프로젝트 설계, 소켓 이벤트 스펙 정의, 개발 환경 세팅
- 2주차 : 실시간 채팅 구현 (Socket.io + SQLite)
- 3주차 : AI 챗봇(Ollama + RAG), 카테고리별 추천 API 연동
- 4주차 : 시선 추적 서버 구현, 게이즈 기반 UI 제어, 통합 테스트

<br>

## 주요 기능

### 실시간 1:1 채팅
- Socket.io로 메시지 송수신, 채팅방 생성·초대·나가기 처리
- 메시지·유저·방 정보를 SQLite에 영속 저장, 재접속 시 이전 대화 복원
- 읽지 않은 메시지 카운트 배지 표시

### AI 챗봇 (RAG)
- Ollama 로컬 LLM + PDF 강의 자료 기반 RAG
- 질문과 관련된 문서 청크를 검색해 컨텍스트로 주입, 강의 내용 기반 답변 생성
- `/api/chatbot` REST 엔드포인트로 프론트엔드와 연동

### 시선 추적 UI
- 웹캠으로 눈동자 위치를 실시간 감지해 화면에 게이즈 커서 표시
- 시선이 특정 카테고리 영역에 일정 시간 머물면 자동 선택 (존 기반 캘리브레이션)
- GazeCursor, CalibrationOverlay, ZoneCalibrationOverlay 컴포넌트로 분리 구현

### 카테고리별 콘텐츠 추천

| 카테고리 | 사용 API |
|:---:|:---:|
| 영화 | TMDB API |
| 음식 | 식품안전나라 OpenAPI |
| 도서 | 카카오 도서 검색 API |
| 게임 | RAWG API |
| 여행 | 한국관광공사 API |
| 쇼핑 | 네이버 쇼핑 검색 API |

### 번역
- MyMemory Translate API로 외국어 메시지 자동 한국어 번역

<br>

## 시작하기

### 1. 의존성 설치

```bash
npm install
cd client && npm install
cd ../server && npm install
```

### 2. Python 가상환경 및 Gaze Server 설치

```bash
cd gaze-server
python3 -m venv venv
venv/bin/pip install -r requirements.txt
```

### 3. Ollama 설치 및 모델 다운로드 (최초 1회)

```bash
brew install ollama
OLLAMA_MODELS="/Users/yonghwan/Desktop/Kakao talk/ollama-models" ollama serve

# 새 터미널에서
ollama pull qwen2.5:3b
ollama pull nomic-embed-text   # RAG 임베딩 사용 시
```

### 4. RAG 벡터 인덱스 빌드 (선택, 최초 1회)

```bash
node server/scripts/buildIndex.js
```

### 5. 전체 실행

```bash
npm run dev
```

> Ollama + Server + Client + Gaze Server가 한 번에 실행됩니다. 종료는 `Ctrl+C`

### 6. 채팅 테스트

1. `http://localhost:3000` 을 **탭 2개** 열기
2. 각 탭에서 **다른 계정**으로 로그인
3. 한쪽 탭의 친구 목록에서 상대방 클릭 → 채팅 시작

<br>

## 환경변수

### `client/.env`

| 키 | 기본값 |
|:---|:---:|
| `VITE_SERVER_URL` | `http://localhost:4000` |

### `server/.env`

| 키 | 기본값 | 설명 |
|:---|:---:|:---|
| `PORT` | `4000` | 서버 포트 |
| `CLIENT_URL` | `http://localhost:3000` | CORS 허용 오리진 |
| `OLLAMA_URL` | `http://localhost:11434` | Ollama 엔드포인트 |
| `OLLAMA_MODEL` | `qwen2.5:3b` | 사용할 LLM 모델 |
| `TMBD_API_KEY` | - | TMDB 영화 API 키 |
| `FOOD_API_KEY` | - | 식품안전나라 API 키 |
| `KAKAO_API_KEY` | - | 카카오 도서 API 키 |
| `RAWG_API_KEY` | - | RAWG 게임 API 키 |
| `DATA_POTAL_KEY` | - | 한국관광공사 API 키 |
| `NAVER_API_KEY_CLIENTID` | - | 네이버 쇼핑 Client ID |
| `NAVER_API_KEY_CLIENTSERCRET` | - | 네이버 쇼핑 Client Secret |
| `TRANSLATE_EMAIL` | - | MyMemory 번역 API 이메일 |
