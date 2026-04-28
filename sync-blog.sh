#!/bin/bash
set -euo pipefail

# Sync blog posts from Obsidian/workspace → Jekyll and deploy
# Usage: ./sync-blog.sh [commit message]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$SCRIPT_DIR"
OBSIDIAN_BLOG="${OBSIDIAN_BLOG:-$HOME/workspace/writing/blog}"
JEKYLL_POSTS="$REPO/_posts"
MSG="${1:-blog: sync from obsidian}"

if [ ! -d "$OBSIDIAN_BLOG" ]; then
  echo "❌ Blog source not found: $OBSIDIAN_BLOG"
  echo "   Set it explicitly if needed: OBSIDIAN_BLOG=/path/to/blog ./sync-blog.sh \"blog: update posts\""
  exit 1
fi

if [ ! -d "$REPO/.git" ]; then
  echo "❌ Not a git repository: $REPO"
  exit 1
fi

mkdir -p "$JEKYLL_POSTS"

echo "📝 Syncing posts from: $OBSIDIAN_BLOG"
echo "📦 Repo: $REPO"

# Copy only valid Jekyll posts (YYYY-MM-DD-*.md)
rsync -av --delete --include='????-??-??-*.md' --exclude='*' "$OBSIDIAN_BLOG/" "$JEKYLL_POSTS/"

echo "📊 Posts:"
ls -1 "$JEKYLL_POSTS/"

echo ""
cd "$REPO"
if git diff --quiet && git diff --cached --quiet; then
  echo "✅ No changes to deploy."
else
  git add -A
  git commit -m "$MSG"
  git push origin main
  echo "🚀 Deployed! Wait 1-2 min for GitHub Pages to update."
fi
