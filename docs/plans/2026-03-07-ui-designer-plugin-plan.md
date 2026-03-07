# ui-designer 플러그인 구현 계획

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** UI 페이지 설계 및 구현을 가이드하는 Claude Code 플러그인을 만든다. 프로젝트 분석 → 인터랙티브 Q&A → 설계 제안 → 코드 생성 워크플로우를 제공한다.

**Architecture:** Claude Code 공식 플러그인 형태. 지식 베이스(references/ 마크다운)가 핵심이며, 스킬이 자동 감지하고, 커맨드가 명시적 호출을 제공하고, 에이전트가 분석/설계를 수행한다. references/는 Codex/Antigravity에서도 직접 참조 가능.

**Tech Stack:** Claude Code Plugin (markdown-based), plugin-dev 스킬 활용

**Design Doc:** `docs/plans/2026-03-07-ui-designer-plugin-design.md`

---

## Task 1: 플러그인 스캐폴드 생성

**Files:**
- Create: `.claude/plugins/local/ui-designer/.claude-plugin/plugin.json`
- Create: `.claude/plugins/local/ui-designer/skills/ui-design-guide/references/` (디렉토리)
- Create: `.claude/plugins/local/ui-designer/commands/` (디렉토리)
- Create: `.claude/plugins/local/ui-designer/agents/` (디렉토리)

**Step 1: 디렉토리 구조 생성**

```bash
mkdir -p .claude/plugins/local/ui-designer/.claude-plugin
mkdir -p .claude/plugins/local/ui-designer/skills/ui-design-guide/references
mkdir -p .claude/plugins/local/ui-designer/commands
mkdir -p .claude/plugins/local/ui-designer/agents
```

**Step 2: plugin.json 매니페스트 작성**

Create `.claude/plugins/local/ui-designer/.claude-plugin/plugin.json`:
```json
{
  "name": "ui-designer",
  "version": "0.1.0",
  "description": "UI 페이지 설계 및 구현 가이드. 프로젝트 분석, 컴포넌트 추천, 레이아웃 설계, 코드 생성을 지원한다.",
  "author": {
    "name": "freelife"
  },
  "keywords": ["ui", "design", "layout", "components", "shadcn"]
}
```

**Step 3: 커밋**

```bash
git add .claude/plugins/local/ui-designer/
git commit -m "feat(ui-designer): 플러그인 스캐폴드 생성"
```

---

## Task 2: 지식 베이스 — component-catalog.md

**Files:**
- Read: `docs/guides/21st-ui-components.md` (원본 데이터)
- Create: `.claude/plugins/local/ui-designer/skills/ui-design-guide/references/component-catalog.md`

**Step 1: component-catalog.md 작성**

21st-ui-components.md를 의사결정 트리 형태로 재구성한다. 각 컴포넌트별:
- 이름 / 설명
- use-when: 언제 사용
- avoid-when: 언제 사용하지 않음
- pairs-with: 함께 자주 쓰이는 컴포넌트
- shadcn-mapping: 구현 시 사용할 shadcn/ui 컴포넌트
- variants: 변형 (미니멀/풍성/다크 등)

구조:
```markdown
# UI Component Catalog

## Marketing Blocks

### Announcements
- **설명**: ...
- **use-when**: ...
- **avoid-when**: ...
- **pairs-with**: Navigation Menu, Hero
- **shadcn-mapping**: Alert, Banner (커스텀)
- **variants**: 풀와이드 바, 닫기 가능, 애니메이션

### Hero
...

## UI Components

### Accordion
...
```

Marketing Blocks 17종 + UI Components 30+종 전체를 커버한다.

**Step 2: 커밋**

```bash
git add .claude/plugins/local/ui-designer/skills/ui-design-guide/references/component-catalog.md
git commit -m "feat(ui-designer): 컴포넌트 카탈로그 지식 베이스 작성"
```

---

## Task 3: 지식 베이스 — layout-patterns.md

**Files:**
- Create: `.claude/plugins/local/ui-designer/skills/ui-design-guide/references/layout-patterns.md`

**Step 1: layout-patterns.md 작성**

다음 섹션을 포함한다:

1. **그리드 시스템**: 12컬럼 기반 배치 규칙, Tailwind grid/flex 패턴
2. **반응형 브레이크포인트**: sm(640px)/md(768px)/lg(1024px)/xl(1280px)/2xl(1536px) 사용 규칙
3. **섹션 배치 규칙**: 수직 리듬(py-16, py-24), 콘텐츠 최대 너비(max-w-7xl), 시각적 계층
4. **일반 레이아웃 패턴**:
   - 사이드바 + 메인 콘텐츠 (flex, sidebar w-64)
   - 풀와이드 히어로 + 컨테이너 콘텐츠
   - 카드 그리드 (grid-cols-1/2/3/4)
   - 스플릿 레이아웃 (50/50, 60/40)
   - 스택 레이아웃 (수직 섹션 나열)
5. **간격/사이징 체계**: Tailwind spacing scale, 일관성 규칙

각 패턴에 Tailwind CSS 코드 예시를 포함한다.

**Step 2: 커밋**

```bash
git add .claude/plugins/local/ui-designer/skills/ui-design-guide/references/layout-patterns.md
git commit -m "feat(ui-designer): 레이아웃 패턴 지식 베이스 작성"
```

---

## Task 4: 지식 베이스 — page-templates.md

**Files:**
- Create: `.claude/plugins/local/ui-designer/skills/ui-design-guide/references/page-templates.md`

**Step 1: page-templates.md 작성**

지원하는 8가지 페이지 유형별 표준 구성:

각 유형별 포함 항목:
- 섹션 순서 (필수/선택 표시)
- ASCII 레이아웃 스켈레톤
- 사용할 컴포넌트 목록 (component-catalog.md 참조)
- shadcn/ui 구현 매핑
- Next.js 파일 구조 예시

페이지 유형:
1. **Landing Page**: Navigation → Hero → Features → Clients → Testimonials → Pricing → CTA → Footer
2. **Dashboard**: Sidebar + Header → Stats Cards → Charts → Tables → Activity Feed
3. **Settings**: Sidebar/Tabs → Form Sections → Save Actions
4. **Auth** (Login/Register): Centered Card → Form → Social Login → Links
5. **CRUD List**: Header + Filters → Table/Cards → Pagination
6. **Detail**: Breadcrumb → Header → Content Tabs → Related Items
7. **Pricing**: Header → Toggle(월/연) → Comparison Cards → FAQ → CTA
8. **Form**: Header → Stepper(선택) → Form Fields → Actions

**Step 2: 커밋**

```bash
git add .claude/plugins/local/ui-designer/skills/ui-design-guide/references/page-templates.md
git commit -m "feat(ui-designer): 페이지 템플릿 지식 베이스 작성"
```

---

## Task 5: 지식 베이스 — qa-templates.md

**Files:**
- Create: `.claude/plugins/local/ui-designer/skills/ui-design-guide/references/qa-templates.md`

**Step 1: qa-templates.md 작성**

질문 형식 규칙:
```
질문: [구체적 질문]
설명: [왜 이 질문이 중요한지 1-2줄]
추천: [분석 데이터 기반 추천] ← ★ 표시
선택지:
  a) [옵션] — [간단 설명]
  b) [옵션] — [간단 설명]
  c) [옵션] — [간단 설명]
  d) 직접 입력
```

섹션 구성:
1. **공통 질문** (모든 유형): 타겟 사용자, 기존 페이지와의 관계, 톤앤매너, 준비된 에셋
2. **Landing/Marketing 전용**: CTA 목표, 벤치마크 사이트, USP, 소셜 프루프
3. **Dashboard 전용**: 핵심 KPI, 데이터 소스, 실시간 갱신, 역할별 뷰
4. **Form/Settings 전용**: 필드 목록, 유효성 규칙, 저장 방식
5. **CRUD 전용**: 데이터 모델, 필터/검색/정렬, 벌크 작업
6. **Auth 전용**: 소셜 로그인, 이메일 인증, 비밀번호 정책

각 질문에 구체적 추천과 예시 답변을 포함한다.
"추천대로" 응답 시 전체 ★ 추천 일괄 적용 규칙을 명시한다.

**Step 2: 커밋**

```bash
git add .claude/plugins/local/ui-designer/skills/ui-design-guide/references/qa-templates.md
git commit -m "feat(ui-designer): Q&A 템플릿 지식 베이스 작성"
```

---

## Task 6: 지식 베이스 — design-principles.md

**Files:**
- Create: `.claude/plugins/local/ui-designer/skills/ui-design-guide/references/design-principles.md`

**Step 1: design-principles.md 작성**

두 부분으로 구성:

**Part 1 — 정적 원칙** (설계 단계에서 사용):
- 시각적 계층 (Visual Hierarchy): 크기, 색상, 대비, 여백으로 중요도 표현
- 일관성 (Consistency): 같은 패턴은 같은 컴포넌트로
- 반응형 디자인: Mobile-first, 브레이크포인트별 레이아웃 변경 규칙
- 컬러 사용: 주색/보조색/경고색 역할, 대비 비율(WCAG AA 4.5:1)
- 타이포그래피: 크기 스케일(text-sm/base/lg/xl/2xl), 줄 간격, 폰트 무게
- 인터랙션 패턴: 호버/포커스/활성 상태, 트랜지션(duration-200)

**Part 2 — Vercel Web Interface Guidelines 연동** (코드 생성 후 검증):
- 소스 URL: `https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md`
- 검증 시점: 코드 생성 완료 후
- 활용법: WebFetch로 최신 가이드라인을 가져와 생성된 코드 검증
- 주요 검증 항목: 접근성, 시맨틱 HTML, 키보드 내비게이션

**Step 2: 커밋**

```bash
git add .claude/plugins/local/ui-designer/skills/ui-design-guide/references/design-principles.md
git commit -m "feat(ui-designer): 디자인 원칙 지식 베이스 작성"
```

---

## Task 7: 스킬 — ui-design-guide/SKILL.md

**Files:**
- Create: `.claude/plugins/local/ui-designer/skills/ui-design-guide/SKILL.md`

**Step 1: plugin-dev:skill-development 스킬 로드**

Skill tool로 `plugin-dev:skill-development` 로드하여 스킬 작성 규칙 확인.

**Step 2: SKILL.md 작성**

프론트매터:
```yaml
---
name: ui-design-guide
description: >
  UI 페이지를 생성하거나 레이아웃을 설계할 때 자동 활성화되는 가이드. "페이지 만들어줘",
  "UI 수정", "레이아웃 변경", "섹션 추가", "Hero", "Dashboard", "Settings" 등
  UI 관련 작업을 감지하면 프로젝트 분석 데이터와 컴포넌트 카탈로그를 기반으로
  최적의 컴포넌트 조합과 레이아웃을 제안한다.
---
```

본문 구성 (1,500-2,000단어):
1. 워크플로우 개요 (4단계: 분석 → Q&A → 설계 → 생성)
2. 0단계: 분석 데이터 확인 (.ui-designer/analysis.json)
   - 없으면 `/ui-analyze` 안내
3. 1단계: 페이지 유형 판별 → qa-templates.md 참조하여 Q&A
   - 질문 + 설명 + 추천 형식 준수
   - "추천대로" 응답 처리
4. 2단계: 설계안 생성
   - component-catalog.md에서 컴포넌트 선택
   - layout-patterns.md에서 배치 규칙 적용
   - page-templates.md에서 표준 구성 참조
   - ASCII 레이아웃 스켈레톤 + 컴포넌트 목록 + 파일 구조 제시
5. 3단계: 코드 생성
   - analysis.json의 기존 스타일/패턴/컨벤션 준수
   - 생성 후 design-principles.md의 Vercel Guidelines로 검증
6. references/ 파일 참조 규칙

**Step 3: 커밋**

```bash
git add .claude/plugins/local/ui-designer/skills/ui-design-guide/SKILL.md
git commit -m "feat(ui-designer): ui-design-guide 스킬 작성"
```

---

## Task 8: 커맨드 — ui-design.md

**Files:**
- Create: `.claude/plugins/local/ui-designer/commands/ui-design.md`

**Step 1: plugin-dev:command-development 스킬 로드**

Skill tool로 `plugin-dev:command-development` 로드.

**Step 2: ui-design.md 작성**

프론트매터:
```yaml
---
name: ui-design
description: "UI 페이지 설계 및 구현. 페이지 유형 또는 자연어 설명으로 시작."
argument-hint: "[landing|dashboard|settings|auth|crud|detail|pricing|form] 또는 자유 설명"
---
```

본문: SKILL.md와 동일한 4단계 워크플로우를 명시적으로 실행하는 지시.
- 인자 파싱 규칙 (유형 키워드 vs 자연어)
- analysis.json 없으면 자동으로 ui-analyzer 에이전트 호출
- Q&A → 설계안 → 승인 → 코드 생성 순서 강제

**Step 3: 커밋**

```bash
git add .claude/plugins/local/ui-designer/commands/ui-design.md
git commit -m "feat(ui-designer): /ui-design 커맨드 작성"
```

---

## Task 9: 커맨드 — ui-analyze.md

**Files:**
- Create: `.claude/plugins/local/ui-designer/commands/ui-analyze.md`

**Step 1: ui-analyze.md 작성**

프론트매터:
```yaml
---
name: ui-analyze
description: "현재 프로젝트의 UI 구조를 분석하고 .ui-designer/analysis.json에 저장."
argument-hint: "[--refresh]"
---
```

본문: ui-analyzer 에이전트를 호출하여 프로젝트 분석 수행.
- 분석 항목: 라우트 맵, 컴포넌트 인벤토리, 레이아웃 패턴, 스타일 컨벤션, 디자인 토큰, 반복 UI 패턴
- 결과를 .ui-designer/analysis.json에 저장
- --refresh 옵션: 기존 분석 갱신
- 분석 완료 후 요약 출력

**Step 2: 커밋**

```bash
git add .claude/plugins/local/ui-designer/commands/ui-analyze.md
git commit -m "feat(ui-designer): /ui-analyze 커맨드 작성"
```

---

## Task 10: 에이전트 — ui-consultant.md

**Files:**
- Create: `.claude/plugins/local/ui-designer/agents/ui-consultant.md`

**Step 1: plugin-dev:agent-development 스킬 로드**

Skill tool로 `plugin-dev:agent-development` 로드.

**Step 2: ui-consultant.md 작성**

프론트매터:
```yaml
---
description: >
  UI 설계 전문 서브에이전트. 프로젝트 분석 데이터(.ui-designer/analysis.json)와
  컴포넌트 카탈로그를 기반으로 페이지별 최적 컴포넌트 조합과 레이아웃을 설계한다.
  복잡한 UI 설계 분석이 필요할 때 스킬/커맨드가 내부적으로 호출한다.
---
```

시스템 프롬프트:
- references/ 문서 참조 지시
- analysis.json 기반 맥락 인식 설계
- ASCII 레이아웃 스켈레톤 생성 능력
- 기존 프로젝트 스타일과의 일관성 검증

**Step 3: 커밋**

```bash
git add .claude/plugins/local/ui-designer/agents/ui-consultant.md
git commit -m "feat(ui-designer): ui-consultant 에이전트 작성"
```

---

## Task 11: 에이전트 — ui-analyzer.md

**Files:**
- Create: `.claude/plugins/local/ui-designer/agents/ui-analyzer.md`

**Step 1: ui-analyzer.md 작성**

프론트매터:
```yaml
---
description: >
  프로젝트 UI 구조 분석 전문 서브에이전트. 코드베이스를 스캔하여 라우트, 컴포넌트,
  레이아웃, 스타일, 디자인 토큰을 체계적으로 분석하고 .ui-designer/analysis.json을 생성한다.
  /ui-analyze 커맨드 또는 ui-design-guide 스킬이 호출한다.
---
```

시스템 프롬프트:
- app/ 디렉토리 스캔 → 라우트 맵 생성
- package.json + import 분석 → shadcn 컴포넌트 인벤토리
- tailwind.config 분석 → 디자인 토큰 추출
- 레이아웃 파일 분석 → 구조 패턴 식별
- 결과를 설계 문서의 analysis.json 스키마에 맞춰 저장
- Glob, Grep, Read 도구 적극 활용

**Step 2: 커밋**

```bash
git add .claude/plugins/local/ui-designer/agents/ui-analyzer.md
git commit -m "feat(ui-designer): ui-analyzer 에이전트 작성"
```

---

## Task 12: README.md

**Files:**
- Create: `.claude/plugins/local/ui-designer/README.md`

**Step 1: README.md 작성**

섹션:
1. 개요 (플러그인 목적, 핵심 기능)
2. 설치 방법
3. 빠른 시작 (/ui-analyze → /ui-design)
4. 커맨드 목록 (표)
5. 지원 페이지 유형 (8종)
6. 워크플로우 설명 (4단계)
7. 다른 AI 도구에서 사용하기
   - Codex CLI: AGENTS.md에 추가할 블록
   - Antigravity / 기타: references/ 경로 안내
8. 지식 베이스 구조 설명

**Step 2: 커밋**

```bash
git add .claude/plugins/local/ui-designer/README.md
git commit -m "docs(ui-designer): README 작성"
```

---

## Task 13: 플러그인 검증

**Step 1: plugin-validator 에이전트로 검증**

plugin-dev:plugin-validator 에이전트를 호출하여 전체 플러그인 구조 검증:
- 매니페스트 유효성
- 디렉토리 구조 규칙 준수
- 컴포넌트 네이밍 컨벤션
- 스킬/커맨드/에이전트 프론트매터 유효성

**Step 2: skill-reviewer 에이전트로 스킬 품질 검증**

plugin-dev:skill-reviewer 에이전트를 호출하여:
- SKILL.md 트리거 설명 품질
- Progressive disclosure 준수
- 본문 작성 스타일

**Step 3: 발견된 이슈 수정**

검증에서 나온 critical/warning 이슈를 수정한다.

**Step 4: 커밋**

```bash
git add -A .claude/plugins/local/ui-designer/
git commit -m "fix(ui-designer): 검증 이슈 수정"
```

---

## Task 14: 통합 테스트 및 최종 확인

**Step 1: 플러그인 로드 확인**

```bash
ls -la .claude/plugins/local/ui-designer/.claude-plugin/plugin.json
ls -la .claude/plugins/local/ui-designer/skills/ui-design-guide/SKILL.md
ls -la .claude/plugins/local/ui-designer/commands/
ls -la .claude/plugins/local/ui-designer/agents/
ls -la .claude/plugins/local/ui-designer/skills/ui-design-guide/references/
```

모든 파일이 존재하고 올바른 위치에 있는지 확인.

**Step 2: references/ 문서 상호 참조 검증**

- component-catalog.md의 shadcn-mapping이 실제 shadcn 컴포넌트와 일치하는지 확인
- page-templates.md의 컴포넌트 참조가 component-catalog.md에 존재하는지 확인
- qa-templates.md의 페이지 유형이 page-templates.md와 일치하는지 확인

**Step 3: 최종 커밋**

```bash
git add -A .claude/plugins/local/ui-designer/
git commit -m "feat(ui-designer): 플러그인 v0.1.0 완성"
```

---

## 작업 요약

| Task | 내용 | 예상 파일 |
|------|------|----------|
| 1 | 플러그인 스캐폴드 | plugin.json + 디렉토리 |
| 2 | component-catalog.md | 47종 컴포넌트 카탈로그 |
| 3 | layout-patterns.md | 그리드/반응형/배치 패턴 |
| 4 | page-templates.md | 8종 페이지 표준 구성 |
| 5 | qa-templates.md | 질문 + 추천 + 예시 템플릿 |
| 6 | design-principles.md | 정적 원칙 + Vercel 가이드라인 연동 |
| 7 | SKILL.md | 스킬 (자동 감지) |
| 8 | ui-design.md | /ui-design 커맨드 |
| 9 | ui-analyze.md | /ui-analyze 커맨드 |
| 10 | ui-consultant.md | 설계 상담 에이전트 |
| 11 | ui-analyzer.md | 프로젝트 분석 에이전트 |
| 12 | README.md | 문서 |
| 13 | 검증 | plugin-validator + skill-reviewer |
| 14 | 통합 테스트 | 최종 확인 |
