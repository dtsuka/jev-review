#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
skill_source="$repo_root/skills/jev-review"
skill_root="${AGENTS_HOME:-$HOME/.agents}/skills"
skill_target="$skill_root/jev-review"

mkdir -p "$skill_root"

if [[ -e "$skill_target" || -L "$skill_target" ]]; then
  if [[ -L "$skill_target" && "$(readlink "$skill_target")" == "$skill_source" ]]; then
    echo "jev-review skill already linked: $skill_target"
    exit 0
  fi
  echo "Refusing to replace existing skill: $skill_target" >&2
  exit 1
fi

ln -s "$skill_source" "$skill_target"
echo "Installed jev-review skill: $skill_target -> $skill_source"
echo "Codex detects skill changes automatically; restart Codex if it does not appear."
