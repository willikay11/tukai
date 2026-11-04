import React from 'react';

import { act, render, screen } from '@testing-library/react';

import { toast } from '@/app/shared/hooks/useToast';

import { Toaster, toastSentence } from './toaster';

describe('toastSentence', () => {
  it('reads a title and a description as one sentence', () => {
    expect(toastSentence('Saved to Weekend', 'The Good Grain is on your list.')).toBe(
      'Saved to Weekend. The Good Grain is on your list.',
    );
  });

  it('does not double the stop on a title that already has one', () => {
    expect(toastSentence('Could not save this!', 'Try again.')).toBe(
      'Could not save this! Try again.',
    );
  });

  it('takes either one alone as it is', () => {
    expect(toastSentence('Back to Nairobi.')).toBe('Back to Nairobi.');
    expect(toastSentence(undefined, 'Phone number copied.')).toBe('Phone number copied.');
  });
});

describe('Toaster', () => {
  it('draws a toast as one line of text, with no icon or close button', () => {
    render(<Toaster />);

    act(() => {
      toast({
        title: 'Saved to Weekend',
        description: 'The Good Grain is on your list.',
        variant: 'success',
      });
    });

    const line = screen.getByText('Saved to Weekend. The Good Grain is on your list.');
    const pill = line.closest('li') as HTMLElement;
    expect(pill).toHaveClass('rounded-full', 'bg-brand-ink', 'text-white');
    expect(pill.querySelector('svg')).toBeNull();
    expect(pill.querySelector('button')).toBeNull();
  });

  it('draws an error the same way as a success', () => {
    render(<Toaster />);

    act(() => {
      toast({ title: 'Could not delete', description: 'Try again.', variant: 'destructive' });
    });

    const pill = screen.getByText('Could not delete. Try again.').closest('li') as HTMLElement;
    expect(pill).toHaveClass('bg-brand-ink', 'text-white');
    expect(pill).not.toHaveClass('bg-red-100');
  });

  it('shows one toast at a time, the latest', () => {
    render(<Toaster />);

    act(() => {
      toast({ title: 'First.' });
      toast({ title: 'Second.' });
    });

    expect(screen.queryByText('First.')).not.toBeInTheDocument();
    expect(screen.getByText('Second.')).toBeInTheDocument();
  });
});
