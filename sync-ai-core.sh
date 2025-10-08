#!/bin/zsh
echo "🚀 Syncing Mainframe AI Core (Public + Private)..."

# Make sure we're in the right folder
cd "$(dirname "$0")"

# Stage and commit changes
git add .
git commit -m "sync: update from local changes" || echo "✅ No new changes to commit."

# Pull latest updates (in case remote changed)
git pull origin main --rebase

echo ""
echo "🧹 Verifying .gitignore..."
if [ ! -f ".gitignore" ]; then
  echo "⚠️  .gitignore missing! Please create one before syncing to public."
  exit 1
fi

# Quick audit for ignored files that shouldn't go public
echo ""
echo "🔍 Checking for private files accidentally staged..."
if git diff --cached --name-only | grep -E "data/|logs/|venv/|models/|artifacts/|__pycache__|\.faiss|\.mp3|\.json" > /dev/null; then
  echo "🚫 Private or data files detected in staging area! Aborting public push."
  echo "🧠 Please unstage them before running sync again."
  git reset HEAD
  exit 1
fi

echo ""
echo "📤 Pushing to both repositories..."
git push origin main

echo ""
echo "✅ Sync complete. All code changes pushed to public and private safely."
