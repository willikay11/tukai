import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PrivacyDrawer } from './PrivacyDrawer';

const toast = jest.fn();
jest.mock('@/app/shared/hooks/useToast', () => ({ useToast: () => ({ toast }) }));

const renderDrawer = (onClose = jest.fn()) => render(<PrivacyDrawer isOpen onClose={onClose} />);

const saveButton = () => screen.getByRole('button', { name: 'Save changes' });

describe('privacy settings', () => {
  beforeEach(() => jest.clearAllMocks());

  it('starts on the defaults with Save changes disabled', () => {
    renderDrawer();

    expect(screen.getByRole('radio', { name: 'Everyone on Tukai' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(saveButton()).toBeDisabled();
  });

  it('enables Save changes once a choice is made', async () => {
    renderDrawer();

    await userEvent.click(screen.getByRole('radio', { name: 'Only you' }));

    expect(saveButton()).toBeEnabled();
  });

  it('toggles a show-on-profile switch', async () => {
    renderDrawer();

    const row = screen.getByRole('switch', { name: /Public bucket lists/ });
    expect(row).toHaveAttribute('aria-checked', 'true');

    await userEvent.click(row);

    expect(row).toHaveAttribute('aria-checked', 'false');
  });

  // There is no account field for any of this yet (see
  // profile_page_backend_gaps.md), so Save is honest about not persisting
  // anything rather than claiming success
  it('is honest that nothing is actually saved', async () => {
    const onClose = jest.fn();
    renderDrawer(onClose);

    await userEvent.click(screen.getByRole('radio', { name: 'Only you' }));
    await userEvent.click(saveButton());

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Privacy settings aren't saved yet" }),
    );
    expect(onClose).toHaveBeenCalled();
  });

  it('resets to the defaults when closed', async () => {
    const { rerender } = renderDrawer();

    await userEvent.click(screen.getByRole('radio', { name: 'Only you' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    rerender(<PrivacyDrawer isOpen onClose={jest.fn()} />);

    expect(screen.getByRole('radio', { name: 'Everyone on Tukai' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });
});
