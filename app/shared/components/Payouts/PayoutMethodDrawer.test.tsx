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
const sendOtp = jest.fn();
const verifyOtp = jest.fn();
let wallets: Wallet[] = [];

jest.mock('@/app/(experiences)/hooks/usePayment', () => ({
  useGetWallets: () => ({ data: { data: wallets } }),
  useCreatePhoneWallet: () => ({ mutate: createPhone, isPending: false }),
  usePatchPhoneWallet: () => ({ mutate: patchPhone, isPending: false }),
  useCreateBankWallet: () => ({ mutate: createBank, isPending: false }),
  usePatchBankWallet: () => ({ mutate: patchBank, isPending: false }),
  useSetActiveWallet: () => ({ mutate: makeActive, isPending: false }),
  useSendWalletOtp: () => ({ mutateAsync: sendOtp, isPending: false }),
  useVerifyWalletOtp: () => ({ mutateAsync: verifyOtp, isPending: false }),
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

  // DEV-425: the name is saved with the wallet, so it comes back
  it('shows the saved name on the M-Pesa account', () => {
    wallets = [aPhoneWallet({ accountHolderName: 'Wanjiku Maina' })];
    renderDrawer();

    expect(screen.getByLabelText('Name on the M-Pesa account')).toHaveValue('Wanjiku Maina');
  });

  it('keeps Save changes disabled for a number that is too short', async () => {
    renderDrawer();

    await userEvent.type(screen.getByLabelText('M-Pesa number'), '12345');

    expect(saveButton()).toBeDisabled();
    expect(screen.getByText('Enter the M-Pesa number withdrawals go to.')).toBeInTheDocument();
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

    expect(createPhone).toHaveBeenCalledWith(
      { phone: '+254712345678', accountHolderName: 'Wanjiku Maina' },
      expect.anything(),
    );
  });

  // Sent with the + and country code, as the API stores it; a leading 0 is dropped
  it('sends a number typed with its leading 0 as +254', async () => {
    renderDrawer();

    await userEvent.type(screen.getByLabelText('M-Pesa number'), '0712 345 678');
    await userEvent.type(screen.getByLabelText('Name on the M-Pesa account'), 'Wanjiku Maina');
    await userEvent.click(saveButton());

    expect(createPhone).toHaveBeenCalledWith(
      { phone: '+254712345678', accountHolderName: 'Wanjiku Maina' },
      expect.anything(),
    );
  });

  it('updates the existing phone wallet instead of creating a new one', async () => {
    wallets = [aPhoneWallet()];
    renderDrawer();

    await userEvent.clear(screen.getByLabelText('M-Pesa number'));
    await userEvent.type(screen.getByLabelText('M-Pesa number'), '798765432');
    await userEvent.type(screen.getByLabelText('Name on the M-Pesa account'), 'Wanjiku Maina');
    await userEvent.click(saveButton());

    expect(patchPhone).toHaveBeenCalledWith(
      { walletId: 'w1', phone: '+254798765432', accountHolderName: 'Wanjiku Maina' },
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

  // DEV-367: blank optional fields failed the API's minLength and blocked a first bank account
  it('creates a bank wallet in Kenya without the fields the screen does not collect', async () => {
    renderDrawer();

    await userEvent.click(screen.getByRole('radio', { name: /Bank account/ }));
    await userEvent.selectOptions(screen.getByLabelText('Bank'), 'Equity Bank');
    await userEvent.type(screen.getByLabelText('Branch'), 'Westlands');
    await userEvent.type(screen.getByLabelText('Account name'), 'Wanjiku Maina');
    await userEvent.type(screen.getByLabelText('Account number'), '1122334455');
    await userEvent.click(saveButton());

    expect(createBank).toHaveBeenCalledWith(
      {
        bankName: 'Equity Bank',
        bankBranch: 'Westlands',
        accountHolderName: 'Wanjiku Maina',
        accountNumber: '1122334455',
        country: 'KE',
      },
      expect.anything(),
    );
  });

  it('activates the wallet and confirms once saved', async () => {
    const onClose = jest.fn();
    createPhone.mockImplementation((_data, { onSuccess }) => onSuccess({ data: { id: 'w2' } }));
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
    patchPhone.mockImplementation((_data, { onError }) =>
      onError(new Error('That number is already in use.')),
    );
    wallets = [aPhoneWallet()];
    renderDrawer();

    await userEvent.clear(screen.getByLabelText('M-Pesa number'));
    await userEvent.type(screen.getByLabelText('M-Pesa number'), '798765432');
    await userEvent.type(screen.getByLabelText('Name on the M-Pesa account'), 'Wanjiku Maina');
    await userEvent.click(saveButton());

    expect(await screen.findByText('That number is already in use.')).toBeInTheDocument();
  });

  // DEV-448: payouts only go to a verified M-Pesa number
  describe('verifying the M-Pesa number', () => {
    beforeEach(() => {
      sendOtp.mockResolvedValue({ sentTo: '+254***678' });
      verifyOtp.mockResolvedValue({ id: 'w2', isVerified: true });
    });

    it('asks for the code straight after a new number is saved', async () => {
      createPhone.mockImplementation((_data, { onSuccess }) =>
        onSuccess({ data: { id: 'w2', walletType: 'phone', isVerified: false } }),
      );
      renderDrawer();

      await userEvent.type(screen.getByLabelText('M-Pesa number'), '712345678');
      await userEvent.type(screen.getByLabelText('Name on the M-Pesa account'), 'Wanjiku Maina');
      await userEvent.click(saveButton());

      expect(makeActive).toHaveBeenCalledWith('w2');
      expect(sendOtp).toHaveBeenCalledWith('w2');
      expect(await screen.findByText(/Enter the 6-digit code we sent to/)).toBeInTheDocument();
      expect(screen.getByText('+254***678')).toBeInTheDocument();
    });

    it('treats a changed number as unverified even when the update response is silent', async () => {
      wallets = [aPhoneWallet({ isVerified: true })];
      patchPhone.mockImplementation((_data, { onSuccess }) => onSuccess({ data: { id: 'w1' } }));
      renderDrawer();

      await userEvent.clear(screen.getByLabelText('M-Pesa number'));
      await userEvent.type(screen.getByLabelText('M-Pesa number'), '798765432');
      await userEvent.type(screen.getByLabelText('Name on the M-Pesa account'), 'Wanjiku Maina');
      await userEvent.click(saveButton());

      expect(sendOtp).toHaveBeenCalledWith('w1');
    });

    it('confirms and closes once the 6th digit checks out', async () => {
      const onClose = jest.fn();
      createPhone.mockImplementation((_data, { onSuccess }) =>
        onSuccess({ data: { id: 'w2', walletType: 'phone', isVerified: false } }),
      );
      renderDrawer(onClose);

      await userEvent.type(screen.getByLabelText('M-Pesa number'), '712345678');
      await userEvent.type(screen.getByLabelText('Name on the M-Pesa account'), 'Wanjiku Maina');
      await userEvent.click(saveButton());
      await userEvent.type(await screen.findByLabelText('6-digit code'), '123456');

      expect(verifyOtp).toHaveBeenCalledWith({ walletId: 'w2', otp: '123456' });
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'M-Pesa number verified' }),
      );
      expect(onClose).toHaveBeenCalled();
    });

    it('says why and keeps the code screen open for a wrong code', async () => {
      verifyOtp.mockRejectedValue({
        status: 400,
        errors: [{ code: 'invalid_otp', detail: 'Invalid code.', attr: 'otp' }],
      });
      createPhone.mockImplementation((_data, { onSuccess }) =>
        onSuccess({ data: { id: 'w2', walletType: 'phone', isVerified: false } }),
      );
      renderDrawer();

      await userEvent.type(screen.getByLabelText('M-Pesa number'), '712345678');
      await userEvent.type(screen.getByLabelText('Name on the M-Pesa account'), 'Wanjiku Maina');
      await userEvent.click(saveButton());
      await userEvent.type(await screen.findByLabelText('6-digit code'), '000000');

      expect(await screen.findByRole('alert')).toHaveTextContent("That code isn't right");
      expect(screen.getByLabelText('6-digit code')).toBeInTheDocument();
    });

    it('offers to verify a saved number that is not verified yet', async () => {
      wallets = [aPhoneWallet({ isVerified: false })];
      renderDrawer();

      await userEvent.click(screen.getByRole('button', { name: 'Verify now' }));
      await userEvent.click(screen.getByRole('button', { name: 'Send code' }));

      expect(sendOtp).toHaveBeenCalledWith('w1');
    });

    it('says nothing about verifying a verified number', () => {
      wallets = [aPhoneWallet({ isVerified: true })];
      renderDrawer();

      expect(screen.queryByRole('button', { name: 'Verify now' })).not.toBeInTheDocument();
    });
  });
});
