import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import reducers from '../reducers';

// Create store with middleware
const store = createStore(
  reducers,
  {}, // initial state
  applyMiddleware(thunk)
);

export default store;
