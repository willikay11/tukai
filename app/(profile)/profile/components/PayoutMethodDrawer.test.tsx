import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Wallet } from '@/types/payment';

import { PayoutMethodDrawer } from './PayoutMethodDrawer';

const createPhone = jest.fn();
const patchPhone = jest.fn();
const createBank = jest.fn();
const patchBank = jest.fn();
const makeActive = jest.fn();
let wallets: Wallet[] = [];

jest.mock('@/app/(experiences)/hooks/usePayment', () => ({
  useGetWallets: () => ({ data: { data: wallets } }),
  useCreatePhoneWallet: () => ({ mutate: createPhone, isPending: false }),
  usePatchPhoneWallet: () => ({ mutate: patchPhone, isPending: false }),
  useCreateBankWallet: () => ({ mutate: createBank, isPending: false }),
  usePatchBankWallet: () => ({ mutate: patchBank, isPending: false }),
  useSetActiveWallet: () => ({ mutate: makeActive, isPending: false }),
}));

const toast = jest.fn();
jest.mock('@/app/shared/hooks/useToast', () => ({ useToast: () => ({ toast }) }));

const aPhoneWallet = (overrides: Partial<Wallet> = {}): Wallet => ({
  id: 'w1',
  user: 'u1',
  walletType: 'phone',
  phone: '254712345815',
  country: 'KE',
  isActive: true,
  dateCreated: '2026-01-01T00:00:00Z',
  ...overrides,
});

const renderDrawer = (onClose = jest.fn()) =>
  render(<PayoutMethodDrawer isOpen onClose={onClose} />);

const saveButton = () => screen.getByRole('button', { name: 'Save changes' });

describe('payout method settings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    wallets = [];
  });

  it('defaults to M-Pesa with an empty number when there is no wallet yet', () => {
    renderDrawer();

    expect(screen.getByRole('radio', { name: /M-Pesa/ })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByLabelText('M-Pesa number')).toHaveValue('');
    expect(saveButton()).toBeDisabled();
  });

  it('shows the saved M-Pesa number', () => {
    wallets = [aPhoneWallet()];
    renderDrawer();

    expect(screen.getByLabelText('M-Pesa number')).toHaveValue('712345815');
  });

  it('keeps Save changes disabled for a number that is too short', async () => {
    renderDrawer();

    await userEvent.type(screen.getByLabelText('M-Pesa number'), '12345');

    expect(saveButton()).toBeDisabled();
    expect(
      screen.getByText('Enter the M-Pesa number withdrawals go to.'),
    ).toBeInTheDocument();
  });

  it('requires the name on the M-Pesa account too', async () => {
    renderDrawer();

    await userEvent.type(screen.getByLabelText('M-Pesa number'), '712345678');

    expect(screen.getByText('Add the name on the M-Pesa account.')).toBeInTheDocument();
    expect(saveButton()).toBeDisabled();
  });

  it('creates a phone wallet when there is none yet', async () => {
    renderDrawer();

    await userEvent.type(screen.getByLabelText('M-Pesa number'), '712345678');
    await userEvent.type(screen.getByLabelText('Name on the M-Pesa account'), 'Wanjiku Maina');
    await userEvent.click(saveButton());

    expect(createPhone).toHaveBeenCalledWith({ phone: '254712345678' }, expect.anything());
  });

  it('updates the existing phone wallet instead of creating a new one', async () => {
    wallets = [aPhoneWallet()];
    renderDrawer();

    await userEvent.clear(screen.getByLabelText('M-Pesa number'));
    await userEvent.type(screen.getByLabelText('M-Pesa number'), '798765432');
    await userEvent.type(screen.getByLabelText('Name on the M-Pesa account'), 'Wanjiku Maina');
    await userEvent.click(saveButton());

    expect(patchPhone).toHaveBeenCalledWith(
      { walletId: 'w1', phone: '254798765432' },
      expect.anything(),
    );
  });

  it('switches to the bank fields', async () => {
    renderDrawer();

    await userEvent.click(screen.getByRole('radio', { name: /Bank account/ }));

    expect(screen.getByLabelText('Bank')).toBeInTheDocument();
    expect(screen.getByLabelText('Branch')).toBeInTheDocument();
    expect(screen.getByLabelText('Account name')).toBeInTheDocument();
    expect(screen.getByLabelText('Account number')).toBeInTheDocument();
  });

  it('creates a bank wallet with Kenya and blank extra fields the screen does not collect', async () => {
    renderDrawer();

    await userEvent.click(screen.getByRole('radio', { name: /Bank account/ }));
    await userEvent.selectOptions(screen.getByLabelText('Bank'), 'Equity Bank');
    await userEvent.type(screen.getByLabelText('Branch'), 'Westlands');
    await userEvent.type(screen.getByLabelText('Account name'), 'Wanjiku Maina');
    await userEvent.type(screen.getByLabelText('Account number'), '1122334455');
    await userEvent.click(saveButton());

    expect(createBank).toHaveBeenCalledWith(
      expect.objectContaining({
        bankName: 'Equity Bank',
        bankBranch: 'Westlands',
        accountHolderName: 'Wanjiku Maina',
        accountNumber: '1122334455',
        country: 'KE',
        branchCode: '',
        swiftCode: '',
        address: '',
      }),
      expect.anything(),
    );
  });

  it('activates the wallet and confirms once saved', async () => {
    const onClose = jest.fn();
    createPhone.mockImplementation((_data, { onSuccess }) =>
      onSuccess({ data: { id: 'w2' } }),
    );
    renderDrawer(onClose);

    await userEvent.type(screen.getByLabelText('M-Pesa number'), '712345678');
    await userEvent.type(screen.getByLabelText('Name on the M-Pesa account'), 'Wanjiku Maina');
    await userEvent.click(saveButton());

    expect(makeActive).toHaveBeenCalledWith('w2');
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Payout method saved. Withdrawals go to M-Pesa ending 678 from now on.',
      }),
    );
    expect(onClose).toHaveBeenCalled();
  });

  it('shows the refusal the API gave', async () => {
    patchPhone.mockImplementation((_data, { onError }) => onError(new Error('That number is already in use.')));
    wallets = [aPhoneWallet()];
    renderDrawer();

    await userEvent.clear(screen.getByLabelText('M-Pesa number'));
    await userEvent.type(screen.getByLabelText('M-Pesa number'), '798765432');
    await userEvent.type(screen.getByLabelText('Name on the M-Pesa account'), 'Wanjiku Maina');
    await userEvent.click(saveButton());

    expect(await screen.findByText('That number is already in use.')).toBeInTheDocument();
  });
});
