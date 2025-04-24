import _ from 'lodash';
import {
  FETCH_CRYPTO_LIST,
  SELECT_CRYPTO,
  FETCH_CHART_DATA,
  CLEAR_CHART_DATA,
  UPDATE_SORT_OPTIONS,
} from '../actions/types';
const IMAGE_URL = 'https://files.coinmarketcap.com/static/img/coins/32x32/';

export default function (
  state = {
    list: null,
    selectedCrypto: null,
    selectedChartData: null,
    sortOptions: { marketCap: 'desc', percentChange: '' },
    error: null,
  },
  action
) {
  const { type, list, crypto, chartData, sortOptions, error } = action;
  switch (type) {
    case SELECT_CRYPTO:
      return { ...state, selectedCrypto: crypto };
    case FETCH_CHART_DATA:
      return { ...state, selectedChartData: chartData, error };
    case CLEAR_CHART_DATA:
      return { ...state, selectedChartData: null };
    case UPDATE_SORT_OPTIONS:
      return { ...state, sortOptions: sortOptions };
    case FETCH_CRYPTO_LIST:
      // If there's no list data, just return the error
      if (!list || list.length === 0) {
        return { ...state, error };
      }

      // CoinGecko data is already processed in the action
      return { ...state, list, error };
    default:
      return state;
  }
}
