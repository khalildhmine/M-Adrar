# Migration & Seed Rules

Source: `docs/architecture/supabase-route-and-monorepo-guide.md`, `docs/architecture/development-rules.md` Section 7

## Migration Principles

### 1. Migration-Only Schema Changes
- All schema changes go through `supabase/migrations/*.sql`.
- Never apply DDL manually in production.
- File naming: `YYYYMMDDHHMMSS_<description>.sql`

### 2. Foreign Key Conventions
- User-related columns (`user_id`, `created_by`, `owner_id`) MUST reference `auth.users(id)`.
- All FK columns MUST have corresponding indexes.

```sql
-- Good: FK with index
ALTER TABLE academy_members
  ADD CONSTRAINT academy_members_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id);

CREATE INDEX idx_academy_members_user_id ON academy_members(user_id);
```

### 3. RLS Policy Conventions
- Multi-tenant tables: `ENABLE ROW LEVEL SECURITY` + `FORCE ROW LEVEL SECURITY`
- Use `(select auth.uid())` pattern in all policies (cached per statement, not per row)
- Policy naming: `<table>_<operation>_<scope>` (e.g., `enrollments_select_member`)

### 4. Index Conventions
- Index all `WHERE`, `JOIN`, and `FK` columns by default.
- Use partial indexes for common filtered queries.
- Naming: `idx_<table>_<columns>`

## Seed Principles

### 1. Idempotent Execution
- Use `ON CONFLICT DO NOTHING` or `ON CONFLICT DO UPDATE` for all inserts.
- Use fixed UUIDs for deterministic re-runs.

### 2. Fail-Fast Prerequisites
- Check for required data (owner accounts, base tables) before proceeding.
- Use `RAISE EXCEPTION` when prerequisites are missing.

### 3. Environment Separation
- Seeds are for local/staging only.
- Production data initialization uses separate, audited scripts.

## Existing Migrations Reference
- `20260305170000_academy_enrollments.sql` — Tables + indexes
- `20260305190000_academies_rls_and_auth_fk.sql` — RLS + FK
- `20260305210000_academy_onboarding_function.sql` — Onboarding function
- `20260305213000_onboarding_insert_policies.sql` — Insert policies

## Existing Seeds Reference
- `supabase/seeds/academy-onboarding-seed.sql` — Demo academy + owner
