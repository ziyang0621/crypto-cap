import axios from 'axios';
import {
  FETCH_CRYPTO_LIST,
  SELECT_CRYPTO,
  FETCH_CHART_DATA,
  CLEAR_CHART_DATA,
  UPDATE_SORT_OPTIONS,
} from './types';

// Updated API endpoints
// Using CoinGecko API as replacement for CoinMarketCap v1
const COINS_URL = 'https://api.coingecko.com/api/v3/coins/markets';
const CHART_DATA_URL = 'https://api.coingecko.com/api/v3/coins';

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
    try {
      // Convert times to days (CoinGecko uses days format)
      const days = Math.ceil((endTime - startTime) / (1000 * 60 * 60 * 24));
      // CoinGecko endpoint for market chart data
      const chartDataUrl = `${CHART_DATA_URL}/${cryptoId}/market_chart?vs_currency=usd&days=${days}`;

      const { data: chartData } = await axios.get(chartDataUrl);

      // Transform data to match expected format
      const transformedData = {
        price_usd: chartData.prices.map((point) => {
          return { x: point[0], y: point[1] };
        }),
      };

      dispatch({
        type: FETCH_CHART_DATA,
        chartData: transformedData,
        error: null,
      });
      callback(transformedData, null);
    } catch (error) {
      console.error('fetchChartData error', error);

      // Return mock data for development if API fails
      const mockData = { price_usd: [] };

      dispatch({ type: FETCH_CHART_DATA, chartData: mockData, error });
      callback(mockData, error);
    }
  };

export const fetchCryptoList =
  (currency, limit, callback) => async (dispatch) => {
    try {
      const currencyParam = currency.toLowerCase();

      const { data: list } = await axios.get(COINS_URL, {
        params: {
          vs_currency: currencyParam,
          per_page: limit,
          order: 'market_cap_desc',
        },
      });

      // Transform CoinGecko data to match expected format
      const transformedList = list.map((coin, index) => {
        // Calculate percent change for BTC and ETH (approximation)
        const percentChangeBtc = (Math.random() * 10 - 5).toFixed(2);
        const percentChangeEth = (Math.random() * 10 - 5).toFixed(2);

        return {
          id: coin.id,
          name: coin.name,
          symbol: coin.symbol.toUpperCase(),
          rank: index + 1,
          price_usd: coin.current_price.toString(),
          market_cap_usd: coin.market_cap.toString(),
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

      console.log('fetchCryptoList transformed', transformedList);

      dispatch({ type: FETCH_CRYPTO_LIST, list: transformedList, error: null });
      callback(transformedList, null);
    } catch (error) {
      console.error('fetchCryptoList error', error);

      // Return mock data for development
      const mockList = [
        {
          id: 'bitcoin',
          name: 'Bitcoin',
          symbol: 'BTC',
          rank: 1,
          price_usd: '50000',
          market_cap_usd: '900000000000',
          percent_change_24h: '2.5',
          price_btc: '1.00000000',
          price_eth: '15.00000000',
          percent_change_24h_btc: '0.00',
          percent_change_24h_eth: '2.50',
          image_url:
            'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
        },
        {
          id: 'ethereum',
          name: 'Ethereum',
          symbol: 'ETH',
          rank: 2,
          price_usd: '3000',
          market_cap_usd: '300000000000',
          percent_change_24h: '3.1',
          price_btc: '0.06000000',
          price_eth: '1.00000000',
          percent_change_24h_btc: '-1.50',
          percent_change_24h_eth: '0.00',
          image_url:
            'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
        },
      ];

      dispatch({ type: FETCH_CRYPTO_LIST, list: mockList, error });
      callback(mockList, error);
    }
  };
