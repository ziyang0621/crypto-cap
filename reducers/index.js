import { combineReducers } from 'redux';
import cryptoInfo from './crypto_info_reducer';
import watchlist from './watchlist_reducer';

export default combineReducers({
  cryptoInfo,
  watchlist,
});
