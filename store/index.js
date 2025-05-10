import { configureStore } from '@reduxjs/toolkit';
import reducers from '../reducers';

// Create store with middleware
const store = configureStore({
  reducer: reducers,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }),
});

export default store;
