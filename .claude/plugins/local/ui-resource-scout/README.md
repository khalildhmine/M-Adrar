# UI Resource Scout Plugin

Next.js + shadcn/ui 기반 외부 UI 리소스를 리서치하고 추천하는 Claude Code 플러그인.
ui-designer 플러그인과 연동하거나 독립적으로 사용할 수 있다.

## 핵심 특징

- **템플릿 리서치**: Vercel Templates, shadcnblocks.com, ui.shadcn.com/blocks, shadcnui-blocks.com에서 프로젝트에 맞는 리소스 탐색
- **컴포넌트 발굴**: shadcn.batchtool.com에서 추가 shadcn 확장 컴포넌트 탐색 (사용자 승인 후)
- **특수 페이지 특화**: 복잡한 랜딩, 마케팅, 인터랙션 뷰 등 보일러플레이트로 커버 어려운 페이지 지원

---

## 설치

```bash
bash .claude/plugins/local/ui-resource-scout/install.sh
```

설치 후 Claude Code를 재시작하면 적용된다.

### 제거

```bash
rm -rf .claude/commands/ui-resource-scout
rm -f .claude/skills/ui-resource-scout-*
rm -f .claude/agents/ui-researcher.md
```

---

## 슬래시 커맨드

### `/ui-resource-scout:ui-research [mode]`

| 인자 | 동작 |
|------|------|
| `template` | Vercel Templates, shadcnblocks 등 외부 템플릿/블록 리서치 |
| `component` | shadcn.batchtool.com 컴포넌트 탐색 (사용자 승인 필요) |
| `all` | 템플릿 + 컴포넌트 리서치 모두 실행 |
| 없음 | 대화형으로 리서치 유형 선택 |

---

## 스킬

### `ui-resource-scout-ui-template-scout`

특수 페이지 키워드 감지 시 자동 트리거. 외부 템플릿/블록 사이트를 리서치하여 적합한 리소스를 추천한다.

**트리거 조건**: 복잡한 랜딩 페이지, 마케팅 페이지, 애니메이션/인터랙션 요청, 다단계 섹션 조합 등

### `ui-resource-scout-ui-component-scout`

자동 트리거 없음. ui-designer 연동 또는 명시적 호출 시에만 실행. batchtool에서 추가 컴포넌트를 탐색한다.

**항상 사용자 승인 후 실행**

---

## 에이전트

| 에이전트 | 역할 |
|---------|------|
| `ui-researcher` | WebFetch 기반 외부 사이트 리서치 실행, 결과 구조화 |

---

## ui-designer 연동

ui-designer 플러그인이 다음 시점에 이 플러그인의 스킬을 제안한다:

1. **특수 페이지 감지 시** → `ui-template-scout` 스킬 실행 제안
2. **설계 중 추가 컴포넌트 필요 시** → `ui-component-scout` 스킬 실행 승인 요청

---

## 디렉토리 구조

```
ui-resource-scout/
├── .claude-plugin/
│   └── plugin.json
├── install.sh
├── commands/
│   └── ui-research.md              # /ui-resource-scout:ui-research
├── skills/
│   ├── ui-template-scout/          # 외부 템플릿 리서치 스킬
│   │   ├── SKILL.md
│   │   └── references/
│   │       └── template-sites.md
│   └── ui-component-scout/         # batchtool 컴포넌트 탐색 스킬
│       ├── SKILL.md
│       └── references/
│           └── batchtool-guide.md
├── agents/
│   └── ui-researcher.md            # WebFetch 리서치 에이전트
└── README.md
```
