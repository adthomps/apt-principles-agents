#!/usr/bin/env bash
set -euo pipefail
TARGET="" MANIFEST="core" DRY_RUN=0 FORCE=0
while [[ $# -gt 0 ]]; do case "$1" in --target) TARGET="$2";shift 2;;--manifest) MANIFEST="$2";shift 2;;--dry-run) DRY_RUN=1;shift;;--force) FORCE=1;shift;;*) echo "Unknown argument: $1" >&2;exit 2;;esac;done
[[ -n "$TARGET" ]] || { echo "--target is required" >&2; exit 2; }
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"; TARGET="$(cd "$TARGET" && pwd)"; STAMP="$(date +%Y%m%d-%H%M%S)"
FILE="$ROOT/manifests/$MANIFEST.yaml";[[ -f "$FILE" ]]||{ echo "Unknown manifest: $MANIFEST" >&2;exit 2;}
copy_one(){ local source="$1" relative="$2" destination="$TARGET/$relative";if [[ -e "$destination" ]];then if [[ "$FORCE" -eq 0 ]];then echo "WARNING: skipping existing $destination" >&2;return;fi;if [[ "$DRY_RUN" -eq 0 ]];then mkdir -p "$TARGET/.apt-backups/$STAMP/$(dirname "$relative")";cp -R "$destination" "$TARGET/.apt-backups/$STAMP/$relative";fi;fi;[[ "$DRY_RUN" -eq 1 ]]&&{ echo "Would install $relative";return;};mkdir -p "$(dirname "$destination")";cp -R "$source" "$destination";echo "Installing $relative";}
for file in AGENTS.md CODEX.md CLAUDE.md GEMINI.md;do copy_one "$ROOT/$file" "$file";done
copy_one "$ROOT/platforms/gemini/config.yaml" ".gemini/config.yaml";copy_one "$ROOT/platforms/gemini/styleguide.md" ".gemini/styleguide.md"
copy_one "$ROOT/platforms/github-copilot/copilot-instructions.md" ".github/copilot-instructions.md"
section=""
while IFS= read -r line;do
  case "$line" in skills:|prompts:)section="${line%:}";;principles:|agents:|templates:|platforms:)section="";;"  - "*)
    [[ -n "$section" ]]||continue;entry="${line#  - }";source="$ROOT/$entry"
    if [[ -d "$source" ]];then
      while IFS= read -r -d '' item;do rel="${item#"$ROOT/$section/"}";if [[ "$section" == skills ]];then for base in .codex/skills .claude/skills .github/skills;do copy_one "$item" "$base/$rel";done;else copy_one "$item" ".github/prompts/$rel";copy_one "$item" ".gemini/commands/$rel";fi;done < <(find "$source" -type f -print0)
    else rel="${source#"$ROOT/$section/"}";if [[ "$section" == skills ]];then for base in .codex/skills .claude/skills .github/skills;do copy_one "$source" "$base/$rel";done;else copy_one "$source" ".github/prompts/$rel";copy_one "$source" ".gemini/commands/$rel";fi;fi;;
  esac
done < "$FILE"
