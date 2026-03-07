---
name: fullstack-review
description: "PR 리뷰, 코드 감사 시 전체 아키텍처 규칙(PERF/COMP/UI/API/SB/DATA)을 종합 검증한다."
---

# Fullstack Review Skill

## Review Process

1. **Identify changed files** via `git diff` or provided file list
2. **Classify changes** into frontend (React/UI) and backend (API/DB/SQL)
3. **Apply relevant checklists** from `references/checklist.md`
4. **Report findings** with rule ID, severity, file:line, and fix suggestion

## Output Format

```
[RULE-ID] [MUST|SHOULD] file:line — Description
  Fix: Suggested correction
```

## Checklist
See `references/checklist.md` for the complete unified checklist.

## Required External Skills
Actively consult during review for comprehensive rule coverage:
- `vercel-react-best-practices` — React/Next.js performance rules (PERF cross-reference)
- `vercel-composition-patterns` — Component architecture patterns (COMP cross-reference)
- `web-design-guidelines` — Accessibility, UX quality (UI cross-reference)
- `supabase-postgres-best-practices` — DB performance/security (SB/DATA cross-reference)
