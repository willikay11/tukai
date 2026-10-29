import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Experience } from '@/types/experience';

import { InvitedGuestsTab } from './index';

const removeGuest = jest.fn();
jest.mock('@/app/shared/hooks/useExperiences', () => ({
  useRemoveExperienceGuest: () => ({
    mutate: removeGuest,
    isPending: false,
    variables: undefined,
  }),
}));

const toast = jest.fn();
jest.mock('@/app/shared/hooks/useToast', () => ({ useToast: () => ({ toast }) }));

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }));

const guests: Experience['guests'] = [
  { id: 'g1', email: 'amani.w@gmail.com', dateCreated: '', status: 'invited' },
  { id: 'g2', email: 'kevo@habari.co.ke', dateCreated: '', status: 'invited' },
];

const communities: Experience['communities'] = [{ id: 'c1', title: 'Nairobi Hikers' }];

const renderTab = (props: Partial<React.ComponentProps<typeof InvitedGuestsTab>> = {}) =>
  render(
    <InvitedGuestsTab experienceId="e1" guests={guests} communities={communities} {...props} />,
  );

describe('the invited guests tab', () => {
  beforeEach(() => jest.clearAllMocks());

  it('counts both lists on their tabs', () => {
    renderTab();

    expect(screen.getByRole('tab', { name: 'Guests (2)' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Communities (1)' })).toBeInTheDocument();
  });

  it('opens on the guests', () => {
    renderTab();

    expect(screen.getByRole('tab', { name: 'Guests (2)' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByText('amani.w@gmail.com')).toBeInTheDocument();
  });

  // The communities an experience was shared with are on the detail serializer;
  // this tab used to say they were not available
  it('lists the communities it was shared with', async () => {
    renderTab();

    await userEvent.click(screen.getByRole('tab', { name: 'Communities (1)' }));

    expect(screen.getByText('Nairobi Hikers')).toBeInTheDocument();
  });

  it('keeps the search field out of the way until it is asked for', async () => {
    renderTab();

    expect(screen.queryByPlaceholderText('Search by name or email')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Search invited guests' }));

    expect(screen.getByPlaceholderText('Search by name or email')).toBeInTheDocument();
  });

  it('narrows the list to what was typed', async () => {
    renderTab();

    await userEvent.click(screen.getByRole('button', { name: 'Search invited guests' }));
    await userEvent.type(screen.getByPlaceholderText('Search by name or email'), 'kevo');

    expect(screen.getByText('kevo@habari.co.ke')).toBeInTheDocument();
    expect(screen.queryByText('amani.w@gmail.com')).not.toBeInTheDocument();
  });

  it('blames the search when nothing matches', async () => {
    renderTab();

    await userEvent.click(screen.getByRole('button', { name: 'Search invited guests' }));
    await userEvent.type(screen.getByPlaceholderText('Search by name or email'), 'zzz');

    expect(screen.getByText('No one matches that search.')).toBeInTheDocument();
  });

  it('removes the guest that was pressed', async () => {
    renderTab();

    await userEvent.click(screen.getByRole('button', { name: 'Remove amani.w@gmail.com' }));

    expect(removeGuest).toHaveBeenCalledWith('g1', expect.anything());
  });

  // The canvas says both halves: they are off the list, and their invite is dead
  it('says what removing them means', async () => {
    removeGuest.mockImplementation((_id, { onSuccess }) => onSuccess());
    renderTab();

    await userEvent.click(screen.getByRole('button', { name: 'Remove amani.w@gmail.com' }));

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'amani.w@gmail.com is off the guest list',
        description: 'Their invite no longer works.',
      }),
    );
  });

  it('reports a refusal rather than looking like it worked', async () => {
    removeGuest.mockImplementation((_id, { onError }) => onError(new Error('Guest not found')));
    renderTab();

    await userEvent.click(screen.getByRole('button', { name: 'Remove amani.w@gmail.com' }));

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'Guest not found', variant: 'destructive' }),
    );
  });

  // Communities are write-only on the API, so there is nothing to call
  it('does not offer to un-share with a community', async () => {
    renderTab();

    await userEvent.click(screen.getByRole('tab', { name: 'Communities (1)' }));

    expect(screen.queryByRole('button', { name: 'Remove Nairobi Hikers' })).not.toBeInTheDocument();
  });

  it('says when nothing has been invited at all', () => {
    renderTab({ guests: [], communities: [] });

    expect(screen.getByText('No guests invited yet.')).toBeInTheDocument();
  });
});
