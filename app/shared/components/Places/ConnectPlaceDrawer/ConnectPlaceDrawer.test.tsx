import React, { useEffect } from 'react';

import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  ConnectPlaceDrawerProvider,
  OpenConnectPlaceOptions,
  useConnectPlaceDrawer,
} from '@/context/ConnectPlaceDrawerContext';

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: { iconName: string }) => <span data-testid={iconName} />,
}));

jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: { user: { id: 'user-1' } }, status: 'authenticated' }),
}));

const createCommunity = jest.fn().mockResolvedValue({ data: { id: 'new-community' } });
jest.mock('@/app/shared/hooks/useCommunities', () => ({
  useGetCommunities: () => ({
    data: { data: { results: [{ id: 'c1', title: 'Weekend Readers', photos: [] }] } },
    isLoading: false,
  }),
  useCreateCommunity: () => ({ mutateAsync: createCommunity, isPending: false }),
  useSubmitCommunityVerification: () => ({ mutateAsync: jest.fn().mockResolvedValue({}) }),
  useUploadVerificationDocument: () => ({ mutateAsync: jest.fn().mockResolvedValue({}) }),
}));

const PLACE = {
  id: 'place-1',
  title: 'Karura Forest',
  slug: 'karura-forest',
  location: { city: 'Gigiri' },
  photos: [],
  totalReviews: 0,
  averageRating: 0,
};

jest.mock('@/app/shared/hooks/usePlaces', () => ({
  useClaimPlaceOwnership: () => ({ mutateAsync: jest.fn().mockResolvedValue({}) }),
  useCreatePlace: () => ({ mutateAsync: jest.fn() }),
  // Mirrors real React Query: no data while disabled, so the drawer's own
  // reset-on-fresh-open effect (which runs before this resolves) isn't
  // racing a prefill that was never supposed to have arrived yet.
  usePlace: (_id: string | null, enabled = true) => ({ data: enabled ? { data: PLACE } : undefined }),
  usePlaces: () => ({ data: { data: { results: [] } }, isFetching: false }),
}));

jest.mock('@/app/shared/hooks/useAuth', () => ({
  useGetInterestCategories: () => ({ data: [] }),
}));

const toast = jest.fn();
jest.mock('@/app/shared/hooks/useToast', () => ({
  toast: (...args: unknown[]) => toast(...args),
  useToast: () => ({ toast }),
}));

/** Opens the drawer on mount with the given options, through the real context. */
const OpenOnMount = ({ options }: { options?: OpenConnectPlaceOptions }) => {
  const { openConnectPlace } = useConnectPlaceDrawer()!;
  useEffect(() => {
    openConnectPlace(options);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
};

const renderDrawer = (options?: OpenConnectPlaceOptions) =>
  render(
    <ConnectPlaceDrawerProvider>
      <OpenOnMount options={options} />
    </ConnectPlaceDrawerProvider>,
  );

const attachDocument = async (user: ReturnType<typeof userEvent.setup>, label: RegExp, file: File) => {
  await user.click(screen.getByRole('button', { name: label }));
  fireEvent.change(screen.getByLabelText('Attach document'), { target: { files: [file] } });
};

describe('ConnectPlaceDrawer', () => {
  beforeEach(() => jest.clearAllMocks());

  it('keeps Submit for review disabled until a place is connected and two documents are attached', async () => {
    const user = userEvent.setup();
    renderDrawer({ placeId: 'place-1' });

    await screen.findByText('Karura Forest');
    const submit = screen.getByRole('button', { name: 'Submit for review' });
    expect(submit).toBeDisabled();
    expect(screen.getByText(/Attach at least two documents/)).toBeInTheDocument();

    await attachDocument(
      user,
      /Attach certificate of incorporation/i,
      new File(['a'], 'cert.pdf', { type: 'application/pdf' }),
    );
    expect(submit).toBeDisabled();
    expect(screen.getByText('Attach one more document. Claims need at least two.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Business license/ }));
    await attachDocument(
      user,
      /Attach business license/i,
      new File(['b'], 'license.pdf', { type: 'application/pdf' }),
    );

    expect(submit).toBeEnabled();
  });

  it('disconnecting the only place reinstates the missing-step message', async () => {
    const user = userEvent.setup();
    renderDrawer({ placeId: 'place-1' });

    await screen.findByText('Karura Forest');
    expect(screen.queryByText('Search for your place and connect it.')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Disconnect Karura Forest/ }));

    expect(screen.getByText('Search for your place and connect it.')).toBeInTheDocument();
  });

  it('submits the claim and shows the mocked Your claim view', async () => {
    const user = userEvent.setup();
    renderDrawer({ placeId: 'place-1' });

    await screen.findByText('Karura Forest');
    await attachDocument(
      user,
      /Attach certificate of incorporation/i,
      new File(['a'], 'cert.pdf', { type: 'application/pdf' }),
    );
    await user.click(screen.getByRole('button', { name: /Business license/ }));
    await attachDocument(
      user,
      /Attach business license/i,
      new File(['b'], 'license.pdf', { type: 'application/pdf' }),
    );

    await user.click(screen.getByRole('button', { name: 'Submit for review' }));

    expect(await screen.findByText('Under review')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Your claim' })).toBeInTheDocument();
  });

  it('cancels a claim after confirming, and reflects it as cancelled', async () => {
    const user = userEvent.setup();
    renderDrawer({ placeId: 'place-1' });

    await screen.findByText('Karura Forest');
    await attachDocument(
      user,
      /Attach certificate of incorporation/i,
      new File(['a'], 'cert.pdf', { type: 'application/pdf' }),
    );
    await user.click(screen.getByRole('button', { name: /Business license/ }));
    await attachDocument(
      user,
      /Attach business license/i,
      new File(['b'], 'license.pdf', { type: 'application/pdf' }),
    );
    await user.click(screen.getByRole('button', { name: 'Submit for review' }));
    await screen.findByText('Under review');

    await user.click(screen.getByRole('button', { name: /Cancel claim/ }));

    const dialog = await screen.findByRole('alertdialog');
    await user.click(within(dialog).getByRole('button', { name: 'Cancel claim' }));

    await waitFor(() => expect(screen.getByText('Cancelled')).toBeInTheDocument());
    expect(screen.getByText('You cancelled this claim.')).toBeInTheDocument();
  });
});
