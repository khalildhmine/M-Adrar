# Dashboard Template Plugin

Next.js 16 + React 19 + Supabase 어드민 대시보드 템플릿 전용 Claude Code 플러그인.
5개의 아키텍처 규칙 문서와 4개의 외부 스킬을 통합하여, 모든 개발 작업에서 규칙을 자동으로 적용한다.

---

## 빠른 설치

```bash
# 1. 프로젝트 루트에서 플러그인 디렉토리 확인
ls dashboard-template-plugin/.claude-plugin/plugin.json

# 2. Claude Code 실행 시 플러그인 로드
claude --plugin-dir ./dashboard-template-plugin

# 3. 설치 확인 (슬래시 명령이 인식되면 정상)
/tem:checklist
```

> 이 플러그인은 프로젝트 내 `dashboard-template-plugin/` 디렉토리에 포함되어 있으므로 별도 다운로드가 필요 없다.

---

## 설치 방법 (상세)

### 방법 1: CLI 옵션으로 로드 (일회성)

Claude Code 실행 시 `--plugin-dir` 옵션으로 플러그인을 로드한다.
세션마다 옵션을 붙여야 한다.

```bash
claude --plugin-dir ./dashboard-template-plugin
```

### 방법 2: 프로젝트 설정에 영구 등록 (권장)

`.claude/settings.json`에 등록하면 해당 프로젝트에서 Claude Code를 실행할 때마다 자동으로 로드된다.

```bash
# .claude 디렉토리가 없으면 생성
mkdir -p .claude
```

`.claude/settings.json` 파일에 다음을 추가 (또는 생성):

```json
{
  "plugins": ["./dashboard-template-plugin"]
}
```

이후 별도 옵션 없이 `claude`만 실행해도 플러그인이 자동 적용된다.

### 방법 3: 다른 프로젝트에서 사용

이 플러그인을 다른 프로젝트에서도 사용하려면 디렉토리를 복사한다:

```bash
# 대상 프로젝트로 복사
cp -r dashboard-template-plugin /path/to/other-project/

# 대상 프로젝트의 .claude/settings.json에 등록
{
  "plugins": ["./dashboard-template-plugin"]
}
```

### 설치 확인

플러그인이 정상 로드되면 아래 명령이 인식된다:

```
/tem:checklist          # AI 체크리스트 실행
/tem:review-frontend    # 프론트엔드 리뷰
/tem:review-backend     # 백엔드 리뷰
/tem:new-api            # API 라우트 스캐폴딩
/tem:new-feature        # 피처 디렉토리 스캐폴딩
/tem:new-migration      # Supabase 마이그레이션 스캐폴딩
/tem:init-project       # 프로젝트 초기화 (도메인 문서 생성)
```

에이전트 확인:
```
/agents                 # frontend-architect, backend-architect, fullstack-dev 표시
```

---

## 플러그인 구성 요소

### 1. 스킬 (Skills) — 컨텍스트 기반 자동 로드

스킬은 작업 중인 파일의 종류에 따라 Claude가 자동으로 로드한다.

| 스킬 | 트리거 조건 | 적용 규칙 |
|------|------------|-----------|
| `frontend-dev` | React 컴포넌트, Next.js 페이지, UI 코드 작성/수정 | PERF, COMP, UI, STATE, UTIL, DS |
| `backend-dev` | API 라우트, Supabase, SQL, 마이그레이션 작업 | API, SB, DATA, OBS, QA |
| `fullstack-review` | PR 리뷰, 코드 리뷰, "review" 키워드 사용 | 전체 규칙 통합 적용 |
| `project-init` | 프로젝트 초기화 시 또는 `docs/domain/glossary.md`·`project.md` 부재 감지 시 | 도메인 용어집 + 프로젝트 개관 생성 |

**작동 원리**: `src/app/api/` 하위 파일을 수정하면 `backend-dev` 스킬이 자동 활성화되어 API-001(버저닝), API-002(zod 검증) 등의 규칙을 Claude가 인식하고 적용한다.

### 2. 에이전트 (Agents) — 전문화된 서브 에이전트

| 에이전트 | 역할 | 도구 권한 |
|---------|------|----------|
| `frontend-architect` | 프론트엔드 코드 리뷰 (읽기 전용) | Read, Grep, Glob, Bash |
| `backend-architect` | 백엔드 코드 리뷰 (읽기 전용) | Read, Grep, Glob, Bash |
| `fullstack-dev` | 기능 구현 (전체 규칙 적용, 기본 에이전트) | 모든 도구 |

**읽기 전용 에이전트**: `frontend-architect`와 `backend-architect`는 코드를 수정하지 않고 리뷰만 수행한다. 안전하게 리뷰를 위임할 수 있다.

**기본 에이전트**: `settings.json`에 의해 `fullstack-dev`가 기본 에이전트로 설정되어, 플러그인 활성화 시 모든 작업에 아키텍처 규칙이 자동 적용된다.

### 3. 슬래시 명령 (Slash Commands)

| 명령 | 설명 |
|------|------|
| `/tem:checklist` | 현재 git 변경사항에 대해 AI 체크리스트 실행 |
| `/tem:review-frontend` | 프론트엔드 코드 리뷰 (frontend-architect 에이전트에 위임) |
| `/tem:review-backend` | 백엔드 코드 리뷰 (backend-architect 에이전트에 위임) |
| `/tem:new-api <domain>/<resource>` | `/api/v1/` 하위에 API 라우트 스캐폴딩 |
| `/tem:new-feature <domain>` | `src/features/` 하위에 피처 디렉토리 스캐폴딩 |
| `/tem:new-migration <description>` | Supabase 마이그레이션 파일 스캐폴딩 |
| `/tem:init-project` | 프로젝트 초기화 — 도메인 용어집(glossary.md) + 프로젝트 개관(project.md) 생성 |

### 4. 훅 (Hooks) — 자동 가드레일

| 훅 | 타입 | 동작 |
|----|------|------|
| PreToolUse (Write) | 차단 | `/api/v1/` 외부에 API 라우트 생성 시 차단 (exit 2) |
| PreToolUse (Edit/Write) | 차단 | `features/`/`lib/`에서 `@/app/` import 시 차단 (ARCH-002) |
| PostToolUse (Edit/Write) | 경고 | API 라우트가 `/api/v1/` 하위가 아닌 경우 경고 |
| PostToolUse (Edit/Write) | 경고 | SQL에서 `auth.uid()` 직접 사용 시 `(select auth.uid())` 패턴 사용 경고 |

---

## 상세 사용법 및 예시

### 예시 1: AI 체크리스트 실행

코드 변경 후 커밋 전에 체크리스트를 실행한다:

```
/tem:checklist
```

**출력 예시:**

```markdown
## Checklist Results

### 통과
- [x] API-001: 모든 API가 /api/v1/** 하위에 있음
- [x] API-002: zod.safeParse 입력 검증 적용됨
- [x] SB-003: (select auth.uid()) 패턴 사용됨

### 실패
- [ ] PERF-001: 순차 I/O 감지됨 — src/app/api/v1/academy/enrollments/route.ts:15
  수정: 독립 fetch를 Promise.all()로 감싸세요

### 해당 없음
- [-] SB-002: SQL 파일 변경 없음

요약: 3개 통과, 1개 실패, 1개 해당 없음
```

### 예시 2: 프론트엔드 코드 리뷰

```
/tem:review-frontend
```

Claude는 `frontend-architect` 에이전트를 생성하여 변경된 프론트엔드 파일을 검사한다:

```
[PERF-004] [MUST] src/components/dashboard/chart.tsx:3
  — barrel import 사용 감지: import { Chart } from '@/components'
  수정: import Chart from '@/components/dashboard/chart' 직접 import 사용

[COMP-001] [MUST] src/features/academy/student-card.tsx:12
  — boolean prop 증식: isCompact, isHighlighted, isAdmin
  수정: CompactStudentCard, HighlightedStudentCard 등 variant 컴포넌트로 분리

[UI-001] [MUST] src/components/ui/icon-button.tsx:8
  — 아이콘 버튼에 aria-label 누락
  수정: <button aria-label="닫기"> 추가
```

### 예시 3: 백엔드 코드 리뷰

```
/tem:review-backend
```

`backend-architect` 에이전트가 API 라우트와 SQL 파일을 검사한다:

```
[API-003] [MUST] src/app/api/v1/students/route.ts:25
  — OFFSET 기반 페이징 사용 감지
  수정: cursor pagination (id > cursor, limit + 1) 패턴으로 변경

[SB-003] [MUST] supabase/migrations/20260310_students.sql:15
  — auth.uid() 직접 사용 (RLS 성능 저하)
  수정: (select auth.uid()) 서브쿼리 패턴 사용
```

### 예시 4: 새 API 라우트 스캐폴딩

```
/tem:new-api academy/students
```

자동으로 `src/app/api/v1/academy/students/route.ts` 생성:
- `zod` 입력 검증 스키마 (API-002 준수)
- cursor pagination 패턴 (API-003 준수)
- Supabase 서버 클라이언트 인증 (SB-001 준수)
- 400/401/500 상태코드 처리 (API-002 준수)

### 예시 5: 새 피처 디렉토리 스캐폴딩

```
/tem:new-feature billing
```

`src/features/billing/` 하위에 `types.ts`, `service.ts`, `queries.ts`, `constants.ts`, `index.ts` 자동 생성.

### 예시 6: 새 마이그레이션 스캐폴딩

```
/tem:new-migration add_students_table
```

`supabase/migrations/<timestamp>_add_students_table.sql` 생성:
- 테이블/FK/인덱스/RLS 템플릿 포함
- `(select auth.uid())` 패턴 가이드 포함

### 예시 7: 훅 자동 차단 체험

**잘못된 API 경로 차단:**

```
사용자: "src/app/api/test/route.ts 에 GET 핸들러를 만들어줘"
```

PreToolUse 훅이 자동으로 차단 (exit 2):

```
API routes MUST be created under src/app/api/v1/**.
Use /api/v1/<domain>/<resource>/route.ts pattern. See API-001.
```

**역방향 의존 차단:**

`src/features/academy/service.ts`에서 `import { something } from '@/app/dashboard/page'` 작성 시:

```
[ARCH-002] features/ and lib/ MUST NOT import from @/app/**.
Dependency direction: app -> features -> lib (never reverse).
```

### 예시 8: 프로젝트 초기화

```
/tem:init-project
```

인터뷰 형식으로 도메인 정보를 수집하여 `docs/domain/glossary.md`와 `docs/domain/project.md`를 자동 생성한다:

1. 서비스명, 타겟 사용자, 핵심 가치 질문
2. 주요 액터 및 역할 정의
3. 핵심 도메인 영역 및 용어 수집
4. 템플릿 기반 문서 생성

생성 후 `fullstack-dev` 에이전트가 코드 작업 시 용어집을 참조하여 네이밍 일관성을 유지한다.

---

## 적용되는 아키텍처 규칙

### 규칙 원본 문서 (5개)

| 문서 | 내용 |
|------|------|
| `docs/architecture/development-rules.md` | 핵심 개발 규칙 (ARCH, API, SB, DATA, PERF, QA) |
| `docs/architecture/nextjs-best-case-rules.md` | 프론트엔드/성능 규칙 (PERF, COMP, UI, STATE, DS, OBS) |
| `docs/architecture/supabase-route-and-monorepo-guide.md` | Supabase/Route 패턴, 모노레포 전환 규칙 |
| `docs/architecture/turborepo-adoption-rules.md` | Turborepo 도입 트리거 및 전환 규칙 |
| `docs/architecture/current-implemented-structure.md` | 현재 구현된 구조 스냅샷 |

### 외부 참조 스킬 (4개)

| 스킬 | 규칙 수 | 내용 |
|------|--------|------|
| `vercel-react-best-practices` | 58개 | React/Next.js 성능 최적화 (async, bundle, server, rerender) |
| `vercel-composition-patterns` | 8개 | 컴포넌트 아키텍처, 상태 관리, React 19 API |
| `web-design-guidelines` | URL 기반 | 접근성/UX 품질 (최신 가이드라인 fetch) |
| `supabase-postgres-best-practices` | 다수 | DB 성능/보안 (query, security, schema, data) |

---

## 규칙 빠른 참조

### MUST 규칙 (위반 시 에러)

| 규칙 ID | 내용 |
|---------|------|
| API-001 | 모든 API는 `/api/v1/**` 하위에 생성 |
| API-002 | `zod.safeParse` 입력 검증 + 400/401/403/500 상태코드 |
| API-003 | 목록 API는 cursor pagination 사용 |
| API-004 | Route Handler는 얇은 어댑터, 비즈니스 로직은 features/lib |
| ARCH-002 | 의존 방향: `app -> features -> lib` (역방향 금지) |
| PERF-001 | 독립 I/O는 `Promise.all`로 병렬화 |
| PERF-004 | barrel import 금지, 무거운 컴포넌트는 `next/dynamic` |
| COMP-001 | boolean prop 증식 금지 — variant 컴포넌트 사용 |
| COMP-003 | UI 컴포넌트는 상태 구현을 직접 알지 않음 |
| UI-001 | 아이콘 버튼 `aria-label`, 입력 필드 `<label>`, `focus-visible` 유지 |
| UI-002 | 폼 필드 `name`/`autocomplete`/`type`, 에러 인접 표시 |
| UI-003 | `prefers-reduced-motion` 대응, `transition: all` 금지 |
| SB-002 | 멀티테넌트 테이블 RLS + FORCE RLS |
| SB-003 | `(select auth.uid())` 패턴 사용, migration-only 스키마 변경 |
| DATA-001 | 데이터 접근 권한의 최종 판단은 Supabase RLS |
| DATA-005 | 스키마 단일 진실 공급원은 `supabase/migrations/*.sql` |
| QA-001 | 신규 규칙/구조 추가 시 계약 테스트 필수 |
| QA-002 | PR 전 `check + test + build` 통과 필수 |
| OBS-001 | PostHog 이벤트명 도메인 접두사, PII 전송 금지 |

### SHOULD 규칙 (위반 시 경고)

| 규칙 ID | 내용 |
|---------|------|
| PERF-002 | Server Component 기본, Client Component는 최소화 |
| PERF-003 | 컴포넌트 조합으로 서버 fetch 병렬화 |
| COMP-002 | 복잡한 UI는 compound component 패턴 |
| COMP-004 | React 19 API (`ref` prop, `use(Context)`) 우선 사용 |
| UI-004 | 긴 텍스트 truncate, 50+ 목록 virtualization, `Intl.*` 포맷팅 |
| DATA-006 | WHERE/JOIN/FK 컬럼 인덱스, cursor pagination, ON CONFLICT upsert |
| DS-001 | 재사용 UI 컴포넌트는 Storybook 스토리 작성 |
| DS-003 | 키보드 탐색, 포커스, 모션 축소 모드 스토리 포함 |

---

## 디렉토리 구조

```
dashboard-template-plugin/
├── .claude-plugin/
│   └── plugin.json                    # 플러그인 매니페스트 (prefix: tem)
├── settings.json                      # 기본 에이전트 설정 (fullstack-dev)
├── skills/
│   ├── frontend-dev/
│   │   ├── SKILL.md                   # 프론트엔드 개발 스킬
│   │   └── references/
│   │       ├── perf-rules.md          # PERF-001~004 성능 규칙
│   │       ├── comp-rules.md          # COMP-001~004 컴포넌트 설계 규칙
│   │       └── ui-rules.md            # UI-001~004 접근성/UX 규칙
│   ├── backend-dev/
│   │   ├── SKILL.md                   # 백엔드 개발 스킬
│   │   └── references/
│   │       ├── api-rules.md           # API-001~004 규칙
│   │       ├── supabase-rules.md      # SB-001~004, DATA-001~006 규칙
│   │       └── migration-rules.md     # 마이그레이션/시드 규칙
│   ├── fullstack-review/
│   │   ├── SKILL.md                   # 풀스택 리뷰 스킬
│   │   └── references/
│   │       └── checklist.md           # AI 작업 체크리스트 통합본
│   └── project-init/
│       ├── SKILL.md                   # 프로젝트 초기화 스킬
│       └── references/
│           ├── glossary-template.md   # 도메인 용어집 템플릿
│           └── project-template.md    # 프로젝트 개관 템플릿
├── agents/
│   ├── frontend-architect.md          # 프론트엔드 아키텍트 (읽기 전용)
│   ├── backend-architect.md           # 백엔드 아키텍트 (읽기 전용)
│   └── fullstack-dev.md               # 풀스택 개발자 (모든 도구, 기본 에이전트)
├── commands/
│   ├── checklist.md                   # /tem:checklist
│   ├── review-frontend.md             # /tem:review-frontend
│   ├── review-backend.md              # /tem:review-backend
│   ├── new-api.md                     # /tem:new-api
│   ├── new-feature.md                 # /tem:new-feature
│   ├── new-migration.md              # /tem:new-migration
│   └── init-project.md                # /tem:init-project
├── hooks/
│   └── hooks.json                     # 자동 검증 훅 (4개)
└── README.md                          # 이 문서
```

---

## 기술 스택

- **Core**: Next.js 16 App Router, React 19, TypeScript 5
- **UI**: TailwindCSS 4, shadcn/ui, lucide-react, Framer Motion
- **Form**: react-hook-form, zod
- **State**: TanStack Query (서버), zustand (UI)
- **Backend**: Route Handler (`/api/v1/**`), Supabase Auth + Postgres + RLS, Drizzle ORM (복잡 쿼리)
- **Tooling**: Biome, Husky
