---
description: Scaffold a new Supabase migration file with proper naming
argument-hint: <description>
name: dashboard-template-new-migration
---

# New Migration Scaffolding

Create a new Supabase migration file following project naming conventions.

## Usage
```
/dashboard-template-new-migration add_students_table
```

## Steps

1. Parse the argument as `<description>`.
   - If no argument provided, ask the user for a description.

2. Generate the timestamp-based filename:
   ```bash
   date -u +"%Y%m%d%H%M%S"
   ```
   Result: `supabase/migrations/<YYYYMMDDHHMMSS>_<description>.sql`

3. Create the migration file with this template:

```sql
-- Migration: <description>
-- Created: <timestamp>

-- 1. Table creation (if applicable)
-- CREATE TABLE <table_name> (
--   id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
--   created_at timestamptz DEFAULT now() NOT NULL,
--   updated_at timestamptz DEFAULT now() NOT NULL
-- );

-- 2. Foreign keys (user references MUST use auth.users(id))
-- ALTER TABLE <table_name>
--   ADD CONSTRAINT <table_name>_user_id_fkey
--   FOREIGN KEY (user_id) REFERENCES auth.users(id);

-- 3. Indexes (MUST index WHERE/JOIN/FK columns)
-- CREATE INDEX idx_<table_name>_user_id ON <table_name>(user_id);

-- 4. RLS (multi-tenant tables MUST have RLS + FORCE RLS)
-- ALTER TABLE <table_name> ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE <table_name> FORCE ROW LEVEL SECURITY;

-- 5. Policies (MUST use (select auth.uid()) pattern)
-- CREATE POLICY "<table_name>_select_own" ON <table_name>
--   FOR SELECT USING (user_id = (select auth.uid()));
```

4. Print a summary and remind about:
   - Uncommenting and filling in the relevant sections
   - Using `(select auth.uid())` pattern in all RLS policies (SB-003)
   - Adding `ENABLE ROW LEVEL SECURITY` + `FORCE ROW LEVEL SECURITY` for multi-tenant tables (SB-002)
   - Indexing all FK columns (DATA-006)
   - Running `supabase db push` or `supabase migration up` to apply
