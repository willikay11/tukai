import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { MobilePlaceBar } from './index';

jest.mock('../ReservationPanel', () => ({
  ReservationPanel: ({ placeName }: { placeName: string }) => (
    <div data-testid="reservation-panel">{placeName}</div>
  ),
}));

jest.mock('next-auth/react', () => ({ useSession: () => ({ data: { user: { id: 'u1' } } }) }));

let ownership: { success?: boolean; data: unknown } | undefined = {
  success: true,
  data: { id: 'o1' },
};
let isLoadingOwnership = false;
jest.mock('@/app/shared/hooks/usePlaces', () => ({
  usePlaceOwnership: () => ({ data: ownership, isLoading: isLoadingOwnership }),
}));

jest.mock('../ClaimPlacePrompt', () => ({
  ClaimPlacePrompt: ({ placeName }: { placeName: string }) => (
    <div data-testid="claim-prompt">{placeName}</div>
  ),
}));

jest.mock('@/app/shared/components/Moments', () => ({
  MomentComposer: ({ open, contextLabel }: { open: boolean; contextLabel: string }) =>
    open ? <div data-testid="moment-composer">{contextLabel}</div> : null,
}));

const renderBar = () => render(<MobilePlaceBar placeId="p1" placeName="Kraftory Biergarten" />);

describe('MobilePlaceBar', () => {
  beforeEach(() => {
    ownership = { success: true, data: { id: 'o1' } };
    isLoadingOwnership = false;
  });

  it('offers both actions without a price', () => {
    renderBar();

    expect(screen.getByRole('button', { name: 'Share Moment' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reserve' })).toBeInTheDocument();
    expect(screen.queryByText(/From/)).not.toBeInTheDocument();
  });

  // Each button opens just its own view — no tab row to choose again
  it('opens the reservation panel alone', async () => {
    const user = userEvent.setup();
    renderBar();

    await user.click(screen.getByRole('button', { name: 'Reserve' }));

    expect(screen.getByTestId('reservation-panel')).toBeInTheDocument();
    expect(screen.queryByTestId('moment-composer')).not.toBeInTheDocument();
  });

  // The moments posted here are already a section of the page, so the button
  // goes straight to writing one rather than to a list
  it('opens the composer itself, not a list of moments', async () => {
    const user = userEvent.setup();
    renderBar();

    await user.click(screen.getByRole('button', { name: 'Share Moment' }));

    expect(screen.getByTestId('moment-composer')).toHaveTextContent('Kraftory Biergarten');
    expect(screen.queryByTestId('reservation-panel')).not.toBeInTheDocument();
  });

  // A place nobody owns cannot take reservations, so Reserve would only ever
  // reach a disabled button
  describe('a place nobody has claimed', () => {
    beforeEach(() => {
      ownership = { success: true, data: null };
    });

    it('offers to claim it instead of reserving', () => {
      renderBar();

      expect(screen.getByRole('button', { name: 'Claim this place' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Reserve' })).not.toBeInTheDocument();
    });

    it('explains what claiming means before the form does', async () => {
      const user = userEvent.setup();
      renderBar();

      await user.click(screen.getByRole('button', { name: 'Claim this place' }));

      expect(screen.getByTestId('claim-prompt')).toHaveTextContent('Kraftory Biergarten');
      expect(screen.queryByTestId('reservation-panel')).not.toBeInTheDocument();
    });
  });

  // A failed or skipped request is not an answer — the bar must not announce
  // a place is unclaimed because it could not ask
  it('keeps Reserve when the ownership request failed', () => {
    ownership = undefined;
    isLoadingOwnership = false;

    renderBar();

    expect(screen.getByRole('button', { name: 'Reserve' })).toBeInTheDocument();
  });

  // Flipping the label once the answer arrives would be worse than waiting
  it('keeps Reserve while ownership is still loading', () => {
    ownership = undefined;
    isLoadingOwnership = true;

    renderBar();

    expect(screen.getByRole('button', { name: 'Reserve' })).toBeInTheDocument();
  });

  it('shows nothing until one is pressed', () => {
    renderBar();

    expect(screen.queryByTestId('reservation-panel')).not.toBeInTheDocument();
    expect(screen.queryByTestId('moment-composer')).not.toBeInTheDocument();
  });
});
