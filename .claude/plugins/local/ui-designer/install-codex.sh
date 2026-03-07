#!/bin/bash
# ui-designer Codex 설치 스크립트
# 사용법: bash .claude/plugins/local/ui-designer/install-codex.sh
# Codex 커맨드를 ~/.codex/prompts/ 에 설치한다.

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PLUGIN_NAME="ui-designer"
TARGET_DIR="$HOME/.codex/prompts"

echo "[$PLUGIN_NAME] Codex 설치 시작..."

# ~/.codex/prompts 디렉토리 생성
mkdir -p "$TARGET_DIR"

# commands → ~/.codex/prompts/ 복사 (파일명에 플러그인 prefix 추가)
if [ -d "$SCRIPT_DIR/commands" ]; then
  count=0
  for f in "$SCRIPT_DIR/commands"/*.md; do
    [ -f "$f" ] || continue
    name=$(basename "$f" .md)
    dest="$TARGET_DIR/${PLUGIN_NAME}-${name}.md"
    cp "$f" "$dest"
    count=$((count + 1))
  done
  echo "  commands: ${count}개 설치 → $TARGET_DIR"
fi

echo "[$PLUGIN_NAME] Codex 설치 완료."
echo "  사용: /ui-designer-ui-design, /ui-designer-ui-research, /ui-designer-ui-analyze"
