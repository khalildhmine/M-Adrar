---
name: ui-template-scout
description: >
  특수 페이지(복잡한 랜딩, 마케팅, 다단계 섹션 구성 등) 요청을 감지하면 자동으로 활성화된다.
  Vercel Templates, shadcnblocks.com, ui.shadcn.com/blocks, shadcnui-blocks.com에서
  Next.js + shadcn/ui 기반 템플릿/블록을 리서치하여 프로젝트에 맞는 리소스를 추천한다.

  TRIGGER when any of these are detected:
  - Complex landing page or marketing page with multiple hero/feature/testimonial sections
  - Requests for animations, scroll effects, or parallax interactions
  - Keywords: "화려하게", "인상적으로", "마케팅용", "프로모션", "세일즈", "임팩트", "wow"
  - 5+ heterogeneous sections requested in a single page
  - User explicitly asks to search external templates or blocks
  - Standard page-templates.md cannot adequately cover the requirement

  DO NOT TRIGGER for:
  - Standard dashboard, settings, auth, CRUD list, detail, pricing, form pages
  - Simple component additions to existing pages
  - Pages that fit within standard templates
---

# UI Template Scout

특수 페이지 요구사항에 맞는 외부 템플릿과 블록 리소스를 탐색하고 추천하는 스킬.

## 트리거 조건 판별

다음 신호 중 하나 이상이 감지되면 이 스킬을 활성화한다.

### 강한 트리거 신호 (즉시 활성화)

| 신호 | 예시 |
|------|------|
| 마케팅/세일즈 랜딩 | "SaaS 랜딩 페이지", "프로모션 페이지", "세일즈 페이지" |
| 복합 섹션 (5개+) | "Hero + Features + Testimonials + Pricing + CTA + FAQ" |
| 특수 인터랙션 | "애니메이션 포함", "스크롤 이펙트", "패럴랙스" |
| 임팩트 키워드 | "화려하게", "인상적으로", "wow 효과", "임팩트 있게" |
| 명시적 외부 요청 | "외부 템플릿 찾아줘", "shadcnblocks에서 찾아줘" |

### 약한 트리거 신호 (판단 필요)

| 신호 | 판단 기준 |
|------|----------|
| 복잡한 랜딩 | 섹션 수 3-4개이지만 각각 복잡한 인터랙션 포함 |
| 비표준 레이아웃 | page-templates.md 표준 구성으로 설계 불충분 |
| "풀페이지" 구성 | 기존 컴포넌트 조합으로는 완성도 부족 판단 |

## 워크플로우

### 1단계: 트리거 감지 및 사용자 제안

특수 페이지로 판별되면 즉시 사용자에게 제안한다:

```
이 페이지는 표준 컴포넌트 조합만으로 설계하기 어려운 특수 페이지로 판단됩니다.

감지된 이유: [판별 근거 1-2줄]

외부 리소스를 리서치하면 더 완성도 높은 설계를 제안드릴 수 있습니다:
- Vercel Templates
- shadcnblocks.com
- ui.shadcn.com/blocks
- shadcnui-blocks.com

리서치를 진행할까요? (y/n)
```

### 2단계: 리서치 실행 (승인 후)

사용자 승인 시 `ui-researcher` 에이전트를 TEMPLATE 모드로 호출한다:

```
MODE: TEMPLATE
REQUIREMENTS: [사용자 요구사항 요약]
PROJECT_STACK: [analysis.json에서 로드한 기술 스택, 없으면 "Next.js + shadcn/ui + Tailwind CSS"]
CONTEXT: [추가 컨텍스트]
```

에이전트가 반환한 결과를 그대로 사용자에게 제시한다.

### 3단계: 결과 제시 및 다음 단계 안내

리서치 결과 제시 후:

```
위 리소스 중 도입할 리소스를 선택해주세요.
선택 후 해당 리소스를 기반으로 설계안을 구체화하겠습니다.

선택지:
  a) [1순위 리소스명] 도입
  b) [2순위 리소스명] 도입
  c) 복수 리소스 조합
  d) 리서치 결과 없이 직접 설계 진행
  e) 다시 리서치 (다른 키워드)
```

### 4단계: 선택된 리소스 기반 설계 안내

선택된 리소스를 바탕으로:
- 도입 방법 (npx 명령 또는 소스 복사) 안내
- 해당 리소스와 프로젝트 기존 스타일의 통합 포인트 설명
- ui-designer의 설계 워크플로우로 자연스럽게 연결

## 거부 처리

사용자가 리서치를 거부하면:
- "알겠습니다. 표준 컴포넌트 조합으로 설계를 진행하겠습니다." 메시지 출력
- 기존 ui-designer 워크플로우(Q&A → 설계안)로 자연스럽게 전환

## 참조 문서

- `references/template-sites.md` — 사이트별 특성, 리서치 팁, 알려진 리소스 목록
- `.ui-designer/analysis.json` — 프로젝트 기술 스택 (있는 경우 로드)
