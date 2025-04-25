#!/bin/bash

# 确保脚本在任何命令失败时停止执行
set -e

echo "使用npm install安装依赖，并使用legacy-peer-deps跳过依赖冲突..."
npm install --legacy-peer-deps

# 启动应用
echo "启动API代理服务器和应用..."
npm run dev 