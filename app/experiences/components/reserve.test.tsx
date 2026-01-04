import React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';

import { usePurchaseExperienceTicket } from '@/hooks/experiences';
import { toast } from '@/hooks/use-toast';
import { Experience } from '@/types/experience';

import Reserve from './reserve';

// Mock dependencies
jest.mock('@/hooks/experiences', () => ({
  usePurchaseExperienceTicket: jest.fn(),
}));

jest.mock('@/hooks/use-toast', () => ({
  toast: jest.fn(),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />;
  },
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    disabled,
    size,
    type,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    size?: string;
    className?: string;
    type?: 'button' | 'submit' | 'reset';
  }) => (
    <button
      data-testid="submit-button"
      onClick={onClick}
      disabled={disabled}
      data-size={size}
      type={type}
    >
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/paymentForm', () => {
  const MockPaymentForm = React.forwardRef(
    (
      {
        onSubmit,
        paid,
      }: {
        onSubmit: (values: {
          firstName: string;
          lastName: string;
          email: string;
          country: string;
          paymentOption: string;
          phoneNumber: string;
        }) => void;
        paid: boolean;
      },
      ref,
    ) => {
      React.useImperativeHandle(ref, () => ({
        submit: () => {
          onSubmit({
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            country: 'Ghana',
            paymentOption: 'card',
            phoneNumber: '+233123456789',
          });
        },
        reset: jest.fn(),
      }));

      return <div data-testid="payment-form">Payment Form (Paid: {paid.toString()})</div>;
    },
  );
  MockPaymentForm.displayName = 'MockPaymentForm';
  return {
    __esModule: true,
    default: MockPaymentForm,
    paymentFormSchema: {},
  };
});

jest.mock('@/components/ui/paymentSuccess', () => {
  return function MockPaymentSuccess({
    isOpen,
    closeModal,
  }: {
    isOpen: boolean;
    closeModal: (goToInviteGuests: boolean) => void;
  }) {
    if (!isOpen) return null;
    return (
      <div data-testid="payment-success-modal">
        <button onClick={() => closeModal(false)}>Close</button>
        <button onClick={() => closeModal(true)}>Invite Guests</button>
      </div>
    );
  };
});

jest.mock('@/components/ui/paystack', () => {
  return function MockPaystack({
    isOpen,
    closeModal,
    url,
  }: {
    isOpen: boolean;
    closeModal: (paymentSuccess: boolean) => void;
    url: string;
  }) {
    if (!isOpen) return null;
    return (
      <div data-testid="paystack-modal">
        <p>Payment URL: {url}</p>
        <button onClick={() => closeModal(true)}>Success</button>
        <button onClick={() => closeModal(false)}>Cancel</button>
      </div>
    );
  };
});

jest.mock('@/components/ui/quantity', () => {
  return function MockQuantity({
    initialValue,
    min,
    max,
    onChange,
  }: {
    initialValue: number;
    min: number;
    max: number;
    onChange: (value: number, type: string) => void;
  }) {
    return (
      <div data-testid="quantity-selector">
        <button
          data-testid="quantity-decrease"
          onClick={() => onChange(Math.max(min, initialValue - 1), 'decrease')}
        >
          -
        </button>
        <span>{initialValue}</span>
        <button
          data-testid="quantity-increase"
          onClick={() => onChange(Math.min(max, initialValue + 1), 'increase')}
        >
          +
        </button>
      </div>
    );
  };
});

jest.mock('@/components/ui/separator', () => ({
  Separator: ({ style, className }: { style?: React.CSSProperties; className?: string }) => (
    <hr data-testid="separator" style={style} className={className} />
  ),
}));

const mockExperience = {
  id: '123',
  title: 'Test Experience',
  description: 'Test description',
  startDate: '2024-03-20T10:00:00Z',
  endDate: '2024-03-20T18:00:00Z',
  currency: 'GHS',
  isPaid: true,
  tickets: [
    {
      id: 'ticket1',
      name: 'General Admission',
      price: 50,
      availableQuantity: 100,
    },
    {
      id: 'ticket2',
      name: 'VIP',
      price: 150,
      availableQuantity: 20,
    },
  ],
  photos: [
    { id: '1', photo: 'https://example.com/photo1.jpg', isCover: true },
    { id: '2', photo: 'https://example.com/photo2.jpg', isCover: false },
  ],
} as unknown as Experience;

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

describe('Reserve Component', () => {
  let mockMutate: jest.Mock;

  beforeEach(() => {
    mockMutate = jest.fn();
    (usePurchaseExperienceTicket as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      data: null,
      isSuccess: false,
      isError: false,
      error: null,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the component with experience title and details', () => {
    renderWithProviders(<Reserve experience={mockExperience} />);

    expect(screen.getByText('Make Reservation')).toBeInTheDocument();
    expect(screen.getByText('Test Experience')).toBeInTheDocument();
    expect(screen.getByText(/Mar 20/)).toBeInTheDocument();
  });

  it('should render experience cover photo', () => {
    renderWithProviders(<Reserve experience={mockExperience} />);

    const image = screen.getByAltText('');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/photo1.jpg');
  });

  it('should render all ticket types with prices', () => {
    renderWithProviders(<Reserve experience={mockExperience} />);

    expect(screen.getByText('General Admission')).toBeInTheDocument();
    expect(screen.getByText('VIP')).toBeInTheDocument();
    expect(screen.getByText('GHS 50.00/person')).toBeInTheDocument();
    expect(screen.getByText('GHS 150.00/person')).toBeInTheDocument();
  });

  it('should render quantity selectors for each ticket', () => {
    renderWithProviders(<Reserve experience={mockExperience} />);

    const quantitySelectors = screen.getAllByTestId('quantity-selector');
    expect(quantitySelectors).toHaveLength(2);
  });

  it('should initially show total as 0', () => {
    renderWithProviders(<Reserve experience={mockExperience} />);

    expect(screen.getByText('GHS 0.00')).toBeInTheDocument();
  });

  it('should render payment form', () => {
    renderWithProviders(<Reserve experience={mockExperience} />);

    expect(screen.getByTestId('payment-form')).toBeInTheDocument();
  });

  it('should render submit button', () => {
    renderWithProviders(<Reserve experience={mockExperience} />);

    const submitButton = screen.getByTestId('submit-button');
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toHaveTextContent('Submit');
  });

  it('should show error when submitting without selecting tickets', () => {
    renderWithProviders(<Reserve experience={mockExperience} />);

    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);

    expect(screen.getByText('Please select at least one ticket')).toBeInTheDocument();
  });

  it('should clear ticket error when user selects a ticket', () => {
    renderWithProviders(<Reserve experience={mockExperience} />);

    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);

    expect(screen.getByText('Please select at least one ticket')).toBeInTheDocument();

    // Select a ticket by increasing quantity
    const quantitySelectors = screen.getAllByTestId('quantity-selector');
    const increaseButton = quantitySelectors[0].querySelector('[data-testid="quantity-increase"]');
    fireEvent.click(increaseButton!);

    // Error should be cleared
    expect(screen.queryByText('Please select at least one ticket')).not.toBeInTheDocument();
  });

  it('should call purchaseExperienceTicket with correct data', () => {
    mockMutate.mockImplementation((data, options) => {
      options.onSuccess({ data: { paymentDetails: { authorizationUrl: 'https://pay.com' } } });
    });

    renderWithProviders(<Reserve experience={mockExperience} />);

    // Select a ticket
    const quantitySelectors = screen.getAllByTestId('quantity-selector');
    const increaseButton = quantitySelectors[0].querySelector('[data-testid="quantity-increase"]');
    fireEvent.click(increaseButton!);

    // Submit form
    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);

    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        first_name: 'John',
        last_name: 'Doe',
        confirmation_email: 'john@example.com',
        ticket_purchases: [
          {
            ticket_id: 'ticket1',
            quantity: 1,
          },
        ],
        billing_details: expect.objectContaining({
          billing_address: {
            country: 'Ghana',
          },
          payment_method: {
            payment_option: 'card',
            mobile_money_phone: '+233123456789',
          },
        }),
      }),
      expect.any(Object),
    );
  });

  it('should open Paystack modal on successful ticket purchase', () => {
    mockMutate.mockImplementation((data, options) => {
      options.onSuccess({ data: { paymentDetails: { authorizationUrl: 'https://pay.com' } } });
    });

    renderWithProviders(<Reserve experience={mockExperience} />);

    // Select a ticket
    const quantitySelectors = screen.getAllByTestId('quantity-selector');
    const increaseButton = quantitySelectors[0].querySelector('[data-testid="quantity-increase"]');
    fireEvent.click(increaseButton!);

    // Submit form
    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);

    // Paystack modal should be visible
    expect(screen.getByTestId('paystack-modal')).toBeInTheDocument();
  });

  it('should show toast on purchase error', () => {
    mockMutate.mockImplementation((data, options) => {
      options.onError({ message: 'Payment failed' });
    });

    renderWithProviders(<Reserve experience={mockExperience} />);

    // Select a ticket
    const quantitySelectors = screen.getAllByTestId('quantity-selector');
    const increaseButton = quantitySelectors[0].querySelector('[data-testid="quantity-increase"]');
    fireEvent.click(increaseButton!);

    // Submit form
    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);

    expect(toast).toHaveBeenCalledWith({
      title: 'Error',
      description: 'Payment failed',
      variant: 'destructive',
    });
  });

  it('should show "Submitting..." when purchase is pending', () => {
    (usePurchaseExperienceTicket as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: true,
      data: null,
      isSuccess: false,
      isError: false,
      error: null,
    });

    renderWithProviders(<Reserve experience={mockExperience} />);

    const submitButton = screen.getByTestId('submit-button');
    expect(submitButton).toHaveTextContent('Submitting...');
    expect(submitButton).toBeDisabled();
  });

  it('should use fallback photo when no cover photo exists', () => {
    const experienceWithoutCover = {
      ...mockExperience,
      photos: [{ id: '1', photo: 'https://example.com/fallback.jpg', isCover: false }],
    };

    renderWithProviders(<Reserve experience={experienceWithoutCover} />);

    const image = screen.getByAltText('');
    expect(image).toHaveAttribute('src', 'https://example.com/fallback.jpg');
  });

  it('should render separators', () => {
    renderWithProviders(<Reserve experience={mockExperience} />);

    const separators = screen.getAllByTestId('separator');
    expect(separators.length).toBeGreaterThan(0);
  });

  it('should pass isPaid prop to PaymentForm', () => {
    renderWithProviders(<Reserve experience={mockExperience} />);

    expect(screen.getByText(/Paid: true/)).toBeInTheDocument();
  });

  it('should handle free experiences (isPaid: false)', () => {
    const freeExperience = { ...mockExperience, isPaid: false };
    renderWithProviders(<Reserve experience={freeExperience} />);

    expect(screen.getByText(/Paid: false/)).toBeInTheDocument();
  });
});
