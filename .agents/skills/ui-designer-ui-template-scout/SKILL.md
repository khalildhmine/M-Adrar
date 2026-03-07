---
name: ui-template-scout
description: >
  특수 페이지(복잡한 랜딩, 마케팅, 다단계 섹션 구성 등) 요청을 감지하면 자동으로 활성화된다.
  Vercel Templates, shadcnblocks.com, ui.shadcn.com/blocks, shadcnui-blocks.com에서
  Next.js + shadcn/ui 기반 템플릿/블록을 리서치하여 프로젝트에 맞는 리소스를 추천한다.

  TRIGGER when any of these are detected:
  - Complex landing page or marketing page with multiple hero/feature/testimonial sections
  - Requests for animations, scroll effects, or parallax interactions
  - Keywords: "화려하게", "인상적으로", "마케팅용", "프로모션", "세일즈", "임팩트", "wow"
  - 5+ heterogeneous sections requested in a single page
  - User explicitly asks to search external templates or blocks
  - Standard page-templates.md cannot adequately cover the requirement

  DO NOT TRIGGER for:
  - Standard dashboard, settings, auth, CRUD list, detail, pricing, form pages
  - Simple component additions to existing pages
  - Pages that fit within standard templates
---

# UI Template Scout

Skill for discovering and recommending external template and block resources matching special page requirements.

## Trigger Condition Evaluation

Activate this skill when one or more of the following signals are detected.

### Strong Trigger Signals (Immediate Activation)

| Signal | Examples |
|--------|----------|
| Marketing/Sales landing | "SaaS landing page", "promotional page", "sales page" |
| Complex sections (5+) | "Hero + Features + Testimonials + Pricing + CTA + FAQ" |
| Special interactions | "with animations", "scroll effects", "parallax" |
| Impact keywords | "화려하게", "인상적으로", "wow effect", "impressive" |
| Explicit external request | "find external templates", "search shadcnblocks" |

### Weak Trigger Signals (Judgment Required)

| Signal | Judgment Criteria |
|--------|-------------------|
| Complex landing | 3-4 sections but each with complex interactions |
| Non-standard layout | Insufficient coverage by page-templates.md standard compositions |
| "Full-page" composition | Existing component combinations insufficient for desired quality |

## Workflow

### Step 1: Trigger Detection and User Proposal

When identified as a special page, immediately propose to the user:

```
This page is identified as a special page that is difficult to design with standard component combinations alone.

Detection reason: [1-2 line rationale]

Researching external resources can help us propose a higher-quality design:
- Vercel Templates
- shadcnblocks.com
- ui.shadcn.com/blocks
- shadcnui-blocks.com

Proceed with research? (y/n)
```

### Step 2: Execute Research (After Approval)

On user approval, invoke the `ui-researcher` agent in TEMPLATE mode:

```
MODE: TEMPLATE
REQUIREMENTS: [user requirements summary]
PROJECT_STACK: [tech stack from analysis.json, or "Next.js + shadcn/ui + Tailwind CSS" if unavailable]
CONTEXT: [additional context]
```

Present the agent's returned results directly to the user.

### Step 3: Present Results and Guide Next Steps

After presenting research results:

```
Please select a resource to adopt from the options above.
We will refine the design based on the selected resource.

Options:
  a) Adopt [top-ranked resource name]
  b) Adopt [second-ranked resource name]
  c) Combine multiple resources
  d) Proceed with direct design without research results
  e) Re-research (different keywords)
```

### Step 4: Design Guidance Based on Selected Resource

Based on the selected resource:
- Guide adoption method (npx command or source copy)
- Explain integration points between the resource and existing project styles
- Seamlessly connect to the ui-designer design workflow

## Rejection Handling

When the user declines research:
- Output message: "Understood. Proceeding with design using standard component combinations."
- Seamlessly transition to the existing ui-designer workflow (Q&A → design proposal)

## Reference Documents

- `references/template-sites.md` — Site characteristics, research tips, known resource catalog
- `.ui-designer/analysis.json` — Project tech stack (loaded if available)
