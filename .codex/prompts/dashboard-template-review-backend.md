---
description: Run backend code review against project backend rules
name: dashboard-template-review-backend
---

# Backend Code Review

Review backend changes directly against the project backend rules.

## Steps

1. Identify files to review:
   ```bash
   git diff --name-only HEAD -- 'src/app/api/**' 'src/lib/supabase/**' 'supabase/**'
   ```
   If no diff, review all recently modified backend files.

2. Read the local rule sources:
   - `AGENTS.md`
   - `docs/architecture/development-rules.md`
   - `.claude/plugins/local/dashboard-template/skills/backend-dev/SKILL.md`
   - `.claude/plugins/local/dashboard-template/skills/backend-dev/references/api-rules.md`
   - `.claude/plugins/local/dashboard-template/skills/backend-dev/references/supabase-rules.md`
   - `.claude/plugins/local/dashboard-template/skills/backend-dev/references/migration-rules.md`

3. Check the selected files against:
   - **API-001~004**: Versioning, input validation, pagination, separation
   - **SB-001~004**: Client usage, RLS, schema changes, seeds
   - **DATA-001~006**: Access control, Supabase-first, Drizzle ORM boundaries, NextAuth opt-in rules, performance

4. Compile findings into a structured report.

5. Put findings first, ordered by severity. If there are no findings, say that explicitly and mention residual risks or test gaps.
