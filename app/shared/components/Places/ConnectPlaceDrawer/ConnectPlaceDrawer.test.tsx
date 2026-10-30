import React, { useEffect, useRef } from 'react';

import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  ConnectPlaceDrawerProvider,
  OpenConnectPlaceOptions,
  useConnectPlaceDrawer,
} from '@/context/ConnectPlaceDrawerContext';
import { renderWithStore } from '@/test-utils/renderWithStore';

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: { iconName: string }) => <span data-testid={iconName} />,
}));

jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: { user: { id: 'user-1' } }, status: 'authenticated' }),
}));

const createCommunity = jest.fn().mockResolvedValue({ data: { id: 'new-community' } });
const uploadDocument = jest.fn().mockResolvedValue({});
const deleteDocument = jest.fn().mockResolvedValue({});
let communityVerificationStatus: string | null = null;
let verificationDocuments: unknown;
jest.mock('@/app/shared/hooks/useCommunities', () => ({
  useGetCommunities: () => ({
    data: {
      data: {
        results: [
          {
            id: 'c1',
            title: 'Weekend Readers',
            photos: [],
            verificationStatus: communityVerificationStatus,
          },
        ],
      },
    },
    isLoading: false,
  }),
  useCreateCommunity: () => ({ mutateAsync: createCommunity, isPending: false }),
  useSubmitCommunityVerification: () => ({ mutateAsync: jest.fn().mockResolvedValue({}) }),
  useUploadVerificationDocument: () => ({ mutateAsync: uploadDocument }),
  useDeleteVerificationDocument: () => ({ mutateAsync: deleteDocument }),
  useVerificationDocuments: () => ({ data: verificationDocuments }),
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

const deleteOwnership = jest.fn().mockResolvedValue({});
let placeOwnerships: Record<string, unknown> = {};
jest.mock('@/app/shared/hooks/usePlaces', () => ({
  useClaimPlaceOwnership: () => ({ mutateAsync: jest.fn().mockResolvedValue({}) }),
  useDeletePlaceOwnership: () => ({ mutateAsync: deleteOwnership }),
  usePlaceReservationProfiles: () => ({ data: undefined }),
  usePlaceOwnerships: (placeIds: string[]) =>
    placeIds.map((placeId) => ({ data: placeOwnerships[placeId] })),
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
  renderWithStore(
    <ConnectPlaceDrawerProvider>
      <OpenOnMount options={options} />
    </ConnectPlaceDrawerProvider>,
  );

const attachDocument = async (user: ReturnType<typeof userEvent.setup>, label: RegExp, file: File) => {
  await user.click(screen.getByRole('button', { name: label }));
  fireEvent.change(screen.getByLabelText('Attach document'), { target: { files: [file] } });
};

const resetBackend = () => {
  jest.clearAllMocks();
  communityVerificationStatus = null;
  verificationDocuments = undefined;
  placeOwnerships = {};
};

describe('ConnectPlaceDrawer', () => {
  beforeEach(resetBackend);

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

  it('submits the claim and shows the Your claim view', async () => {
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
    expect(deleteOwnership).toHaveBeenCalledWith('place-1');
  });
});

type SentDocument = {
  id: string;
  documentType: string;
  fileName: string;
  fileSizeLabel: string;
};

const SENT: Record<'certificate' | 'license', SentDocument> = {
  certificate: {
    id: 'doc-1',
    documentType: 'certificate_of_incorporation',
    fileName: 'cert.pdf',
    fileSizeLabel: '1 KB',
  },
  license: {
    id: 'doc-2',
    documentType: 'business_license',
    fileName: 'license.pdf',
    fileSizeLabel: '2 KB',
  },
};

const OpenSentClaim = ({
  sent,
  view,
}: {
  sent: SentDocument[];
  view: 'claim' | 'documents';
}) => {
  const { submitClaim, openConnectPlace, claims } = useConnectPlaceDrawer()!;
  const claimId = useRef<string | null>(null);

  useEffect(() => {
    const claim = submitClaim({
      communityId: 'c1',
      communityName: 'Weekend Readers',
      places: [{ id: 'place-1', title: 'Karura Forest', isOnTukai: true }],
      documents: sent,
    });
    claimId.current = claim.id;
    openConnectPlace({ claimId: claim.id, view });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => openConnectPlace({ claimId: claimId.current!, view })}
      >
        Reopen claim
      </button>
      <output data-testid="claim-files">
        {claims[0]?.documents.map((document) => document.fileName).join(',')}
      </output>
    </>
  );
};

const renderSentClaim = (view: 'claim' | 'documents', ...sent: SentDocument[]) =>
  renderWithStore(
    <ConnectPlaceDrawerProvider>
      <OpenSentClaim sent={sent} view={view} />
    </ConnectPlaceDrawerProvider>,
  );

const ownership = (approved: boolean) => ({ success: true, data: { community: 'c1', approved } });

describe('ConnectPlaceDrawer claim status', () => {
  beforeEach(resetBackend);

  it('is under review while the ownership claim has not been approved', async () => {
    placeOwnerships = { 'place-1': ownership(false) };
    communityVerificationStatus = 'under_review';
    renderSentClaim('claim', SENT.certificate, SENT.license);

    expect(await screen.findByText('Under review')).toBeInTheDocument();
  });

  it('stays under review until the API has answered', async () => {
    renderSentClaim('claim', SENT.certificate, SENT.license);

    expect(await screen.findByText('Under review')).toBeInTheDocument();
  });

  it('is approved once the ownership claim is approved, and offers reservation setup', async () => {
    placeOwnerships = { 'place-1': ownership(true) };
    communityVerificationStatus = 'approved';
    renderSentClaim('claim', SENT.certificate, SENT.license);

    expect(await screen.findByText('Approved')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Set up reservations/ }).length).toBeGreaterThan(
      0,
    );
  });

  it('is not approved when Tukai rejected the verification, and offers a new claim', async () => {
    placeOwnerships = { 'place-1': ownership(false) };
    communityVerificationStatus = 'rejected';
    renderSentClaim('claim', SENT.certificate, SENT.license);

    expect(await screen.findByText('Not approved')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start a new claim' })).toBeInTheDocument();
  });

  it('is cancelled when the place no longer carries the ownership claim', async () => {
    placeOwnerships = { 'place-1': { success: true, data: null } };
    renderSentClaim('claim', SENT.certificate, SENT.license);

    expect(await screen.findByText('Cancelled')).toBeInTheDocument();
  });

  it('lists the documents the API holds, naming each by its file', async () => {
    verificationDocuments = {
      data: {
        results: [
          {
            id: 'srv-1',
            documentType: 'tax_registration',
            fileUrl: 'https://cdn.tukai.co/verification_documents/pin%20certificate.pdf?sig=1',
            notes: 'Registered in 2019',
          },
        ],
      },
    };
    renderSentClaim('claim', SENT.certificate);

    expect(await screen.findByText('pin certificate.pdf')).toBeInTheDocument();
    expect(screen.getByText('Tax registration')).toBeInTheDocument();
    expect(screen.getByText('Registered in 2019')).toBeInTheDocument();
  });

  it('withdraws the ownership claim on every place when the owner cancels', async () => {
    const user = userEvent.setup();
    renderSentClaim('claim', SENT.certificate, SENT.license);
    await screen.findByText('Under review');

    await user.click(screen.getByRole('button', { name: /Cancel claim/ }));
    await user.click(
      within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Cancel claim' }),
    );

    await waitFor(() => expect(screen.getByText('Cancelled')).toBeInTheDocument());
    expect(deleteOwnership).toHaveBeenCalledWith('place-1');
    expect(toast).toHaveBeenCalledWith({
      description: 'Claim cancelled. Karura Forest stays unclaimed.',
    });
  });

  it('keeps the claim and says why when the API refuses the cancellation', async () => {
    const user = userEvent.setup();
    deleteOwnership.mockRejectedValueOnce({ message: 'Cannot remove an approved ownership.' });
    renderSentClaim('claim', SENT.certificate, SENT.license);
    await screen.findByText('Under review');

    await user.click(screen.getByRole('button', { name: /Cancel claim/ }));
    await user.click(
      within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Cancel claim' }),
    );

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith({
        title: 'Could not cancel this claim',
        description: 'Cannot remove an approved ownership.',
        variant: 'destructive',
      }),
    );
    expect(screen.getByText('Under review')).toBeInTheDocument();
  });
});

describe('ConnectPlaceDrawer resubmitting documents', () => {
  beforeEach(resetBackend);

  const replaceDocument = (label: string, file: File) => {
    fireEvent.click(screen.getByRole('button', { name: `Replace ${label}` }));
    fireEvent.change(screen.getByLabelText('Attach document'), { target: { files: [file] } });
  };

  const pdf = (name: string) => new File(['x'], name, { type: 'application/pdf' });

  const resubmit = () => screen.getByRole('button', { name: 'Resubmit for review' });

  const openDocuments = async (...sent: SentDocument[]) => {
    renderSentClaim('documents', ...sent);
    await screen.findAllByText(/Already sent/);
  };

  it('shows the documents already sent as attached rows', async () => {
    await openDocuments(SENT.certificate, SENT.license);

    expect(screen.getAllByText(/Already sent/)).toHaveLength(2);
    expect(screen.getByText(/2 documents attached/)).toBeInTheDocument();
  });

  it('asks for a change before it can be resubmitted, even with two documents sent', async () => {
    await openDocuments(SENT.certificate, SENT.license);

    expect(resubmit()).toBeDisabled();
    expect(screen.getByText('Attach the document Tukai asked for.')).toBeInTheDocument();
  });

  it('accepts a new file in place of a sent one', async () => {
    await openDocuments(SENT.certificate, SENT.license);

    replaceDocument('Certificate of incorporation', pdf('new-cert.pdf'));

    expect(resubmit()).toBeEnabled();
    expect(screen.getByText('new-cert.pdf')).toBeInTheDocument();
  });

  it('counts a sent document towards the two, so one more type is enough', async () => {
    const user = userEvent.setup();
    await openDocuments(SENT.certificate);
    expect(screen.getByText(/1 attached\. Add one more\./)).toBeInTheDocument();
    expect(screen.getByText('Attach at least two documents.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Business license/ }));
    await attachDocument(user, /Attach business license/i, pdf('license.pdf'));

    expect(resubmit()).toBeEnabled();
  });

  it('does not count a sent document twice when a new file replaces it', async () => {
    await openDocuments(SENT.certificate);

    replaceDocument('Certificate of incorporation', pdf('new-cert.pdf'));

    expect(resubmit()).toBeDisabled();
    expect(screen.getByText('Attach at least two documents.')).toBeInTheDocument();
  });

  it('can drop a sent document, and then needs another to make up the two', async () => {
    const user = userEvent.setup();
    await openDocuments(SENT.certificate, SENT.license);

    await user.click(screen.getByRole('button', { name: 'Remove Certificate of incorporation' }));

    expect(screen.getByText(/1 attached\. Add one more\./)).toBeInTheDocument();
    expect(resubmit()).toBeDisabled();
    expect(screen.getByText('Attach at least two documents.')).toBeInTheDocument();

    await attachDocument(
      user,
      /Attach certificate of incorporation/i,
      pdf('certificate-2.pdf'),
    );

    expect(resubmit()).toBeEnabled();
  });

  it('replaces the documents on the API and keeps the ones nobody touched', async () => {
    const user = userEvent.setup();
    await openDocuments(SENT.certificate, SENT.license);
    replaceDocument('Certificate of incorporation', pdf('new-cert.pdf'));

    await user.click(resubmit());

    await waitFor(() =>
      expect(screen.getByTestId('claim-files')).toHaveTextContent('license.pdf,new-cert.pdf'),
    );
    expect(deleteDocument).toHaveBeenCalledTimes(1);
    expect(deleteDocument).toHaveBeenCalledWith({ communityId: 'c1', documentId: 'doc-1' });
    expect(uploadDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        communityId: 'c1',
        documentType: 'certificate_of_incorporation',
        file: expect.objectContaining({ name: 'new-cert.pdf' }),
      }),
    );
    expect(toast).toHaveBeenCalledWith({
      description: 'Documents sent. Your claim is back under review.',
    });
  });

  it('removes a dropped document from the API before uploading its replacement', async () => {
    const user = userEvent.setup();
    await openDocuments(SENT.certificate, SENT.license);
    await user.click(screen.getByRole('button', { name: 'Remove Business license' }));
    await user.click(screen.getByRole('button', { name: /Tax registration/ }));
    await attachDocument(user, /Attach tax registration/i, pdf('pin.pdf'));
    const order: string[] = [];
    deleteDocument.mockImplementationOnce(async () => order.push('delete'));
    uploadDocument.mockImplementationOnce(async () => order.push('upload'));

    await user.click(resubmit());

    await waitFor(() => expect(order).toEqual(['delete', 'upload']));
    expect(deleteDocument).toHaveBeenCalledWith({ communityId: 'c1', documentId: 'doc-2' });
  });

  it('says why when the API refuses the new documents, and keeps the drawer open', async () => {
    const user = userEvent.setup();
    uploadDocument.mockRejectedValueOnce({
      message: 'Cannot add documents to a completed verification.',
    });
    await openDocuments(SENT.certificate, SENT.license);
    replaceDocument('Certificate of incorporation', pdf('new-cert.pdf'));

    await user.click(resubmit());

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith({
        title: 'Could not send these documents',
        description: 'Cannot add documents to a completed verification.',
        variant: 'destructive',
      }),
    );
    expect(screen.getByText('new-cert.pdf')).toBeInTheDocument();
  });

  it('starts from the sent documents again when reopened, dropping changes made before', async () => {
    const user = userEvent.setup();
    await openDocuments(SENT.certificate, SENT.license);
    replaceDocument('Certificate of incorporation', pdf('abandoned.pdf'));
    await user.click(screen.getByRole('button', { name: 'Remove Business license' }));
    expect(screen.getByText('abandoned.pdf')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await user.click(screen.getByRole('button', { name: 'Reopen claim' }));

    await screen.findAllByText(/Already sent/);
    expect(screen.queryByText('abandoned.pdf')).not.toBeInTheDocument();
    expect(screen.getAllByText(/Already sent/)).toHaveLength(2);
    expect(resubmit()).toBeDisabled();
  });
});
