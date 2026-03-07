# ui-designer

UI 페이지 설계 및 구현을 위한 Claude Code 플러그인.
프로젝트를 분석하고, 컴포넌트를 추천하고, 레이아웃을 설계하고, 코드를 생성한다.

## 핵심 특징

- **프로젝트 맥락 인식**: 기존 코드를 분석하여 스타일/패턴에 맞는 구체적 추천
- **인터랙티브 Q&A**: 질문 + 설명 + 추천으로 모호함 완전 제거
- **하이브리드 워크플로우**: 자동 감지 (스킬) + 명시적 호출 (커맨드)
- **검증 포함**: Vercel Web Interface Guidelines로 생성 코드 자동 검증

## 설치

```bash
# 로컬 플러그인으로 설치 (프로젝트 내)
# .claude/plugins/local/ui-designer/ 디렉토리에 위치

# 또는 별도 위치에서 플러그인 디렉토리 지정
claude --plugin-dir /path/to/ui-designer
```

## 빠른 시작

### 1단계: 프로젝트 분석

```
/ui-analyze
```

프로젝트의 라우트, 컴포넌트, 레이아웃, 스타일을 스캔하고 `.ui-designer/analysis.json`에 저장한다.

### 2단계: UI 설계

```
/ui-design landing
/ui-design dashboard
/ui-design "학원 SaaS Hero 섹션"
```

페이지 유형을 지정하거나 자유롭게 설명하면 인터랙티브 Q&A → 설계안 → 코드 생성 순서로 진행한다.

### 3단계: 자동 감지

일반 대화에서 "로그인 페이지 만들어줘", "대시보드에 차트 추가해줘" 등 UI 작업을 요청하면 스킬이 자동으로 활성화된다.

## 커맨드

| 커맨드 | 설명 |
|--------|------|
| `/ui-design [type\|description]` | UI 설계 전체 워크플로우 |
| `/ui-analyze [--refresh]` | 프로젝트 UI 구조 분석 |

## 지원 페이지 유형

| 유형 | 키워드 | 용도 |
|------|--------|------|
| Landing | landing, 랜딩, 홈페이지 | 마케팅, 서비스 소개 |
| Dashboard | dashboard, 대시보드 | 데이터 요약, 모니터링 |
| Settings | settings, 설정 | 사용자/시스템 설정 |
| Auth | auth, login, 로그인 | 인증 (로그인/회원가입) |
| CRUD List | crud, 목록, 게시판 | 데이터 목록 조회 |
| Detail | detail, 상세 | 단일 항목 상세 보기 |
| Pricing | pricing, 요금 | 요금제 비교/선택 |
| Form | form, 폼, 입력 | 데이터 입력/생성 |

## 워크플로우

```
[0단계] 프로젝트 분석
  → 라우트, 컴포넌트, 레이아웃, 스타일 스캔
  → .ui-designer/analysis.json 저장

[1단계] 요구사항 수집
  → 페이지 유형 판별
  → 인터랙티브 Q&A (질문 + 설명 + 추천 + 선택지)
  → "추천대로" 응답 시 일괄 적용

[2단계] 설계 제안
  → 분석 데이터 + Q&A 기반 설계안 생성
  → ASCII 레이아웃 + 컴포넌트 목록 + 파일 구조
  → 사용자 승인

[3단계] 코드 생성
  → 기존 프로젝트 패턴/컨벤션 준수
  → Vercel Web Interface Guidelines 검증
  → 결과 보고
```

## 지식 베이스

`skills/ui-design-guide/references/` 디렉토리의 마크다운 문서가 핵심 지식이다.

| 파일 | 내용 |
|------|------|
| `component-catalog.md` | 58종 컴포넌트 의사결정 가이드 (use-when, avoid-when, pairs-with, shadcn 매핑) |
| `layout-patterns.md` | 그리드, 반응형, 6종 레이아웃 패턴, 간격 체계 |
| `page-templates.md` | 8종 페이지 유형별 표준 구성, ASCII 스켈레톤 |
| `qa-templates.md` | 페이지 유형별 인터랙티브 질문 템플릿 |
| `design-principles.md` | 디자인 원칙 + Vercel Guidelines 검증 |

## 다른 AI 도구에서 사용하기

references/ 디렉토리의 마크다운 문서는 도구 독립적이므로 어떤 AI 도구에서든 참조할 수 있다.

### Codex CLI

프로젝트의 `AGENTS.md`에 다음을 추가한다:

```markdown
## UI Design Guidelines

UI 페이지를 생성하거나 레이아웃을 구성할 때 반드시 다음 문서를 참조하세요:

- 컴포넌트 선택: .claude/plugins/local/ui-designer/skills/ui-design-guide/references/component-catalog.md
- 레이아웃 패턴: .claude/plugins/local/ui-designer/skills/ui-design-guide/references/layout-patterns.md
- 페이지 템플릿: .claude/plugins/local/ui-designer/skills/ui-design-guide/references/page-templates.md
- 질문 템플릿: .claude/plugins/local/ui-designer/skills/ui-design-guide/references/qa-templates.md
- 디자인 원칙: .claude/plugins/local/ui-designer/skills/ui-design-guide/references/design-principles.md

프로젝트 분석 데이터: .ui-designer/analysis.json (없으면 먼저 프로젝트를 분석하세요)
```

### Antigravity / 기타 AI 도구

references/ 문서를 컨텍스트로 로드한다:

```bash
# 방법 1: 프로젝트 루트에 심볼릭 링크
ln -s .claude/plugins/local/ui-designer/skills/ui-design-guide/references docs/ui-design-guide

# 방법 2: 각 도구의 컨텍스트 설정에서 직접 경로 지정
```

## 기술 스택

이 플러그인은 **Next.js + shadcn/ui + Tailwind CSS** 환경에 최적화되어 있다.
