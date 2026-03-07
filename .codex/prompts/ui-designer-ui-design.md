---
name: ui-designer-ui-design
description: "UI 페이지 설계 및 구현. 페이지 유형 또는 자연어 설명으로 시작."
argument-hint: "[landing|dashboard|settings|auth|crud|detail|pricing|form] or free-form description"
---

# UI Design Workflow

Execute the full workflow for designing and implementing UI pages.

## Argument Parsing

Analyze user arguments:

- **Type keywords** (landing, dashboard, settings, auth, crud, detail, pricing, form):
  Immediately start the workflow for that type.
- **Natural language description**:
  Analyze the description to determine the appropriate page type and confirm with the user when needed.
- **No arguments**:
  Ask the user what page they want to create.

## Local Reference Files

Read these files directly from the repository as needed:

- `.claude/plugins/local/ui-designer/skills/ui-design-guide/references/component-catalog.md`
- `.claude/plugins/local/ui-designer/skills/ui-design-guide/references/layout-patterns.md`
- `.claude/plugins/local/ui-designer/skills/ui-design-guide/references/page-templates.md`
- `.claude/plugins/local/ui-designer/skills/ui-design-guide/references/qa-templates.md`
- `.claude/plugins/local/ui-designer/skills/ui-design-guide/references/design-principles.md`
- `.claude/plugins/local/ui-designer/skills/ui-design-guide/references/external-resources.md`

Do not assume global skills or sub-agents are available.

## Execution Order

### 1. Project Analysis Check

Check for `.ui-designer/analysis.json`.

- **If it exists**: Load the analysis data.
- **If it does not exist**: Run the same direct repository analysis described by `/ui-designer-ui-analyze`, save the file, then summarize the result.

### 1.5. Special Page Detection and External Resource Suggestion

Analyze the page type and request description to determine if it is a special page.

**Special page signals**:
- Complex marketing/landing pages with 5+ heterogeneous sections
- Explicit animation, scroll effect, or parallax requirements
- Strong impact keywords such as "flashy", "impressive", "promotional", "sales"
- Cases where `page-templates.md` is clearly insufficient

If it is a special page, ask whether to research external resources first. When approved, browse the external resources listed in `external-resources.md` and reflect the findings before continuing.

### 2. Interactive Q&A

Load the relevant question set from `qa-templates.md`.

Use this format:

```text
**Q[N]. [question]**

> [why this matters]

★ **Recommendation**: [recommendation + reason]

  a) [option] — [description]
  b) [option] — [description]
  c) [option] — [description]
  d) Custom input
```

Progression order:
1. Common questions
2. Type-specific questions

When the user says "go with recommendations", apply all starred recommendations.

### 3. Design Proposal Generation and Presentation

Generate the design proposal directly after Q&A is complete.

Include:
- layout pattern and ASCII skeleton
- selected component list with shadcn mappings
- Next.js file structure
- consistency notes with the existing project

**User approval is mandatory.** If the user requests changes, revise and present again.

### 4. Code Generation

Generate code based on the approved design proposal.

- Follow patterns from `.ui-designer/analysis.json`
- Apply `design-principles.md`
- Use `lucide-react` as the default icon library unless the user requested otherwise
- Verify the generated result against the local design principles and, when needed, the latest Vercel Web Interface Guidelines
- Report verification results and a concise change summary
