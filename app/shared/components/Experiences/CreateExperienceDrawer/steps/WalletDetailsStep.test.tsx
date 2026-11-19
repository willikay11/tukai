import { fireEvent, render, screen } from '@testing-library/react';

import { Wallet } from '@/types/payment';

import { WalletDetailsStep } from './WalletDetailsStep';

jest.mock('@/app/shared/components/Icons', () => ({ IconComponent: () => null }));
jest.mock('@/app/shared/hooks/useToast', () => ({ useToast: () => ({ toast: jest.fn() }) }));
jest.mock('@/app/shared/components/Payouts/VerifyMpesaWallet', () => ({
  VerifyMpesaWallet: ({ phone }: { phone?: string }) => <div>Verify {phone}</div>,
}));
jest.mock('@/app/shared/components/Forms', () => ({
  SelectField: ({ label, onChange }: { label: string; onChange: (value: string) => void }) => (
    <button type="button" onClick={() => onChange(label === 'Country' ? 'Uganda' : 'Kenya')}>
      {label}
    </button>
  ),
  IntlPhoneField: ({
    country,
    onCountryChange,
    value,
    onChange,
  }: {
    country: string;
    onCountryChange: (iso: string) => void;
    value: string;
    onChange: (value: string) => void;
  }) => (
    <div>
      <span>Code {country}</span>
      <button type="button" onClick={() => onCountryChange('GB')}>
        Pick GB
      </button>
      <input aria-label="Bank phone" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  ),
}));

const mpesa = {
  id: 'mp',
  walletType: 'phone',
  phone: '+254712345815',
  accountHolderName: 'Wanjiku Maina',
  isActive: true,
  isVerified: true,
} as Wallet;
const kcb = {
  id: 'kcb',
  walletType: 'bank',
  bankName: 'KCB Bank',
  accountNumber: '1234560417',
  accountHolderName: 'Aberdare Trail Collective',
  isActive: false,
  isVerified: true,
} as Wallet;

const createPhoneWallet = jest.fn();
const createBankWallet = jest.fn();
const updateWalletFormData = jest.fn();

type WalletForm = {
  paymentMethod: 'phone' | 'bank';
  selectedWallet?: Wallet;
  isAddingNew: boolean;
  phoneNumber: string;
};

const renderStep = (saved: Wallet[], form: Partial<WalletForm> = {}) => {
  const flow = {
    formData: {
      wallet: {
        paymentMethod: 'phone',
        selectedWallet: saved[0],
        isAddingNew: false,
        phoneNumber: '',
        ...form,
      },
    },
    wallets: saved,
    savedWallets: saved,
    walletErrors: {},
    updateWalletFormData,
    walletMutations: { createPhoneWallet, createBankWallet },
  };
  // The step reads only these parts of the flow
  render(<WalletDetailsStep flow={flow as never} />);
};

describe('WalletDetailsStep, with saved payout accounts', () => {
  beforeEach(() => jest.clearAllMocks());

  it('lists them, with the picked one checked and no form', () => {
    renderStep([mpesa, kcb]);

    expect(screen.getByText('Choose your payout account')).toBeInTheDocument();
    expect(screen.getByRole('radiogroup', { name: 'Payout account' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /M-Pesa ending 815/ })).toBeChecked();
    expect(screen.getByText('Wanjiku Maina')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /KCB Bank ending 0417/ })).not.toBeChecked();
    expect(screen.getByRole('radio', { name: /Add new account/ })).not.toBeChecked();
    expect(screen.queryByText('Select your preferred payout method')).not.toBeInTheDocument();
  });

  it('picks another saved account', () => {
    renderStep([mpesa, kcb]);
    fireEvent.click(screen.getByRole('radio', { name: /KCB Bank ending 0417/ }));

    expect(updateWalletFormData).toHaveBeenCalledWith({
      selectedWallet: kcb,
      paymentMethod: 'bank',
      isAddingNew: false,
    });
  });

  it('shows the form under the list for Add new account', () => {
    renderStep([mpesa, kcb]);
    fireEvent.click(screen.getByRole('radio', { name: /Add new account/ }));
    expect(updateWalletFormData).toHaveBeenCalledWith({
      isAddingNew: true,
      selectedWallet: undefined,
    });
  });

  it('opens a blank form when Add new account is picked', () => {
    renderStep([mpesa, kcb], { isAddingNew: true, selectedWallet: undefined });

    expect(screen.getByRole('radio', { name: /Add new account/ })).toBeChecked();
    expect(screen.getByText('Select your preferred payout method')).toBeInTheDocument();
    // Not seeded from the saved M-Pesa wallet
    expect(screen.getByPlaceholderText('7XX XXX XXX')).toHaveValue('');
  });

  it('picks a saved number typed again, rather than adding it twice', () => {
    renderStep([mpesa, kcb], {
      isAddingNew: true,
      selectedWallet: undefined,
      phoneNumber: '0712 345 815',
    });
    fireEvent.blur(screen.getByPlaceholderText('7XX XXX XXX'));

    expect(createPhoneWallet).not.toHaveBeenCalled();
    expect(updateWalletFormData).toHaveBeenCalledWith({
      selectedWallet: mpesa,
      paymentMethod: 'phone',
      isAddingNew: false,
    });
  });

  it('adds a new M-Pesa number with + and the country code, then picks it', () => {
    renderStep([kcb], {
      isAddingNew: true,
      selectedWallet: undefined,
      phoneNumber: '0798 765 432',
    });
    fireEvent.blur(screen.getByPlaceholderText('7XX XXX XXX'));

    expect(createPhoneWallet).toHaveBeenCalledWith({ phone: '+254798765432' }, expect.anything());
    const added = { ...mpesa, id: 'new', phone: '+254798765432', isActive: false };
    createPhoneWallet.mock.calls[0][1].onSuccess({ data: added });
    expect(updateWalletFormData).toHaveBeenCalledWith({
      selectedWallet: added,
      paymentMethod: 'phone',
      isAddingNew: false,
    });
  });

  it('asks for the code when the picked M-Pesa number is not verified yet', () => {
    const unverified = { ...mpesa, isVerified: false };
    renderStep([unverified, kcb]);

    expect(screen.getByText('Verify +254712345815')).toBeInTheDocument();
  });
});

describe('WalletDetailsStep, with no saved payout accounts', () => {
  it('shows the set-up form on its own, as before', () => {
    renderStep([], { selectedWallet: undefined });

    expect(screen.getByText('Set up your payout account')).toBeInTheDocument();
    expect(screen.queryByRole('radiogroup', { name: 'Payout account' })).not.toBeInTheDocument();
    expect(screen.getByText('Select your preferred payout method')).toBeInTheDocument();
  });
});

// DEV-508: the bank account's phone number can be from any country
describe('WalletDetailsStep, a new bank account phone number', () => {
  beforeEach(() => jest.clearAllMocks());

  const fillBank = () => {
    renderStep([], { selectedWallet: undefined, paymentMethod: 'bank' });
    const type = (placeholder: string, value: string) =>
      fireEvent.change(screen.getByPlaceholderText(placeholder), { target: { value } });
    type('Bank name', 'Barclays');
    type('Branch', 'Soho');
    type('Account name', 'Wanjiku Maina');
    type('Account number', '12345678');
    type('Town or city', 'London');
    // The two country pickers: bank, then billing
    screen.getAllByRole('button', { name: 'Country' }).forEach((button) => fireEvent.click(button));
  };

  it('starts its code on the bank country', () => {
    fillBank();

    expect(screen.getByText('Code UG')).toBeInTheDocument();
  });

  it('saves the number with the code the host picked', () => {
    fillBank();
    fireEvent.click(screen.getByRole('button', { name: 'Pick GB' }));
    fireEvent.change(screen.getByLabelText('Bank phone'), { target: { value: '07700 900123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save bank details' }));

    expect(createBankWallet).toHaveBeenCalledWith(
      expect.objectContaining({ contactPhone: '+447700900123' }),
      expect.anything(),
    );
  });
});
