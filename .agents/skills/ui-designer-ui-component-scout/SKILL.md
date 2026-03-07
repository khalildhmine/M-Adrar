---
name: ui-component-scout
description: >
  shadcn.batchtool.com에서 shadcn/ui 확장 컴포넌트를 탐색하는 선택적 리서치 스킬.
  자동 트리거되지 않으며, 다음 두 경우에만 활성화된다:
  1. 사용자가 /ui-designer:ui-research component 커맨드를 명시적으로 실행한 경우
  2. ui-designer의 ui-consultant 에이전트가 설계 중 추가 컴포넌트가 필요하다고 판단하고
     ui-design 커맨드가 사용자 승인을 받은 경우

  NEVER auto-trigger. ALWAYS requires explicit invocation or user approval via ui-designer workflow.

  This skill researches shadcn.batchtool.com only.
  For external template research, use ui-template-scout instead.
---

# UI Component Scout

Skill for searching and recommending shadcn/ui extension components from shadcn.batchtool.com.

## Core Principles

1. **Never auto-trigger**: Only execute after explicit invocation or user approval
2. **batchtool dedicated**: This skill only researches shadcn.batchtool.com
3. **Clarify purpose first**: Clearly identify what components are needed before researching
4. **Suitability assessment**: Determine whether discovered components are actually needed for the current project

## Entry Paths

### Path A: Explicit Command

When `/ui-designer:ui-research component` is executed:
- Ask the user what components are needed
- Execute research immediately after understanding requirements

### Path B: ui-designer Integration

When ui-designer's ui-consultant sends the `[BATCHTOOL_RESEARCH_SUGGESTED]: [reason]` signal
and the user approves:
- Use the context provided with approval (what components are needed)
- Execute research immediately (without additional questions)

## Workflow

### Step 1: Requirements Identification (Path A only)

When entering from Path A (explicit command):

```
What components are you looking for?

Examples:
- "data table with column pinning and sorting"
- "calendar with time picker"
- "kanban board"
- "rich text editor"
- "date range picker"

Current project's main tech stack: [loaded from analysis.json or "Next.js + shadcn/ui + Tailwind CSS"]
```

### Step 2: Research Execution

Invoke the `ui-researcher` agent in COMPONENT mode:

```
MODE: COMPONENT
REQUIREMENTS: [identified component requirements]
PROJECT_STACK: [analysis.json or default]
CONTEXT: [additional context]
```

### Step 3: Result Evaluation and Presentation

Evaluate the following from the agent's returned results:

**Suitability criteria**:
- Is it compatible with the current project's tech stack?
- Is it consistent with the shadcn/ui style guide?
- Is it actively maintained?
- Is installation/adoption realistically feasible?

Add evaluation results and present to the user:

```
## batchtool Component Search Results

[ui-researcher agent results]

### Suitability Assessment

| Component | Tech Compatibility | shadcn Consistency | Adoption Ease | Overall |
|-----------|-------------------|-------------------|---------------|---------|
| [name]    | ✅/⚠️/❌          | ✅/⚠️/❌          | ✅/⚠️/❌      | Recommended/Hold/Not recommended |

### Conclusion
[Adoption decision and reasons in 2-3 lines]
```

### Step 4: Adoption Decision

```
Please select components to adopt:
  a) Adopt [component name] — [adoption method summary]
  b) Adopt [component name] — [adoption method summary]
  c) Do not adopt (keep current design)
  d) Re-search with different keywords
```

After selection:
- **When adopting**: Provide specific installation/integration instructions, explain integration points with existing design
- **When not adopting**: Display "Keeping current design" message and return to existing workflow

## batchtool Research Failure Handling

When WebFetch fails:

```
shadcn.batchtool.com is inaccessible.

We recommend checking for similar features in official shadcn/ui instead:
- Official components: https://ui.shadcn.com/docs/components/[component-name]
- Community extensions: https://github.com/birobirobiro/awesome-shadcn-ui

If you tell us the specific components you need, we can find alternatives.
```

## Reference Documents

- `references/batchtool-guide.md` — batchtool site structure, known component categories
- `.ui-designer/analysis.json` — Project tech stack
