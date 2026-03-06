# Next.js + Supabase 개발 규칙

기준 시점: 2026-03-05

## 1) 문서 목적
- 이 문서는 본 템플릿(`Next.js 16 + React 19 + Supabase`) 기반 풀스택 개발 시 팀/AI가 동일한 기준으로 작업하도록 규칙을 고정한다.
- 목표는 다음 3가지다.
  1. 기능 추가 속도 유지
  2. 성능/보안/일관성 확보
  3. Turborepo 전환 가능성 보존

## 2) 적용 범위와 우선순위
- 적용 범위: `src/app/**`, `src/lib/**`, `supabase/**`, `docs/**`, `tests/**`
- 우선순위:
  1. 보안/데이터 정합성
  2. 성능(서버 병렬화, 번들 크기)
  3. 개발 생산성(구조 일관성, 테스트 자동화)

## 3) 스택 고정값 (현재 프로젝트 기준)
- Core: `Next.js 16 App Router`, `React 19`, `TypeScript 5`
- UI: `TailwindCSS 4`, `shadcn/ui`, `lucide-react`
- Form/Validation: `react-hook-form`, `zod`
- State: `TanStack Query`(서버 상태), `zustand`(UI 전역 상태)
- Backend: `Route Handler (/api/v1/**)`
- Auth/DB: `Supabase Auth + Supabase Postgres + RLS`
- Complex Query: `Drizzle ORM` (복잡한 서버 쿼리 보조 계층, postgres.js 드라이버)
- Tooling: `Biome`, `Husky`, 계약 테스트(`node --test tests/*.test.mjs`)

주의:
- 일반 React 템플릿 기준의 `Vite`, `React Router`, `JWT 수동 저장` 규칙은 본 프로젝트에 직접 적용하지 않는다.
- 본 프로젝트는 `App Router + 서버 쿠키 기반 Supabase 세션`을 표준으로 사용한다.

## 4) 서비스 규모별 운영 모델 (이 프로젝트 기준)

### Small/MVP
- 원칙: 단일 Next.js 앱 + Supabase로 빠르게 검증
- 허용:
  - 도메인 폴더가 일부 미분리 상태여도 기능 우선
  - 단, API 버저닝(`/api/v1`)과 RLS는 필수

### Medium/Scalable (현재 권장 기본값)
- 원칙: 성장 전제 구조로 개발
- 필수:
  - `app -> features -> lib` 의존 방향
  - Supabase 정책/인덱스/시드 운영 자동화
  - 계약 테스트 + CI 게이트

### Large/Enterprise
- 원칙: 모듈 경계와 운영 체계 강화
- 추가:
  - Turborepo + pnpm 모노레포
  - E2E(Playwright), 에러 모니터링(Sentry), 성능 모니터링(Web Vitals/APM)
  - 다중 인증 전략(MFA/SAML 등), 고급 권한 체계

## 5) 아키텍처 규칙 (MUST)

### ARCH-001 계층 경계
- `src/app/**`: 라우팅, HTTP 진입점, 레이아웃
- `src/features/**`: 도메인 로직
- `src/lib/**`: 외부 연동/인프라(Supabase, storage, util)

### ARCH-002 의존 방향
- 허용: `app -> features -> lib`
- 금지:
  - `features -> app`
  - `lib -> app`
  - 도메인 코드에서 특정 페이지/라우트 직접 참조

### ARCH-003 모노레포 전환 호환성
- 신규 공용 로직은 패키지 승격 가능한 위치에 배치한다.
- 목표 매핑:
  - `src/components/ui/*` -> `packages/ui`
  - `src/lib/supabase/*` -> `packages/infra-supabase`
  - `src/features/*` -> `packages/domain-*`

## 6) API/백엔드 규칙 (MUST)

### API-001 버저닝
- 모든 API는 `src/app/api/v1/**/route.ts`에 생성한다.

### API-002 입력/에러 규칙
- 입력은 `zod.safeParse`로 검증한다.
- 상태코드 기본값:
  - `400`: 입력 오류
  - `401`: 인증 실패
  - `403`: 권한 부족
  - `500`: 서버/DB 오류

### API-003 페이징 규칙
- 대량 목록 API는 cursor pagination을 기본으로 사용한다(`id > cursor`, `limit + 1`).

### API-004 비즈니스 로직 분리
- Route Handler는 얇은 어댑터로 유지하고 도메인 처리 로직은 `features`/`lib`로 위임한다.

## 7) Supabase Auth/DB 규칙 (MUST)

### SB-001 클라이언트 사용
- 서버 컨텍스트: `createSupabaseServerClient`
- 브라우저 컨텍스트: `createSupabaseBrowserClient`
- Service role 키는 서버 전용 경로에서만 사용한다.

### SB-002 멀티테넌시 보안
- 멀티테넌트 테이블은 `RLS + FORCE RLS`를 기본으로 적용한다.
- 앱 레벨 가드는 보조이고, 데이터 접근 제어의 최종 책임은 RLS다.

### SB-003 스키마 변경 원칙
- 스키마 변경은 migration-only 원칙을 따른다.
- 사용자 참조 컬럼은 `auth.users(id)` FK로 연결한다.
- 정책 내부 `auth.uid()`는 `(select auth.uid())` 패턴을 사용한다.

### SB-004 온보딩/시드 원칙
- 초기 데이터 스크립트는 idempotent여야 한다.
- 필수 선행 데이터 누락 시 fail-fast 예외를 발생시킨다.

## 8) React/Next 성능 규칙 (Vercel Best Practices 반영)

### PERF-001 워터폴 제거 (MUST)
- 독립 I/O는 `Promise.all`로 병렬화한다. (`async-parallel`)
- API Route에서도 Promise를 먼저 시작하고 늦게 await한다. (`async-api-routes`)

### PERF-002 번들 크기 제어 (MUST)
- barrel import를 피하고 직접 import한다. (`bundle-barrel-imports`)
- 무거운 클라이언트 컴포넌트는 `next/dynamic`으로 지연 로드한다. (`bundle-dynamic-imports`)

### PERF-003 서버 렌더링 최적화 (SHOULD)
- 기본은 Server Component, 꼭 필요한 경우만 Client Component.
- Client로 내려보내는 데이터는 최소화한다. (`server-serialization`)
- 병렬 fetch 구조를 우선 설계한다. (`server-parallel-fetching`)

### PERF-004 리렌더 최적화 (SHOULD)
- effect로 파생 상태를 만들지 말고 렌더 단계에서 계산한다. (`rerender-derived-state-no-effect`)
- 상호작용 로직은 가능한 이벤트 핸들러로 이동한다. (`rerender-move-effect-to-event`)

## 9) 상태관리/프론트엔드 규칙
- 서버 상태: `TanStack Query` 우선
- UI 전역 상태: `zustand` (필요한 최소 범위)
- 폼: `react-hook-form + zod`
- `localStorage` 사용 시 버전 키를 두고 최소 데이터만 저장한다.

## 10) 테스트/품질 규칙 (MUST)

### QA-001 계약 테스트
- 신규 규칙/구조/정책 추가 시 대응 계약 테스트를 함께 추가한다.
- 기본 테스트 명령: `npm run test` (현재 계약 테스트 스위트)

### QA-002 정적 검사
- PR 전 `npm run check`를 통과해야 한다.
- pre-commit 훅(Husky) 실패 시 우회 커밋 금지.

### QA-003 회귀 방지
- 인증/권한/DB 정책 변경은 문서 + 테스트를 항상 동반한다.

## 11) CI/CD/운영 규칙
- PR 게이트 기본: `check + test + build`
- 환경 변수는 역할별 분리:
  - 공개 가능: `NEXT_PUBLIC_*`
  - 서버 전용: `SUPABASE_SERVICE_ROLE_KEY` 등
- production에서만 `removeConsole` 적용을 유지한다.

## 12) 규모 확장 트리거 (Medium -> Large)
아래 중 2개 이상 충족 시 Turborepo 도입을 시작한다.
1. 독립 배포 앱이 2개 이상 필요
2. 공용 UI/도메인/인프라 재사용이 급증
3. 워커/배치/큐 소비자 독립 배포 필요
4. 팀이 앱/패키지 단위로 분화

## 13) AI 작업 체크리스트
1. 신규 API가 `/api/v1/**` 규칙을 지켰는가?
2. 입력 검증(`zod.safeParse`)과 상태코드 규칙이 반영됐는가?
3. DB 접근이 RLS 우선 원칙을 따르는가?
4. FK/인덱스/정책이 migration에 함께 반영됐는가?
5. 독립 I/O를 병렬화해 워터폴을 제거했는가?
6. 무거운 컴포넌트를 지연 로딩했는가?
7. 모노레포 전환 시 이동 가능한 경계를 유지했는가?
