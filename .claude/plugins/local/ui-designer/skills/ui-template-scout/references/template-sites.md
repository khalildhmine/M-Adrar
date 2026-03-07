# 외부 템플릿 사이트 가이드

ui-template-scout 스킬이 리서치에 사용하는 사이트별 특성과 팁.

## 1순위: ui.shadcn.com/blocks

**URL**: https://ui.shadcn.com/blocks

**특징**:
- shadcn/ui 공식 블록 컬렉션
- Next.js App Router 기반으로 검증된 코드
- CLI 설치 지원: `npx shadcn@latest add [block-name]`

**주요 블록 카테고리**:
- Sidebar layouts (sidebar-01 ~ sidebar-16)
- Login/Auth pages (login-01 ~ login-04)
- Dashboard layouts
- Charts with data display

**리서치 팁**:
- `/blocks` 페이지에서 전체 목록 확인
- 블록명을 알면 `npx shadcn@latest add [name]`으로 바로 설치 가능
- 코드 소스: https://github.com/shadcn-ui/ui/tree/main/apps/www/registry/new-york/block

**적합한 경우**: 표준화된 UI 블록, CLI 설치 선호, Next.js 공식 패턴 준수

---

## 2순위: shadcnblocks.com

**URL**: https://www.shadcnblocks.com/

**특징**:
- 섹션 단위 블록 라이브러리 (랜딩 페이지 특화)
- 코드 복사 방식 (CLI 없음)
- 다양한 Hero, Features, Testimonials, CTA 섹션 제공

**주요 섹션 카테고리**:
- Hero sections (다양한 레이아웃)
- Feature grids
- Testimonials / Social proof
- Pricing tables
- CTA sections
- FAQ / Accordion

**리서치 팁**:
- 랜딩 페이지 섹션 조합에 가장 적합
- 섹션별로 선택하여 조합 가능
- Tailwind CSS + shadcn/ui 기반

**적합한 경우**: 복잡한 마케팅 랜딩 페이지, 다단계 섹션 조합

---

## 3순위: shadcnui-blocks.com

**URL**: https://www.shadcnui-blocks.com/

**특징**:
- 커뮤니티 기반 shadcn/ui 블록
- shadcnblocks.com과 유사하지만 다른 스타일 변형 제공
- 코드 복사 방식

**주요 카테고리**:
- Hero sections (다양한 변형)
- Feature sections
- Pricing components
- Contact forms

**적합한 경우**: shadcnblocks.com에서 원하는 스타일 못 찾을 때, 다양한 변형 비교

---

## 4순위: Vercel Templates

**URL**: https://vercel.com/templates

**특징**:
- 풀 페이지/풀 프로젝트 수준 템플릿
- Next.js 공식 지원 (Vercel 제공)
- 다양한 기술 스택 포함

**필터링 팁**:
- Framework: Next.js 필터 적용
- CSS: Tailwind CSS 필터 적용
- 검색어: "shadcn" 또는 "shadcn/ui"

**적합한 경우**: 전체 프로젝트 구조 참고, 풀 페이지 레이아웃 참고

---

## 사이트별 비교 요약

| 사이트 | 단위 | 설치 방식 | 랜딩 특화 | 공식 여부 |
|--------|------|----------|----------|----------|
| ui.shadcn.com/blocks | 블록 | npx CLI | 보통 | 공식 |
| shadcnblocks.com | 섹션 | 코드 복사 | 매우 높음 | 커뮤니티 |
| shadcnui-blocks.com | 섹션 | 코드 복사 | 높음 | 커뮤니티 |
| vercel.com/templates | 전체 | 프로젝트 복사 | 보통 | 공식 |

## Next.js 호환성 확인 포인트

리서치 결과에서 다음을 확인한다:
- App Router 기반인지 (Pages Router 아닌지)
- React 19 / Next.js 15+ 호환 여부
- `"use client"` 지시어 패턴
- Tailwind CSS v4 대응 여부
