#!/bin/bash
# Sync blog posts from Obsidian → Jekyll and deploy
# Usage: ./sync-blog.sh [commit message]

OBSIDIAN_BLOG=~/workspace/blog
JEKYLL_POSTS=~/code/cgdjustin.github.io/_posts
REPO=~/code/cgdjustin.github.io

MSG="${1:-blog: sync from obsidian}"

echo "📝 Syncing posts from Obsidian..."
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
