# Supabase & Data Rules (SB-001~004, DATA-001~006)

Source: `docs/architecture/development-rules.md` Section 7, `docs/architecture/nextjs-best-case-rules.md` Section 6

## SB-001 Client Usage (MUST)

- Server context (cookie-based): `createSupabaseServerClient` from `src/lib/supabase/server.ts`
- Browser context: `createSupabaseBrowserClient` from `src/lib/supabase/client.ts`
- Service role key: server-only routes, minimal scope

```typescript
// Server context
import { createSupabaseServerClient } from '@/lib/supabase/server';
const supabase = await createSupabaseServerClient();

// Browser context
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
const supabase = createSupabaseBrowserClient();
```

## SB-002 Multi-Tenancy Security (MUST)

- Multi-tenant tables: `RLS + FORCE RLS` always enabled.
- App-level guards (proxy/layout) are UX optimization only, NOT the security boundary.

```sql
ALTER TABLE academy_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_enrollments FORCE ROW LEVEL SECURITY;
```

## SB-003 Schema Change Principle (MUST)

- Schema changes are migration-only (never manual DDL in production).
- User reference columns use `auth.users(id)` FK.
- RLS policies use `(select auth.uid())` pattern (NOT bare `auth.uid()`).

```sql
-- Good: Subquery pattern for performance
CREATE POLICY "members_select_own" ON academy_members
  FOR SELECT USING (user_id = (select auth.uid()));

-- Bad: Direct function call (re-evaluated per row)
CREATE POLICY "members_select_own" ON academy_members
  FOR SELECT USING (user_id = auth.uid());
```

## SB-004 Onboarding/Seed Principle (MUST)

- Seed scripts MUST be idempotent (safe for repeated execution).
- Missing prerequisite data triggers fail-fast exception.

```sql
-- Idempotent: ON CONFLICT DO NOTHING
INSERT INTO academies (id, name) VALUES ('fixed-uuid', 'Demo Academy')
ON CONFLICT (id) DO NOTHING;

-- Fail-fast: Missing owner
IF _owner_id IS NULL THEN
  RAISE EXCEPTION 'Owner email % not found in auth.users', _email;
END IF;
```

---

## DATA-001 Single Authority for Access Control (MUST)

Final authority for user data access is Supabase RLS policies. App-level guards are UX-only.

## DATA-002 Supabase-First Path (MUST)

User-facing CRUD uses Supabase server client + RLS. Input via `zod.safeParse`, errors via 400/401/403/500.

## DATA-003 Complex Query Layer — Drizzle ORM (MUST)

Supabase Client is the default for all CRUD operations (RLS auto-applied). Use Drizzle ORM when:
- Queries involve 3+ JOINs, window functions, or subqueries
- Aggregation/reporting queries where compile-time type safety matters
- Performance-critical queries needing fine-grained SQL control
- Edge Runtime compatibility is required

```typescript
// Default: Supabase Client (CRUD with RLS)
const { data } = await supabase.from('students').select('id, name')

// Drizzle ORM: Complex queries (type-safe SQL)
const result = await db
  .select({
    userId: users.id,
    totalEnrollments: sql<number>`count(*)`.as('total'),
    rank: sql<number>`row_number() over (order by count(*) desc)`,
  })
  .from(users)
  .leftJoin(enrollments, eq(users.id, enrollments.userId))
  .groupBy(users.id)
```

Drizzle queries bypass RLS — ensure authorization is verified at the service layer before executing.

## DATA-004 Auth Provider Selection (MUST)

Default: **Supabase Auth**. Optional replacement: **NextAuth**.

- When using NextAuth, Supabase RLS must still enforce all data access control.
- NextAuth user sessions must be synced to Supabase `auth.users` for RLS to function.
- Document user identifier sync rules in ADR when switching to NextAuth.

```
Auth Provider (swappable)         DB Access Control (always enforced)
┌─────────────────────┐           ┌─────────────────────┐
│ Supabase Auth (default)│─────────▶│ Supabase Postgres    │
│ NextAuth (optional)    │─────────▶│ + RLS (final authority)│
└─────────────────────┘           └─────────────────────┘
```

## DATA-005 Schema/Migration Principle (MUST)

- Single source of truth: `supabase/migrations/*.sql`
- User reference columns: `auth.users(id)` FK
- Policy `auth.uid()`: always use `(select auth.uid())` pattern
- Seed: idempotent + fail-fast

## DATA-006 Performance/Operations (SHOULD)

- Index all `WHERE`/`JOIN`/`FK` columns. (`query-missing-indexes`, `schema-foreign-key-indexes`)
- List queries: cursor pagination default. (`data-pagination`)
- Upsert: `INSERT ... ON CONFLICT`. (`data-upsert`)
- High-concurrency: connection pooling assumed. (`conn-pooling`)

## Cross-Reference
- Supabase skill: `supabase-postgres-best-practices` (query-*, security-*, schema-*, data-*)
