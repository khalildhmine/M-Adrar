# Supabase/Route 패턴 + 모노레포 전환 가이드

## 목적
- 현재 단일 Next.js 앱에서 빠르게 기능을 추가하되, 추후 모노레포로 안전하게 확장할 수 있는 규칙을 고정한다.
- Supabase 연동 시 쿼리/스키마 성능과 RLS 보안을 기본값으로 적용한다.

## Supabase/Route 패턴

### 1) 클라이언트 계층 분리
- 서버 요청 컨텍스트(쿠키 기반): `src/lib/supabase/server.ts`의 `createSupabaseServerClient`
- 브라우저 전용: `src/lib/supabase/client.ts`의 `createSupabaseBrowserClient`
- 환경변수 읽기/검증: `src/lib/supabase/env.ts`

### 2) API 버저닝 + Route Handler 규칙
- API는 `src/app/api/v1/**/route.ts` 구조를 기본으로 사용한다.
- 모든 입력은 `zod.safeParse`로 검증한다.
- 인증 실패는 `401`, 입력 검증 실패는 `400`, 서버/DB 실패는 `500`으로 통일한다.
- 목록 조회는 기본적으로 cursor 방식(`id > cursor`)을 사용한다.

### 3) DB 접근 규칙
- 사용자 요청 기반 API는 서비스 롤 키보다 `createSupabaseServerClient` + RLS를 우선한다.
- 서비스 롤 클라이언트는 배치/관리자 작업 등 최소 범위에서만 사용한다.

## Supabase Postgres 적용 기준 (Best Practices 반영)
- `query-missing-indexes`: `WHERE/JOIN` 컬럼 인덱스 기본 적용
- `schema-foreign-key-indexes`: FK 컬럼 인덱스 누락 금지
- `schema-constraints`: 멤버십/생성자 사용자 컬럼은 `auth.users(id)` FK로 연결
- `security-rls-basics`: 멀티테넌트 테이블은 RLS + FORCE RLS 기본 적용
- `security-rls-performance`: 정책에서 `auth.uid()`는 `(select auth.uid())` 패턴 사용
- `data-pagination`: 대량 목록은 OFFSET 대신 cursor pagination 사용

참고 마이그레이션:
- `supabase/migrations/20260305170000_academy_enrollments.sql`
- `supabase/migrations/20260305190000_academies_rls_and_auth_fk.sql`
- `supabase/migrations/20260305210000_academy_onboarding_function.sql`
- `supabase/migrations/20260305213000_onboarding_insert_policies.sql`

참고 시드:
- `supabase/seeds/academy-onboarding-seed.sql`

## 모노레포 전환 트리거
- 아래 항목 중 2개 이상 충족 시 모노레포 전환을 시작한다.
1. Next.js 앱이 2개 이상 필요해짐 (예: 관리자 웹 + 학부모 포털)
2. 공통 UI/도메인 로직을 별도 패키지로 재사용해야 함
3. 백그라운드 워커/배치/ETL을 독립 배포해야 함
4. 팀이 분리되어 배포 단위를 명확히 나눠야 함

## 모노레포 전환 가능한 폴더 규칙 (현재 단일 리포 기준)

### 현재 단계(단일 앱) 네이밍 규칙
- `src/features/<domain>/...`: 도메인 단위 기능 (예: `academy`, `students`, `billing`)
- `src/lib/<infra>/...`: 외부 연동/인프라 계층 (예: `supabase`, `s3`)
- `src/app/api/v1/<domain>/...`: API 엔드포인트
- `src/components/ui`: 순수 UI 컴포넌트

### 확장 단계(모노레포 전환 시) 목표 구조
```txt
apps/
  admin-web/
  academy-web/
packages/
  ui/
  domain-academy/
  infra-supabase/
  infra-drizzle/
  config-typescript/
```

### 전환 호환 규칙
- 도메인 코드에서 `@/app/**` 직접 참조 금지 (라우팅 계층 의존 역전 방지)
- Route Handler는 `features`/`lib`를 호출하는 얇은 어댑터로 유지
- 공통 타입은 도메인 폴더 또는 추후 `packages/domain-*`로 승격 가능한 위치에 둔다

## AI 작업 체크리스트
1. 새 API 추가 시 `src/app/api/v1` 하위에 생성했는가?
2. 입력 검증(`zod.safeParse`)과 상태코드(400/401/500) 규칙을 지켰는가?
3. 목록 API가 OFFSET이 아니라 cursor pagination인가?
4. 신규 테이블/쿼리에 필요한 인덱스를 함께 만들었는가?
5. 멀티테넌트 테이블에 RLS + FORCE RLS + 정책을 추가했는가?
6. 사용자 참조 컬럼(`created_by`, `user_id` 등)을 `auth.users(id)` FK로 연결했는가?
7. RLS 정책 함수 호출은 `(select auth.uid())` 패턴을 사용했는가?
8. 신규 코드가 추후 `apps/*`, `packages/*`로 이동 가능한 경계를 유지하는가?
