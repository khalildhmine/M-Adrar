---
name: ui-design-guide
description: "UI 페이지 설계 및 구현 가이드. 프로젝트 분석 기반 컴포넌트 추천, 레이아웃 설계, 코드 생성을 제공한다."
---

# UI Design Guide

A guide for designing and implementing UI pages based on project analysis data and component catalogs.
Provides concrete designs tailored to the current project's structure/style/conventions, not abstract recommendations.

## Workflow Overview

Proceeds in 4 steps. No step is skipped.

```
[Step 0: Project Analysis] → [Step 1: Requirements Gathering] → [Step 2: Design Proposal] → [Step 3: Code Generation]
```

## Step 0: Project Analysis Check

Check for the `.ui-designer/analysis.json` file in the project root.

**If file exists**: Load the analysis data and proceed to Step 1.

**If file does not exist**: Inform the user:
> "The project UI structure must be analyzed first. Please run `/ui-analyze`."

Items to check from analysis data:
- `project.framework`, `project.uiLibrary`, `project.styling` — Tech stack
- `components.shadcn`, `components.custom` — Components in use
- `layout.pattern` — Existing layout structure
- `style.colors`, `style.borderRadius`, `style.darkMode` — Style conventions
- `patterns` — Recurring UI patterns

## Step 1: Requirements Gathering (Interactive Q&A)

### 1.1 Page Type Identification

Identify the page type from the user's request. Use the quick reference table in `references/page-templates.md`.

| Keyword | Type |
|---------|------|
| landing, homepage, hero, marketing | Landing |
| dashboard, overview, status | Dashboard |
| settings, preferences, configuration | Settings |
| login, signup, auth | Auth |
| list, board, CRUD | CRUD List |
| detail, profile | Detail |
| pricing, plans, rates | Pricing |
| form, input, registration | Form |

If the type is unclear, confirm with the user.

### 1.15 Special Page Detection

After page type identification, check if the request contains special page signals:
- When complex sections (5+), special interactions, or impact keywords are detected
- Suggest whether to activate the `ui-template-scout` skill to the user
- Apply the same special page detection criteria as the `/ui-design` command
- Refer to special page detection criteria in `references/external-resources.md`

### 1.2 Q&A Progression

Load the question list for the page type from `references/qa-templates.md`.

**Question format rules** (must follow):
```
**Q[N]. [question]**

> [1-2 line explanation of why this question matters]

★ **Recommendation**: [analysis data-based recommendation. 1 line reason]

  a) [option] — [brief description]
  b) [option] — [brief description]
  c) [option] — [brief description]
  d) Custom input
```

**Progression order**:
1. Common questions (Q1~Q4: target, layout relationship, tone & manner, assets)
2. Type-specific questions

**"Go with recommendations" handling**:
- If the user responds with "go with recommendations" or "decide for me", apply all ★ recommendations at once.
- If the user answers "recommend" to an individual question, apply that question's ★ recommendation.

**★ Recommendation writing rules**:
- Reflect existing project data from analysis.json (existing styles, colors, patterns)
- Combine industry best practices with practical experience
- Explain the recommendation reason concisely in 1 line

## Step 2: Design Proposal

Present a concrete design proposal after all Q&A is complete.

### 2.1 Component Selection

Select suitable components from `references/component-catalog.md`.

Check the following:
- Match `use-when` conditions with user requirements
- Verify no `avoid-when` conditions apply
- Compose natural combinations using `pairs-with`
- Confirm actual implementation components via `shadcn-mapping`

### 2.2 Layout Design

Select a suitable layout pattern from `references/layout-patterns.md`.
Reference the standard configuration for the page type from `references/page-templates.md`.

### 2.3 Design Proposal Format

```
📋 [Page Name] Design Proposal

Layout: [pattern name] ([description])
┌─────────────────────────┐
│ [ASCII skeleton]          │
└─────────────────────────┘

Components:
 • [component name] — [role] (shadcn: [mapping])
 • ...

File structure:
 • [path/filename] — [role]
 • ...

Style:
 • Maintain existing project style: [specific items]
 • Additional style: [if needed]
```

After presenting the design proposal, **user approval is mandatory**. If modifications are requested, reflect them and re-present.

## Step 3: Code Generation

Generate code after user approval.

### 3.1 Generation Rules

- Follow existing patterns/conventions from analysis.json (import paths, naming, directory structure)
- Apply static principles from `references/design-principles.md`
- Prioritize shadcn components already in use in the existing project
- If new shadcn components are needed, provide installation commands

### 3.2 Code Verification

After code generation, verify by referencing Part 2 of `references/design-principles.md`:

1. Fetch the latest Vercel Web Interface Guidelines via WebFetch
   - URL: `https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md`
2. Compare generated code against the guidelines
3. Auto-fix any violations
4. Report verification results:
   ```
   ✅ Accessibility: Semantic HTML, alt attributes included
   ✅ Keyboard: Logical Tab order
   ⚠️ Fixed: [fix details]
   ```

### 3.3 Result Presentation

- Summary of generated files and changes
- Guidance on packages/components that need to be newly installed
- Additional considerations (data integration, APIs, etc.)

## Reference Documents

### Reference Files

Refer to the following documents as needed during the design process:

- **`references/component-catalog.md`** — Decision guide for 58 component types. Check use-when/avoid-when/pairs-with/shadcn-mapping when selecting components.
- **`references/layout-patterns.md`** — Grids, responsive design, section placement, 6 layout patterns, spacing system. Reference during layout design.
- **`references/page-templates.md`** — Standard configurations for 8 page types. Section order, ASCII skeletons, shadcn mappings, Next.js file structure.
- **`references/qa-templates.md`** — Interactive question templates per page type. Must follow this format during Q&A.
- **`references/design-principles.md`** — Visual hierarchy, consistency, responsive, color, typography, interaction principles + Vercel Guidelines verification.
- **`references/external-resources.md`** — Icon policy (Lucide default), external resource list, batchtool guide. Reference for special page detection and icon selection.

### Project Analysis Data

- **`.ui-designer/analysis.json`** — Analysis results of the current project's routes, components, layout, style, and patterns.

## Core Principles

1. **Project context first**: Concrete recommendations based on analysis.json, not abstract suggestions
2. **Eliminate ambiguity**: Resolve all uncertainties through Q&A before designing
3. **Execute after approval**: Always show the design proposal to the user and get approval before code generation
4. **Maintain consistency**: Stay consistent with the existing project's styles/patterns/conventions
5. **Verify before submission**: Verify generated code against design principles and Web Interface Guidelines
6. **Lucide icons first**: Use `lucide-react` as the default icon library unless specifically requested otherwise. Refer to icon policy in `references/external-resources.md`.
