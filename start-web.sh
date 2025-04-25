#!/bin/bash

# 确保脚本在任何命令失败时停止执行
set -e

# 清理可能的端口占用
echo "检查并清理可能的端口占用..."
lsof -ti:19006 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true

# 安装依赖
echo "安装依赖..."
npm install --legacy-peer-deps

# 启动代理服务器
echo "启动API代理服务器..."
node server.js &
PROXY_PID=$!

# 等待代理服务器启动
echo "等待代理服务器完全启动..."
sleep 3

# 启动Web应用
echo "启动Web应用..."
npx expo start --web

# 捕获Ctrl+C信号，确保清理所有进程
trap "kill $PROXY_PID; echo '已停止所有服务'; exit" INT TERM

# 等待所有后台进程完成
wait 