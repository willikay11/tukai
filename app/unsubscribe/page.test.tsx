import React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { useUnsubscribe } from '@/hooks/comms';

import UnsubscribePage from './page';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useSearchParams: jest.fn(),
}));

jest.mock('@/hooks/comms', () => ({
  useUnsubscribe: jest.fn(),
}));

jest.mock('@/app/components/pageLayoutContent', () => ({
  PageLayoutContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/app/components/form', () => ({
  Button: ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => (
    <button onClick={onClick}>{children}</button>
  ),
}));

const { useSearchParams } = require('next/navigation');

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(<QueryClientProvider client={queryClient}>{component}</QueryClientProvider>);
};

describe('UnsubscribePage', () => {
  let mockMutateAsync: jest.Mock;

  beforeEach(() => {
    mockMutateAsync = jest.fn().mockResolvedValue({
      success: true,
    });
    (useUnsubscribe as jest.Mock).mockReturnValue({
      mutateAsync: mockMutateAsync,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should show loading state initially', async () => {
    useSearchParams.mockReturnValue({
      get: jest.fn().mockReturnValue('test-token'),
    });

    // Use a promise that doesn't resolve immediately to capture loading state
    mockMutateAsync.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100)),
    );

    renderWithProviders(<UnsubscribePage />);

    expect(screen.getByText(/Processing your unsubscribe request/i)).toBeInTheDocument();
  });

  it('should show error message when no token is provided', async () => {
    useSearchParams.mockReturnValue({
      get: jest.fn().mockReturnValue(null),
    });

    renderWithProviders(<UnsubscribePage />);

    await waitFor(() => {
      expect(screen.getByText(/Invalid unsubscribe link. No token provided./i)).toBeInTheDocument();
    });
  });

  it('should show success message when unsubscribe is successful', async () => {
    useSearchParams.mockReturnValue({
      get: jest.fn().mockReturnValue('test-token'),
    });

    mockMutateAsync.mockResolvedValue({
      success: true,
    });

    renderWithProviders(<UnsubscribePage />);

    await waitFor(() => {
      expect(
        screen.getByText(/You have been successfully unsubscribed from our emails./i),
      ).toBeInTheDocument();
    });

    expect(mockMutateAsync).toHaveBeenCalledWith({ token: 'test-token' });
  });

  it('should show error message when unsubscribe fails', async () => {
    useSearchParams.mockReturnValue({
      get: jest.fn().mockReturnValue('test-token'),
    });

    mockMutateAsync.mockResolvedValue({
      success: false,
      message: 'Failed to unsubscribe. Please try again or contact support.',
    });

    renderWithProviders(<UnsubscribePage />);

    await waitFor(() => {
      expect(
        screen.getByText(/Failed to unsubscribe. Please try again or contact support./i),
      ).toBeInTheDocument();
    });
  });

  it('should show generic error message when unsubscribe fails without specific message', async () => {
    useSearchParams.mockReturnValue({
      get: jest.fn().mockReturnValue('test-token'),
    });

    mockMutateAsync.mockResolvedValue({
      success: false,
    });

    renderWithProviders(<UnsubscribePage />);

    await waitFor(() => {
      expect(
        screen.getByText(
          /An error occurred while processing your request. Please try again later./i,
        ),
      ).toBeInTheDocument();
    });
  });

  it('should render success state with correct elements', async () => {
    useSearchParams.mockReturnValue({
      get: jest.fn().mockReturnValue('test-token'),
    });

    mockMutateAsync.mockResolvedValue({
      success: true,
    });

    renderWithProviders(<UnsubscribePage />);

    await waitFor(() => {
      expect(
        screen.getByText(/You have been successfully unsubscribed from our emails./i),
      ).toBeInTheDocument();
    });

    expect(screen.getByText(/You won't receive any more emails from us./i)).toBeInTheDocument();
    expect(screen.getByText(/Return to Home/i)).toBeInTheDocument();
  });

  it('should render error state with correct elements', async () => {
    useSearchParams.mockReturnValue({
      get: jest.fn().mockReturnValue(null),
    });

    renderWithProviders(<UnsubscribePage />);

    await waitFor(() => {
      expect(screen.getByText(/Invalid unsubscribe link. No token provided./i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Return to Home/i)).toBeInTheDocument();
  });

  it('should call router.push when Return to Home button is clicked', async () => {
    const mockPush = jest.fn();
    jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue({
      push: mockPush,
    });

    useSearchParams.mockReturnValue({
      get: jest.fn().mockReturnValue(null),
    });

    renderWithProviders(<UnsubscribePage />);

    await waitFor(() => {
      expect(screen.getByText(/Invalid unsubscribe link. No token provided./i)).toBeInTheDocument();
    });

    const button = screen.getByText(/Return to Home/i);
    fireEvent.click(button);

    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('should render page title and subtitle', async () => {
    useSearchParams.mockReturnValue({
      get: jest.fn().mockReturnValue('test-token'),
    });

    mockMutateAsync.mockResolvedValue({
      success: true,
    });

    renderWithProviders(<UnsubscribePage />);

    expect(screen.getByText(/^Unsubscribe$/)).toBeInTheDocument();
    expect(screen.getByText(/Manage your email preferences/i)).toBeInTheDocument();
  });
});
