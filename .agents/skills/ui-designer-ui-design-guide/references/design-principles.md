# Design Principles

> UI 설계와 코드 생성에 적용하는 디자인 원칙.
> Part 1은 설계 단계에서, Part 2는 코드 생성 후 검증 단계에서 사용한다.

---

## Part 1: 정적 디자인 원칙

설계 단계에서 컴포넌트 선택과 레이아웃 배치를 결정할 때 적용한다.

---

### 1.1 시각적 계층 (Visual Hierarchy)

**원칙**: 사용자의 시선이 가장 중요한 요소부터 순서대로 이동하도록 설계한다.

**도구**:
- **크기**: 제목 > 소제목 > 본문 > 캡션
- **색상**: 주 색상은 핵심 CTA에만, 보조 색상은 부가 정보에
- **대비**: 중요한 요소는 배경 대비를 높게
- **여백**: 중요한 요소 주변에 더 많은 여백 (breathing room)
- **굵기**: font-bold는 핵심 정보, font-normal은 일반 정보

**Tailwind 적용**:

| 계층 | 크기 | 무게 | 색상 |
|------|------|------|------|
| 주 제목 | `text-3xl` ~ `text-5xl` | `font-bold` | `text-foreground` |
| 부 제목 | `text-xl` ~ `text-2xl` | `font-semibold` | `text-foreground` |
| 본문 | `text-base` | `font-normal` | `text-foreground` |
| 부가 텍스트 | `text-sm` | `font-normal` | `text-muted-foreground` |
| 캡션/힌트 | `text-xs` | `font-normal` | `text-muted-foreground` |

**계층 구성 예시**:

```tsx
// 올바른 계층 구성
<section className="space-y-2">
  <h1 className="text-3xl font-bold text-foreground">페이지 제목</h1>
  <p className="text-sm text-muted-foreground">페이지에 대한 부가 설명</p>
</section>

// 카드 내부 계층
<CardHeader className="space-y-1">
  <CardTitle className="text-lg font-semibold">카드 제목</CardTitle>
  <CardDescription className="text-sm text-muted-foreground">카드 설명</CardDescription>
</CardHeader>
```

**실수 방지**:
- 모든 텍스트가 같은 크기/무게면 계층이 없어 사용자가 어디를 봐야 할지 모름
- 너무 많은 색상을 쓰면 계층이 오히려 혼란해짐
- CTA 버튼이 여러 개면 어떤 것이 주요 행동인지 불명확 — Primary는 1개, 나머지는 Secondary/Ghost
- `text-foreground`와 `text-muted-foreground` 외의 텍스트 색상은 의미적으로만 사용 (에러, 성공 등)

---

### 1.2 일관성 (Consistency)

**원칙**: 같은 역할의 요소는 항상 같은 스타일로.

**규칙**:
- 같은 종류의 카드는 같은 크기, 같은 패딩, 같은 border-radius
- 같은 레벨의 제목은 같은 텍스트 스타일
- 같은 유형의 버튼은 같은 `variant` 사용
- 같은 계층의 섹션은 같은 `padding`

**shadcn/ui 활용**:
- shadcn 컴포넌트의 기본 스타일을 최대한 유지
- `variant`를 일관되게 사용

| variant | 용도 |
|---------|------|
| `default` | 주요 CTA (페이지당 1개 권장) |
| `secondary` | 보조 행동 |
| `outline` | 중립적 행동, 취소 |
| `ghost` | 아이콘 버튼, 네비게이션 아이템 |
| `destructive` | 삭제, 위험한 행동 |
| `link` | 텍스트 기반 행동, 링크 |

- `size`를 일관되게 사용: `sm` / `default` / `lg` / `icon`

**패딩 일관성**:

| 컨텍스트 | 패딩 |
|----------|------|
| 페이지 컨테이너 | `p-6` 또는 `p-8` |
| 카드 내부 | `p-6` (CardContent 기본) |
| 테이블 셀 | `px-4 py-3` |
| 작은 카드/위젯 | `p-4` |
| 모달/다이얼로그 | `p-6` |

**실수 방지**:
- 같은 페이지에서 Card의 패딩이 `p-4`, `p-6`, `p-8`로 제각각
- 버튼 스타일이 페이지마다 다름
- 같은 기능의 아이콘이 페이지마다 다른 아이콘 사용 (Lucide React 아이콘 세트 통일)
- 같은 역할의 컴포넌트를 페이지마다 다르게 구현 (공통 컴포넌트로 추출)

---

### 1.3 반응형 디자인

**원칙**: Mobile-first로 설계하고, 큰 화면에서 확장한다.

**규칙**:
- 기본 스타일은 모바일용, `sm:` / `md:` / `lg:` / `xl:` 접두사로 확장
- 터치 타겟: 최소 44x44px (모바일 버튼/링크) — `min-h-[44px] min-w-[44px]`
- 콘텐츠 우선순위: 모바일에서는 핵심만, 데스크톱에서 보조 정보 추가
- 이미지: 모바일에서 비율 유지, 필요시 숨김 (`hidden md:block`)

**일반적인 반응형 전환**:

| 요소 | 모바일 | 태블릿 (`md`) | 데스크톱 (`lg`) |
|------|--------|---------------|----------------|
| 사이드바 | Sheet (숨김) | Sheet | 고정 표시 |
| 카드 그리드 | `grid-cols-1` | `grid-cols-2` | `grid-cols-3` ~ `grid-cols-4` |
| 테이블 | 카드 뷰 또는 가로 스크롤 | 스크롤 | 풀 표시 |
| 네비게이션 | 햄버거 메뉴 | 햄버거 메뉴 | 풀 메뉴 |
| Hero 섹션 | 스택 (세로) | 스택 | 스플릿 (가로) |
| 폼 필드 | 1컬럼 | 2컬럼 | 2컬럼 ~ 3컬럼 |

**반응형 그리드 패턴**:

```tsx
// 카드 그리드
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

// 통계 카드 (4개)
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

// 2컬럼 레이아웃 (콘텐츠 + 사이드)
<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
  <div className="lg:col-span-2">메인 콘텐츠</div>
  <div>사이드 패널</div>
</div>
```

**실수 방지**:
- 데스크톱 기준으로 설계 후 모바일 대응 — 반드시 Mobile-first
- `px-4` 같은 모바일 여백 없이 `px-8`로 시작 — 좁은 화면에서 콘텐츠가 잘림
- 터치 타겟이 너무 작아 모바일에서 탭 실수 발생
- 테이블을 그대로 모바일에 적용 — 가로 스크롤 또는 카드 뷰로 전환 필요

---

### 1.4 컬러 사용 규칙

**원칙**: 컬러는 의미를 전달하는 도구다. 장식이 아니다.

**역할별 컬러 (shadcn CSS 변수)**:

| 역할 | shadcn 변수 | Tailwind 클래스 | 용도 |
|------|------------|----------------|------|
| 주 색상 | `--primary` | `bg-primary text-primary-foreground` | CTA, 주요 행동, 선택된 상태 |
| 보조 색상 | `--secondary` | `bg-secondary text-secondary-foreground` | 부가 행동, 태그, 배지 |
| 파괴 | `--destructive` | `bg-destructive text-destructive-foreground` | 삭제, 에러, 위험 |
| 배경 | `--background` | `bg-background` | 페이지 배경 |
| 카드 배경 | `--card` | `bg-card text-card-foreground` | 카드/패널 배경 |
| 기본 텍스트 | `--foreground` | `text-foreground` | 기본 텍스트 |
| 약한 텍스트 | `--muted-foreground` | `text-muted-foreground` | 부가 정보, 힌트 |
| 뮤트 배경 | `--muted` | `bg-muted` | 비활성 배경, 코드 블록 |
| 강조 | `--accent` | `bg-accent text-accent-foreground` | 호버 상태, 강조 배경 |
| 테두리 | `--border` | `border-border` | 구분선, 카드 외곽 |
| 링 | `--ring` | `ring-ring` | 포커스 링 |

**상태별 컬러**:

| 상태 | 컬러 클래스 | 예시 |
|------|------------|------|
| 성공 | `text-green-600 dark:text-green-400` | 완료, 승인 |
| 경고 | `text-yellow-600 dark:text-yellow-400` | 주의, 대기 |
| 에러 | `text-destructive` | 실패, 거부 |
| 정보 | `text-blue-600 dark:text-blue-400` | 안내, 정보 |

**대비 비율 (WCAG AA)**:

| 텍스트 유형 | 최소 대비 비율 |
|------------|--------------|
| 일반 텍스트 (18px 미만) | 4.5:1 |
| 큰 텍스트 (18px 이상, bold 14px 이상) | 3:1 |
| UI 요소 (버튼 테두리, 입력 필드) | 3:1 |
| 비활성/장식 요소 | 기준 없음 |

**다크 모드**:
- shadcn의 CSS 변수 시스템으로 자동 지원
- 이미지/아이콘의 다크 모드 대응 확인 (`dark:` 변형 사용)
- **하드코딩된 컬러 절대 금지**: `bg-white` 대신 `bg-background`, `text-black` 대신 `text-foreground`

**실수 방지**:
- `bg-white`, `text-black` 등 하드코딩 — 다크 모드에서 깨짐
- 같은 페이지에 Primary 버튼이 3개 이상 — 사용자가 주요 행동을 파악 못 함
- 에러가 아닌 곳에 `destructive` 컬러 사용 — 사용자에게 잘못된 신호
- 낮은 대비 텍스트 — 접근성 위반 및 가독성 저하

---

### 1.5 타이포그래피 규칙

**크기 스케일 (Tailwind)**:

| 용도 | 클래스 | 크기 | 적용 예 |
|------|--------|------|---------|
| 히어로 제목 | `text-4xl lg:text-5xl` | 36px/48px | 랜딩 페이지 메인 제목 |
| 페이지 제목 | `text-3xl lg:text-4xl` | 30px/36px | `<h1>` 페이지 헤더 |
| 섹션 제목 | `text-2xl` | 24px | `<h2>` 섹션 구분 |
| 카드 제목 | `text-lg` ~ `text-xl` | 18px/20px | CardTitle |
| 소제목 | `text-base font-semibold` | 16px | `<h4>` 소그룹 제목 |
| 본문 | `text-base` | 16px | 일반 텍스트 |
| 부가 정보 | `text-sm` | 14px | 설명, 레이블 |
| 캡션/라벨 | `text-xs` | 12px | 메타 정보, 배지 텍스트 |

**줄 간격 (line-height)**:

| 컨텍스트 | 클래스 | 값 | 적합한 용도 |
|----------|--------|-----|------------|
| 제목 | `leading-tight` | 1.25 | h1, h2 — 큰 텍스트 |
| 소제목 | `leading-snug` | 1.375 | h3, h4 |
| 본문 | `leading-normal` | 1.5 | 기본 단락 |
| 긴 본문 | `leading-relaxed` | 1.625 | 문서, 블로그 |
| 좁은 UI | `leading-none` | 1.0 | 버튼, 배지 |

**최대 줄 길이**:

| 콘텐츠 유형 | 클래스 | 설명 |
|------------|--------|------|
| 본문 단락 | `max-w-prose` | 약 65자 — 가독성 최적 |
| 설명문 | `max-w-2xl` | 넓은 설명 블록 |
| 전체 폭 | 제한 없음 | 테이블, 코드, 대시보드 |

**폰트 무게**:

| 클래스 | 값 | 용도 |
|--------|-----|------|
| `font-normal` | 400 | 본문, 일반 텍스트 |
| `font-medium` | 500 | 레이블, 네비게이션 |
| `font-semibold` | 600 | 소제목, 카드 제목 |
| `font-bold` | 700 | 제목, 강조 수치 |

**실수 방지**:
- 모든 텍스트에 `font-bold` — 강조가 사라짐
- `text-xs`로 중요한 정보 표시 — 가독성 저하
- 긴 본문에 `leading-tight` — 줄이 겹쳐 보임
- 고정 `px` 크기 사용 — 반응형과 접근성 대응 불가

---

### 1.6 인터랙션 패턴

**원칙**: 모든 인터랙티브 요소는 상태를 명확하게 표현한다.

**상태 표현**:

| 상태 | 스타일 | Tailwind 클래스 |
|------|--------|----------------|
| 기본 | 기본 스타일 | — |
| 호버 | 배경/색상 변화 | `hover:bg-accent hover:text-accent-foreground` |
| 포커스 | 포커스 링 | `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` |
| 활성(클릭) | 약간 축소 | `active:scale-95` |
| 선택됨 | 강조 배경 | `data-[state=active]:bg-primary data-[state=active]:text-primary-foreground` |
| 비활성 | 흐림 처리 | `disabled:opacity-50 disabled:pointer-events-none` |
| 로딩 | 스피너 + 비활성 | `disabled:opacity-50` + `<Loader2 className="animate-spin" />` |

**트랜지션 가이드**:

| 변화 유형 | 권장 설정 | 적용 예 |
|----------|----------|--------|
| 색상 변화 | `transition-colors duration-150` | 버튼 호버, 링크 |
| 투명도 변화 | `transition-opacity duration-200` | 툴팁, 오버레이 |
| 크기/위치 변화 | `transition-all duration-300` | 아코디언, 패널 |
| 그림자 변화 | `transition-shadow duration-200` | 카드 호버 |
| 모달/시트 등장 | shadcn 내장 `animate-in` | Dialog, Sheet |

**피드백 패턴**:

| 이벤트 | 피드백 방법 | 구현 |
|--------|-----------|------|
| 성공 | Toast (하단 오른쪽) | `toast.success("저장되었습니다")` |
| 에러 | 인라인 에러 + Toast | 폼 필드 아래 에러 메시지 |
| 로딩 | Skeleton → 콘텐츠 전환 | `<Skeleton className="h-4 w-full" />` |
| 빈 상태 | 아이콘 + 안내 문구 + CTA | Empty state 컴포넌트 |
| 삭제 확인 | AlertDialog | 취소/확인 2단계 |
| 작업 진행 | Progress 또는 스피너 | `<Progress value={progress} />` |

**키보드 내비게이션**:
- 모든 인터랙티브 요소는 Tab으로 포커스 가능해야 함
- `tabIndex={-1}`: 프로그래매틱 포커스만, Tab 순서에서 제외
- `tabIndex={0}`: 기본 Tab 순서에 포함
- 모달이 열리면 포커스를 모달 내부로 이동, 닫히면 트리거 요소로 복귀

**실수 방지**:
- 호버 스타일 없는 버튼 — 클릭 가능한 요소임을 알 수 없음
- 포커스 링 없는 인터랙티브 요소 — 키보드 사용자 접근성 위반
- `cursor-pointer` 누락 — 클릭 가능한 요소가 기본 커서로 표시됨
- 로딩 중 버튼 비활성화 없음 — 중복 요청 발생

---

### 1.7 레이아웃 구성 패턴

**페이지 구조**:

```
┌─────────────────────────────────────┐
│  Sidebar (고정, lg: 표시)           │
├─────────────────────────────────────┤
│  Header (sticky, top-0)             │
│  ─ 페이지 제목 / 빵부스러미 / 액션   │
├─────────────────────────────────────┤
│  Main Content                       │
│  ─ 통계 카드 행                      │
│  ─ 주요 콘텐츠 (테이블/차트/폼)      │
│  ─ 보조 콘텐츠 (사이드 패널)         │
└─────────────────────────────────────┘
```

**간격 시스템**:

| 요소 간 관계 | 간격 |
|------------|------|
| 관련 요소 내부 | `gap-2` ~ `gap-3` |
| 같은 섹션 내 카드 | `gap-4` |
| 섹션과 섹션 사이 | `gap-6` ~ `gap-8` |
| 페이지 전체 여백 | `p-4 lg:p-6` 또는 `p-6 lg:p-8` |
| 주요 섹션 사이 | `space-y-8` |

**Z-index 관리**:

| 요소 | z-index | 클래스 |
|------|---------|--------|
| 기본 콘텐츠 | 0 | `z-0` |
| 고정 헤더, Sticky 요소 | 10 | `z-10` |
| 드롭다운, 팝오버 | 20 | `z-20` |
| 모달 오버레이 | 30 | `z-30` |
| 토스트, 알림 | 40 | `z-40` |
| 최상위 (로딩 스피너) | 50 | `z-50` |

---

## Part 2: Vercel Web Interface Guidelines 연동

코드 생성이 완료된 후, 최종 품질 검증 단계에서 사용한다.

---

### 2.1 가이드라인 소스

```
URL: https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md
```

### 2.2 적용 시점

```
설계 완료 → 코드 생성 → [검증 단계] → 최종 결과물
                              │
                              ├─ WebFetch로 최신 가이드라인 다운로드
                              ├─ 생성된 코드와 가이드라인 대조
                              ├─ 위반 사항 식별
                              └─ 자동 수정 후 결과 보고
```

검증은 코드 생성 직후 자동으로 수행한다. 사용자에게 별도 요청하지 않는다.

### 2.3 활용법

1. `WebFetch` 도구로 위 URL에서 최신 가이드라인을 가져온다
2. 생성된 코드 파일을 가이드라인 규칙과 대조한다
3. 위반 사항이 있으면 자동으로 수정한다
4. 수정 내용을 사용자에게 보고한다

### 2.4 주요 검증 항목 (가이드라인에서 다루는 대표적 영역)

**접근성 (Accessibility)**:
- 시맨틱 HTML 태그 사용 (`<header>`, `<main>`, `<nav>`, `<section>`, `<article>`)
- 이미지 `alt` 속성 — 의미 있는 이미지는 설명, 장식용은 `alt=""`
- 버튼/링크에 aria-label (아이콘만 있는 버튼은 필수)
- 폼 요소와 레이블 연결 (`htmlFor` / `aria-labelledby`)
- 색상만으로 의미 전달 금지 — 텍스트나 아이콘 병행

**성능 (Performance)**:
- `<img>` 대신 `next/image` (`<Image>`) 사용
- 불필요한 `useEffect` 및 리렌더링 방지
- 대용량 컴포넌트 코드 스플리팅 (`dynamic` import)
- 폰트 최적화 (`next/font` 사용)
- 서버 컴포넌트 우선 (`"use client"` 최소화)

**사용성 (Usability)**:
- 포커스 관리 — 모달 열기/닫기 시 포커스 이동
- 에러 처리 — 폼 검증 에러 인라인 표시
- 로딩 상태 — Skeleton 또는 스피너로 피드백
- 빈 상태 — 의미 있는 안내 메시지와 행동 유도

**코드 품질 (Code Quality)**:
- 컴포넌트 단일 책임 원칙
- Props 타입 명시 (TypeScript interface 또는 type)
- 과도한 인라인 스타일 지양 — Tailwind 클래스 활용
- 하드코딩된 문자열/수치 상수화

### 2.5 검증 결과 형식

검증 완료 후 아래 형식으로 보고한다:

```
[검증 결과]
접근성
  ✅ 시맨틱 HTML 구조 사용 확인
  ✅ 이미지 alt 속성 포함
  ❌ 아이콘 버튼에 aria-label 누락 → 추가 완료

성능
  ✅ next/image 사용
  ⚠️ "use client" 과도한 사용 → 서버 컴포넌트로 분리 권장

사용성
  ✅ 포커스 관리 적용 (Dialog)
  ✅ 로딩 상태 Skeleton 처리

코드 품질
  ✅ TypeScript 타입 정의 완료
  ⚠️ 인라인 스타일 2건 발견 → Tailwind 클래스로 전환 권장
```

아이콘 범례:
- `✅` — 통과
- `⚠️` — 권장 개선 (기능 동작에는 문제 없음)
- `❌` — 필수 수정 (자동 수정 완료 또는 수정 필요)

---

## 부록: 설계 품질 체크리스트

설계안을 사용자에게 제시하기 전에 다음을 확인한다:

**시각적 계층**:
- [ ] 시각적 계층이 명확한가? (제목 > 본문 > 부가)
- [ ] Primary CTA가 명확히 하나인가?
- [ ] 중요한 정보가 시각적으로 강조되어 있는가?

**일관성**:
- [ ] 컴포넌트 스타일이 페이지 전체에서 일관적인가?
- [ ] 같은 역할의 아이콘이 동일하게 사용되었는가?
- [ ] shadcn variant가 역할에 맞게 사용되었는가?

**반응형**:
- [ ] Mobile-first로 반응형을 고려했는가?
- [ ] 터치 타겟이 44px 이상인가?
- [ ] 모바일에서 테이블/복잡한 레이아웃을 대체했는가?

**컬러**:
- [ ] 컬러가 의미에 맞게 사용되었는가?
- [ ] 하드코딩된 컬러(`bg-white`, `text-black`)가 없는가?
- [ ] 다크 모드에서도 문제없는가?

**타이포그래피**:
- [ ] 텍스트 크기/줄 간격이 가독성 있는가?
- [ ] 긴 본문에 `max-w-prose`가 적용되었는가?

**인터랙션**:
- [ ] 모든 인터랙티브 요소에 호버/포커스 상태가 있는가?
- [ ] 로딩/에러/빈 상태가 처리되었는가?
- [ ] 키보드 내비게이션이 가능한가?

**코드**:
- [ ] 기존 프로젝트의 디자인 토큰을 재사용했는가?
- [ ] TypeScript 타입이 정의되었는가?
- [ ] 컴포넌트가 적절히 분리되었는가?

---

*최종 수정: 2026-03-07*
