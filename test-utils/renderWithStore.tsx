import { ReactElement } from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { RenderResult, render } from '@testing-library/react';
import { Provider } from 'react-redux';

import { claimsReducer } from '@/slices/claimsSlice';
import resetReducer from '@/slices/resetSlice';
import userReducer from '@/slices/userSlice';

/**
 * Renders inside a fresh, unpersisted Redux store - the same reducers
 * `store/store.ts` combines, minus redux-persist.
 *
 * Anything that reads or dispatches to the real app store (ConnectPlaceDrawerContext's
 * claims, for one) needs a `<Provider>` ancestor in a test, same as in the app.
 * A fresh store per call, rather than the app's own singleton, keeps one
 * test's dispatches from leaking into the next test in the same file.
 */
export const renderWithStore = (ui: ReactElement): RenderResult => {
  const store = configureStore({
    reducer: combineReducers({ userReducer, resetReducer, claimsReducer }),
  });

  return render(<Provider store={store}>{ui}</Provider>);
};
