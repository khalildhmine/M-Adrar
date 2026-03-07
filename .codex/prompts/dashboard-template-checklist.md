---
description: Run AI work checklist against current changes
name: dashboard-template-checklist
---

# AI Work Checklist

Run the unified checklist against current git changes.

## Steps

1. Get the current diff:
   ```bash
   git diff --name-only HEAD
   ```
   If no staged changes, also check:
   ```bash
   git diff --name-only
   ```

2. Read the project rule sources directly:
   - `AGENTS.md`
   - `docs/architecture/development-rules.md`
   - `docs/architecture/nextjs-best-case-rules.md`
   - `.claude/plugins/local/dashboard-template/skills/fullstack-review/references/checklist.md`

3. For each changed file, apply the relevant checklist items:
   - `.ts`/`.tsx` files in `src/app/api/` — Apply API checklist (API-001~004)
   - `.ts`/`.tsx` files in `src/app/`, `src/components/`, `src/features/` — Apply frontend checklist (PERF, COMP, UI)
   - `.sql` files in `supabase/` — Apply Supabase checklist (SB, DATA)

4. Report findings in this format:
   ```
   ## Checklist Results

   ### Passed
   - [x] API-001: All APIs under /api/v1/** ✓

   ### Failed
   - [ ] PERF-001: Sequential I/O detected in src/app/api/v1/academy/enrollments/route.ts:15
     Fix: Wrap independent fetches in Promise.all()

   ### Not Applicable
   - [-] SB-002: No SQL files changed
   ```

5. Summarize: `X passed, Y failed, Z not applicable`
6. If violations exist, list failures before the summary. If there are no failures, say that explicitly.
