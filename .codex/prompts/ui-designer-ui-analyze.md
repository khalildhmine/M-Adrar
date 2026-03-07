---
name: ui-designer-ui-analyze
description: "현재 프로젝트의 UI 구조를 분석하고 .ui-designer/analysis.json에 저장."
argument-hint: "[--refresh]"
---

# UI Analyze

Systematically analyze the current project's UI structure and save the result to `.ui-designer/analysis.json`.

## Execution Conditions

- **No arguments**: If `.ui-designer/analysis.json` already exists, show the existing analysis first. If it does not exist, create it.
- **--refresh**: Ignore any existing file and run a fresh analysis.

## Analysis Process

Analyze the repository directly. Do not delegate to other agents or assume external skills are installed.

### 1. Project Basic Information
- Read `package.json`
- Identify framework, UI library, styling tools
- Distinguish Next.js App Router / Pages Router

### 2. Route Map
- Scan `src/app/**/page.tsx`
- Collect route paths
- Detect route groups such as `(main)`, `(auth)`, `(dashboard)`
- Determine page type for each route when possible

### 3. Component Inventory
- Scan `src/components/ui/` for installed shadcn/ui components
- Scan `src/components/` for custom components
- Estimate usage frequency from imports when helpful

### 4. Layout Patterns
- Analyze `src/app/**/layout.tsx`
- Check sidebar/header/content structure
- Note sidebar width, header height, content padding, collapsible behavior

### 5. Style Conventions
- Analyze `tailwind.config.ts` or `tailwind.config.js` if present
- Analyze `src/app/globals.css` or the main global stylesheet
- Extract CSS variables, radius/spacing patterns, dark mode support

### 6. Recurring UI Patterns
- Identify data display patterns (tables, cards, lists)
- Identify form patterns
- Identify navigation patterns

## Result Storage

Save analysis results to `.ui-designer/analysis.json` using this schema:

```json
{
  "analyzedAt": "ISO 8601 datetime",
  "project": {
    "framework": "next.js",
    "uiLibrary": "shadcn/ui",
    "styling": "tailwind"
  },
  "routes": [
    { "path": "/dashboard", "type": "dashboard", "components": ["Card", "Table"] }
  ],
  "components": {
    "shadcn": ["Button", "Card", "Table", "Sidebar", "Dialog"],
    "custom": ["ThemeSwitch", "SearchInput"]
  },
  "layout": {
    "pattern": "sidebar-header-content",
    "sidebar": { "width": "w-64", "collapsible": true },
    "header": { "fixed": true, "height": "h-16" },
    "content": { "maxWidth": "max-w-7xl", "padding": "p-6" }
  },
  "style": {
    "colors": { "primary": "hsl(...)", "radius": "0.5rem" },
    "borderRadius": "rounded-lg",
    "darkMode": true
  },
  "patterns": {
    "dataDisplay": "table-with-toolbar",
    "forms": "card-wrapped-sections",
    "navigation": "sidebar-with-groups"
  }
}
```

## Result Output

Show a short summary after saving:

```
Project analysis complete

Tech stack: Next.js + shadcn/ui + Tailwind CSS
Routes: [N] pages found
shadcn components: [N] installed
Layout: [pattern description]
Style: [key characteristics]

Analysis results saved to .ui-designer/analysis.json.
You can now start UI design with /ui-designer-ui-design.
```
