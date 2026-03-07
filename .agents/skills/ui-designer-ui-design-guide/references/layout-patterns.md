# Layout Patterns Guide

> UI 레이아웃 설계 시 참조하는 패턴 가이드.
> Tailwind CSS 클래스 예시를 포함하며, Next.js + shadcn/ui 환경에 최적화되어 있다.

---

## 1. 그리드 시스템

### 12컬럼 그리드

Tailwind CSS의 `grid grid-cols-12`를 기반으로 컬럼을 나누는 방식이다. 전통적인 12컬럼 그리드 시스템을 그대로 CSS Grid로 구현할 수 있다.

#### gap 사용법

| 클래스 | 값 | 용도 |
|--------|------|------|
| `gap-4` | 1rem (16px) | 밀집된 카드 레이아웃 |
| `gap-6` | 1.5rem (24px) | 일반 콘텐츠 그리드 (기본값) |
| `gap-8` | 2rem (32px) | 여유 있는 섹션 내 블록 |
| `gap-x-6 gap-y-8` | 가로/세로 별도 지정 | 방향별 간격 차이가 필요할 때 |

#### 컬럼 span 패턴

| 패턴 | 클래스 조합 | 용도 |
|------|-----------|------|
| 4-4-4 | `col-span-4` x3 | 기능 소개 3열, 통계 카드 3열 |
| 6-6 | `col-span-6` x2 | 좌우 2분할, 스플릿 레이아웃 |
| 4-8 | `col-span-4` + `col-span-8` | 사이드바 + 메인 콘텐츠 |
| 3-9 | `col-span-3` + `col-span-9` | 좁은 필터 + 넓은 결과 영역 |
| 3-3-3-3 | `col-span-3` x4 | 대시보드 통계 카드 4열 |
| 8-4 | `col-span-8` + `col-span-4` | 메인 콘텐츠 + 보조 패널 |

#### 코드 예시

```html
<!-- 4-4-4 패턴: 기능 소개 3열 -->
<div class="grid grid-cols-12 gap-6">
  <div class="col-span-4">기능 1</div>
  <div class="col-span-4">기능 2</div>
  <div class="col-span-4">기능 3</div>
</div>

<!-- 4-8 패턴: 사이드 필터 + 콘텐츠 -->
<div class="grid grid-cols-12 gap-6">
  <div class="col-span-4">필터 패널</div>
  <div class="col-span-8">콘텐츠 영역</div>
</div>

<!-- 3-9 패턴: 좁은 사이드바 + 넓은 메인 -->
<div class="grid grid-cols-12 gap-6">
  <div class="col-span-3">사이드바</div>
  <div class="col-span-9">메인 콘텐츠</div>
</div>
```

---

### Flexbox 패턴

#### `flex` vs `grid` 선택 기준

| 상황 | 추천 | 이유 |
|------|------|------|
| 행 또는 열 중 하나의 방향으로만 배치 | `flex` | 단일 축 정렬에 최적화 |
| 2차원(행+열) 동시 제어 필요 | `grid` | 행과 열을 동시에 지정 가능 |
| 항목 크기가 콘텐츠에 따라 유동적 | `flex` | 자동 크기 조절 (flex-shrink/grow) |
| 항목 크기를 고정 비율로 나눠야 함 | `grid` | `grid-cols-*`로 정확한 비율 지정 |
| 내비게이션 바, 버튼 그룹 | `flex` | 수평 정렬 패턴에 적합 |
| 카드 그리드, 대시보드 레이아웃 | `grid` | 균일한 격자 배치에 적합 |

#### 자주 쓰는 flex 패턴

```html
<!-- 수평 중앙 정렬 -->
<div class="flex items-center justify-center gap-4">
  <span>아이콘</span>
  <span>텍스트</span>
</div>

<!-- 양 끝 배치 (헤더, 툴바) -->
<div class="flex items-center justify-between">
  <div>로고</div>
  <nav>메뉴</nav>
</div>

<!-- 수직 중앙 정렬 (카드 내부) -->
<div class="flex flex-col items-center justify-center min-h-[200px]">
  <h3>제목</h3>
  <p>설명</p>
</div>

<!-- 자식 요소 균등 분배 -->
<div class="flex items-center gap-2">
  <div class="flex-1">왼쪽 콘텐츠</div>
  <div class="flex-shrink-0">고정 너비 요소</div>
</div>
```

#### flex-wrap을 이용한 반응형

```html
<!-- 모바일: 세로 스택 → 데스크탑: 가로 나열 -->
<div class="flex flex-wrap gap-4">
  <div class="w-full sm:w-auto flex-1">항목 1</div>
  <div class="w-full sm:w-auto flex-1">항목 2</div>
  <div class="w-full sm:w-auto flex-1">항목 3</div>
</div>

<!-- 태그/뱃지 목록: 넘치면 자동 줄바꿈 -->
<div class="flex flex-wrap gap-2">
  <span class="px-3 py-1 rounded-full bg-muted text-sm">태그 1</span>
  <span class="px-3 py-1 rounded-full bg-muted text-sm">태그 2</span>
  <span class="px-3 py-1 rounded-full bg-muted text-sm">태그 3</span>
</div>
```

---

## 2. 반응형 브레이크포인트

| 접두사 | 최소 너비 | 대상 디바이스 |
|--------|----------|-------------|
| (기본) | 0px | 모바일 (320px~) |
| `sm` | 640px | 큰 모바일 |
| `md` | 768px | 태블릿 |
| `lg` | 1024px | 소형 데스크탑 |
| `xl` | 1280px | 데스크탑 |
| `2xl` | 1536px | 와이드 데스크탑 |

### Mobile-first 접근법

Tailwind는 기본적으로 모바일 퍼스트 방식이다. 클래스를 접두사 없이 작성하면 모든 화면 크기에 적용되고, `sm:`, `md:` 등을 붙이면 해당 브레이크포인트 이상에서만 적용된다.

```html
<!-- 모바일: 전체 너비 → 태블릿: 절반 → 데스크탑: 1/3 -->
<div class="w-full md:w-1/2 lg:w-1/3">카드</div>
```

### 반응형 컬럼 전환 예시

```html
<!-- 1컬럼 → 2컬럼 → 3컬럼 → 4컬럼 전환 -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  <div>카드 1</div>
  <div>카드 2</div>
  <div>카드 3</div>
  <div>카드 4</div>
</div>

<!-- 1컬럼 → 2컬럼 → 3컬럼 (블로그, 상품 목록) -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <div>게시물 1</div>
  <div>게시물 2</div>
  <div>게시물 3</div>
</div>
```

### 사이드바 반응형 전환

```html
<!-- 모바일: 사이드바 숨김 → 데스크탑: 표시 -->
<div class="flex">
  <aside class="hidden lg:block w-64 shrink-0">
    사이드바 (데스크탑에서만 표시)
  </aside>
  <main class="flex-1 min-w-0">
    메인 콘텐츠
  </main>
</div>
```

### 타이포그래피 반응형

```html
<!-- 모바일: 작게 → 데스크탑: 크게 -->
<h1 class="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold">
  히어로 제목
</h1>

<p class="text-base md:text-lg leading-relaxed">
  본문 텍스트
</p>
```

### 패딩/마진 반응형

```html
<!-- 컨테이너 좌우 패딩: 모바일에서 좁게, 데스크탑에서 넓게 -->
<div class="px-4 sm:px-6 lg:px-8">
  콘텐츠
</div>

<!-- 섹션 상하 패딩: 모바일에서 좁게, 데스크탑에서 넓게 -->
<section class="py-12 md:py-16 lg:py-20">
  섹션 콘텐츠
</section>
```

---

## 3. 섹션 배치 규칙

### 수직 리듬 (Vertical Rhythm)

페이지 스크롤 시 자연스러운 흐름을 만들기 위해 섹션 간 간격을 일관되게 유지해야 한다.

| 용도 | 클래스 | 실제 크기 |
|------|--------|---------|
| 최소 섹션 간격 | `py-12` | 48px |
| 기본 섹션 간격 | `py-16` | 64px |
| 여유 있는 섹션 | `py-20` | 80px |
| 강조 섹션 (히어로, CTA) | `py-24` | 96px |
| 풀스크린에 가까운 섹션 | `py-32` | 128px |

#### 섹션 내부 요소 간격

```html
<!-- 섹션 헤더 (제목 + 부제) 간격 -->
<div class="space-y-4">
  <h2 class="text-3xl font-bold">섹션 제목</h2>
  <p class="text-muted-foreground">섹션 설명</p>
</div>

<!-- 카드/항목 목록 간격 -->
<div class="space-y-6">
  <div>항목 1</div>
  <div>항목 2</div>
  <div>항목 3</div>
</div>

<!-- 섹션 헤더와 콘텐츠 사이 간격 -->
<section class="py-16">
  <div class="space-y-4 text-center mb-12">
    <h2>섹션 제목</h2>
    <p>섹션 설명</p>
  </div>
  <div class="grid grid-cols-3 gap-6">
    <!-- 카드들 -->
  </div>
</section>
```

#### 일관성 규칙

- 같은 계층의 섹션은 반드시 같은 `py-*` 값을 사용한다
- 강조 섹션(Hero, CTA)만 예외적으로 더 큰 값을 사용한다
- 섹션 내부의 sub-섹션은 부모보다 작은 간격을 사용한다 (예: 섹션이 `py-16`이면 내부 블록은 `mb-8`)

---

### 콘텐츠 컨테이너

| 용도 | 클래스 | 최대 너비 |
|------|--------|---------|
| 표준 컨테이너 (기본) | `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` | 1280px |
| 넓은 컨테이너 | `max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8` | 1536px |
| 좁은 콘텐츠 (블로그, 약관) | `max-w-3xl mx-auto px-4` | 768px |
| 폼/카드 (로그인, 가입) | `max-w-md mx-auto px-4` | 448px |
| 대화형 콘텐츠 | `max-w-5xl mx-auto px-4 sm:px-6` | 1024px |
| 풀와이드 | 컨테이너 없음 | 100% |

```html
<!-- 표준 컨테이너 -->
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  콘텐츠
</div>

<!-- 블로그 아티클 (읽기 최적화) -->
<article class="max-w-3xl mx-auto px-4 prose prose-neutral">
  본문 내용
</article>

<!-- 로그인 폼 -->
<div class="max-w-md mx-auto px-4">
  <form>로그인 폼</form>
</div>
```

---

### 시각적 계층

#### z-index 체계

| z-index | 클래스 | 용도 |
|---------|--------|------|
| 0 | `z-0` | 기본 레이어 |
| 10 | `z-10` | 고정 헤더, sticky 요소 |
| 20 | `z-20` | 드롭다운, 팝오버 |
| 30 | `z-30` | 모달 오버레이 |
| 40 | `z-40` | 토스트, 알림 |
| 50 | `z-50` | 최상위 (로딩 스피너, 오버레이) |

```html
<!-- 고정 헤더 -->
<header class="fixed top-0 left-0 right-0 z-10 bg-background border-b">
  네비게이션
</header>

<!-- 드롭다운 메뉴 -->
<div class="relative">
  <button>메뉴 열기</button>
  <div class="absolute top-full left-0 z-20 bg-popover shadow-lg rounded-md">
    드롭다운 내용
  </div>
</div>
```

---

## 4. 일반 레이아웃 패턴

### 4.1 사이드바 + 메인 콘텐츠

관리자 대시보드, 이메일 클라이언트, 설정 페이지 등에 적합한 레이아웃이다.

```
┌──────────────────────────────────────┐
│ Header (h-16, fixed top)             │
├────────────┬─────────────────────────┤
│ Sidebar    │ Main Content            │
│ (w-64)     │ (flex-1)                │
│            │                         │
│ ├─ 메뉴 1  │  ┌─────────────────┐   │
│ ├─ 메뉴 2  │  │  Page Content   │   │
│ ├─ 메뉴 3  │  └─────────────────┘   │
│            │                         │
└────────────┴─────────────────────────┘
```

#### 기본 구현

```html
<div class="flex h-screen overflow-hidden">
  <!-- 사이드바 -->
  <aside class="hidden lg:flex lg:flex-col w-64 border-r bg-sidebar shrink-0">
    <div class="flex h-16 items-center border-b px-6">
      <span class="font-semibold">로고</span>
    </div>
    <nav class="flex-1 overflow-y-auto p-4">
      <!-- 메뉴 항목 -->
    </nav>
  </aside>

  <!-- 메인 영역 -->
  <div class="flex flex-1 flex-col overflow-hidden">
    <header class="flex h-16 items-center justify-between border-b px-6 shrink-0">
      <!-- 헤더 내용 -->
    </header>
    <main class="flex-1 overflow-y-auto p-6">
      <!-- 페이지 콘텐츠 -->
    </main>
  </div>
</div>
```

#### 접을 수 있는 사이드바 (shadcn/ui Sidebar 사용)

```tsx
// Next.js + shadcn/ui SidebarProvider 기반
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 overflow-y-auto">
        <SidebarTrigger className="m-2" />
        {children}
      </main>
    </SidebarProvider>
  )
}
```

#### 모바일: Sheet로 전환

```tsx
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"

// 모바일에서 햄버거 버튼 클릭 시 사이드바를 Sheet로 표시
<Sheet>
  <SheetTrigger asChild>
    <Button variant="ghost" size="icon" className="lg:hidden">
      <Menu className="h-5 w-5" />
    </Button>
  </SheetTrigger>
  <SheetContent side="left" className="w-64 p-0">
    <SidebarContent />
  </SheetContent>
</Sheet>
```

---

### 4.2 풀와이드 히어로 + 컨테이너 콘텐츠

랜딩 페이지에서 시각적 임팩트와 구조화된 콘텐츠를 조합하는 패턴이다.

```
┌──────────────────────────────────────┐
│ Navigation (full-width, sticky)      │
├──────────────────────────────────────┤
│                                      │
│  Hero Section (full-width)           │
│  (min-h-[70vh] or 100vh)             │
│                                      │
│  "핵심 가치 제안 한 줄"               │
│  [CTA 버튼]                          │
│                                      │
├──────────────────────────────────────┤
│  ┌────────────────────────────────┐  │
│  │ Content Section (max-w-7xl)    │  │
│  │                                │  │
│  │  기능 소개 / 설명 등            │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

#### 구현 예시

```html
<!-- 네비게이션 (풀와이드, sticky) -->
<nav class="sticky top-0 z-10 w-full border-b bg-background/80 backdrop-blur-sm">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
    <span class="font-bold text-lg">브랜드</span>
    <div class="flex items-center gap-4">
      <!-- 메뉴 -->
    </div>
  </div>
</nav>

<!-- 히어로 섹션 (풀와이드) -->
<section class="relative min-h-[70vh] flex items-center justify-center bg-gradient-to-b from-background to-muted/30">
  <div class="max-w-4xl mx-auto px-4 text-center space-y-6">
    <h1 class="text-5xl lg:text-7xl font-bold tracking-tight">
      핵심 가치 제안
    </h1>
    <p class="text-xl text-muted-foreground max-w-2xl mx-auto">
      부제목 설명
    </p>
    <div class="flex items-center justify-center gap-4">
      <button class="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-medium">
        시작하기
      </button>
      <button class="px-8 py-3 rounded-lg border font-medium">
        더 알아보기
      </button>
    </div>
  </div>
</section>

<!-- 컨테이너 콘텐츠 섹션 -->
<section class="py-20">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- 기능 소개 등 구조화된 콘텐츠 -->
  </div>
</section>
```

---

### 4.3 카드 그리드

동일한 유형의 항목을 균일한 격자로 나열하는 패턴이다. 블로그 목록, 상품 목록, 팀원 소개, 기능 소개 등에 사용된다.

```
┌──────┬──────┬──────┐
│ Card │ Card │ Card │
│      │      │      │
├──────┼──────┼──────┤
│ Card │ Card │ Card │
│      │      │      │
└──────┴──────┴──────┘
```

#### 2/3/4 컬럼 변형

```html
<!-- 2컬럼 카드 그리드 (스플릿 콘텐츠) -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div class="rounded-lg border p-6">카드</div>
  <div class="rounded-lg border p-6">카드</div>
</div>

<!-- 3컬럼 카드 그리드 (기능 소개, 팀 소개) -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <div class="rounded-lg border p-6">카드</div>
  <div class="rounded-lg border p-6">카드</div>
  <div class="rounded-lg border p-6">카드</div>
</div>

<!-- 4컬럼 카드 그리드 (통계, 상품 목록) -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
  <div class="rounded-lg border p-6">카드</div>
  <div class="rounded-lg border p-6">카드</div>
  <div class="rounded-lg border p-6">카드</div>
  <div class="rounded-lg border p-6">카드</div>
</div>
```

#### 카드 크기 일관성 유지

```html
<!-- 고정 높이 카드 (이미지 포함) -->
<div class="grid grid-cols-3 gap-6">
  <div class="rounded-lg border overflow-hidden flex flex-col">
    <div class="aspect-video bg-muted shrink-0">
      <!-- 이미지 영역: aspect-ratio로 일관성 유지 -->
    </div>
    <div class="flex flex-col flex-1 p-4">
      <h3 class="font-semibold">제목</h3>
      <p class="text-sm text-muted-foreground flex-1">설명</p>
      <div class="mt-4">
        <!-- 하단 고정 버튼 -->
      </div>
    </div>
  </div>
</div>

<!-- 균일 높이 카드 (h-full 패턴) -->
<div class="grid grid-cols-3 gap-6 items-stretch">
  <div class="h-full rounded-lg border p-6 flex flex-col">
    <div class="flex-1">콘텐츠</div>
    <div class="mt-4 shrink-0">하단 고정</div>
  </div>
</div>
```

---

### 4.4 스플릿 레이아웃

텍스트와 비주얼(이미지, 데모, 일러스트)을 좌우로 나란히 배치하는 패턴이다. 기능 설명, 로그인 페이지, 제품 소개에 자주 사용된다.

```
┌──────────────────┬───────────────────┐
│                  │                   │
│  Text Content    │  Visual / Image   │
│  (50% or 60%)    │  (50% or 40%)     │
│                  │                   │
│  헤드라인         │  [스크린샷/이미지]  │
│  설명 텍스트      │                   │
│  [버튼]          │                   │
│                  │                   │
└──────────────────┴───────────────────┘
```

#### 50/50 변형

```html
<!-- 50/50 스플릿 (모바일: 스택) -->
<div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
  <div class="space-y-6">
    <h2 class="text-3xl font-bold">기능 제목</h2>
    <p class="text-muted-foreground">기능 설명</p>
    <button class="px-6 py-3 bg-primary text-primary-foreground rounded-lg">
      자세히 보기
    </button>
  </div>
  <div class="rounded-xl overflow-hidden shadow-2xl">
    <img src="..." alt="기능 스크린샷" class="w-full h-auto" />
  </div>
</div>
```

#### 60/40 변형 (텍스트 강조)

```html
<!-- 60/40: 텍스트 더 넓게 -->
<div class="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
  <div class="lg:col-span-3 space-y-6">
    <!-- 텍스트 콘텐츠 (60%) -->
    <h2 class="text-3xl font-bold">기능 제목</h2>
    <p class="text-muted-foreground leading-relaxed">상세 설명</p>
  </div>
  <div class="lg:col-span-2">
    <!-- 비주얼 (40%) -->
    <img src="..." alt="..." class="w-full rounded-xl shadow-lg" />
  </div>
</div>
```

#### 교대 배치 (alternating) 패턴

```html
<!-- 기능 소개: 좌우 교대 배치 -->
<div class="space-y-20">
  <!-- 홀수: 텍스트 왼쪽, 이미지 오른쪽 -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
    <div class="space-y-4">...</div>
    <div>...</div>
  </div>

  <!-- 짝수: 이미지 왼쪽, 텍스트 오른쪽 -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
    <div class="order-2 lg:order-1">...</div>
    <div class="order-1 lg:order-2 space-y-4">...</div>
  </div>
</div>
```

---

### 4.5 스택 레이아웃

섹션들을 수직으로 나열하는 랜딩 페이지의 기본 구조이다. 각 섹션은 독립적인 배경과 간격으로 시각적 구분을 만든다.

```
┌──────────────────────────────────────┐
│ Hero Section                         │
│ (배경: 기본 또는 그라데이션)           │
├──────────────────────────────────────┤
│ Features Section                     │
│ (배경: 기본)                          │
├──────────────────────────────────────┤
│ Testimonials Section                 │
│ (배경: muted)                        │
├──────────────────────────────────────┤
│ Pricing Section                      │
│ (배경: 기본)                          │
├──────────────────────────────────────┤
│ CTA Section                          │
│ (배경: primary 또는 강조 색상)        │
└──────────────────────────────────────┘
```

#### 섹션 구분 방법

```html
<!-- 방법 1: 배경색 교대 -->
<section class="py-20 bg-background">섹션 1 (흰 배경)</section>
<section class="py-20 bg-muted/50">섹션 2 (연한 배경)</section>
<section class="py-20 bg-background">섹션 3 (흰 배경)</section>

<!-- 방법 2: 구분선 -->
<section class="py-20 border-t">섹션 (상단 구분선)</section>

<!-- 방법 3: 여백으로만 구분 -->
<div class="space-y-24">
  <section>섹션 1</section>
  <section>섹션 2</section>
  <section>섹션 3</section>
</div>

<!-- 방법 4: 다크 CTA 섹션 강조 -->
<section class="py-20 bg-primary text-primary-foreground">
  <div class="max-w-7xl mx-auto px-4 text-center space-y-6">
    <h2 class="text-3xl font-bold">지금 시작하세요</h2>
    <button class="px-8 py-3 bg-background text-foreground rounded-lg font-medium">
      무료로 시작
    </button>
  </div>
</section>
```

---

### 4.6 대시보드 그리드

관리자 대시보드에서 통계 카드, 차트, 테이블을 조합하는 레이아웃이다.

```
┌──────────┬──────────┬──────────┬──────────┐
│ Stat     │ Stat     │ Stat     │ Stat     │
│ Card     │ Card     │ Card     │ Card     │
├──────────┴──────────┼──────────┴──────────┤
│                     │                     │
│  Chart (큰)         │  Chart (보조)        │
│                     │                     │
├─────────────────────┴─────────────────────┤
│                                           │
│  Data Table (전체 너비)                    │
│                                           │
└───────────────────────────────────────────┘
```

#### 구현 코드

```html
<div class="space-y-6 p-6">
  <!-- 통계 카드 행 -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <div class="rounded-lg border bg-card p-6">
      <p class="text-sm text-muted-foreground">총 매출</p>
      <p class="text-2xl font-bold mt-2">₩4,521,000</p>
      <p class="text-xs text-green-500 mt-1">+20.1% 전월 대비</p>
    </div>
    <div class="rounded-lg border bg-card p-6">
      <p class="text-sm text-muted-foreground">신규 가입</p>
      <p class="text-2xl font-bold mt-2">+2,350</p>
      <p class="text-xs text-green-500 mt-1">+180.1% 전월 대비</p>
    </div>
    <div class="rounded-lg border bg-card p-6">
      <p class="text-sm text-muted-foreground">활성 사용자</p>
      <p class="text-2xl font-bold mt-2">+12,234</p>
      <p class="text-xs text-green-500 mt-1">+19% 전월 대비</p>
    </div>
    <div class="rounded-lg border bg-card p-6">
      <p class="text-sm text-muted-foreground">처리 건수</p>
      <p class="text-2xl font-bold mt-2">+573</p>
      <p class="text-xs text-orange-500 mt-1">+201 전월 대비</p>
    </div>
  </div>

  <!-- 차트 그리드 -->
  <div class="grid grid-cols-1 lg:grid-cols-7 gap-4">
    <div class="lg:col-span-4 rounded-lg border bg-card p-6">
      <h3 class="font-semibold mb-4">월별 매출 추이</h3>
      <!-- 큰 차트 (4/7 비율) -->
    </div>
    <div class="lg:col-span-3 rounded-lg border bg-card p-6">
      <h3 class="font-semibold mb-4">최근 판매</h3>
      <!-- 보조 차트 또는 목록 (3/7 비율) -->
    </div>
  </div>

  <!-- 데이터 테이블 (전체 너비) -->
  <div class="rounded-lg border bg-card">
    <div class="p-6 border-b">
      <h3 class="font-semibold">거래 내역</h3>
    </div>
    <div class="p-6">
      <!-- TanStack Table -->
    </div>
  </div>
</div>
```

#### 대시보드 변형 패턴

```html
<!-- 사이드 요약 패널이 있는 대시보드 -->
<div class="grid grid-cols-1 xl:grid-cols-4 gap-6 p-6">
  <!-- 메인 콘텐츠 (3/4) -->
  <div class="xl:col-span-3 space-y-6">
    <div class="grid grid-cols-3 gap-4">
      <!-- 통계 카드 -->
    </div>
    <div class="rounded-lg border p-6">
      <!-- 메인 차트 -->
    </div>
  </div>

  <!-- 사이드 패널 (1/4) -->
  <div class="space-y-4">
    <div class="rounded-lg border p-4">
      <!-- 요약 정보 -->
    </div>
    <div class="rounded-lg border p-4">
      <!-- 최근 활동 -->
    </div>
  </div>
</div>
```

---

## 5. 간격/사이징 체계

### Tailwind Spacing Scale

| 클래스 | 값 | 실제 크기 | 용도 |
|--------|------|----------|------|
| `1` | 0.25rem | 4px | 아이콘과 텍스트 사이 최소 간격 |
| `2` | 0.5rem | 8px | 관련 요소 간 밀착 간격 |
| `3` | 0.75rem | 12px | 폼 필드 내 라벨-입력 간격 |
| `4` | 1rem | 16px | 기본 요소 간격 (패딩, 마진) |
| `5` | 1.25rem | 20px | 버튼 좌우 패딩 |
| `6` | 1.5rem | 24px | 카드 내부 패딩, 그룹 간 간격 |
| `8` | 2rem | 32px | 섹션 내 블록 간 간격 |
| `10` | 2.5rem | 40px | 하위 섹션 간 간격 |
| `12` | 3rem | 48px | 작은 섹션 간 간격 |
| `16` | 4rem | 64px | 섹션 간 기본 간격 |
| `20` | 5rem | 80px | 섹션 간 여유 간격 |
| `24` | 6rem | 96px | 강조 섹션 간 간격 |
| `32` | 8rem | 128px | 풀스크린 섹션 상하 여백 |

### 4의 배수 원칙

모든 간격은 4px의 배수로 통일한다. Tailwind의 기본 단위(1 = 4px)가 이 원칙을 자연스럽게 지원한다.

```
4px  (1)  → 아이콘-텍스트 밀착
8px  (2)  → 관련 요소 간 최소 간격
12px (3)  → 폼 요소 내부 간격
16px (4)  → 컴포넌트 기본 패딩
24px (6)  → 카드 내부 패딩
32px (8)  → 섹션 내 블록 간 간격
48px (12) → 소섹션 간 여백
64px (16) → 섹션 간 기본 여백
80px (20) → 섹션 간 여유 여백
96px (24) → 강조 섹션 여백
```

### 계층별 간격 규칙

```html
<!-- 올바른 계층별 간격 예시 -->
<section class="py-20">                    <!-- 섹션 간: py-20 (80px) -->
  <div class="max-w-7xl mx-auto px-4">
    <div class="mb-12">                    <!-- 헤더-콘텐츠: mb-12 (48px) -->
      <h2 class="mb-4">섹션 제목</h2>     <!-- 제목-부제: mb-4 (16px) -->
      <p>섹션 설명</p>
    </div>
    <div class="grid grid-cols-3 gap-6">  <!-- 카드 간: gap-6 (24px) -->
      <div class="p-6 space-y-3">         <!-- 카드 내부: p-6, space-y-3 -->
        <h3>카드 제목</h3>
        <p>카드 설명</p>
      </div>
    </div>
  </div>
</section>
```

### 일관성 체크리스트

- 같은 계층의 요소는 반드시 같은 간격 값을 사용한다
- 부모-자식 간격은 최소 2단계 차이를 둔다 (예: 섹션 `py-20` → 내부 블록 `mb-12`)
- 카드 내부 패딩은 `p-4` (모바일) 또는 `p-6` (데스크탑) 중 하나로 통일한다
- 그리드 gap은 카드 내부 패딩과 같거나 크게 설정한다

---

## 6. 특수 레이아웃 패턴

### 6.1 스티키 헤더 + 스크롤 콘텐츠

```html
<!-- 전체 레이아웃: 헤더 고정, 나머지 스크롤 -->
<div class="flex flex-col h-screen">
  <header class="shrink-0 h-16 border-b flex items-center px-6 bg-background z-10">
    헤더 (고정)
  </header>
  <main class="flex-1 overflow-y-auto">
    <div class="p-6">
      스크롤 가능한 콘텐츠
    </div>
  </main>
</div>
```

### 6.2 고정 푸터 + 스크롤 콘텐츠

```html
<!-- 페이지 하단에 항상 보이는 액션 바 (모바일 앱 스타일) -->
<div class="flex flex-col min-h-screen">
  <main class="flex-1 pb-20">
    메인 콘텐츠 (하단 여백 확보)
  </main>
  <footer class="fixed bottom-0 left-0 right-0 h-16 border-t bg-background flex items-center justify-around px-4">
    고정 하단 탭 바
  </footer>
</div>
```

### 6.3 멀티 패널 레이아웃 (이메일 클라이언트 스타일)

```
┌──────────┬─────────────┬──────────────────┐
│          │             │                  │
│ Sidebar  │ List Panel  │  Detail Panel    │
│ (w-64)   │ (w-80)      │  (flex-1)        │
│          │             │                  │
│ 폴더     │ 메일 목록    │  메일 본문        │
│ 목록     │             │                  │
│          │             │                  │
└──────────┴─────────────┴──────────────────┘
```

```html
<div class="flex h-screen overflow-hidden">
  <!-- 1단: 네비게이션 -->
  <aside class="hidden lg:block w-64 border-r shrink-0 overflow-y-auto">
    사이드바
  </aside>

  <!-- 2단: 목록 패널 -->
  <div class="w-80 border-r shrink-0 overflow-y-auto hidden md:block">
    목록 패널
  </div>

  <!-- 3단: 상세 패널 -->
  <main class="flex-1 overflow-y-auto">
    상세 패널
  </main>
</div>
```

### 6.4 센터드 싱글 컬럼 (설정, 프로필 페이지)

```
         ┌──────────────────┐
         │                  │
         │  Page Header     │
         │                  │
         ├──────────────────┤
         │  Section 1       │
         ├──────────────────┤
         │  Section 2       │
         ├──────────────────┤
         │  Section 3       │
         │                  │
         └──────────────────┘
```

```html
<!-- 설정 페이지: 좁은 단일 컬럼 중앙 정렬 -->
<div class="max-w-2xl mx-auto px-4 py-8 space-y-8">
  <div>
    <h1 class="text-2xl font-bold">설정</h1>
    <p class="text-muted-foreground mt-1">계정 및 환경 설정을 관리합니다</p>
  </div>

  <div class="space-y-6">
    <section class="rounded-lg border p-6 space-y-4">
      <h2 class="font-semibold">프로필 정보</h2>
      <!-- 폼 필드 -->
    </section>

    <section class="rounded-lg border p-6 space-y-4">
      <h2 class="font-semibold">알림 설정</h2>
      <!-- 토글 목록 -->
    </section>

    <section class="rounded-lg border border-destructive p-6 space-y-4">
      <h2 class="font-semibold text-destructive">위험 구역</h2>
      <!-- 계정 삭제 등 위험 액션 -->
    </section>
  </div>
</div>
```

### 6.5 탭 기반 서브 레이아웃

```html
<!-- 마이페이지, 상품 상세 등 탭 기반 서브 섹션 -->
<div class="max-w-4xl mx-auto px-4 py-8">
  <div class="mb-6">
    <h1 class="text-2xl font-bold">마이페이지</h1>
  </div>

  <!-- shadcn/ui Tabs -->
  <div class="border-b mb-6">
    <nav class="flex gap-4 -mb-px">
      <button class="pb-3 border-b-2 border-primary font-medium text-sm">
        주문 내역
      </button>
      <button class="pb-3 border-b-2 border-transparent text-muted-foreground text-sm hover:text-foreground">
        리뷰
      </button>
      <button class="pb-3 border-b-2 border-transparent text-muted-foreground text-sm hover:text-foreground">
        관심 상품
      </button>
    </nav>
  </div>

  <div>
    <!-- 탭 콘텐츠 -->
  </div>
</div>
```

---

## 7. 레이아웃 설계 체크리스트

구현 전 아래 항목을 확인한다.

### 구조 결정

- [ ] 페이지의 주 네비게이션 방식은 무엇인가? (사이드바 / 상단 바 / 탭)
- [ ] 콘텐츠의 주된 방향은 무엇인가? (목록 / 상세 / 폼 / 대시보드)
- [ ] 모바일에서 어떻게 변형되는가? (스택 / 숨김 / Sheet 전환)

### 간격 일관성

- [ ] 같은 계층의 섹션은 같은 `py-*`를 사용하고 있는가?
- [ ] 카드 내부 패딩이 `p-4` 또는 `p-6`으로 통일되어 있는가?
- [ ] 그리드 gap이 카드 패딩과 조화를 이루는가?

### 반응형

- [ ] 모바일(기본), 태블릿(`md:`), 데스크탑(`lg:`) 세 단계를 모두 확인했는가?
- [ ] 넘치는(overflow) 요소가 없는가? (`min-w-0` 필요 여부 확인)
- [ ] 이미지는 `aspect-ratio` 또는 고정 높이로 일관성을 유지하는가?

### 접근성

- [ ] 랜드마크 요소(`header`, `main`, `nav`, `aside`, `footer`)를 적절히 사용했는가?
- [ ] 포커스 순서가 시각적 순서와 일치하는가? (`order-*` 사용 시 주의)
- [ ] 충분한 색상 대비를 유지하고 있는가? (텍스트 vs 배경 4.5:1 이상)
