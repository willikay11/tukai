import React from 'react';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ClaimPlaceContent } from './ClaimPlaceContent';

const replace = jest.fn();
const push = jest.fn();
const back = jest.fn();
let searchParams = new URLSearchParams();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace, push, back }),
  useSearchParams: () => searchParams,
}));

let sessionState: { data: unknown; status: string } = {
  data: { user: { id: 'u1' } },
  status: 'authenticated',
};
jest.mock('next-auth/react', () => ({ useSession: () => sessionState }));

const toast = jest.fn();
jest.mock('@/app/shared/hooks/useToast', () => ({ useToast: () => ({ toast }) }));

const useGetCommunities = jest.fn();
const submitVerification = jest.fn();
const uploadDocument = jest.fn();
jest.mock('@/app/shared/hooks/useCommunities', () => ({
  useGetCommunities: (params: Record<string, unknown>) => useGetCommunities(params),
  useSubmitCommunityVerification: () => ({ mutateAsync: submitVerification }),
  useUploadVerificationDocument: () => ({ mutateAsync: uploadDocument }),
}));

const claimPlace = jest.fn();
const createPlace = jest.fn();
const usePlace = jest.fn();
const usePlaces = jest.fn();
jest.mock('@/app/shared/hooks/usePlaces', () => ({
  useClaimPlaceOwnership: () => ({ mutateAsync: claimPlace }),
  useCreatePlace: () => ({ mutateAsync: createPlace }),
  usePlace: (id: string | null, enabled: boolean) => usePlace(id, enabled),
  usePlaces: (params: Record<string, unknown>) => usePlaces(params),
  useGoogleMapsAutocomplete: () => ({ data: { data: [] }, isFetching: false }),
}));

const community = { id: 'c1', title: 'Nairobi Runners', photos: [] };
const otherCommunity = { id: 'c2', title: 'Karen Cyclists', photos: [] };
const place = { id: 'p1', title: 'Talisman', photos: [], location: { city: 'Karen' } };

const withCommunities = (results: unknown[], isLoading = false) =>
  useGetCommunities.mockReturnValue({ data: { data: { results } }, isLoading });

const attachDocuments = async (user: ReturnType<typeof userEvent.setup>) => {
  const input = screen.getByLabelText('Attach document');

  await user.click(screen.getByRole('button', { name: 'Certificate of Incorporation' }));
  await user.upload(input, new File(['a'], 'incorporation.pdf', { type: 'application/pdf' }));

  await user.click(screen.getByRole('button', { name: 'Business License' }));
  await user.upload(input, new File(['b'], 'licence.pdf', { type: 'application/pdf' }));
};

describe('ClaimPlaceContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    searchParams = new URLSearchParams('placeId=p1');
    sessionState = { data: { user: { id: 'u1' } }, status: 'authenticated' };
    withCommunities([community]);
    usePlace.mockReturnValue({ data: { data: place } });
    usePlaces.mockReturnValue({ data: { data: { results: [] } }, isFetching: false });
    createPlace.mockResolvedValue({ data: { id: 'p2' } });
    claimPlace.mockResolvedValue({ success: true });
    submitVerification.mockResolvedValue({ success: true });
    uploadDocument.mockResolvedValue({ success: true });
  });

  // Ownership belongs to a community, so someone who hosts none has nothing to
  // claim with — they are sent to make one and brought straight back
  it('sends a reader with no communities to create one first', async () => {
    withCommunities([]);

    render(<ClaimPlaceContent />);

    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith(
        `/communities/create?returnTo=${encodeURIComponent('/places/claim?placeId=p1')}`,
      ),
    );
  });

  it('does not redirect while the communities are still loading', () => {
    withCommunities([], true);

    render(<ClaimPlaceContent />);

    expect(replace).not.toHaveBeenCalled();
  });

  // The picker is the create-experience flow's own selector, so a reader who
  // hosts several communities chooses between them the same way there
  it('claims on behalf of the community the reader picks', async () => {
    withCommunities([community, otherCommunity]);
    const user = userEvent.setup();

    render(<ClaimPlaceContent />);
    await screen.findByText('Talisman');
    await user.click(screen.getByRole('button', { name: 'Karen Cyclists' }));
    await attachDocuments(user);

    await user.click(screen.getByRole('button', { name: 'Submit for review' }));

    await waitFor(() =>
      expect(claimPlace).toHaveBeenCalledWith({ placeId: 'p1', communityId: 'c2' }),
    );
  });

  it('opens on the place named in the URL', async () => {
    render(<ClaimPlaceContent />);

    expect(await screen.findByText('Talisman')).toBeInTheDocument();
  });

  it('cannot be submitted until proof of ownership is attached', async () => {
    render(<ClaimPlaceContent />);

    expect(await screen.findByRole('button', { name: 'Submit for review' })).toBeDisabled();
  });

  it('claims the place, then files the documents against the community', async () => {
    const user = userEvent.setup();

    render(<ClaimPlaceContent />);
    await screen.findByText('Talisman');
    await attachDocuments(user);

    await user.click(screen.getByRole('button', { name: 'Submit for review' }));

    await waitFor(() =>
      expect(claimPlace).toHaveBeenCalledWith({ placeId: 'p1', communityId: 'c1' }),
    );
    expect(submitVerification).toHaveBeenCalledWith('c1');
    expect(uploadDocument).toHaveBeenCalledTimes(2);
    expect(uploadDocument).toHaveBeenCalledWith(
      expect.objectContaining({ communityId: 'c1', documentType: 'certificate_of_incorporation' }),
    );
  });

  // The confirmation names the place and holds until the reader dismisses it,
  // rather than navigating out from under them
  it('confirms the request and only then moves on', async () => {
    const user = userEvent.setup();

    render(<ClaimPlaceContent />);
    await screen.findByText('Talisman');
    await attachDocuments(user);

    await user.click(screen.getByRole('button', { name: 'Submit for review' }));

    expect(await screen.findByText('Request Submitted Successfully')).toBeInTheDocument();
    expect(
      screen.getByText(/Your request to link Talisman to your community has been sent/),
    ).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Done' }));

    expect(push).toHaveBeenCalledWith('/places/p1');
  });

  // The API rejects a second application while one is under review, which says
  // the application already exists — the documents still belong on it
  it('still uploads the documents when a verification is already open', async () => {
    submitVerification.mockRejectedValue({ message: 'already pending' });
    const user = userEvent.setup();

    render(<ClaimPlaceContent />);
    await screen.findByText('Talisman');
    await attachDocuments(user);

    await user.click(screen.getByRole('button', { name: 'Submit for review' }));

    await waitFor(() => expect(uploadDocument).toHaveBeenCalledTimes(2));
    expect(await screen.findByText('Request Submitted Successfully')).toBeInTheDocument();
  });

  it('reports a failed claim instead of navigating away', async () => {
    claimPlace.mockRejectedValue({ message: 'This place is already claimed' });
    const user = userEvent.setup();

    render(<ClaimPlaceContent />);
    await screen.findByText('Talisman');
    await attachDocuments(user);

    await user.click(screen.getByRole('button', { name: 'Submit for review' }));

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({ description: 'This place is already claimed' }),
      ),
    );
    expect(screen.queryByText('Request Submitted Successfully')).not.toBeInTheDocument();
  });
});
