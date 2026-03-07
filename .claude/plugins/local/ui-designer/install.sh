#!/bin/bash
# ui-designer 로컬 설치 스크립트
# 사용법: bash .claude/plugins/local/ui-designer/install.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"
CLAUDE_DIR="$PROJECT_ROOT/.claude"
PLUGIN_NAME="ui-designer"
PLUGIN_REL="plugins/local/ui-designer"

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
