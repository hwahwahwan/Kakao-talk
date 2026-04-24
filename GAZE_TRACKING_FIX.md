# GazeTracking 문제 해결 가이드

> `antoinelame/GazeTracking` 라이브러리 적용 후 나타나는 두 가지 증상의 원인과 해결 방법.

---

## 증상 요약

1. **순간이동** — 한 곳을 응시해도 점이 여기저기 튐
2. **가장자리 고착** — 점이 좌/우 끝에만 달라붙음 (중앙 영역을 못 찍음)

두 증상 모두 **라이브러리 자체의 한계**와 **현재 구현의 파라미터 선택**이 원인입니다.

---

## 원인 분석

### 증상 1: 순간이동(Jitter)

**`antoinelame/GazeTracking`의 구조적 한계**
- 눈 추적은 웹캠 단일 프레임에서 **동공 중심점을 검출**하는 방식
- `horizontal_ratio = pupil_x / eye_width`, 즉 **픽셀 2~3개 오차가 화면 전체 폭에 해당**
- 파이썬 라이브러리 측에 **시간적 스무딩이 없음** → 프레임마다 ±0.02~0.05 노이즈
- 머리 움직임을 추적하지 않음 → 고개를 살짝만 돌려도 "눈이 움직인 것"으로 기록됨
- 눈꺼풀이 내려오는 순간 동공 위치가 튐 (`is_blinking`이 항상 완벽히 잡히진 않음)

**현재 구현의 문제**
- [client/src/hooks/useCategoryGaze.ts:38-44](client/src/hooks/useCategoryGaze.ts#L38-L44) 에서 **이동 평균(mean)** 사용
  - 평균은 **아웃라이어에 취약**: 프레임 하나가 0.2 튀면 평균 전체가 오염됨
  - 15프레임 창 = 500ms → 튄 값이 500ms 동안 영향을 줌
- `isBlinking === true`인 프레임도 그대로 샘플로 사용하고 있음
- 디버그 점([client/src/pages/CategoryPage.tsx:81-86](client/src/pages/CategoryPage.tsx#L81-L86))은 스무딩 안 된 raw 값을 사용 → 시각적으로 더 튀어 보임

### 증상 2: 좌우 가장자리 고착

**이것은 clamp 문제입니다**
- [gazeUtils.ts:5-6](client/src/utils/gazeUtils.ts#L5-L6)의 `norm()`이 결과를 `[0, 1]`로 clamp
- 입력 ratio가 보정된 범위 `[hMin, hMax]` 밖으로 나가면 → 0 또는 1 → 화면 맨 끝
- **실제 눈 ratio 범위는 매우 좁음** (보통 수평 0.05~0.10, 수직 0.03~0.08 폭)
- 노이즈(±0.02~0.05)가 이 좁은 범위와 거의 같은 스케일 → **노이즈 한 번만 튀어도 범위 밖으로 튀어나가 clamp**

스크린샷 관측값: `h=0.594, v=0.618, w=1728, h=963` → dot x=737, y=271
- 737/1728 ≈ 0.426 → `norm(h)=0.574` → 역산 시 폭이 매우 좁은 보정값(약 hMin≈0.55, hMax≈0.625)이 저장된 상태로 추정
- 보정 범위가 좁으면 노이즈 한 번이 즉시 `x=0` 또는 `x=W`로 튐

### 증상 1 + 2의 결합
- 노이즈가 커서 → 순간이동
- 노이즈가 보정 범위보다 커서 → 튄 값은 대부분 clamp → 결과적으로 **"왼쪽 끝 → 오른쪽 끝"으로만 순간이동**

---

## 해결 방법 (우선순위 순)

### [P0] 즉시 적용: 중앙값 필터 + 블링크 샘플 제거

[client/src/hooks/useCategoryGaze.ts](client/src/hooks/useCategoryGaze.ts) 수정:

```ts
// 이동 평균 대신 이동 중앙값 사용
const median = (arr: number[]) => {
  const s = [...arr].sort((a, b) => a - b)
  return s[Math.floor(s.length / 2)]
}

// 블링크 프레임은 샘플에서 제외
if (!gazeData.isBlinking) {
  if (gazeData.horizontalRatio != null) { hs.push(gazeData.horizontalRatio); if (hs.length > GAZE_SMOOTH_N) hs.shift() }
  if (gazeData.verticalRatio != null) { vs.push(gazeData.verticalRatio); if (vs.length > GAZE_SMOOTH_N) vs.shift() }
}

const smoothed: GazeData = {
  ...gazeData,
  horizontalRatio: hs.length ? median(hs) : gazeData.horizontalRatio,
  verticalRatio: vs.length ? median(vs) : gazeData.verticalRatio,
}
```

**효과**: 평균이 아닌 중앙값은 프레임 1~2개의 outlier를 완전히 무시합니다. 순간이동이 대폭 줄어듭니다.

### [P0] 즉시 적용: 디버그 점도 스무딩값 사용

현재 `CategoryPage.tsx`의 디버그 점은 raw gazeData를 씁니다. 훅에서 스무딩된 값을 반환하게 하거나, 페이지에서도 동일한 스무딩을 적용하세요. 아니면 **디버그 점은 삭제** — 어차피 이 라이브러리로 픽셀 단위 포인팅은 불가능합니다.

### [P1] 보정 범위 마진 확대

[CalibrationOverlay.tsx:54](client/src/components/CalibrationOverlay.tsx#L54)의 `M = 0.015` → **`M = 0.04~0.06`** 으로 확대.
- 노이즈 범위와 비슷하거나 더 큰 마진을 줘야 clamp로 튕기지 않음
- 트레이드오프: 마진이 커질수록 화면 끝까지 시선이 안 닿음 (하지만 히트박스 padding이 있으니 실사용엔 충분)

### [P1] 보정 샘플에도 중앙값 + 블링크 제외

[CalibrationOverlay.tsx:47-48](client/src/components/CalibrationOverlay.tsx#L47-L48) 도 **평균 대신 중앙값**으로 바꾸고, `isBlinking=true` 샘플은 배제하세요. 현재는 보정 단계에서 블링크 하면 보정값 자체가 오염됩니다.

### [P1] 외곽 포인팅 대신 "영역 일치(consensus)" 방식

**픽셀 좌표로 버튼에 히트시키려 하지 말고**, "최근 N프레임 중 과반수가 같은 버튼 위에 있으면 선택"으로 로직을 바꾸세요:

```ts
// 최근 10프레임의 detected 결과를 기억
const histRef = useRef<(CategoryId | null)[]>([])
histRef.current.push(detected)
if (histRef.current.length > 10) histRef.current.shift()
const counts = new Map<CategoryId | null, number>()
histRef.current.forEach(id => counts.set(id, (counts.get(id) ?? 0) + 1))
const [winner, n] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]
const stable = n >= 7 ? winner : null  // 70% 이상 일치해야 인정
```

**효과**: 순간이동 한두 프레임은 자연스럽게 무시되고, 사용자가 진짜 오래 보는 버튼만 선택됩니다.

### [P2] 히트 패딩 확대 + 버튼 간격 넓히기

[gazeConfig.ts:9](client/src/constants/gazeConfig.ts#L9) `GAZE_HIT_PADDING = 50` → **80~120** 으로.
카테고리 버튼이 현재 7개가 좁게 붙어있어([CategoryGrid.tsx](client/src/components/CategoryGrid.tsx)) 정밀 포인팅이 필요합니다. 버튼 간격을 더 띄우면 edge clamping이 발생해도 실용 정확도가 오릅니다.

### [P2] 라이브러리의 이산 zone 활용

`horizontalRatio` 대신 `is_left / is_center / is_right`를 사용해 **화면을 3구역**으로만 나누면 노이즈에 강합니다. 카테고리 버튼 배치를 이 3구역 + 상/중/하 조합으로 재설계할 수 있다면 정확도가 비약적으로 올라갑니다.

---

## 위 방법들을 모두 적용해도 안 되는 경우 — 라이브러리 자체가 한계

`antoinelame/GazeTracking`는 **화면 포인팅용이 아닙니다.** 원 설계 목적은 "사용자가 왼쪽/오른쪽/중앙 중 어디를 보는가" 수준의 이산 방향 추정입니다. 정밀한 좌표를 원한다면 아래 대안 중 하나로 교체가 필요합니다.

| 대안 | 장점 | 단점 |
|------|------|------|
| **WebGazer.js** | 브라우저 단독 실행, 클릭 기반 자동 보정, 문서 풍부 | 정확도는 이 라이브러리와 비슷하지만 smoothing이 내장 |
| **MediaPipe FaceLandmarker (iris)** | Google 모델, 픽셀 정밀도 훨씬 높음, 브라우저에서 동작 | 통합 코드 작성 필요 |
| **GazeCloud API** | 상용 수준 정확도 | 외부 서비스 의존 |
| **Tobii Eye Tracker 5** | 하드웨어 기반, 사실상 표준 | $200 하드웨어 구매 |

권장: **WebGazer.js** 로 시도 → 만족 못하면 **MediaPipe iris** 로. 둘 다 파이썬 서버가 필요 없어서 현재 `gaze-server/server.py` 프로세스를 통째로 제거할 수 있습니다.

---

## 적용 체크리스트

- [ ] `useCategoryGaze.ts`: 이동 평균 → 이동 중앙값
- [ ] `useCategoryGaze.ts`: `isBlinking=true` 샘플 제외
- [ ] `CalibrationOverlay.tsx`: `M = 0.04` 로 확대
- [ ] `CalibrationOverlay.tsx`: 평균 → 중앙값, 블링크 샘플 제외
- [ ] `useCategoryGaze.ts`: consensus (최근 N프레임 과반수) 로직 추가
- [ ] `gazeConfig.ts`: `GAZE_HIT_PADDING` 80~120으로 확대
- [ ] 기존 저장된 보정값 삭제 (`localStorage.removeItem('gaze-calibration-v1')`) 후 재보정 실행
- [ ] 위 항목 적용 후에도 개선이 미미하면 **WebGazer.js** 또는 **MediaPipe iris** 로 라이브러리 교체 검토

---

## 왜 현재 구현이 실패했는가 (한 줄 요약)

> **노이즈가 보정 범위보다 크기 때문에**, 노이즈 한 번만 튀면 `norm()`이 0/1로 clamp되어 점이 가장자리로 순간이동합니다. 이동 "평균"은 outlier에 약해서 방어가 안 됩니다. 중앙값 필터 + 블링크 제거 + 넓은 마진 + consensus 로직, 이 네 가지를 같이 적용해야 실사용 가능합니다.
