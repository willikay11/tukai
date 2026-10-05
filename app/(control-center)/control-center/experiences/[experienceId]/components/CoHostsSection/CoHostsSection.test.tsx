import React from 'react';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CoHostInvite } from '@/types/coHost';
import { Experience } from '@/types/experience';

import { CoHostsSection } from './index';

const addCoHosts = jest.fn();
const removeCoHost = jest.fn();
const findUser = jest.fn();
let invites: CoHostInvite[] = [];

jest.mock('@/app/shared/hooks/useExperiences', () => ({
  useCoHostInvites: () => ({ data: { data: { results: invites } } }),
  useSearchUsersDebounced: () => ({ mutateAsync: findUser, isPending: false }),
  useAddCoHosts: () => ({ mutate: addCoHosts, isPending: false }),
  useRemoveCoHost: () => ({ mutate: removeCoHost, isPending: false, variables: undefined }),
}));

const toast = jest.fn();
jest.mock('@/app/shared/hooks/useToast', () => ({ useToast: () => ({ toast }) }));

const experience = (overrides: Partial<Experience> = {}): Experience =>
  ({ id: 'e1', title: 'Sunrise hike', coHosts: [], ...overrides }) as unknown as Experience;

const renderSection = (overrides: Partial<Experience> = {}) =>
  render(<CoHostsSection experience={experience(overrides)} />);

const type = async (address: string) => {
  await userEvent.type(screen.getByLabelText('Co-host email address'), address);
  await userEvent.click(screen.getByRole('button', { name: 'Invite co-host' }));
};

describe('co-hosts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    invites = [];
    findUser.mockResolvedValue({
      data: { results: [{ id: 'u1', email: 'kevo@habari.co.ke', displayName: 'Kevo' }] },
    });
  });

  it('says plainly when no one else manages it', () => {
    renderSection();

    expect(screen.getByText('No one else manages this experience yet.')).toBeInTheDocument();
  });

  it('lists the co-hosts', () => {
    renderSection({ coHosts: [{ id: 'u1', displayName: 'Kevo' }] as Experience['coHosts'] });

    expect(screen.getByText('Kevo')).toBeInTheDocument();
    expect(screen.getByText('Co-host')).toBeInTheDocument();
  });

  /**
   * Inviting is not co-hosting: the API records a PENDING invite and waits, so
   * a host has to be able to see that difference.
   */
  it('shows an invite as still waiting', () => {
    invites = [{ id: 7, invitedUser: { id: 'u2', displayName: 'Njeri' }, status: 'PENDING' }];
    renderSection();

    expect(screen.getByText('Njeri')).toBeInTheDocument();
    expect(screen.getByText('Waiting for them to accept')).toBeInTheDocument();
  });

  it('shows one that was turned down', () => {
    invites = [{ id: 7, invitedUser: { id: 'u2', displayName: 'Njeri' }, status: 'DECLINED' }];
    renderSection();

    expect(screen.getByText('Declined')).toBeInTheDocument();
  });

  // An accepted invite is a co-host and appears in that list instead
  it('does not list an accepted invite twice', () => {
    invites = [{ id: 7, invitedUser: { id: 'u1', displayName: 'Kevo' }, status: 'ACCEPTED' }];
    renderSection({ coHosts: [{ id: 'u1', displayName: 'Kevo' }] as Experience['coHosts'] });

    expect(screen.getAllByText('Kevo')).toHaveLength(1);
  });

  it('refuses something that is not an address', async () => {
    renderSection();

    await type('kevo');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Enter the email address of their Tukai account.',
    );
    expect(addCoHosts).not.toHaveBeenCalled();
  });

  it('invites the account behind the address', async () => {
    renderSection();

    await type('kevo@habari.co.ke');

    await waitFor(() => expect(addCoHosts).toHaveBeenCalledWith(['u1'], expect.anything()));
  });

  // A co-host holds the experience's permissions, so they need an account
  it('says so when no account uses that address', async () => {
    findUser.mockResolvedValue({ data: { results: [] } });
    renderSection();

    await type('nobody@habari.co.ke');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No Tukai account uses that address. A co-host needs an account.',
    );
    expect(addCoHosts).not.toHaveBeenCalled();
  });

  it('reports a failed lookup rather than inviting nobody', async () => {
    findUser.mockRejectedValue(new Error('offline'));
    renderSection();

    await type('kevo@habari.co.ke');

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not look up that address.');
  });

  it('says what an invite means once it is sent', async () => {
    addCoHosts.mockImplementation((_ids, { onSuccess }) => onSuccess());
    renderSection();

    await type('kevo@habari.co.ke');

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Kevo has been invited',
          description: 'They co-host this experience once they accept.',
        }),
      ),
    );
  });

  it('removes a co-host, and says what they lose', async () => {
    removeCoHost.mockImplementation((_id, { onSuccess }) => onSuccess());
    renderSection({ coHosts: [{ id: 'u1', displayName: 'Kevo' }] as Experience['coHosts'] });

    await userEvent.click(screen.getByRole('button', { name: 'Remove Kevo' }));

    expect(removeCoHost).toHaveBeenCalledWith('u1', expect.anything());
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Kevo is no longer a co-host',
        description: 'They lose access to managing this experience.',
      }),
    );
  });

  // Withdrawing an invite is the host's own act; the person never accepted
  it('does not offer to remove someone who has only been asked', () => {
    invites = [{ id: 7, invitedUser: { id: 'u2', displayName: 'Njeri' }, status: 'PENDING' }];
    renderSection();

    expect(screen.queryByRole('button', { name: 'Remove Njeri' })).not.toBeInTheDocument();
  });
});
