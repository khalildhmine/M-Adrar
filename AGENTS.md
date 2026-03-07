# Next.js Admin Dashboard — Development Rules

You must answer in Korean.

## Project Overview

Next.js 16 + React 19 + Supabase 기반 관리자 대시보드 템플릿.
Supabase Auth + RLS가 기본 인증이며, Drizzle ORM은 복잡 쿼리 전용.

### Tech Stack

- **Core:** Next.js 16 App Router, React 19, TypeScript 5
- **UI:** TailwindCSS 4, shadcn/ui, lucide-react, Framer Motion
- **Forms:** react-hook-form + zod
- **State:** TanStack Query (서버 상태), zustand (UI 상태)
- **Backend:** Route Handlers (`/api/v1/**`), Supabase Auth + Postgres + RLS, Drizzle ORM
- **Tooling:** Biome, Husky

## Build & Test Commands

```bash
npm run check    # Biome lint + format check
npm run test     # Unit/integration tests
npm run build    # Next.js production build
```

PR 게이트: `npm run check && npm run test && npm run build` 모두 통과 필수.

## Project Structure (ARCH)

```
src/
├── app/           # Routing, layouts, thin adapters (HTTP 진입점)
├── features/      # Domain logic (비즈니스 로직)
├── lib/           # Infrastructure (Supabase, utils, 외부 통합)
└── components/    # Shared UI components
```

### Dependency Direction

```
app → features → lib (단방향만 허용)
```

- `features/`는 절대 `app/`에서 import 금지
- `lib/`는 절대 `app/`에서 import 금지
- 도메인 코드가 특정 페이지/라우트를 참조 금지

### Monorepo-Ready Placement

- `src/components/ui/*` → future `packages/ui`
- `src/lib/supabase/*` → future `packages/infra-supabase`
- `src/features/*` → future `packages/domain-*`

## Frontend Rules

### Performance (PERF)

```typescript
// PERF-001: 독립 I/O는 반드시 병렬화
// Bad
const users = await getUsers();
const posts = await getPosts();

// Good
const [users, posts] = await Promise.all([getUsers(), getPosts()]);
```

- **PERF-002:** Server Component가 기본. Client Component는 최소화 (`'use client'`는 필요한 곳만)
- **PERF-004:** barrel import 금지. 무거운 컴포넌트는 `next/dynamic`으로 lazy-load

```typescript
// Bad
import { Button, Dialog, Chart } from '@/components/ui';

// Good
import { Button } from '@/components/ui/button';
const Chart = dynamic(() => import('@/components/ui/chart'));
```

### Component Design (COMP)

```typescript
// COMP-001: boolean prop 남발 금지 — variants 사용
// Bad
<Button primary large rounded />

// Good
<Button variant="primary" size="lg" shape="rounded" />
```

- **COMP-003:** UI 컴포넌트는 상태 구현을 모르게 설계 (props로 데이터 받기만)

### UI/Accessibility (UI)

- **UI-001:** 아이콘 버튼에 `aria-label`, input에 label, `focus-visible` 유지
- **UI-002:** Form 필드에 `name`/`autocomplete`/`type` 필수, 에러는 필드 옆에 표시
- **UI-003:** `prefers-reduced-motion` 존중, `transition: all` 금지, `transform`/`opacity` 사용

```typescript
// Bad
<button onClick={onClick}><Icon /></button>

// Good
<button onClick={onClick} aria-label="메뉴 열기"><Icon /></button>
```

## Backend Rules

### API Routes (API)

```typescript
// API-001: 모든 API는 /api/v1/** 하위에 위치
// 경로: src/app/api/v1/<domain>/<resource>/route.ts

// API-002: 입력 검증은 zod.safeParse
export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = schema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: result.error.flatten() },
      { status: 400 }
    );
  }
  // ...
}
```

- **API-003:** 목록 API는 cursor pagination (`id > cursor`, `limit + 1`)
- **API-004:** Route Handler는 thin adapter — 비즈니스 로직은 `features/`로 위임

### Supabase (SB)

```typescript
// SB-001: 서버는 createSupabaseServerClient, 브라우저는 createSupabaseBrowserClient
// 절대 혼용 금지
```

- **SB-002:** 멀티테넌트 테이블은 반드시 `ENABLE ROW LEVEL SECURITY` + `FORCE ROW LEVEL SECURITY`

```sql
-- SB-003: auth.uid()는 반드시 (select auth.uid()) 패턴 사용
-- Bad (성능 문제)
CREATE POLICY "select_own" ON items
  FOR SELECT USING (user_id = auth.uid());

-- Good
CREATE POLICY "select_own" ON items
  FOR SELECT USING (user_id = (select auth.uid()));
```

- **SB-004:** Seed 스크립트는 idempotent + fail-fast

### Data Access (DATA)

- **DATA-001:** 데이터 접근 최종 권한은 Supabase RLS
- **DATA-002:** User CRUD는 Supabase server client + RLS 경유
- **DATA-003:** 단순 CRUD는 Supabase Client, 복잡 쿼리(3+ JOIN, 집계, window function)는 Drizzle ORM
- **DATA-005:** Schema source of truth는 `supabase/migrations/*.sql`
- **DATA-006:** WHERE/JOIN/FK 컬럼에 인덱스, cursor pagination, `ON CONFLICT` upsert

### Migration Rules

- 스키마 변경은 마이그레이션 파일로만 수행
- FK는 `auth.users(id)` 참조
- RLS 정책에 `(select auth.uid())` 패턴 필수
- 인덱스 컬럼: FK, WHERE, JOIN 컬럼

## Environment Variables (DEPLOY)

- **Public:** `NEXT_PUBLIC_*`만 클라이언트에 노출
- **Server-only:** `SUPABASE_SERVICE_ROLE_KEY` 등 — 절대 클라이언트에 노출 금지

## Boundaries

### MUST (반드시 지킬 것)

- API 라우트는 `/api/v1/**` 하위에만 생성
- 독립 I/O는 `Promise.all`로 병렬화
- RLS 정책에 `(select auth.uid())` 패턴 사용
- 멀티테넌트 테이블에 RLS + FORCE RLS 적용
- zod로 입력 검증
- 아이콘 버튼에 aria-label 추가
- `features/`와 `lib/`는 `app/`에서 import 금지

### MUST NOT (절대 하지 말 것)

- barrel import 사용 금지
- `transition: all` 사용 금지
- boolean prop 남발 금지 (variants 사용)
- 서버 키를 클라이언트에 노출 금지
- `auth.uid()` 단독 사용 금지 (반드시 `(select auth.uid())`)
- Route Handler에 비즈니스 로직 직접 작성 금지 (features/로 위임)
- 스키마를 마이그레이션 없이 직접 변경 금지

## Available Skills (플러그인 동작 정의)

### dashboard-template 스킬

#### 프론트엔드 개발 시 (frontend-dev)
React 컴포넌트, Next.js 페이지, shadcn/ui 작업 시 다음 규칙을 자동 적용한다:
- PERF-001: 독립 I/O는 `Promise.all` 병렬화 (MUST)
- PERF-002: Server Component 기본, Client Component 최소화 (MUST)
- PERF-004: barrel import 금지, 무거운 컴포넌트 `next/dynamic` lazy-load (MUST)
- COMP-001: boolean prop 남발 금지 — variants 사용 (MUST)
- COMP-003: UI 컴포넌트는 상태 구현을 모르게 설계 (MUST)
- UI-001: 아이콘 버튼 `aria-label`, input에 label, `focus-visible` 유지 (MUST)
- UI-002: Form 필드에 `name`/`autocomplete`/`type`, 에러는 필드 옆 표시 (MUST)
- UI-003: `prefers-reduced-motion` 존중, `transition: all` 금지 (MUST)

#### 백엔드 개발 시 (backend-dev)
API 라우트, Supabase, 마이그레이션 작업 시 다음 규칙을 자동 적용한다:
- API-001: 모든 API는 `src/app/api/v1/**/route.ts` (MUST)
- API-002: 입력 검증은 `zod.safeParse`, 상태코드 400/401/403/500 (MUST)
- API-003: 목록 API는 cursor pagination (`id > cursor`, `limit + 1`) (MUST)
- API-004: Route Handler는 thin adapter — 비즈니스 로직은 `features/`로 위임 (MUST)
- SB-001: 서버는 `createSupabaseServerClient`, 브라우저는 `createSupabaseBrowserClient` (MUST)
- SB-002: 멀티테넌트 테이블 RLS + FORCE RLS (MUST)
- SB-003: `auth.uid()` → 반드시 `(select auth.uid())` 패턴 (MUST)
- DATA-003: 단순 CRUD는 Supabase Client, 복잡 쿼리(3+ JOIN, window function)는 Drizzle ORM (MUST)
- DATA-005: Schema source of truth는 `supabase/migrations/*.sql` (MUST)

#### PR 리뷰 시 (fullstack-review)
위 PERF/COMP/UI/API/SB/DATA 규칙을 모두 종합 검증한다.

### ui-designer 스킬

UI 페이지 설계 및 구현 요청 시 다음 4단계 워크플로를 따른다:
1. **Step 0 - 프로젝트 분석**: `.ui-designer/analysis.json` 확인 (없으면 `/ui-designer-ui-analyze` 먼저 실행)
2. **Step 1 - 요구사항 수집**: 페이지 목적, 사용자, 핵심 액션 확인
3. **Step 2 - 디자인 제안**: 레이아웃 + 컴포넌트 목록 제안, 승인 후 진행
4. **Step 3 - 코드 생성**: shadcn/ui 컴포넌트 기반 구현, lucide-react 아이콘 사용

## Available Commands (Codex 슬래시 커맨드)

Codex 설치(`bash .claude/plugins/local/dashboard-template/install-codex.sh`) 후 사용 가능:

| 커맨드 | 용도 |
|--------|------|
| `/dashboard-template-new-feature` | 새 피처 디렉토리 스캐폴딩 |
| `/dashboard-template-new-api` | `/api/v1/` 하위 API 라우트 생성 |
| `/dashboard-template-new-migration` | Supabase 마이그레이션 파일 생성 |
| `/dashboard-template-review-frontend` | 프론트엔드 코드 리뷰 |
| `/dashboard-template-review-backend` | 백엔드 코드 리뷰 |
| `/dashboard-template-checklist` | AI 작업 체크리스트 실행 |
| `/ui-designer-ui-design` | UI 페이지 설계 및 구현 |
| `/ui-designer-ui-research` | 외부 UI 리소스 리서치 |
| `/ui-designer-ui-analyze` | 프로젝트 UI 구조 분석 |

## Plugin Installation Guide

### Claude Code (기본)

```bash
bash .claude/plugins/local/dashboard-template/install.sh
bash .claude/plugins/local/ui-designer/install.sh
```

### Antigravity (선택)

```bash
bash .claude/plugins/local/dashboard-template/install-antigravity.sh
bash .claude/plugins/local/ui-designer/install-antigravity.sh
```

스킬이 `.github/skills/`에 설치된다. Antigravity에서 프로젝트 열면 자동 인식.

### Codex (선택)

```bash
bash .claude/plugins/local/dashboard-template/install-codex.sh
bash .claude/plugins/local/ui-designer/install-codex.sh
```

커맨드가 `~/.codex/prompts/`에 설치된다.
