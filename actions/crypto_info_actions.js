import axios from 'axios';
import {
  FETCH_CRYPTO_LIST,
  SELECT_CRYPTO,
  FETCH_CHART_DATA,
  CLEAR_CHART_DATA
} from './types';

const COINS_URL = 'https://api.coinmarketcap.com/v1/ticker';
const CHART_DATA_URL = 'https://graphs.coinmarketcap.com/currencies';

export const selectCrypto = crypto => {
  return { type: SELECT_CRYPTO, crypto: crypto };
};

export const clearChartData = () => {
  return { type: CLEAR_CHART_DATA };
};

export const fetchChartData = (
  cryptoId,
  startTime,
  endTime,
  callback
) => async dispatch => {
  try {
    const chartDataUrl = `${CHART_DATA_URL}/${cryptoId}/${startTime}/${endTime}`;
    const { data: chartData } = await axios.get(chartDataUrl);

    dispatch({ type: FETCH_CHART_DATA, chartData: chartData, error: null });
    callback(chartData, null);
  } catch (error) {
    console.error('fetchChartData error', error);

    dispatch({ type: FETCH_CHART_DATA, chartData: null, error: error });
    callback(null, error);
  }
};

export const fetchCryptoList = (
  currency,
  limit,
  callback
) => async dispatch => {
  try {
    const { data: list } = await axios.get(COINS_URL, {
      params: {
        convert: currency,
        limit: limit
      }
    });

    console.log('fetchCryptoList', list);

    dispatch({ type: FETCH_CRYPTO_LIST, list: list, error: null });

    callback(list, null);
  } catch (error) {
    console.error('fetchCryptoList error', error);

    dispatch({ type: FETCH_CRYPTO_LIST, list: null, error: error });
    callback(null, error);
  }
};
