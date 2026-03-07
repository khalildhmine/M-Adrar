---
description: "Initialize project — generate domain glossary and project overview documents"
name: dashboard-template-init-project
---

Begin project initialization and generate `docs/domain/project.md` and `docs/domain/glossary.md`.

1. Create `docs/domain/` if it does not exist.
2. Read these local templates before writing:
   - `.claude/plugins/local/dashboard-template/skills/project-init/references/project-template.md`
   - `.claude/plugins/local/dashboard-template/skills/project-init/references/glossary-template.md`
3. Inspect the current repository context first:
   - `README.md`
   - `AGENTS.md`
   - `docs/architecture/*`
4. If essential product context is still missing, interview the user for:
   - service summary
   - target users and actors
   - core value proposition
   - important domain terms and Korean/English naming
5. Generate:
   - `docs/domain/project.md`
   - `docs/domain/glossary.md`
6. Summarize what was created and what was assumed or still needs confirmation.
