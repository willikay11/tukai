import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { ErrorState } from './ErrorState';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: mockPush }) }));

const makeError = (digest?: string) => Object.assign(new Error('boom'), { digest });

describe('ErrorState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  it('offers a way out rather than stranding the user', () => {
    render(<ErrorState error={makeError()} reset={jest.fn()} />);

    expect(screen.getByRole('heading')).toHaveTextContent('Something went wrong');
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back to Discover' })).toBeInTheDocument();
  });

  it('calls reset to retry the failed segment', () => {
    const reset = jest.fn();
    render(<ErrorState error={makeError()} reset={reset} />);

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(reset).toHaveBeenCalledTimes(1);
  });

  it('navigates to the segment home when asked', () => {
    render(
      <ErrorState error={makeError()} reset={jest.fn()} homeHref="/places" homeLabel="Back to Places" />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Back to Places' }));

    expect(mockPush).toHaveBeenCalledWith('/places');
  });

  // Stack traces and raw messages can leak internals; the digest is the safe
  // handle for correlating a user report with server logs
  it('never renders the raw error message, only the digest', () => {
    render(<ErrorState error={makeError('abc123')} reset={jest.fn()} />);

    expect(screen.queryByText(/boom/)).not.toBeInTheDocument();
    expect(screen.getByText('Reference: abc123')).toBeInTheDocument();
  });

  it('omits the reference line when there is no digest', () => {
    render(<ErrorState error={makeError()} reset={jest.fn()} />);

    expect(screen.queryByText(/Reference:/)).not.toBeInTheDocument();
  });

  it('logs the real error for debugging', () => {
    const error = makeError();
    render(<ErrorState error={error} reset={jest.fn()} />);

    expect(console.error).toHaveBeenCalledWith('Unhandled error:', error);
  });
});
