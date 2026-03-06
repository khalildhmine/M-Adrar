# Next.js Best Case 개발 규칙 (현재 템플릿 기준)

기준 시점: 2026-03-05

## 0) 문서 목적
- 본 문서는 현재 템플릿 구조를 기준으로, 아래 스택을 가장 일관되게 운영하기 위한 실무 규칙을 정의한다.
- 참고 문서:
  - `docs/architecture/development-rules.md`
  - `docs/architecture/supabase-route-and-monorepo-guide.md`
  - `docs/architecture/turborepo-adoption-rules.md`

적용 스킬 기준:
- `vercel-react-best-practices` (성능/렌더링/번들)
- `vercel-composition-patterns` (컴포넌트 구조)
- `web-design-guidelines` (접근성/UX 품질)
- `supabase-postgres-best-practices` (DB 성능/보안)

---

## 1) 기술 스택 역할 분리 (Single Responsibility)

### 1.1 Core
- `Next.js 16 App Router + React Server Components`를 기본 실행 모델로 사용한다.
- `TypeScript`는 `strict` 모드 전제로 도메인 타입 안정성을 강제한다.

### 1.2 UI/스타일
- `TailwindCSS + shadcn/ui + Lucide + Framer Motion` 조합을 기본 UI 스택으로 고정한다.
- 디자인/인터랙션 규칙은 컴포넌트 레벨에서 일관되게 적용한다(아래 5장 참조).

### 1.3 상태
- 서버 상태: `React Query` 우선
- 클라이언트 전역 UI 상태: `zustand` 최소 범위 사용

### 1.4 백엔드/데이터/인증
- 기본 원칙: **권한 판단의 진실 공급원은 Supabase(RLS)**
- `Supabase`: Auth + Postgres + 정책(RLS) 실행 계층
- `Drizzle ORM`: 내부 관리자/배치/복잡한 서버 도메인 쿼리용 보조 계층 (postgres.js 드라이버)
- `NextAuth.js`: 소셜 로그인 확장 시 세션 브로커 역할(선택). 단독 권한 소스로 사용하지 않는다.

### 1.5 인프라
- 권장 우선순위: `Vercel > Netlify > Cloudflare`
- 이유: App Router/RSC/Route Handler 호환성과 운영 단순성.

---

## 2) 아키텍처 규칙 (MUST)

### ARCH-001 계층 경계
- `src/app/**`: 라우팅, 레이아웃, Route Handler(얇은 어댑터)
- `src/features/**`: 도메인 유스케이스/서비스
- `src/lib/**`: 외부 연동(Supabase, Drizzle, PostHog 등)
- `src/components/**`: UI 구성 요소

### ARCH-002 의존 방향
- 허용: `app -> features -> lib`
- 금지:
  - `features -> app`
  - `lib -> app`
  - 도메인 로직에서 페이지 컴포넌트 참조

### ARCH-003 API 경로 정책
- 모든 API는 `src/app/api/v1/**/route.ts`에 배치한다.
- Route Handler는 입력 검증 + 인증/인가 + 유스케이스 호출만 수행한다.

### ARCH-004 모노레포 전환 호환
- 신규 도메인 코드는 `src/features/<domain>` 우선 배치.
- 패키지 승격 대상:
  - `src/components/ui/*` -> `packages/ui`
  - `src/lib/supabase/*` -> `packages/infra-supabase`
  - `src/features/*` -> `packages/domain-*`

---

## 3) Next.js / React 성능 규칙 (MUST/SHOULD)

### PERF-001 워터폴 제거 (MUST)
- 독립 I/O는 `Promise.all`로 병렬화한다. (`async-parallel`)
- Route Handler/Server Action은 Promise를 먼저 시작하고 늦게 `await`한다. (`async-api-routes`)

### PERF-002 RSC 우선 전략 (MUST)
- 기본은 Server Component.
- 인터랙션/브라우저 API가 필요한 경우에만 Client Component로 분리한다.
- 서버->클라이언트 전달 props는 필요한 필드만 직렬화한다. (`server-serialization`)

### PERF-003 서버 fetch 구성 (SHOULD)
- 컴포넌트 조합으로 서버 fetch를 병렬화한다. (`server-parallel-fetching`)
- 페이지 루트에서 불필요한 순차 fetch를 만들지 않는다.

### PERF-004 번들 크기 규칙 (MUST)
- barrel import 최소화(직접 import 우선). (`bundle-barrel-imports`)
- 무거운 컴포넌트(차트/에디터/지도)는 `next/dynamic`으로 지연 로드. (`bundle-dynamic-imports`)

---

## 4) 컴포넌트 설계 규칙 (vercel-composition-patterns)

### COMP-001 boolean prop 증식 금지 (MUST)
- `isX`, `isY` 조합으로 거대 컴포넌트 분기 생성 금지.
- 변형은 명시적 variant 컴포넌트로 분리한다.

### COMP-002 Compound Components 우선 (SHOULD)
- 복잡한 UI는 `Root/Trigger/Content` 형태의 compound 패턴으로 설계한다.
- 하위 컴포넌트는 shared context로 상태를 읽고, props drilling을 줄인다.

### COMP-003 상태 구현 은닉 (MUST)
- UI 컴포넌트는 상태 구현(zustand/useState/react-query)을 직접 알지 않게 한다.
- Provider/Container에서 state/actions/meta 인터페이스를 주입한다.

### COMP-004 React 19 API 사용 (SHOULD)
- 신규 컴포넌트는 React 19 패턴(`ref` prop, `use(Context)`) 우선 검토.
- 기존 패턴(`forwardRef`)은 호환 이슈 없을 때 점진 전환한다.

---

## 5) UI/UX/접근성 규칙 (web-design-guidelines)

### UI-001 접근성 기본 (MUST)
- 아이콘 버튼은 `aria-label` 필수.
- 입력 필드는 `<label>` 또는 `aria-label` 필수.
- 액션은 `<button>`, 네비게이션은 `<a>/<Link>`만 사용.
- 포커스 표시(`focus-visible`) 제거 금지.

### UI-002 폼 품질 (MUST)
- `name`, `autocomplete`, 적절한 `type` 지정.
- 에러는 필드 인접 표시, 제출 시 첫 오류 포커스 이동.
- 로딩 상태 텍스트는 `…` 사용(`Saving…`).

### UI-003 애니메이션 규칙 (MUST)
- `prefers-reduced-motion` 대응 필수.
- `transform/opacity` 기반 애니메이션 우선.
- `transition: all` 금지.

### UI-004 콘텐츠/레이아웃 (SHOULD)
- 긴 텍스트는 `truncate/line-clamp/break-words` 처리.
- list 50개 이상은 virtualization 또는 `content-visibility` 검토.
- date/number/currency는 `Intl.*` 사용, 하드코딩 포맷 금지.

---

## 6) 데이터/인증 규칙 (Supabase + Drizzle + NextAuth)

### DATA-001 권한 단일 소스 (MUST)
- 사용자 데이터 접근 권한의 최종 판단은 Supabase RLS 정책으로 수행한다.
- 앱 레벨 가드(proxy/layout)는 UX 최적화 레이어이며 보안의 최종 계층이 아니다.

### DATA-002 Supabase 우선 경로 (MUST)
- 사용자 요청 기반 CRUD는 Supabase 서버 클라이언트 + RLS 경로를 우선 사용한다.
- 입력은 `zod.safeParse`, 오류 코드는 400/401/403/500으로 통일한다.

### DATA-003 Drizzle 사용 경계 (MUST)
- Drizzle은 다음 경우에 한정:
  - 내부 운영 API
  - 백그라운드 작업/배치
  - RLS 비의존 복합 리포트 쿼리
- 공개 API에서 Drizzle 직접 접근 시 권한 누락 위험을 검토하고 ADR을 남긴다.
- 스키마 정의(`src/lib/drizzle/schema.ts`)는 기존 `supabase/migrations/*.sql`과 수동 동기화한다.
- `drizzle-kit push/migrate`는 사용하지 않는다. 마이그레이션은 Supabase SQL이 단일 진실 공급원이다.

### DATA-004 NextAuth 사용 경계 (MUST)
- NextAuth는 소셜 로그인 확장이 필요할 때만 도입한다.
- NextAuth 세션만으로 Supabase RLS를 대체하지 않는다.
- 도입 시 사용자 식별자 동기화 규칙(예: auth user id mapping)을 문서화한다.

### DATA-005 스키마/마이그레이션 원칙 (MUST)
- 스키마 단일 진실 공급원은 `supabase/migrations/*.sql`.
- 사용자 참조 컬럼은 `auth.users(id)` FK 연결.
- 정책 내 `auth.uid()`는 `(select auth.uid())` 패턴 사용.
- idempotent seed + fail-fast seed 원칙 유지.

### DATA-006 성능/운영 (SHOULD)
- `WHERE/JOIN/FK` 컬럼 인덱스 기본 적용. (`query-missing-indexes`, `schema-foreign-key-indexes`)
- 목록 조회는 cursor pagination 기본. (`data-pagination`)
- upsert가 필요한 구간은 `INSERT ... ON CONFLICT`. (`data-upsert`)
- 동시성 높은 환경에서 connection pooling 전제. (`conn-pooling`)

---

## 7) 상태관리/유틸 규칙

### STATE-001 React Query
- 서버 캐시 정책(staleTime/gcTime)을 도메인별로 명시한다.
- mutation 성공 후 무분별한 전체 invalidate 금지, 키 단위 무효화.

### STATE-002 Zustand
- UI 로컬 전역(사이드바, 테마, 필터 패널 상태)만 저장.
- 서버 정합성이 필요한 데이터는 zustand에 원본 저장 금지.

### UTIL-001 zod / react-hook-form
- API 스키마와 폼 스키마를 공유 가능한 단위로 분리한다.
- 서버에서도 동일 스키마 또는 동등 스키마를 재검증한다.

### UTIL-002 date-fns / ts-pattern / es-toolkit
- 날짜 파싱/표시는 `date-fns + Intl` 조합을 기본으로 사용.
- 분기 복잡도가 높은 도메인 로직은 `ts-pattern`으로 exhaustiveness 보장.
- 범용 유틸은 `es-toolkit` 우선(중복 유틸 직접 구현 최소화).

---

## 8) Storybook / 디자인 시스템 운영 규칙

### DS-001 스토리 작성 대상 (MUST)
- 재사용 UI 컴포넌트(`src/components/ui`, feature 공용 컴포넌트)는 Storybook 스토리를 만든다.

### DS-002 상태 시나리오 (MUST)
- 최소 시나리오: `default`, `loading`, `empty`, `error`, `long-content`.

### DS-003 접근성/상호작용 (SHOULD)
- 키보드 탐색, 포커스 표시, 모션 축소 모드 스토리를 포함한다.

---

## 9) 관측/분석 규칙 (PostHog)

### OBS-001 이벤트 설계 (MUST)
- 이벤트 이름은 도메인 접두사 사용: `academy.created`, `enrollment.added`.
- 민감정보(전화번호/이메일 원문) 전송 금지.

### OBS-002 성능 영향 최소화 (MUST)
- PostHog 스크립트는 초기 렌더를 막지 않도록 지연 로드.
- 핵심 전환 이벤트는 서버 측에서도 보완 로그를 남긴다.

---

## 10) 배포/런타임 규칙

### DEPLOY-001 배포 타깃
- 기본: Vercel.
- Netlify/Cloudflare 선택 시 런타임 호환성(Edge/Node API/ISR)을 사전 검증한다.

### DEPLOY-002 환경 변수
- 공개 키: `NEXT_PUBLIC_*`
- 서버 비밀: 서버 전용 런타임에서만 접근
- 서비스 롤 키는 클라이언트 번들 포함 금지

---

## 11) PR/AI 체크리스트
1. API가 `/api/v1/**` + `zod.safeParse` 규칙을 지켰는가?
2. 독립 I/O를 병렬화해 워터폴을 제거했는가?
3. RSC 경계를 지키고 직렬화 payload를 최소화했는가?
4. 컴포넌트가 boolean prop 분기 대신 조합/variant 구조인가?
5. 폼/버튼/포커스/모션이 접근성 규칙을 충족하는가?
6. Supabase RLS/FK/인덱스/정책이 migration에 반영됐는가?
7. Drizzle/NextAuth 사용이 정의된 경계를 넘지 않았는가?
8. Storybook 시나리오(`default/loading/empty/error`)가 있는가?
9. PostHog 이벤트명이 도메인 규칙을 따르고 PII를 배제했는가?
10. 테스트(`check`, `test`, `build`)를 통과했는가?
