const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

// 代理CoinGecko币种市场数据
app.get('/api/coins/markets', async (req, res) => {
  try {
    console.log(
      'Proxying request to CoinGecko markets API with params:',
      req.query
    );
    const response = await axios.get(
      'https://api.coingecko.com/api/v3/coins/markets',
      {
        params: req.query,
      }
    );
    console.log(`Successfully retrieved ${response.data.length} coins data`);
    res.json(response.data);
  } catch (error) {
    console.error('Error proxying to CoinGecko:', error.message);
    res.status(error.response?.status || 500).json({
      error: error.message,
      details: error.response?.data || 'No additional details',
    });
  }
});

// 代理CoinGecko币种图表数据
app.get('/api/coins/:id/market_chart', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(
      `Proxying request to CoinGecko chart API for ${id} with params:`,
      req.query
    );

    // 验证参数
    if (!id) {
      return res.status(400).json({ error: 'Coin ID is required' });
    }

    // 准备请求参数
    const params = { ...req.query };
    if (!params.vs_currency) {
      params.vs_currency = 'usd'; // 默认使用USD
    }

    // 获取数据
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/coins/${id}/market_chart`,
      {
        params: params,
        timeout: 10000, // 10秒超时
      }
    );

    // 验证响应
    if (
      !response.data ||
      !response.data.prices ||
      response.data.prices.length === 0
    ) {
      console.warn(`Empty or invalid response for ${id}`);
    } else {
      console.log(
        `Successfully retrieved chart data for ${id} with ${response.data.prices.length} data points`
      );
    }

    res.json(response.data);
  } catch (error) {
    console.error('Error proxying to CoinGecko chart API:', error.message);

    // 详细记录错误信息
    if (error.response) {
      console.error(`API responded with status ${error.response.status}`);
      console.error('Error details:', error.response.data);
    } else if (error.request) {
      console.error('No response received from API');
    } else {
      console.error('Error setting up request:', error.message);
    }

    // 返回友好的错误信息
    res.status(error.response?.status || 500).json({
      error: error.message,
      details: error.response?.data || 'No additional details',
    });
  }
});

// 如果在生产环境，提供静态文件
if (process.env.NODE_ENV === 'production') {
  // 提供静态文件
  app.use(express.static(path.join(__dirname, 'web/build')));

  // 所有未匹配的路由返回index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'web/build/index.html'));
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
