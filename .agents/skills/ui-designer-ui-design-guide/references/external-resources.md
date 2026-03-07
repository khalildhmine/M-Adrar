# 외부 UI 리소스 가이드

ui-designer 플러그인이 참조하는 외부 리소스 목록과 사용 정책.

## 아이콘 정책

### 기본: Lucide (필수)

특별한 요청이 없으면 **항상 Lucide 아이콘을 사용**한다.

- 패키지: `lucide-react`
- 공식 사이트: https://lucide.dev/
- 설치: `npx shadcn@latest add [component]` 시 자동 포함 (shadcn/ui 기본 의존성)
- 사용: `import { IconName } from 'lucide-react'`

### 대안 아이콘 (사용자가 명시적으로 요청한 경우에만)

| 라이브러리 | 패키지 | 사용 시기 |
|-----------|--------|----------|
| Radix Icons | `@radix-ui/react-icons` | Radix 원본 디자인 필요 시 |
| Heroicons | `@heroicons/react` | Tailwind UI 기반 디자인 시 |
| Phosphor Icons | `@phosphor-icons/react` | 다양한 weight 옵션 필요 시 |

---

## 외부 템플릿 & 블록 리소스

### 특수 페이지용 리소스 (ui-researcher 에이전트가 리서치)

| 사이트 | URL | 특징 | 적합한 경우 |
|--------|-----|------|------------|
| Vercel Templates | https://vercel.com/templates | Next.js 공식 템플릿 | 풀 페이지 구조 참고 |
| shadcnblocks | https://www.shadcnblocks.com/ | shadcn 기반 섹션 블록 | 랜딩 섹션 조합 |
| shadcn/ui Blocks | https://ui.shadcn.com/blocks | 공식 블록 컬렉션 | 표준 UI 패턴 |
| shadcnui-blocks | https://www.shadcnui-blocks.com/ | 커뮤니티 블록 | 다양한 변형 |

### batchtool 리소스 (선택적 리서치)

| 사이트 | URL | 특징 | 리서치 시기 |
|--------|-----|------|------------|
| shadcn batchtool | https://shadcn.batchtool.com/ | shadcn 확장 컴포넌트 | UI 설계 구조 참고 필요 시 |

batchtool 리서치는 **사용자 승인 후**에만 실행한다:
- 트리거: ui-consultant가 설계 중 추가 컴포넌트 참고가 필요하다고 판단할 때
- 프로세스: 사용자에게 리서치 여부를 물어본 후 승인 시 ui-researcher 호출

---

## 특수 페이지 판별 기준

다음 신호 중 하나 이상이 감지되면 특수 페이지로 분류하고 외부 리소스 리서치를 제안한다:

1. **복잡한 마케팅/랜딩 페이지**: Hero + Features + Testimonials + CTA 등 다단계 섹션
2. **특수 인터랙션**: 애니메이션, 스크롤 이펙트, 패럴랙스 요청
3. **키워드 신호**: "화려하게", "인상적으로", "마케팅용", "프로모션", "세일즈"
4. **page-templates.md 표준 구성 초과**: 표준 템플릿으로 설계가 부족하다고 판단될 때
5. **복합 섹션 요구**: 5개 이상의 이질적 섹션 조합

---

## WebFetch 사용 가이드

외부 리소스 리서치 시 WebFetch 실패 가능성을 대비한다:

- 리서치 실패 시: "사이트 접근 불가. 수동으로 확인해주세요: [URL]" 메시지 출력
- 부분 성공 시: 접근 가능한 리소스만 추천
- 대안: 알려진 컴포넌트 이름/패턴을 직접 추천
