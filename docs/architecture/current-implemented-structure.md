# 현재 반영 구조 스냅샷

기준 시점: 2026-03-05

## 개요
- 이 문서는 현재 프로젝트에 실제 반영된 구조를 코드 기준으로 기록한다.
- 향후 Turborepo 전환 시 어떤 부분을 `apps/*`, `packages/*`로 이동할지 판단하는 기준 문서다.

## Next.js 런타임 / 빌드 설정
- 파일: `next.config.mjs`
- 반영 사항:
  - `reactCompiler: true`
  - `turbopack.root: dirname` 지정으로 루트 추론 경고를 방지하고 워크스페이스 기준 빌드 경로를 고정
  - `compiler.removeConsole`(production 한정)
  - `/dashboard -> /dashboard/default` 리다이렉트

## 인증 / 세션 / 권한 가드

### 인증 화면 라우트
- 파일:
  - `src/app/(main)/auth/v1/login/page.tsx`
  - `src/app/(main)/auth/v1/register/page.tsx`
  - `src/app/(main)/auth/v2/login/page.tsx`
  - `src/app/(main)/auth/v2/register/page.tsx`
- 동작:
  - 인증 페이지는 `/auth/*`로 통일
  - 로그인 성공 후 `next` 쿼리를 우선 사용하고 없으면 `/dashboard/default`로 이동

### 인증 API
- `POST /api/v1/auth/login`
  - 파일: `src/app/api/v1/auth/login/route.ts`
  - `supabase.auth.signInWithPassword` 기반 로그인
  - 스키마 입력은 `email`, `password`만 허용 (`remember` 제거로 폼/라우트 일관성 유지)
- `POST /api/v1/auth/register`
  - 파일: `src/app/api/v1/auth/register/route.ts`
  - `supabase.auth.signUp` 기반 회원가입

### 인증 폼 연동 규칙
- 파일:
  - `src/app/(main)/auth/_components/login-form.tsx`
  - `src/app/(main)/auth/_components/register-form.tsx`
- 동작:
  - 로그인 폼은 `/api/v1/auth/login`, 회원가입 폼은 `/api/v1/auth/register` 호출
  - mock toast 기반 제출 로직 제거 후 실제 API 응답 기준 처리

### 세션 라우팅 가드
- 파일: `src/proxy.ts`
- 동작:
  - 비인증 사용자가 `/dashboard/*` 접근 시 `/auth/v1/login?next=...`로 리다이렉트
  - 인증 사용자가 `/auth/*` 접근 시 `/dashboard/default`로 리다이렉트
  - matcher: `["/dashboard/:path*", "/auth/:path*"]`

### 대시보드 권한 가드
- 파일: `src/app/(main)/dashboard/layout.tsx`
- 동작:
  - 서버에서 `supabase.auth.getUser()`로 세션 확인
  - `academy_members`에서 사용자 멤버십/역할(owner/manager/staff) 확인
  - 실패 시 `/auth/v1/login` 또는 `/unauthorized`로 리다이렉트

## Supabase 클라이언트 계층
- `src/lib/supabase/env.ts`
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` 검증
- `src/lib/supabase/server.ts`
  - 쿠키 기반 서버 클라이언트 팩토리
  - 서비스 롤 클라이언트 팩토리
- `src/lib/supabase/client.ts`
  - 브라우저용 Supabase 클라이언트 팩토리

## Drizzle ORM 보조 계층
- `src/lib/drizzle/env.ts`
  - `DATABASE_URL` 환경변수 검증
- `src/lib/drizzle/schema.ts`
  - `academies`, `academy_members`, `academy_enrollments` 테이블의 TypeScript 스키마 선언
  - 마이그레이션은 `supabase/migrations/*.sql`이 단일 진실 공급원이며 스키마는 수동 동기화
- `src/lib/drizzle/client.ts`
  - postgres.js + Supabase Transaction Pooler 기반 Drizzle 인스턴스 팩토리
  - `server-only` import로 클라이언트 번들 유입 차단
- `src/lib/drizzle/index.ts`
  - 공개 API (`db`, 스키마 re-export)
- `drizzle.config.ts`
  - `drizzle-kit pull` (introspect) 전용 설정. push/migrate 미사용

## API 버저닝 + 도메인 라우트
- 버저닝 기준: `src/app/api/v1/**`
- 반영 라우트:
  - `src/app/api/v1/auth/login/route.ts`
  - `src/app/api/v1/auth/register/route.ts`
  - `src/app/api/v1/academy/enrollments/route.ts`
- enrollments 라우트 특징:
  - `zod.safeParse` 입력 검증
  - cursor pagination (`id > cursor`, `limit + 1`)
  - 400/401/500 상태코드 규칙

## Supabase 스키마 / RLS / 마이그레이션
- 마이그레이션:
  - `supabase/migrations/20260305170000_academy_enrollments.sql`
  - `supabase/migrations/20260305190000_academies_rls_and_auth_fk.sql`
  - `supabase/migrations/20260305210000_academy_onboarding_function.sql`
  - `supabase/migrations/20260305213000_onboarding_insert_policies.sql`
- 시드:
  - `supabase/seeds/academy-onboarding-seed.sql`
- 반영 사항:
  - `academies`, `academy_members`, `academy_enrollments` 테이블
  - FK 인덱스 및 조회 인덱스 추가
  - `auth.users(id)` FK 연결 (`academy_members.user_id`, `academy_enrollments.created_by`)
  - RLS + FORCE RLS + 멤버십 기반 정책
  - RLS 성능 패턴 `(select auth.uid())` 적용
  - `onboard_academy_owner` 함수로 academy + owner 멤버십 원자적 온보딩 지원
  - `onboard_academy_owner`는 authenticated 컨텍스트에서 `owner_user_id = auth.uid()` 위임 가드 적용
  - 온보딩 경로용 insert 정책(`academies_insert_authenticated`, `academy_members_insert_self_owner`) 분리 적용
  - 로컬/스테이징에서 고정 UUID 기반 idempotent 시드 재실행 가능
  - 시드 owner 계정 누락 시 예외를 발생시켜 환경 재현성 보장

## 온보딩 / 시드 운영 절차
- 파일: `supabase/seeds/academy-onboarding-seed.sql`
- 실행 특성:
  - 반복 실행 안전(idempotent): 고정 `academy_id` + 함수 내부 `ON CONFLICT DO NOTHING`
  - 선행 조건: `auth.users`에 owner 이메일 계정 존재
  - fail-fast: owner 이메일 누락 시 `raise exception`으로 즉시 실패 처리

## 테스트 계약
- `tests/auth-adoption-contract.test.mjs`
  - auth route 존재/폼 연동/proxy 가드 검증
- `tests/auth-session-guard-contract.test.mjs`
  - dashboard layout 멤버십 가드 검증
- `tests/supabase-route-contract.test.mjs`
  - Supabase 계층 + API pagination + 문서 존재 검증
- `tests/supabase-postgres-best-practices.test.mjs`
  - FK/RLS 정책이 best-practices를 따르는지 검증
- `tests/academy-onboarding-seed-contract.test.mjs`
  - 온보딩 함수/시드 SQL 존재 및 idempotent 패턴 검증
- `tests/review-fix-contract.test.mjs`
  - 온보딩 insert 정책, 함수 owner 위임 가드, 시드 fail-fast, `turbopack.root`, remember 제거 검증
- `tests/turborepo-docs-contract.test.mjs`
  - Turborepo 규칙 문서/구조 스냅샷 문서 존재 및 핵심 섹션 검증

## 문서 자산
- `docs/architecture/supabase-route-and-monorepo-guide.md`
- `docs/architecture/turborepo-adoption-rules.md`
- `docs/architecture/development-rules.md`
- `docs/architecture/nextjs-best-case-rules.md`
- `docs/architecture/current-implemented-structure.md`

## Turborepo 전환 관점에서의 현재 상태
- 준비된 점:
  - Supabase 연동 계층이 `src/lib/supabase`로 분리되어 패키지 승격이 용이함
  - API가 `v1`으로 버저닝되어 앱 분리 이후에도 경로 정책 재사용 가능
  - 인증/권한 규칙이 route/layout/proxy에 명시되어 이동 기준이 명확함
  - 빌드 루트(`turbopack.root`)를 명시해 워크스페이스 확장 시 설정 이전 비용이 낮음
- 남은 작업:
  - `src/features/*` 도메인 계층 분리 강화
  - UI/도메인/인프라 import 경계 lint 규칙 도입
  - Drizzle 스키마와 Supabase 마이그레이션 간 동기화 자동 검증 도입
