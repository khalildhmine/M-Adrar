# Unified AI/PR Checklist

Source: `docs/architecture/development-rules.md` Section 13, `docs/architecture/nextjs-best-case-rules.md` Section 11

## Backend Checklist (development-rules.md)

1. [ ] New API is under `/api/v1/**`? (API-001)
2. [ ] Input validation via `zod.safeParse` with proper status codes (400/401/403/500)? (API-002)
3. [ ] DB access follows RLS-first principle? (SB-002, DATA-001)
4. [ ] FK/indexes/policies included in migration? (DATA-005, DATA-006)
5. [ ] Independent I/O parallelized (no waterfalls)? (PERF-001)
6. [ ] Heavy components lazy-loaded? (PERF-004)
7. [ ] Monorepo-compatible boundaries maintained? (ARCH-003)

## Frontend Checklist (nextjs-best-case-rules.md)

1. [ ] API uses `/api/v1/**` + `zod.safeParse`? (API-001, API-002)
2. [ ] Independent I/O parallelized? (PERF-001)
3. [ ] RSC boundary respected, serialization payload minimized? (PERF-002)
4. [ ] Components use composition/variants instead of boolean prop branching? (COMP-001)
5. [ ] Forms/buttons/focus/motion meet accessibility rules? (UI-001~003)
6. [ ] Supabase RLS/FK/indexes/policies in migration? (SB-003, DATA-005)
7. [ ] Drizzle ORM used only for complex queries (3+ JOINs, aggregations), with authorization verified at service layer? (DATA-003)
8. [ ] If NextAuth is used, RLS still enforces all data access and user sync is documented? (DATA-004)
8. [ ] Storybook scenarios (default/loading/empty/error) exist? (DS-002)
9. [ ] PostHog events follow domain naming, no PII? (OBS-001)
10. [ ] Tests pass (`check`, `test`, `build`)? (QA-001, QA-002)

## Supabase-Specific Checklist (supabase-route-and-monorepo-guide.md)

1. [ ] New API under `src/app/api/v1`? (API-001)
2. [ ] Input validation + status codes correct? (API-002)
3. [ ] List API uses cursor pagination (not OFFSET)? (API-003)
4. [ ] New tables/queries have required indexes? (DATA-006)
5. [ ] Multi-tenant tables have RLS + FORCE RLS + policies? (SB-002)
6. [ ] User reference columns use `auth.users(id)` FK? (SB-003)
7. [ ] RLS policy functions use `(select auth.uid())` pattern? (SB-003)
8. [ ] Code maintains monorepo-portable boundaries? (ARCH-003)

## State/Utility Checklist (nextjs-best-case-rules.md)

1. [ ] TanStack Query staleTime/gcTime set per domain, no blanket invalidate? (STATE-001)
2. [ ] Zustand only for UI state, no server data stored? (STATE-002)
3. [ ] Zod schemas shared between API and form? (UTIL-001)

## Storybook Checklist (nextjs-best-case-rules.md)

1. [ ] Reusable UI components have Storybook stories? (DS-001)
2. [ ] Storybook scenarios (default/loading/empty/error) exist? (DS-002)

## Observability Checklist (nextjs-best-case-rules.md)

1. [ ] PostHog events follow domain naming, no PII? (OBS-001)
2. [ ] PostHog script lazy-loaded? (OBS-002)

## Testing Checklist (development-rules.md)

1. [ ] New rules/structures have corresponding contract tests? (QA-001)
2. [ ] Tests pass (`check`, `test`, `build`)? (QA-002)
3. [ ] Auth/permission changes have docs + tests? (QA-003)

## Architecture Checklist

1. [ ] Layer boundaries respected (`app`/`features`/`lib`/`components`)? (ARCH-001)
2. [ ] Dependency direction: `app -> features -> lib` (no reverse imports)? (ARCH-002)
3. [ ] Code maintains monorepo-portable boundaries? (ARCH-003)

## Deploy Checklist

1. [ ] Environment variables separated by role (`NEXT_PUBLIC_*` vs server-only)? (DEPLOY-001)
2. [ ] PR gate `check + test + build` passes? (DEPLOY-002)

## Review Priority

1. **Security/Data integrity** — RLS, auth, input validation
2. **Performance** — Waterfalls, bundle size, RSC boundaries
3. **Architecture** — Dependency direction, layer boundaries
4. **Consistency** — Naming, patterns, state management
