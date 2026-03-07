---
description: Run frontend code review against project frontend rules
name: dashboard-template-review-frontend
---

# Frontend Code Review

Review frontend changes directly against the project frontend rules.

## Steps

1. Identify files to review:
   ```bash
   git diff --name-only HEAD -- 'src/app/**/*.tsx' 'src/app/**/*.ts' 'src/components/**' 'src/features/**'
   ```
   If no diff, review all recently modified frontend files.

2. Read the local rule sources:
   - `AGENTS.md`
   - `docs/architecture/nextjs-best-case-rules.md`
   - `.claude/plugins/local/dashboard-template/skills/frontend-dev/SKILL.md`
   - `.claude/plugins/local/dashboard-template/skills/frontend-dev/references/perf-rules.md`
   - `.claude/plugins/local/dashboard-template/skills/frontend-dev/references/comp-rules.md`
   - `.claude/plugins/local/dashboard-template/skills/frontend-dev/references/ui-rules.md`

3. Check the selected files against:
   - **PERF-001~004**: Waterfalls, RSC boundaries, server fetch, bundle size
   - **COMP-001~004**: Boolean props, compound components, state hiding, React 19
   - **UI-001~004**: Accessibility, form quality, animations, content/layout
   - **ARCH-001~002**: Layer boundaries, dependency direction

4. Compile findings into a structured report.

5. Put findings first, ordered by severity. If there are no findings, say that explicitly and mention residual risks or test gaps.
