---
name: ui-component-scout
description: >
  shadcn.batchtool.com에서 shadcn/ui 확장 컴포넌트를 탐색하는 선택적 리서치 스킬.
  자동 트리거되지 않으며, 다음 두 경우에만 활성화된다:
  1. 사용자가 /ui-resource-scout:ui-research component 커맨드를 명시적으로 실행한 경우
  2. ui-designer의 ui-consultant 에이전트가 설계 중 추가 컴포넌트가 필요하다고 판단하고
     ui-design 커맨드가 사용자 승인을 받은 경우

  NEVER auto-trigger. ALWAYS requires explicit invocation or user approval via ui-designer workflow.

  This skill researches shadcn.batchtool.com only.
  For external template research, use ui-template-scout instead.
---

# UI Component Scout

shadcn.batchtool.com에서 shadcn/ui 확장 컴포넌트를 탐색하고 추천하는 스킬.

## 핵심 원칙

1. **절대 자동 트리거 금지**: 항상 명시적 호출 또는 사용자 승인 후에만 실행
2. **batchtool 전담**: 이 스킬은 shadcn.batchtool.com만 리서치한다
3. **목적 명확화 우선**: 리서치 전 어떤 컴포넌트가 필요한지 명확히 파악
4. **적합성 평가**: 발견한 컴포넌트가 현재 프로젝트에 실제로 필요한지 판단

## 진입 경로

### 경로 A: 명시적 커맨드

`/ui-resource-scout:ui-research component` 실행 시:
- 사용자에게 어떤 컴포넌트가 필요한지 질문
- 요구사항 파악 후 즉시 리서치 실행

### 경로 B: ui-designer 연동

ui-designer의 ui-consultant가 `[BATCHTOOL_RESEARCH_SUGGESTED]: [이유]` 신호를 보내고
사용자가 승인한 경우:
- 승인과 함께 전달된 컨텍스트(어떤 컴포넌트가 필요한지)를 사용
- 바로 리서치 실행 (추가 질문 없이)

## 워크플로우

### 1단계: 요구사항 파악 (경로 A에서만)

경로 A(명시적 커맨드)에서 진입한 경우:

```
어떤 컴포넌트를 찾고 계신가요?

예시:
- "data table with column pinning and sorting"
- "calendar with time picker"
- "kanban board"
- "rich text editor"
- "date range picker"

현재 프로젝트의 주요 기술 스택: [analysis.json에서 로드 또는 "Next.js + shadcn/ui + Tailwind CSS"]
```

### 2단계: 리서치 실행

`ui-researcher` 에이전트를 COMPONENT 모드로 호출한다:

```
MODE: COMPONENT
REQUIREMENTS: [파악된 컴포넌트 요구사항]
PROJECT_STACK: [analysis.json 또는 기본값]
CONTEXT: [추가 컨텍스트]
```

### 3단계: 결과 평가 및 제시

에이전트가 반환한 결과에서 다음을 평가한다:

**적합성 기준**:
- 현재 프로젝트의 기술 스택과 호환되는가?
- shadcn/ui 스타일 가이드와 일관성이 있는가?
- 적극적으로 유지보수되고 있는가?
- 설치/도입이 현실적으로 가능한가?

평가 결과를 추가하여 사용자에게 제시:

```
## batchtool 컴포넌트 탐색 결과

[ui-researcher 에이전트 결과]

### 적합성 평가

| 컴포넌트 | 기술 호환성 | shadcn 일관성 | 도입 용이성 | 종합 |
|---------|-----------|-------------|-----------|------|
| [이름]  | ✅/⚠️/❌  | ✅/⚠️/❌    | ✅/⚠️/❌  | 추천/보류/비추천 |

### 결론
[채택 여부 및 이유 2-3줄]
```

### 4단계: 도입 결정

```
도입할 컴포넌트를 선택해주세요:
  a) [컴포넌트명] 도입 — [도입 방법 요약]
  b) [컴포넌트명] 도입 — [도입 방법 요약]
  c) 도입하지 않음 (현재 설계 유지)
  d) 다른 키워드로 재탐색
```

선택 후:
- **도입 결정 시**: 구체적 설치/통합 방법 안내, 기존 설계와의 통합 포인트 설명
- **미도입 결정 시**: "현재 설계를 유지합니다" 메시지 후 기존 워크플로우 복귀

## batchtool 리서치 불가 처리

WebFetch 실패 시:

```
shadcn.batchtool.com 접근 불가.

대신 공식 shadcn/ui에서 유사 기능 확인을 권장합니다:
- 공식 컴포넌트: https://ui.shadcn.com/docs/components/[component-name]
- 커뮤니티 확장: https://github.com/birobirobiro/awesome-shadcn-ui

필요한 컴포넌트를 직접 알려주시면 대안을 찾아드리겠습니다.
```

## 참조 문서

- `references/batchtool-guide.md` — batchtool 사이트 구조, 알려진 컴포넌트 카테고리
- `.ui-designer/analysis.json` — 프로젝트 기술 스택
