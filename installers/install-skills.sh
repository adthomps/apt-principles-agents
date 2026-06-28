#!/usr/bin/env bash
set -euo pipefail
TARGET="" MANIFEST="core" DRY_RUN=0 FORCE=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --target) TARGET="$2"; shift 2;; --manifest) MANIFEST="$2"; shift 2;;
    --dry-run) DRY_RUN=1; shift;; --force) FORCE=1; shift;;
    *) echo "Unknown argument: $1" >&2; exit 2;;
  esac
done
[[ -n "$TARGET" ]] || { echo "--target is required" >&2; exit 2; }
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET="$(cd "$TARGET" && pwd)"
FILE="$ROOT/manifests/$MANIFEST.yaml"
[[ -f "$FILE" ]] || { echo "Unknown manifest: $MANIFEST" >&2; exit 2; }
STAMP="$(date +%Y%m%d-%H%M%S)"
install_one() {
  local source="$1" relative="$2" destination="$TARGET/.apt/$relative"
  if [[ -e "$destination" ]]; then
    if [[ "$FORCE" -eq 0 ]]; then echo "WARNING: skipping existing $destination" >&2; return; fi
    if [[ "$DRY_RUN" -eq 0 ]]; then mkdir -p "$TARGET/.apt-backups/$STAMP/$(dirname "$relative")"; cp -R "$destination" "$TARGET/.apt-backups/$STAMP/$relative"; fi
  fi
  [[ "$DRY_RUN" -eq 1 ]] && { echo "Would install $relative"; return; }
  mkdir -p "$(dirname "$destination")"; cp "$source" "$destination"; echo "Installing $relative"
}
section=""
while IFS= read -r line; do
  case "$line" in principles:|skills:|agents:|templates:|prompts:|examples:) section="${line%:}";; platforms:) section="";; "  - "*)
    [[ -n "$section" ]] || continue; entry="${line#  - }"; source="$ROOT/$entry"
    [[ -e "$source" ]] || { echo "Manifest path missing: $entry" >&2; exit 1; }
    if [[ -d "$source" ]]; then while IFS= read -r -d '' file; do rel="${file#"$ROOT/"}"; install_one "$file" "$rel"; done < <(find "$source" -type f -print0)
    else install_one "$source" "$entry"; fi;;
  esac
done < "$FILE"
