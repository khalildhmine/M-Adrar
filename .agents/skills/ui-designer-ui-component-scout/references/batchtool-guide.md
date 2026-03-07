# shadcn.batchtool.com 리서치 가이드

ui-component-scout 스킬이 batchtool 리서치에 사용하는 참조 문서.

## 사이트 개요

**URL**: https://shadcn.batchtool.com/

**역할**: shadcn/ui 공식 컴포넌트에서 커버하지 않는 확장 컴포넌트 모음
- 커뮤니티가 제작한 shadcn 스타일 호환 컴포넌트
- 공식 shadcn/ui 레지스트리에 없는 고급 컴포넌트 제공
- `npx shadcn@latest add [url]` 형식 또는 소스 복사로 설치

## 알려진 컴포넌트 카테고리

### 데이터 테이블 확장

shadcn/ui의 기본 DataTable에서 제공하지 않는 고급 기능:
- Column pinning (열 고정)
- Virtual scrolling (대용량 데이터)
- Inline editing
- Row grouping
- Advanced filtering UI

**리서치 키워드**: "data-table", "table", "tanstack"

### 날짜/시간 컴포넌트

- Date range picker
- Time picker
- Calendar with events
- DateTime picker (날짜+시간 통합)

**리서치 키워드**: "date", "calendar", "time", "datetime"

### 폼 고급 컴포넌트

- Multi-step form
- File upload with preview
- Rich text editor (Tiptap 기반)
- Code editor (Monaco/CodeMirror)
- Signature pad

**리서치 키워드**: "form", "upload", "editor", "rich-text"

### 레이아웃/내비게이션 확장

- Kanban board
- Drag-and-drop list
- Resizable panels (이미 shadcn에 있지만 확장 버전)
- Multi-column layout

**리서치 키워드**: "kanban", "drag", "dnd", "layout"

### 차트/시각화

shadcn/ui Recharts 래퍼 외 추가 차트:
- Gantt chart
- Timeline
- Heatmap
- Tree view / Organization chart

**리서치 키워드**: "chart", "gantt", "timeline", "tree"

### 기타 고급 컴포넌트

- Tour / Onboarding guide
- Spotlight search (Cmd+K 확장)
- Notification center
- Comment / Thread UI
- Rating / Review component

**리서치 키워드**: "tour", "search", "notification", "comment", "rating"

## WebFetch 리서치 전략

### 직접 URL 접근

```
https://shadcn.batchtool.com/
```

사이트에서 컴포넌트 목록과 각 컴포넌트 페이지를 탐색한다.

### 실패 시 대안

batchtool 접근 불가 시 대안 검색:

1. **awesome-shadcn-ui**: https://github.com/birobirobiro/awesome-shadcn-ui
   - shadcn/ui 생태계 확장 컴포넌트 종합 목록

2. **공식 shadcn 레지스트리**: https://ui.shadcn.com/docs/components
   - 최신 공식 컴포넌트 목록 확인

3. **shadcn-extension**: https://shadcn-extension.vercel.app/
   - 추가 확장 컴포넌트

## 도입 방법

### npx CLI (권장)

```bash
npx shadcn@latest add [component-url]
```

### 소스 코드 복사

1. batchtool 컴포넌트 페이지에서 소스 코드 복사
2. `components/ui/[component-name].tsx`에 저장
3. 필요한 의존성 설치

## 호환성 체크리스트

batchtool 컴포넌트 도입 전 확인:

- [ ] Next.js App Router 호환
- [ ] React 18/19 호환
- [ ] shadcn/ui 스타일 변수(`--primary`, `--radius` 등) 사용
- [ ] Tailwind CSS 기반
- [ ] TypeScript 타입 정의 포함
- [ ] 마지막 업데이트 날짜 확인 (6개월 이내 권장)
