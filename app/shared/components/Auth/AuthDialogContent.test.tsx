import React from 'react';

import { render, screen } from '@testing-library/react';

import { Dialog } from '@/components/ui/dialog';

import { AuthDialogContent } from './AuthDialogContent';

const renderBox = (className?: string) =>
  render(
    <Dialog open>
      <AuthDialogContent className={className}>
        <p>Card</p>
      </AuthDialogContent>
    </Dialog>,
  );

describe('AuthDialogContent', () => {
  /**
   * The shared DialogContent is 720px from md and declares nothing unprefixed,
   * so both caps are needed — an unprefixed max-width alone never reaches the
   * desktop width. Two surfaces set neither and showed the card full width.
   */
  it('caps the card at a form width, at every size', () => {
    renderBox();

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass('max-w-[460px]', 'md:max-w-[460px]');
    expect(dialog).not.toHaveClass('md:max-w-[720px]');
  });

  it('still lets a caller add to it', () => {
    renderBox('bg-gray-50');

    expect(screen.getByRole('dialog')).toHaveClass('bg-gray-50', 'max-w-[460px]');
  });
});
