import { useEffect } from 'react';

import { render, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';

import { store } from '@/store/store';

import { ConnectPlaceDrawerProvider, useConnectPlaceDrawer } from './ConnectPlaceDrawerContext';

// Keeps this test to the Redux/persistence wiring - the drawer UI itself is
// exercised elsewhere (ConnectPlaceDrawer.test.tsx)
jest.mock('@/app/shared/components/Places/ConnectPlaceDrawer', () => ({
  ConnectPlaceDrawer: () => null,
}));

const SubmitOnMount = () => {
  const { submitClaim } = useConnectPlaceDrawer()!;
  useEffect(() => {
    submitClaim({
      communityId: 'c1',
      communityName: 'Weekend Readers',
      places: [{ id: 'place-1', title: 'Karura Forest', isOnTukai: true }],
      documents: [],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
};

/**
 * Regression test for: submitting a claim shows "pending review", but
 * reloading the page and reopening the place loses that status.
 *
 * The root cause was that `claims` lived in plain React state inside
 * ConnectPlaceDrawerProvider, which resets on every page load. This exercises
 * the real app store (`store/store.ts`), not the test-only unpersisted one
 * `renderWithStore` builds elsewhere, specifically to prove a submitted claim
 * reaches the redux-persist storage a real reload would rehydrate from.
 */
describe('claim persistence', () => {
  beforeEach(() => localStorage.clear());

  it('writes a submitted claim to localStorage, so a reload would still find it', async () => {
    render(
      <Provider store={store}>
        <ConnectPlaceDrawerProvider>
          <SubmitOnMount />
        </ConnectPlaceDrawerProvider>
      </Provider>,
    );

    await waitFor(() => {
      const persisted = localStorage.getItem('persist:root');
      expect(persisted).toBeTruthy();

      const claimsState = JSON.parse(JSON.parse(persisted as string).claimsReducer);
      expect(claimsState.claims).toHaveLength(1);
      expect(claimsState.claims[0]).toMatchObject({
        communityId: 'c1',
        places: [{ id: 'place-1', title: 'Karura Forest' }],
        status: 'review',
      });
    });
  });
});
