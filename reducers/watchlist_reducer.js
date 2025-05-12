import { ADD_TO_WATCHLIST, REMOVE_FROM_WATCHLIST } from '../actions/types';

const initialState = {
  list: [], // Array of coin objects
};

export default function (state = initialState, action) {
  switch (action.type) {
    case ADD_TO_WATCHLIST:
      // Prevent duplicates
      if (state.list.find((coin) => coin.id === action.coin.id)) {
        return state;
      }
      return {
        ...state,
        list: [...state.list, action.coin],
      };
    case REMOVE_FROM_WATCHLIST:
      return {
        ...state,
        list: state.list.filter((coin) => coin.id !== action.coinId),
      };
    default:
      return state;
  }
}
