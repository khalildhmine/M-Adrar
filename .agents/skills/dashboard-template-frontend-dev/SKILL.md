---
name: frontend-dev
description: "React 컴포넌트, Next.js 페이지, shadcn/ui 등 프론트엔드 개발 시 PERF/COMP/UI 규칙을 자동 적용한다."
---

# Frontend Development Skill

## Project-Specific Rules

### Performance (PERF-001 ~ PERF-004)
See `references/perf-rules.md` for full details.
- PERF-001: Parallelize independent I/O with `Promise.all` (MUST)
- PERF-002: Default to Server Components, minimize Client Components (MUST)
- PERF-003: Structure components to parallelize server fetches (SHOULD)
- PERF-004: No barrel imports; lazy-load heavy components with `next/dynamic` (MUST)

### Component Design (COMP-001 ~ COMP-004)
See `references/comp-rules.md` for full details.
- COMP-001: No boolean prop proliferation — use explicit variants (MUST)
- COMP-002: Complex UI uses compound component pattern (SHOULD)
- COMP-003: UI components don't know state implementation details (MUST)
- COMP-004: Prefer React 19 APIs (`ref` prop, `use(Context)`) for new code (SHOULD)

### UI/UX/Accessibility (UI-001 ~ UI-004)
See `references/ui-rules.md` for full details.
- UI-001: aria-label on icon buttons, label on inputs, focus-visible preserved (MUST)
- UI-002: Form fields have name/autocomplete/type, errors adjacent to field (MUST)
- UI-003: Respect prefers-reduced-motion, use transform/opacity, no `transition: all` (MUST)
- UI-004: Truncate long text, virtualize 50+ lists, use `Intl.*` for formatting (SHOULD)

## Tech Stack
- Next.js 16 App Router + React 19 + TypeScript 5
- TailwindCSS 4 + shadcn/ui + lucide-react + Framer Motion
- react-hook-form + zod (forms)
- TanStack Query (server state) + zustand (UI state)

## State Management Rules
- STATE-001: TanStack Query staleTime/gcTime per domain; no blanket invalidate after mutation
- STATE-002: zustand for UI-only global state (sidebar, theme, filters); never store server data

## Utility Rules
- UTIL-001: Share zod schemas between API and form; server re-validates same schema
- UTIL-002: `date-fns + Intl` for dates, `ts-pattern` for exhaustive matching, `es-toolkit` for utils

## Storybook Rules
- DS-001: Reusable UI components (`src/components/ui`, feature shared) MUST have Storybook stories (MUST)
- DS-002: Minimum scenarios: `default`, `loading`, `empty`, `error`, `long-content` (MUST)
- DS-003: Include keyboard navigation, focus, reduced-motion stories (SHOULD)

## Architecture Rules (ARCH-001 ~ ARCH-003)
- ARCH-001: Layer boundaries (MUST)
  - `src/app/**` — Routing, layouts, thin adapters
  - `src/features/**` — Domain logic
  - `src/lib/**` — Infrastructure (Supabase, utils)
  - `src/components/**` — Shared UI components
- ARCH-002: Dependency direction `app -> features -> lib` only (MUST)
  - Forbidden: `features -> app`, `lib -> app`, domain code referencing specific pages/routes
- ARCH-003: Monorepo-ready placement (MUST)
  - `src/components/ui/*` -> future `packages/ui`
  - `src/lib/supabase/*` -> future `packages/infra-supabase`
  - `src/features/*` -> future `packages/domain-*`

## Required External Skills
Actively consult these skills when writing or reviewing frontend code:
- `vercel-react-best-practices` — 58 performance rules (async, bundle, server, rerender). Cross-reference with PERF rules above.
- `vercel-composition-patterns` — Component architecture, state management, React 19 APIs. Cross-reference with COMP rules above.
- `web-design-guidelines` — Accessibility, UX quality, interface design principles. Cross-reference with UI rules above.
