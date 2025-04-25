# Crypto Cap

A cryptocurrency price tracking app built with React Native and Expo.

## How to run

1. Install dependencies:

```
npm install
```

2. Start the development server:

```
npm start
```

3. Launch on your device:

- Scan the QR code with the Expo Go app on your phone
- Press 'i' to open in iOS simulator (requires Xcode)
- Press 'a' to open in Android emulator (requires Android Studio)

## Features

- View top cryptocurrencies by market cap
- Track prices in USD, BTC, and ETH
- View detailed price information and historical data
- Sort by market cap or percentage change

# CryptoCap API 解决方案

这个项目包含了一个解决 CoinGecko API 的 CORS 和请求限制问题的解决方案。

## 问题背景

在使用 CoinGecko API 时，我们遇到两个主要问题：

1. **CORS 错误**：浏览器的同源策略阻止从前端直接访问 CoinGecko API
2. **请求限制 (429 错误)**：CoinGecko 免费 API 有严格的速率限制，频繁请求会导致"Too Many Requests"错误

## 解决方案

项目实现了以下解决方案：

1. **本地代理服务器**：解决 CORS 问题
2. **数据缓存机制**：减少 API 请求频率
3. **模拟数据**：在 API 不可用时提供备选数据

## 如何使用

### 安装依赖

```bash
# 安装代理服务器依赖
npm install
```

### 运行应用

使用提供的启动脚本同时启动代理服务器和 React Native 应用：

```bash
chmod +x start.sh  # 赋予执行权限
./start.sh  # 运行脚本
```

或者分别启动：

```bash
# 启动代理服务器
node server.js

# 在另一个终端启动React Native应用
cd web
npm start
```

## 模拟数据

如果需要完全使用模拟数据（例如在没有网络连接的情况下开发），请修改 `actions/crypto_info_actions.js` 文件中的以下变量：

```javascript
// 设置为true使用模拟数据，false使用真实API
const USE_MOCK_DATA = true;
```

## 自定义配置

可以在 `actions/crypto_info_actions.js` 中调整这些参数：

```javascript
// 缓存持续时间（毫秒）
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟
const CHART_CACHE_DURATION = 10 * 60 * 1000; // 10分钟

// 代理服务器URL
const API_BASE_URL = 'http://localhost:3001/api';
```

## 生产环境

对于生产环境，建议：

1. 将代理服务器部署到云端服务器
2. 获取 CoinGecko API 密钥以增加请求限制
3. 实现更可靠的缓存机制（如 Redis）
