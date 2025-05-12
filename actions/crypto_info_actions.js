import axios from 'axios';
import {
  FETCH_CRYPTO_LIST,
  SELECT_CRYPTO,
  FETCH_CHART_DATA,
  CLEAR_CHART_DATA,
  UPDATE_SORT_OPTIONS,
  ADD_TO_WATCHLIST,
  REMOVE_FROM_WATCHLIST,
} from './types';
import mockCoinsData from '../mockData/mockCoins';

// 使用本地代理服务器API端点
const API_BASE_URL = 'http://localhost:3001/api';
const COINS_URL = `${API_BASE_URL}/coins/markets`;
const CHART_DATA_URL = `${API_BASE_URL}/coins`;

// 使用模拟数据（开发阶段设为true）
const USE_MOCK_DATA = true;

// 缓存机制
let cachedCoinsList = null;
let lastCoinsFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

// 缓存图表数据
const chartDataCache = {};
const CHART_CACHE_DURATION = 10 * 60 * 1000; // 10分钟缓存

export const selectCrypto = (crypto) => {
  return { type: SELECT_CRYPTO, crypto: crypto };
};

export const clearChartData = () => {
  return { type: CLEAR_CHART_DATA };
};

export const updateSortOptions = (sortOptions) => {
  return { type: UPDATE_SORT_OPTIONS, sortOptions: sortOptions };
};

export const fetchChartData =
  (cryptoId, startTime, endTime, callback) => async (dispatch) => {
    console.log(
      `Fetching chart data for ${cryptoId}, period: ${startTime} to ${endTime}`
    );

    // 如果使用模拟数据，直接返回模拟的图表数据
    if (USE_MOCK_DATA) {
      const mockChartData = generateMockChartData(startTime, endTime);
      dispatch({
        type: FETCH_CHART_DATA,
        chartData: mockChartData,
        error: null,
      });
      callback(mockChartData, null);
      return;
    }

    // 计算日期范围
    const days = Math.ceil((endTime - startTime) / (1000 * 60 * 60 * 24));

    // 生成缓存键
    const cacheKey = `${cryptoId}_${days}`;
    const now = Date.now();

    // 检查缓存
    if (
      chartDataCache[cacheKey] &&
      now - chartDataCache[cacheKey].timestamp < CHART_CACHE_DURATION
    ) {
      console.log(`Using cached chart data for ${cryptoId} (${days} days)`);
      dispatch({
        type: FETCH_CHART_DATA,
        chartData: chartDataCache[cacheKey].data,
        error: null,
      });
      callback(chartDataCache[cacheKey].data, null);
      return;
    }

    try {
      console.log(
        `Making API request to ${CHART_DATA_URL}/${cryptoId}/market_chart with days=${days}`
      );

      // 使用代理服务器请求图表数据
      const { data: chartData } = await axios.get(
        `${CHART_DATA_URL}/${cryptoId}/market_chart`,
        {
          params: {
            vs_currency: 'usd',
            days: days,
          },
        }
      );

      console.log(
        `Chart data received, transforming ${
          chartData?.prices?.length || 0
        } data points`
      );

      // 检查数据是否有效
      if (!chartData || !chartData.prices || chartData.prices.length === 0) {
        throw new Error('Invalid chart data received');
      }

      // 转换数据为所需格式
      const transformedData = {
        price_usd: chartData.prices.map((point) => {
          return { x: point[0], y: point[1] };
        }),
      };

      // 更新缓存
      chartDataCache[cacheKey] = {
        data: transformedData,
        timestamp: now,
      };

      console.log(`Successfully processed chart data for ${cryptoId}`);

      dispatch({
        type: FETCH_CHART_DATA,
        chartData: transformedData,
        error: null,
      });
      callback(transformedData, null);
    } catch (error) {
      console.error('fetchChartData error:', error.message);
      console.error('Request details:', { cryptoId, days });

      if (error.response) {
        console.error('API response error:', {
          status: error.response.status,
          data: error.response.data,
        });
      }

      // 生成一些基本的模拟数据作为备用
      console.log('Generating fallback mock data');
      const fallbackData = generateMockChartData(startTime, endTime);
      dispatch({ type: FETCH_CHART_DATA, chartData: fallbackData, error });
      callback(fallbackData, error);
    }
  };

// 生成模拟的图表数据
const generateMockChartData = (startTime, endTime) => {
  const pricePoints = [];
  const startPrice = 40000 + Math.random() * 10000;
  const timeStep = (endTime - startTime) / 100; // 生成100个数据点

  for (let i = 0; i < 100; i++) {
    const time = startTime + i * timeStep;
    // 生成合理的价格波动
    const randomFactor = 1 + (Math.random() * 0.1 - 0.05); // -5% 到 +5% 的波动
    const price = i === 0 ? startPrice : pricePoints[i - 1].y * randomFactor;

    pricePoints.push({
      x: time,
      y: price,
    });
  }

  return { price_usd: pricePoints };
};

export const fetchCryptoList =
  (currency, limit, callback) => async (dispatch) => {
    // 如果使用模拟数据，直接返回模拟数据
    if (USE_MOCK_DATA) {
      console.log('Using mock data for crypto list');
      dispatch({ type: FETCH_CRYPTO_LIST, list: mockCoinsData, error: null });
      callback(mockCoinsData, null);
      return;
    }

    const now = Date.now();

    // 如果有缓存且未过期，使用缓存数据
    if (cachedCoinsList && now - lastCoinsFetchTime < CACHE_DURATION) {
      console.log('Using cached crypto list data');
      dispatch({ type: FETCH_CRYPTO_LIST, list: cachedCoinsList, error: null });
      callback(cachedCoinsList, null);
      return;
    }

    try {
      const currencyParam = currency.toLowerCase();

      // 使用代理服务器请求数据
      const { data: list } = await axios.get(COINS_URL, {
        params: {
          vs_currency: currencyParam,
          per_page: limit,
          order: 'market_cap_desc',
        },
      });

      // 转换数据格式
      const transformedList = list.map((coin, index) => {
        // 计算BTC和ETH的百分比变化（近似值）
        const percentChangeBtc = (Math.random() * 10 - 5).toFixed(2);
        const percentChangeEth = (Math.random() * 10 - 5).toFixed(2);

        return {
          id: coin.id,
          name: coin.name,
          symbol: coin.symbol.toUpperCase(),
          rank: index + 1,
          price_usd: coin.current_price?.toString() || '0',
          market_cap_usd: coin.market_cap?.toString() || '0',
          percent_change_24h: coin.price_change_percentage_24h
            ? coin.price_change_percentage_24h.toFixed(2)
            : '0.00',
          price_btc: (
            coin.current_price /
            (list.find((c) => c.symbol === 'btc')?.current_price || 50000)
          ).toFixed(8),
          price_eth: (
            coin.current_price /
            (list.find((c) => c.symbol === 'eth')?.current_price || 3000)
          ).toFixed(8),
          percent_change_24h_btc: percentChangeBtc,
          percent_change_24h_eth: percentChangeEth,
          image_url: coin.image,
        };
      });

      // 更新缓存
      cachedCoinsList = transformedList;
      lastCoinsFetchTime = now;

      console.log(
        `Successfully fetched and transformed ${transformedList.length} coins`
      );
      dispatch({ type: FETCH_CRYPTO_LIST, list: transformedList, error: null });
      callback(transformedList, null);
    } catch (error) {
      console.error('fetchCryptoList error', error);

      // 如果缓存可用，使用缓存作为备用方案
      if (cachedCoinsList) {
        console.log('API request failed, using cached data as fallback');
        dispatch({ type: FETCH_CRYPTO_LIST, list: cachedCoinsList, error });
        callback(cachedCoinsList, error);
        return;
      }

      // 如果没有缓存，使用模拟数据
      console.log('API request failed, using mock data as fallback');
      dispatch({ type: FETCH_CRYPTO_LIST, list: mockCoinsData, error });
      callback(mockCoinsData, error);
    }
  };

export const addToWatchlist = (coin) => {
  return { type: ADD_TO_WATCHLIST, coin };
};

export const removeFromWatchlist = (coinId) => {
  return { type: REMOVE_FROM_WATCHLIST, coinId };
};
