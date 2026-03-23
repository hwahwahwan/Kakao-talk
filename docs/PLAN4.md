# PLAN4 - 다국어 번역 기능 추가

> 목표: 영어/스페인어/일본어로 보낸 메시지를 받는 쪽에서 한국어로 자동 번역해서 표시
> 마감: 2026-03-30 (다음주)

---

## 1. 번역 API 선택

> ⚠️ DeepL 무료 플랜 폐지, Naver Papago 2024년 2월 지원 종료 → MyMemory 사용

| API | 무료 한도 | 카드 필요 | API 키 필요 | 비고 |
|---|---|---|---|---|
| **MyMemory** | 일 50,000자 (이메일 등록 시) | ❌ 불필요 | ❌ 불필요 | **가장 추천** |
| DeepL | 월 500,000자 | ✅ 필요 (청구 안 됨) | 필요 | 품질 좋지만 카드 필요 |
| Google Cloud | 월 500,000자 | ✅ 필요 (청구 안 됨) | 필요 | 카드 필요 |
| Azure Translator | 월 2,000,000자 | ✅ 필요 (청구 안 됨) | 필요 | 한도 제일 크지만 카드 필요 |

### 추천: MyMemory API

**추천 이유:**
- 가입 불필요, 카드 불필요, API 키 불필요
- 이메일 주소를 파라미터로 넣기만 하면 하루 50,000자 무료
- 한국어, 영어, 스페인어, 일본어 모두 지원
- HTTP GET 요청 하나로 끝 (별도 패키지 설치 불필요)

**사용 방법:**
- 별도 가입/발급 없음
- `.env`에 본인 이메일만 추가:
  ```
  TRANSLATE_EMAIL=your_email@example.com
  ```
- API 호출 예시:
  ```
  https://api.mymemory.translated.net/get?q=Hello&langpair=en|ko&de=your_email@example.com
  ```

---

## 2. 동작 방식 설계

### 번역 흐름

```
[발신자] 영어/스페인어/일본어로 메시지 작성
    ↓
[서버] 메시지 수신 (MESSAGE_SEND)
    ↓
[서버] DeepL API로 한국어 번역
    ↓
[서버] 원문 + 번역문 모두 저장
    ↓
[수신자] 한국어 번역문 표시 (원문 보기 토글 가능)
[발신자] 원문 표시 (본인이 보낸 언어 그대로)
```

### 왜 서버에서 번역하나?

- API 키가 서버에만 있어도 됨 (클라이언트에 노출 안 됨)
- 번역 결과가 모든 수신자에게 동일하게 전달됨
- 나중에 메시지 히스토리 로드할 때도 번역문이 저장되어 있음

---

## 3. 변경이 필요한 파일 목록

```
server/
  index.js              → 번역 로직 추가 (MESSAGE_SEND 핸들러)
  translate.js          → 번역 유틸 함수 (새 파일)
  constants.js          → 언어 코드 상수 추가
  package.json          → deepl-node 패키지 추가
  .env                  → DEEPL_API_KEY 추가

client/src/
  types/index.ts        → Message 타입에 translatedContent, sourceLang 필드 추가
  components/
    ChatWindow.tsx      → 번역된 메시지 표시 로직
    MessageBubble.tsx   → 원문/번역 토글 버튼 UI (새 파일 또는 수정)
    LoginScreen.tsx     → 언어 선택 옵션 추가
  store/useChatStore.ts → myLanguage 상태 추가 (내 언어 설정)
```

---

## 4. 메시지 스키마 변경

현재 메시지 구조:
```js
{
  id, roomId, senderId, senderName,
  content,        // 원문
  type, createdAt
}
```

변경 후:
```js
{
  id, roomId, senderId, senderName,
  content,            // 원문 (발신자가 보낸 언어 그대로)
  translatedContent,  // 한국어 번역문 (번역 성공 시)
  sourceLang,         // 원문 언어 코드 ("EN", "ES", "JA", "KO")
  type, createdAt
}
```

---

## 5. 구현 단계 (순서대로)

### Step 1: 서버 - 번역 유틸 작성 (MyMemory API)

별도 패키지 설치 불필요 (Node.js 내장 `https` 모듈 사용)

`server/translate.js` 파일 생성:
```js
const https = require('https')

// 언어 코드 매핑 (클라이언트 → MyMemory 형식)
const LANG_MAP = { KO: 'ko', EN: 'en', ES: 'es', JA: 'ja' }

// 한국어가 아닌 메시지를 한국어로 번역
async function translateToKorean(text, sourceLang) {
  if (!sourceLang || sourceLang === 'KO') return null

  const source = LANG_MAP[sourceLang]
  if (!source) return null

  const email = process.env.TRANSLATE_EMAIL ?? ''
  const query = encodeURIComponent(text)
  const url = `https://api.mymemory.translated.net/get?q=${query}&langpair=${source}|ko&de=${email}`

  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = ''
      res.on('data', (chunk) => (data += chunk))
      res.on('end', () => {
        try {
          const json = JSON.parse(data)
          const translated = json.responseData?.translatedText
          // MyMemory가 번역 실패 시 원문을 그대로 돌려주는 경우 null 처리
          resolve(translated && translated !== text ? translated : null)
        } catch {
          resolve(null)
        }
      })
    }).on('error', (err) => {
      console.error('[번역 실패]', err.message)
      resolve(null)
    })
  })
}

module.exports = { translateToKorean }
```

### Step 2: 서버 - MESSAGE_SEND 핸들러에 번역 추가

`server/index.js` 의 `MESSAGE_SEND` 이벤트 핸들러 수정:

```js
// 기존: 동기 처리
socket.on(SOCKET_EVENTS.MESSAGE_SEND, ({ roomId, content, sourceLang }) => { ... })

// 변경: async로 번역 처리
socket.on(SOCKET_EVENTS.MESSAGE_SEND, async ({ roomId, content, sourceLang }) => {
  // ... 기존 검증 로직 ...

  // sourceLang이 없거나 KO이면 번역 건너뜀
  const translatedContent = await translateToKorean(content, sourceLang ?? 'KO')

  const message = {
    id: crypto.randomUUID(),
    roomId,
    senderId: userId,
    senderName: user?.name ?? null,
    content: content.trim(),
    translatedContent,      // 추가
    sourceLang: sourceLang ?? 'KO',  // 추가
    type: 'text',
    createdAt: new Date().toISOString(),
  }

  room.messages.push(message)
  io.to(roomId).emit(SOCKET_EVENTS.MESSAGE_RECEIVE, message)
})
```

### Step 3: 클라이언트 - 로그인 시 언어 선택 추가

`LoginScreen.tsx`에 언어 선택 드롭다운 추가:

```tsx
// 언어 옵션
const LANGUAGES = [
  { code: 'KO', label: '한국어' },
  { code: 'EN', label: 'English' },
  { code: 'ES', label: 'Español' },
  { code: 'JA', label: '日本語' },
]
```

선택한 언어를 zustand store에 저장하고, 메시지 전송 시 `sourceLang` 함께 전송.

### Step 4: 클라이언트 - 메시지 표시 로직 변경

`MessageBubble.tsx` (또는 `ChatWindow.tsx`) 수정:

- **받은 메시지**: `translatedContent`가 있으면 번역문 표시, 없으면 원문 표시
- **보낸 메시지**: 항상 원문 표시 (내가 쓴 언어 그대로)
- **원문 보기 토글**: 번역문 아래 작은 "원문 보기" 버튼 → 클릭 시 원문과 번역문 같이 표시

```tsx
// 표시 로직 예시
const displayContent = isMine
  ? message.content
  : (message.translatedContent ?? message.content)
```

### Step 5: 클라이언트 - 메시지 전송 시 언어 코드 포함

`useSocket.ts`의 `sendMessage` 함수 수정:

```ts
// 기존
sendMessage(roomId: string, content: string)

// 변경
sendMessage(roomId: string, content: string, sourceLang: string)
```

---

## 6. UI/UX 디자인

### 로그인 화면 언어 선택

```
이름: [____________]
이메일: [____________]
사용 언어: [한국어 ▼]  ← 드롭다운 추가
         [English    ]
         [Español    ]
         [日本語     ]
[입장하기]
```

### 메시지 말풍선 (번역된 메시지)

```
┌─────────────────────────────┐
│ 안녕하세요! (번역됨)          │  ← 번역문 (굵게)
│ Hello!               [원문] │  ← 원문 (작게, 회색) + 토글 버튼
└─────────────────────────────┘
```

또는 토글 전/후:

```
[접힌 상태]
┌─────────────────────────────┐
│ 안녕하세요!                  │
│                   [원문 보기]│
└─────────────────────────────┘

[펼친 상태]
┌─────────────────────────────┐
│ 안녕하세요!                  │
│ ─────────────────────────  │
│ Hello!              [접기]  │
└─────────────────────────────┘
```

---

## 7. 환경변수 설정

`server/.env` 파일에 추가:
```
TRANSLATE_EMAIL=your_email@example.com
```

> ⚠️ `.env` 파일은 절대 git에 커밋하지 말 것
> 이메일 없이도 동작하지만 하루 한도가 5,000자로 줄어듦

### API 키/가입 없이 동작 확인

이메일 없어도 번역 자체는 동작함. 단, 하루 한도가 5,000자로 낮아짐.
번역 실패 시 원문 그대로 표시 (채팅 자체는 중단 없음).

---

## 8. 에러 처리

- DeepL API 호출 실패 시: 번역 없이 원문만 전달 (서비스 중단 없음)
- API 키 없을 때: 서버 시작 시 경고 로그 출력, 번역 기능만 비활성화
- 지원하지 않는 언어: `sourceLang`을 `null`로 보내면 DeepL이 자동 감지

---

## 9. 구현 순서 요약 (추천 작업 순서)

| 순서 | 작업 | 예상 소요 |
|---|---|---|
| 1 | DeepL 회원가입 + API 키 발급 | 10분 |
| 2 | `server/translate.js` 작성 + `deepl-node` 설치 | 30분 |
| 3 | `server/index.js` MESSAGE_SEND 핸들러 수정 | 30분 |
| 4 | `client/src/types/index.ts` Message 타입 수정 | 10분 |
| 5 | `LoginScreen.tsx` 언어 선택 드롭다운 추가 | 30분 |
| 6 | `useSocket.ts` sendMessage에 sourceLang 추가 | 20분 |
| 7 | `ChatWindow.tsx` 번역문 표시 로직 추가 | 30분 |
| 8 | 원문 보기 토글 UI 추가 | 30분 |
| 9 | 테스트 (각 언어별로 메시지 전송 확인) | 30분 |

총 예상 소요: **3~4시간**

---

## 10. 테스트 시나리오

1. 영어로 로그인한 유저가 `"Hello, how are you?"` 전송 → 받는 쪽에서 `"안녕하세요, 잘 지내시나요?"` 확인
2. 스페인어로 로그인한 유저가 `"¿Cómo estás?"` 전송 → `"어떻게 지내세요?"` 확인
3. 일본어로 로그인한 유저가 `"こんにちは"` 전송 → `"안녕하세요"` 확인
4. 한국어 유저가 메시지 보내면 번역 없이 원문 그대로 표시 확인
5. 원문 보기 토글 동작 확인
6. API 키 없는 상태에서 서버가 정상 동작하는지 확인 (번역만 안 되고 채팅은 됨)
