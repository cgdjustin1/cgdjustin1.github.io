#!/bin/bash
set -euo pipefail

# Sync blog posts from the Obsidian vault into Jekyll's _posts.
# Nothing is committed or pushed: review the result (git status, local preview), then publish separately.
# Usage: ./sync-blog.sh [--yes]
#   --yes  remove site posts that are missing from Obsidian without asking

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$SCRIPT_DIR"
OBSIDIAN_BLOG="${OBSIDIAN_BLOG:-$HOME/workspace/knowledge/writing/blog}"
JEKYLL_POSTS="$REPO/_posts"
ASSUME_YES="${1:-}"

if [ ! -d "$OBSIDIAN_BLOG" ]; then
  echo "❌ Blog source not found: $OBSIDIAN_BLOG"
  echo "   Set it explicitly if needed: OBSIDIAN_BLOG=/path/to/blog ./sync-blog.sh"
  exit 1
fi

mkdir -p "$JEKYLL_POSTS"
shopt -s nullglob

echo "📝 Obsidian: $OBSIDIAN_BLOG"
echo "📦 Site:     $JEKYLL_POSTS"

# Only dated posts (YYYY-MM-DD-*.md) are synced; notes, templates and subfolders are ignored.
missing=()
for post in "$JEKYLL_POSTS"/????-??-??-*.md; do
  name="$(basename "$post")"
  [ -e "$OBSIDIAN_BLOG/$name" ] || missing+=("$name")
done

if [ "${#missing[@]}" -gt 0 ]; then
  echo "⚠️  On the site but not in Obsidian, so they would be removed:"
  printf '   - %s\n' "${missing[@]}"
  if [ "$ASSUME_YES" != "--yes" ]; then
    read -r -p "Remove them from the site? [y/N] " answer || answer=""
    if [ "$answer" != "y" ]; then
      echo "Stopped. Nothing changed."
      exit 1
    fi
  fi
fi

changed=0
for source in "$OBSIDIAN_BLOG"/????-??-??-*.md; do
  name="$(basename "$source")"
  if ! cmp -s "$source" "$JEKYLL_POSTS/$name"; then
    cp "$source" "$JEKYLL_POSTS/$name"
    echo "   ↻ $name"
    changed=1
  fi
done

if [ "${#missing[@]}" -gt 0 ]; then
  for name in "${missing[@]}"; do
    rm "$JEKYLL_POSTS/$name"
    echo "   ✕ $name"
  done
  changed=1
fi

if [ "$changed" -eq 0 ]; then
  echo "✅ Already in sync."
  exit 0
fi

echo "🏷️  Generating tag pages..."
bash "$REPO/scripts/generate-tags.sh"

echo ""
git -C "$REPO" status --short
echo ""
echo "Synced locally. Nothing is published yet: preview, then commit and push."
