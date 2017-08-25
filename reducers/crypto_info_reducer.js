import _ from 'lodash';
import {
  FETCH_CRYPTO_LIST
} from '../actions/types';
const IMAGE_URL = 'https://files.coinmarketcap.com/static/img/coins/16x16/';

export default function(state = { list: null, error: null }, action) {
  const { type, list, error } = action;
  switch (type) {
    case FETCH_CRYPTO_LIST:
      let cryptoList = _.forEach(list, (item) => {
        const imageFileName = item.id.replace(' ', '-') + '.png';
        item.image_url = IMAGE_URL + imageFileName;
      });
      return { ...state, list: cryptoList, error };
    default:
      return state;
  }
}
