import axios from 'axios';
import {
  FETCH_CRYPTO_LIST
} from './types';

const ROOT_URL = 'https://api.coinmarketcap.com/v1/ticker';

export const fetchCryptoList = (currency, limit, callback) => async dispatch => {
  try {
    const { data: list } = await axios.get(ROOT_URL, {
      params: {
        convert: currency,
        limit: limit,
      }
    });

    console.log('fetchCryptoList', list);

    dispatch({ type: FETCH_CRYPTO_LIST,  list: list, error: null });

    callback(list, null);
  } catch(error) {
    console.error('fetchCryptoList error', error);

    dispatch({ type: FETCH_CRYPTO_LIST, list: list, error: error });
    callback(null, error);
  }
};
