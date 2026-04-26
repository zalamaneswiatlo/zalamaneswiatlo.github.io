#!/bin/bash
set -e

SOURCE_BRANCH="local_with_history"
TARGET_BRANCH="publish"

git checkout "$SOURCE_BRANCH"
git branch -D "$TARGET_BRANCH" 2>/dev/null || true
git checkout --orphan "$TARGET_BRANCH"
git add -A
git commit -m "Clean state from $SOURCE_BRANCH"
git push -f origin "$TARGET_BRANCH"
git checkout "$SOURCE_BRANCH"
