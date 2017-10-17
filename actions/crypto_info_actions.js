import axios from 'axios';
import { FETCH_CRYPTO_LIST, SELECT_CRYPTO } from './types';

const ROOT_URL = 'https://api.coinmarketcap.com/v1/ticker';

export const selectCrypto = crypto => {
  return { type: SELECT_CRYPTO, crypto: crypto };
};

export const fetchCryptoList = (
  currency,
  limit,
  callback
) => async dispatch => {
  try {
    const { data: list } = await axios.get(ROOT_URL, {
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
