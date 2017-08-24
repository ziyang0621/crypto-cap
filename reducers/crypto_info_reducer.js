import {
  FETCH_CRYPTO_LIST
} from '../actions/types';

export default function(state = { list: null, error: null }, action) {
  const { type, list, error } = action;
  switch (type) {
    case FETCH_CRYPTO_LIST:
      return { ...state, list, error };
    default:
      return state;
  }
}
