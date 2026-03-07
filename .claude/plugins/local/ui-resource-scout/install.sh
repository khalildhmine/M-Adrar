#!/bin/bash
# ui-resource-scout 로컬 설치 스크립트
# 사용법: bash .claude/plugins/local/ui-resource-scout/install.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"
CLAUDE_DIR="$PROJECT_ROOT/.claude"
PLUGIN_NAME="ui-resource-scout"
PLUGIN_REL="plugins/local/ui-resource-scout"

echo "[$PLUGIN_NAME] 로컬 플러그인 설치 시작..."

# commands 심볼릭 링크
if [ -d "$SCRIPT_DIR/commands" ]; then
  mkdir -p "$CLAUDE_DIR/commands/$PLUGIN_NAME"
  for f in "$SCRIPT_DIR/commands"/*.md; do
    [ -f "$f" ] || continue
    name=$(basename "$f")
    ln -sf "../../$PLUGIN_REL/commands/$name" "$CLAUDE_DIR/commands/$PLUGIN_NAME/$name"
  done
  echo "  commands: $(ls "$CLAUDE_DIR/commands/$PLUGIN_NAME" | wc -l | tr -d ' ')개 등록"
fi

# skills 심볼릭 링크
if [ -d "$SCRIPT_DIR/skills" ]; then
  mkdir -p "$CLAUDE_DIR/skills"
  for d in "$SCRIPT_DIR/skills"/*/; do
    [ -d "$d" ] || continue
    name=$(basename "$d")
    ln -sf "../$PLUGIN_REL/skills/$name" "$CLAUDE_DIR/skills/${PLUGIN_NAME}-${name}"
  done
  echo "  skills: $(ls -d "$SCRIPT_DIR/skills"/*/ 2>/dev/null | wc -l | tr -d ' ')개 등록"
fi

# agents 심볼릭 링크
if [ -d "$SCRIPT_DIR/agents" ]; then
  mkdir -p "$CLAUDE_DIR/agents"
  for f in "$SCRIPT_DIR/agents"/*.md; do
    [ -f "$f" ] || continue
    name=$(basename "$f")
    ln -sf "../$PLUGIN_REL/agents/$name" "$CLAUDE_DIR/agents/$name"
  done
  echo "  agents: $(ls "$SCRIPT_DIR/agents"/*.md 2>/dev/null | wc -l | tr -d ' ')개 등록"
fi

echo "[$PLUGIN_NAME] 설치 완료. Claude Code를 재시작하세요."
echo ""
echo "사용 가능한 커맨드:"
echo "  /ui-resource-scout:ui-research          — 외부 리소스 리서치"
echo "  /ui-resource-scout:ui-research template  — 템플릿/블록 리서치"
echo "  /ui-resource-scout:ui-research component — batchtool 컴포넌트 탐색"
echo ""
echo "제거 방법:"
echo "  rm -rf .claude/commands/ui-resource-scout"
echo "  rm -f .claude/skills/ui-resource-scout-*"
echo "  rm -f .claude/agents/ui-researcher.md"
