#!/bin/zsh
echo "🚀 Syncing Mainframe AI Core (Public + Private)..."

git add .
git commit -m "sync: update from local changes" || echo "✅ No new changes to commit."
git pull origin main --rebase

echo ""
echo "📤 Pushing to both repositories..."
git push origin main

echo ""
echo "✅ Sync complete."
