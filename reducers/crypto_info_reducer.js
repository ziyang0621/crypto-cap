import _ from 'lodash';
import { FETCH_CRYPTO_LIST, SELECT_CRYPTO } from '../actions/types';
const IMAGE_URL = 'https://files.coinmarketcap.com/static/img/coins/32x32/';

export default function(
  state = { list: null, crypto: null, error: null },
  action
) {
  const { type, list, crypto, error } = action;
  switch (type) {
    case SELECT_CRYPTO:
      return { ...state, selectedCrypto: crypto };
    case FETCH_CRYPTO_LIST:
      let cryptoList = _.forEach(list, item => {
        const imageFileName = item.id.replace(' ', '-') + '.png';
        item.image_url = IMAGE_URL + imageFileName;
      });
      return { ...state, list: cryptoList, error };
    default:
      return state;
  }
}
