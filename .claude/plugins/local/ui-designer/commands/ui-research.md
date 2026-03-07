---
name: ui-research
description: "외부 UI 리소스 리서치. 특수 페이지 템플릿 탐색 또는 batchtool 컴포넌트 발굴을 실행한다."
argument-hint: "[template|component|all] 또는 자유 설명"
---

# UI Research 커맨드

외부 UI 리소스를 리서치하여 프로젝트에 맞는 템플릿, 블록, 컴포넌트를 추천한다.

## 인자 파싱

사용자 인자를 분석한다:

| 인자 | 동작 |
|------|------|
| `template` | ui-template-scout 스킬 실행 — 외부 템플릿/블록 리서치 |
| `component` | ui-component-scout 스킬 실행 — batchtool 컴포넌트 탐색 |
| `all` | template → component 순서로 두 리서치 모두 실행 |
| 자연어 설명 | 설명을 분석하여 적합한 모드 판별 |
| 없음 | 대화형으로 리서치 유형 선택 |

## 실행 순서

### 인자 없음: 대화형 선택

```
어떤 리서치를 실행할까요?

  a) template — 외부 템플릿/블록 리서치
     (Vercel Templates, shadcnblocks.com, ui.shadcn.com/blocks, shadcnui-blocks.com)
  b) component — batchtool 컴포넌트 탐색
     (shadcn.batchtool.com에서 shadcn 확장 컴포넌트 발굴)
  c) all — 두 리서치 모두 실행
  d) 취소
```

### template 모드

1. 프로젝트 분석 데이터 로드 (`.ui-designer/analysis.json` 있는 경우)
2. 어떤 페이지/기능을 위한 리서치인지 확인 (없으면 질문)
3. ui-template-scout 스킬 워크플로우 실행:
   - 자동으로 특수 페이지 여부 판단
   - ui-researcher 에이전트를 TEMPLATE 모드로 호출
   - 결과 제시 → 선택 → 도입 안내

**예시 흐름**:
```
어떤 페이지를 위한 템플릿을 찾고 계신가요?
예: "SaaS 랜딩 페이지", "마케팅 홈페이지", "프로모션 페이지"

> SaaS 랜딩 페이지, 애니메이션 포함

[리서치 실행 중...]
[결과 제시]
```

### component 모드

1. 어떤 컴포넌트가 필요한지 확인 (없으면 질문)
2. 사용자에게 리서치 승인 요청:
   ```
   shadcn.batchtool.com에서 "[요구사항]" 관련 컴포넌트를 탐색하겠습니다.
   진행할까요? (y/n)
   ```
3. 승인 시 ui-component-scout 스킬 워크플로우 실행:
   - ui-researcher 에이전트를 COMPONENT 모드로 호출
   - 결과 평가 및 제시 → 도입 결정

**예시 흐름**:
```
어떤 컴포넌트를 찾고 계신가요?
예: "date range picker", "kanban board", "rich text editor"

> data table with column pinning

shadcn.batchtool.com에서 "data table with column pinning" 관련 컴포넌트를 탐색하겠습니다.
진행할까요? (y/n)

> y

[리서치 실행 중...]
[결과 평가 및 제시]
```

### all 모드

template 모드 완료 후 component 모드를 순서대로 실행한다.

template 완료 후:
```
템플릿 리서치가 완료되었습니다.
이어서 batchtool 컴포넌트 탐색도 진행할까요? (y/n)
```

## 프로젝트 분석 활용

`.ui-designer/analysis.json`이 있으면 로드하여 활용한다:
- 기술 스택 정보 → 호환성 필터링에 활용
- 기존 컴포넌트 목록 → 중복 추천 방지
- 스타일 컨벤션 → 스타일 일관성 체크에 활용

없는 경우: 기본값 "Next.js + shadcn/ui + Tailwind CSS" 사용

## 완료 후 안내

리서치 완료 시 다음을 안내한다:

```
리서치가 완료되었습니다.

도입이 결정된 리소스:
- [리소스명]: [도입 방법 요약]

다음 단계:
- UI 설계를 계속하려면: /ui-designer:ui-design [page-type]
- 추가 리서치: /ui-resource-scout:ui-research [template|component]
```
