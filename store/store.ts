import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import { claimsReducer } from '../slices/claimsSlice';
import resetReducer from '../slices/resetSlice';
import userReducer from '../slices/userSlice';

const persistConfig = {
  key: 'root',
  storage,
};

const persistedReducer = persistReducer(
  persistConfig,
  combineReducers({ userReducer, resetReducer, claimsReducer }),
);

export const store = configureStore({
  reducer: persistedReducer,
  devTools: process.env.NODE_ENV !== 'production',
  // redux-persist wraps actions/state with non-serializable internals; the
  // default middleware's check is for app state, which stays plain here
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: { ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'] } }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
