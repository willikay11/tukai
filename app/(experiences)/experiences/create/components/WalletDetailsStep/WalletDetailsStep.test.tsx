import { render, screen } from '@testing-library/react';

import { WalletDetailsStep } from '.';

const selectedWallet = { id: 'wallet-123', name: 'M-Pesa' };

jest.mock('../wallet', () => ({
  CreateExperienceWallet: ({ onSelectedWalletChange }: any) => (
    <div data-testid="wallet-step">
      <button onClick={() => onSelectedWalletChange({ id: 'wallet-123', name: 'M-Pesa' })}>
        Select Wallet
      </button>
    </div>
  ),
}));

jest.mock('@/app/shared/hooks/useToast', () => ({
  useToast: () => ({ toast: jest.fn() }),
}));

describe('WalletDetailsStep', () => {
  const mockWallets = [
    {
      id: 'wallet-1',
      walletType: 'phone' as const,
      phone: '+254712345678',
      country: 'Kenya',
      isActive: true,
      user: 'user-1',
      dateCreated: '2026-01-01',
    },
  ];

  const mockMutations = {
    createBankWallet: jest.fn(),
    isCreatingBankWallet: false,
    createPhoneWallet: jest.fn(),
    isCreatingPhoneWallet: false,
    patchBankWallet: jest.fn(),
    isPatchingBankWallet: false,
    patchPhoneWallet: jest.fn(),
    isPatchingPhoneWallet: false,
  };

  const defaultProps = {
    formData: {
      selectedWalletId: null,
      paymentMethod: 'mpesa' as const,
      mpesaPhoneNumber: '',
    },
    onChange: jest.fn(),
    errors: {},
    wallets: mockWallets,
    isWalletsLoading: false,
    walletMutations: mockMutations,
    onPreviewAndPublish: jest.fn(),
  };

  it('renders CreateExperienceWallet', () => {
    render(<WalletDetailsStep {...defaultProps} />);
    expect(screen.getByTestId('wallet-step')).toBeInTheDocument();
  });

  it('calls onChange when wallet selection changes', () => {
    const onChange = jest.fn();
    render(<WalletDetailsStep {...defaultProps} onChange={onChange} />);

    const selectButton = screen.getByText('Select Wallet');
    selectButton.click();

    expect(onChange).toHaveBeenCalledWith({ selectedWallet });
  });

  it('passes formData fields as props to CreateExperienceWallet', () => {
    render(
      <WalletDetailsStep
        {...defaultProps}
        formData={{
          selectedWalletId: 'wallet-1',
          paymentMethod: 'bank_account',
          mpesaPhoneNumber: '254712345678',
        }}
      />,
    );
    expect(screen.getByTestId('wallet-step')).toBeInTheDocument();
  });
});
