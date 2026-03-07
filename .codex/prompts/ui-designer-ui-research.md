---
name: ui-designer-ui-research
description: "외부 UI 리소스 리서치. 특수 페이지 템플릿 탐색 또는 batchtool 컴포넌트 발굴을 실행한다."
argument-hint: "[template|component|all] or free-form description"
---

# UI Research Command

Research external UI resources to recommend templates, blocks, and components suited for the project.

## Local Reference Files

Read these local files before browsing:

- `.claude/plugins/local/ui-designer/skills/ui-template-scout/references/template-sites.md`
- `.claude/plugins/local/ui-designer/skills/ui-component-scout/references/batchtool-guide.md`
- `.ui-designer/analysis.json` if it exists

Do not assume global skills or external sub-agents are available.

## Argument Parsing

Analyze user arguments:

| Argument | Action |
|----------|--------|
| `template` | Research external templates/blocks |
| `component` | Research batchtool-style components |
| `all` | Run template research, then component research |
| Natural language description | Infer the most relevant research mode |
| None | Ask which research mode the user wants |

## Execution Order

### No arguments: Interactive Selection

```text
Which research would you like to run?

  a) template — External template/block research
  b) component — batchtool component search
  c) all — Run both researches
  d) Cancel
```

### template Mode

1. Load `.ui-designer/analysis.json` if present.
2. Confirm what page or feature the research is for.
3. Browse the resource sites listed in `template-sites.md`.
4. Present results with suitability notes and adoption guidance.

### component Mode

1. Confirm what components are needed.
2. Ask for approval before browsing external component resources.
3. Browse the relevant resource sites and present results with compatibility notes.

### all Mode

Run template mode first, then ask whether to continue with component mode.

## Project Analysis Utilization

If `.ui-designer/analysis.json` exists, use it for:
- tech stack compatibility filtering
- avoiding duplicate recommendations
- preserving style consistency

If it does not exist, assume a default baseline of `Next.js + shadcn/ui + Tailwind CSS`.

## Post-Completion Guidance

Provide the following guidance when research is complete:

```text
Research is complete.

Resources selected for adoption:
- [resource name]: [adoption method summary]

Next steps:
- To continue UI design: /ui-designer-ui-design [page-type]
- Additional research: /ui-designer-ui-research [template|component|all]
```
