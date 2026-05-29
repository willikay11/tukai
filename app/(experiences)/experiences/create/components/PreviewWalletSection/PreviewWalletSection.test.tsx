import { render, screen } from '@testing-library/react';

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: any) => <span>{iconName}</span>,
}));

import { PreviewWalletSection } from './index';
import type { Wallet } from '@/types/payment';

describe('PreviewWalletSection', () => {
  describe('Rendering', () => {
    it('renders the component', () => {
      const { container } = render(<PreviewWalletSection />);
      expect(container).toBeInTheDocument();
    });

    it('displays wallet details heading', () => {
      render(<PreviewWalletSection />);
      expect(screen.getByText('Wallet Details')).toBeInTheDocument();
    });

    it('displays privacy notice', () => {
      render(<PreviewWalletSection />);
      expect(screen.getByText(/You're the only one who can see this/i)).toBeInTheDocument();
    });

    it('displays edit button when onEdit provided', () => {
      const onEdit = jest.fn();
      render(<PreviewWalletSection onEdit={onEdit} />);
      expect(screen.getByText('Edit02Icon')).toBeInTheDocument();
    });

    it('does not display edit button when onEdit not provided', () => {
      render(<PreviewWalletSection />);
      expect(screen.queryByText('Edit02Icon')).not.toBeInTheDocument();
    });
  });

  describe('No Wallet State', () => {
    it('shows placeholder when wallet not provided', () => {
      render(<PreviewWalletSection />);
      expect(screen.getByText('No wallet details added yet.')).toBeInTheDocument();
    });

    it('shows placeholder when wallet is undefined', () => {
      render(<PreviewWalletSection wallet={undefined} />);
      expect(screen.getByText('No wallet details added yet.')).toBeInTheDocument();
    });
  });

  describe('Phone Wallet Display', () => {
    it('displays M-Pesa phone wallet', () => {
      const phoneWallet: Wallet = {
        id: 'wallet-1',
        type: 'phone' as const,
        phone_number: '0712345678',
        is_primary: true,
        walletType: 'phone',
        phone: '0712345678',
      } as Wallet;

      render(<PreviewWalletSection wallet={phoneWallet} />);
      expect(screen.getByText('M-Pesa')).toBeInTheDocument();
      expect(screen.getByText(/MPesa Number:/i)).toBeInTheDocument();
      expect(screen.getByText('0712345678')).toBeInTheDocument();
    });

    it('displays M-Pesa image for phone wallet', () => {
      const phoneWallet: Wallet = {
        id: 'wallet-1',
        type: 'phone' as const,
        phone_number: '0712345678',
        is_primary: true,
        walletType: 'phone',
        phone: '0712345678',
      } as Wallet;

      const { container } = render(<PreviewWalletSection wallet={phoneWallet} />);
      const img = container.querySelector('img[alt="M-Pesa"]');
      expect(img).toBeInTheDocument();
      expect(img?.getAttribute('src')).toBe('/images/mpesa.png');
    });
  });

  describe('Bank Wallet Display', () => {
    const bankWallet: Wallet = {
      id: 'wallet-1',
      type: 'bank' as const,
      is_primary: true,
      walletType: 'bank',
      accountHolderName: 'John Doe',
      bankName: 'Kenya Commercial Bank',
      bankBranch: 'Nairobi',
      accountNumber: '1234567890123456',
      country: 'Kenya',
    } as Wallet;

    it('displays bank account label', () => {
      render(<PreviewWalletSection wallet={bankWallet} />);
      expect(screen.getByText('Bank Account')).toBeInTheDocument();
    });

    it('displays account holder name', () => {
      render(<PreviewWalletSection wallet={bankWallet} />);
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('displays bank name', () => {
      render(<PreviewWalletSection wallet={bankWallet} />);
      expect(screen.getByText(/Kenya Commercial Bank/i)).toBeInTheDocument();
    });

    it('displays bank branch with bank name', () => {
      render(<PreviewWalletSection wallet={bankWallet} />);
      expect(screen.getByText(/Kenya Commercial Bank, Nairobi/i)).toBeInTheDocument();
    });

    it('masks account number showing only last 4 digits', () => {
      render(<PreviewWalletSection wallet={bankWallet} />);
      const accountDisplay = screen.getByText(/\*\*\*\* \*\*\*\* \*\*\*\* 3456/);
      expect(accountDisplay).toBeInTheDocument();
    });

    it('displays country', () => {
      render(<PreviewWalletSection wallet={bankWallet} />);
      expect(screen.getByText('Kenya')).toBeInTheDocument();
    });

    it('handles bank wallet without branch', () => {
      const walletNoBranch: Wallet = {
        ...bankWallet,
        bankBranch: undefined,
      } as Wallet;

      render(<PreviewWalletSection wallet={walletNoBranch} />);
      expect(screen.getByText('Kenya Commercial Bank')).toBeInTheDocument();
      expect(screen.queryByText(/Nairobi/)).not.toBeInTheDocument();
    });

    it('handles bank wallet without country', () => {
      const walletNoCountry: Wallet = {
        ...bankWallet,
        country: undefined,
      } as Wallet;

      render(<PreviewWalletSection wallet={walletNoCountry} />);
      expect(screen.queryByText(/^Kenya$/)).not.toBeInTheDocument();
    });
  });

  describe('Edit Functionality', () => {
    it('calls onEdit when edit button clicked', () => {
      const onEdit = jest.fn();
      render(
        <PreviewWalletSection
          wallet={{
            id: 'wallet-1',
            type: 'phone' as const,
            phone_number: '0712345678',
            is_primary: true,
          } as Wallet}
          onEdit={onEdit}
        />
      );
      const editButton = screen.getByText('Edit02Icon').closest('button');
      editButton?.click();
      expect(onEdit).toHaveBeenCalled();
    });

    it('allows edit button even when no wallet', () => {
      const onEdit = jest.fn();
      render(<PreviewWalletSection onEdit={onEdit} />);
      const editButton = screen.getByText('Edit02Icon').closest('button');
      expect(editButton).toBeInTheDocument();
    });
  });

  describe('Wallet Type Detection', () => {
    it('shows M-Pesa for phone wallet type', () => {
      const phoneWallet: Wallet = {
        id: 'wallet-1',
        type: 'phone' as const,
        walletType: 'phone',
        phone: '0712345678',
        phone_number: '0712345678',
        is_primary: true,
      } as Wallet;

      render(<PreviewWalletSection wallet={phoneWallet} />);
      expect(screen.getByText('M-Pesa')).toBeInTheDocument();
      expect(screen.queryByText('Bank Account')).not.toBeInTheDocument();
    });

    it('shows bank account for bank wallet type', () => {
      const bankWallet: Wallet = {
        id: 'wallet-1',
        type: 'bank' as const,
        walletType: 'bank',
        accountHolderName: 'John',
        bankName: 'KCB',
        accountNumber: '1234567890123456',
        is_primary: true,
      } as Wallet;

      render(<PreviewWalletSection wallet={bankWallet} />);
      expect(screen.getByText('Bank Account')).toBeInTheDocument();
      expect(screen.queryByText('M-Pesa')).not.toBeInTheDocument();
    });
  });

  describe('Minimal Bank Wallet', () => {
    it('displays bank account with only essential fields', () => {
      const minimalBankWallet: Wallet = {
        id: 'wallet-1',
        type: 'bank' as const,
        walletType: 'bank',
        is_primary: true,
      } as Wallet;

      const { container } = render(<PreviewWalletSection wallet={minimalBankWallet} />);
      expect(screen.getByText('Bank Account')).toBeInTheDocument();
      // No assertion needed for missing fields - they just won't render
      expect(container).toBeInTheDocument();
    });
  });
});
