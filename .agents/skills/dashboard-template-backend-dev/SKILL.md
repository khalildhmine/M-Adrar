---
name: backend-dev
description: "API 라우트, Supabase, 마이그레이션, RLS 등 백엔드 개발 시 API/SB/DATA 규칙을 자동 적용한다."
---

# Backend Development Skill

## Project-Specific Rules

### API Rules (API-001 ~ API-004)
See `references/api-rules.md` for full details.
- API-001: All APIs under `src/app/api/v1/**/route.ts` (MUST)
- API-002: Input via `zod.safeParse`, status codes 400/401/403/500 (MUST)
- API-003: List APIs use cursor pagination (`id > cursor`, `limit + 1`) (MUST)
- API-004: Route Handlers are thin adapters; delegate to `features`/`lib` (MUST)

### Supabase Rules (SB-001 ~ SB-004)
See `references/supabase-rules.md` for full details.
- SB-001: Server context uses `createSupabaseServerClient`, browser uses `createSupabaseBrowserClient` (MUST)
- SB-002: Multi-tenant tables require RLS + FORCE RLS (MUST)
- SB-003: Schema changes are migration-only; `auth.uid()` -> `(select auth.uid())` (MUST)
- SB-004: Seed scripts are idempotent; fail-fast on missing prerequisites (MUST)

### Data Rules (DATA-001 ~ DATA-006)
See `references/supabase-rules.md` for full details.
- DATA-001: Final authority for data access is Supabase RLS (MUST)
- DATA-002: User CRUD goes through Supabase server client + RLS (MUST)
- DATA-003: Drizzle ORM for complex queries (3+ JOINs, window functions, aggregations) and reports; Supabase Client remains default for CRUD (MUST)
- DATA-004: NextAuth as optional auth provider replacement; Supabase Auth + RLS is default. When using NextAuth, RLS must still enforce all access control (MUST)
- DATA-005: Schema source of truth is `supabase/migrations/*.sql` (MUST)
- DATA-006: Index WHERE/JOIN/FK columns; cursor pagination; upsert via ON CONFLICT (SHOULD)

### Migration Rules
See `references/migration-rules.md` for full details.

## Tech Stack
- Next.js 16 Route Handlers (`/api/v1/**`)
- Supabase Auth + Postgres + RLS (default auth)
- Drizzle ORM (complex queries, Edge compatible) + Supabase Client (default CRUD)
- zod (input validation)
- TanStack Query (client-side server state)
- Optional: NextAuth (alternative auth provider, RLS still enforced)

## Observability Rules (OBS-001 ~ OBS-002)
- OBS-001: Event names use domain prefix (`academy.created`, `enrollment.added`); no PII (MUST)
- OBS-002: PostHog script lazy-loaded; critical conversion events logged server-side too (MUST)

## Testing Rules (QA-001 ~ QA-003)
- QA-001: New rules/structures/policies must have corresponding contract tests (MUST)
- QA-002: PR gate: `npm run check && npm run test && npm run build` must pass (MUST)
- QA-003: Auth/permission/DB policy changes always require docs + tests (MUST)

## Architecture Rules (ARCH-001 ~ ARCH-003)
- ARCH-001: Layer boundaries (MUST)
  - `src/app/**` — Routing, HTTP entry points, layouts
  - `src/features/**` — Domain logic
  - `src/lib/**` — External integrations/infrastructure (Supabase, storage, util)
- ARCH-002: Dependency direction `app -> features -> lib` only (MUST)
  - Forbidden: `features -> app`, `lib -> app`, domain code referencing specific pages/routes
- ARCH-003: Monorepo-ready placement (MUST)
  - `src/components/ui/*` -> future `packages/ui`
  - `src/lib/supabase/*` -> future `packages/infra-supabase`
  - `src/features/*` -> future `packages/domain-*`

## Deploy Rules (DEPLOY)
- DEPLOY-001: Environment variables separated by role (MUST)
  - Public: `NEXT_PUBLIC_*` only
  - Server-only: `SUPABASE_SERVICE_ROLE_KEY` etc. — never expose to client
- DEPLOY-002: PR gate `check + test + build` must pass before deploy (MUST)
- Deploy methods:
  - Quick preview: `vercel-deploy-claimable` skill (no auth required)
  - Production: `vercel` plugin (`/vercel:deploy`) with authenticated Vercel CLI

## Required External Skills
Actively consult when writing or reviewing backend code:
- `supabase-postgres-best-practices` — Query performance, connection management, security/RLS, schema design. Cross-reference with SB/DATA rules above.
