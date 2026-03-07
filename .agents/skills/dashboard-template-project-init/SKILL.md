---
name: project-init
description: "인터뷰 기반으로 도메인 용어집과 프로젝트 개관 문서를 생성하는 프로젝트 초기화 스킬."
---

# Project Init Skill

## Trigger Conditions

Suggest running this skill if any of the following are true:
- `docs/domain/glossary.md` does not exist
- `docs/domain/project.md` does not exist
- The user executes the `/init-project` command

## Workflow

### Phase 1: Collect Project Overview

Ask the user the following questions sequentially (one at a time):

1. **One-line service summary** — What is this project?
2. **Target users** — Who will use it?
3. **Core values** — Three core values provided to users
4. **Key actors** — Distinct user roles in the system (e.g., admin, regular user, guest)
5. **Core domains** — Primary business domain areas (e.g., orders, payments, shipping)
6. **MVP scope** — Features included in and excluded from the first release

### Phase 2: Collect Domain Terminology

Based on the domains identified in Phase 1:

1. Confirm **key terms** for each domain area with the user
2. Collect Korean terms + English equivalents + DB table/column name mappings
3. Categorize: actors, core domains, (if applicable) orders/payments, shipping, user funnel, authentication, admin dashboard, i18n, technical terms

### Phase 3: Document Generation

Based on `references/project-template.md` and `references/glossary-template.md`:

1. Generate `docs/domain/project.md`
2. Generate `docs/domain/glossary.md`
3. Show generated documents to the user and incorporate revisions

### Phase 4: Integration Verification

1. Check whether to add domain document references to `docs/architecture/development-rules.md`
2. Suggest a commit

## Agent Integration

The fullstack-dev agent references `docs/domain/glossary.md` during code work to:
- Consistently use glossary terms in variable names, function names, and table names
- Suggest glossary.md updates when new domain terms are discovered
