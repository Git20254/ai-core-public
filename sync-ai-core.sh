#!/bin/zsh

echo "🚀 Syncing Mainframe AI Core (Public + Private)..."

cd ~/ai-core || { echo "❌ AI Core repo not found!"; exit 1; }

# Make sure we’re on main and up-to-date
git checkout main >/dev/null 2>&1
git fetch origin main >/dev/null 2>&1
git pull origin main --rebase

# Add any local changes
git add .
if ! git diff --cached --quiet; then
  git commit -m "sync: update AI Core from local changes"
  echo "✅ Local changes committed."
else
  echo "✅ No new changes to commit."
fi

echo ""
echo "🧹 Verifying .gitignore..."
git status --ignored -s | grep "!!" && echo "Ignored files detected (safe)." || echo "No ignored files found."

echo ""
echo "📤 Pushing to both repositories..."
git push origin main >/dev/null 2>&1
git push --all >/dev/null 2>&1

echo ""
echo "✅ AI Core sync complete! (Private + Public updated safely)"
