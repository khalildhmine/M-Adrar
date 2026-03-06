# Turborepo 도입 규칙

## 문서 목적
- 현재 단일 앱을 빠르게 개발하면서도, 이후 `Turborepo + pnpm` 모노레포로 안전하게 전환할 수 있는 규칙을 고정한다.
- AI/개발자가 신규 기능 구현 시 구조적 부채를 만들지 않도록 기준점을 제공한다.

## 도입 트리거
아래 항목 중 2개 이상 충족 시 Turborepo 도입을 시작한다.
1. 독립 배포가 필요한 앱이 2개 이상 생김 (예: `admin-web`, `academy-web`)
2. UI/도메인/인프라 코드를 앱 간 공유해야 함
3. 백그라운드 워커/배치/큐 소비자를 별도 배포해야 함
4. 팀이 기능 단위가 아닌 앱/패키지 단위로 분화됨

## 도입 전 필수 원칙
1. App Router는 라우팅/HTTP 어댑터 역할만 수행
2. 도메인 로직은 `src/features/*`에 배치
3. 외부 연동은 `src/lib/*`로 분리
4. 신규 API는 `src/app/api/v1/**` 버저닝 고정

## 의존 방향 규칙
허용 의존 방향:
- `app -> features -> lib`
- `components -> lib`

금지 규칙:
- `features -> app` 역의존 금지
- `lib -> app` 역의존 금지
- 도메인 코드에서 UI 컴포넌트 직접 참조 금지

## 앱/패키지 구조 템플릿
모노레포 전환 시 목표 구조:

```txt
apps/
  admin-web/
  academy-web/
  ops-worker/
packages/
  ui/
  domain-academy/
  domain-auth/
  infra-supabase/
  infra-drizzle/
  config-typescript/
  config-eslint/
```

## 현재 단일 리포와 1:1 매핑
- `src/components/ui/*` -> `packages/ui`
- `src/features/academy/*` -> `packages/domain-academy`
- `src/lib/supabase/*` -> `packages/infra-supabase`
- `src/lib/drizzle/*` -> `packages/infra-drizzle`
- `src/app/*` -> `apps/admin-web/src/app/*`

## 패키지 설계 규칙
1. 패키지는 단일 책임 유지 (`domain-*`, `infra-*`, `ui` 분리)
2. 패키지 공개 API는 `index.ts`에서만 export
3. 패키지 내부 구현 경로 직접 import 금지
4. 런타임 의존성과 dev 의존성 분리

## 버전/빌드 규칙
1. 패키지 매니저는 `pnpm` 단일화
2. 워크스페이스 루트에서 `turbo run build|test|lint` 실행
3. 캐시 가능한 작업은 Turborepo task로 등록
4. 앱 단위 빌드 산출물(`.next`, `dist`)만 outputs로 명시

## Supabase 연동 규칙 (모노레포 이후 포함)
1. 브라우저/서버 클라이언트 팩토리는 `infra-supabase`에 통합
2. 서비스 롤 키 사용 코드는 서버 전용 패키지로 격리
3. DB 스키마는 `supabase/migrations`를 단일 진실 공급원으로 유지

## AI 작업 체크리스트
1. 신규 코드가 `app -> features -> lib` 의존 방향을 지키는가?
2. API가 `v1` 버저닝과 입력 검증(`zod.safeParse`)을 지키는가?
3. 재사용 가능 코드가 패키지 승격 가능한 위치에 있는가?
4. Supabase 정책/쿼리가 RLS 및 인덱스 규칙을 준수하는가?
5. 차후 `apps/*`, `packages/*` 이동 시 import 경로 충돌이 없는가?
