#!/usr/bin/env sh

# 当发生错误时中止脚本
set -e

# 构建
npm run generate
npm run upload
npm run refresh

git add -A
git commit -m 'deploy'
git push origin master
