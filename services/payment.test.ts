import { apiWithToken } from './apiService';
import {
  createBankWallet,
  createPhoneWallet,
  fetchHostIncome,
  patchBankWallet,
  sendWalletOtp,
  verifyWalletOtp,
  walletBody,
} from './payment';

jest.mock('./apiService', () => ({ apiWithToken: jest.fn() }));

const api = { post: jest.fn(), patch: jest.fn(), get: jest.fn() };

describe('wallet requests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (apiWithToken as jest.Mock).mockResolvedValue(api);
    api.post.mockResolvedValue({ status: 201, data: { id: 'w1' } });
    api.patch.mockResolvedValue({ status: 200, data: { id: 'w1' } });
  });

  it('leaves out blank optional fields', () => {
    expect(
      walletBody({ bank_name: 'KCB', branch_code: '', swift_code: '  ', town: undefined }),
    ).toEqual({ bank_name: 'KCB' });
  });

  // DEV-367: a blank branch code, SWIFT code or address failed minLength: 1
  it('creates a Kenyan bank wallet with only the fields it has', async () => {
    await createBankWallet({
      bankName: 'Equity Bank',
      bankBranch: 'Westlands',
      accountHolderName: 'Wanjiku Maina',
      accountNumber: '1122334455',
      country: 'KE',
      branchCode: '',
      swiftCode: '',
    });

    expect(api.post).toHaveBeenCalledWith('/v1/payments/wallets/bank/', {
      bank_name: 'Equity Bank',
      bank_branch: 'Westlands',
      account_holder_name: 'Wanjiku Maina',
      account_number: '1122334455',
      country: 'KE',
    });
  });

  // DEV-426: postcode, town and a contact phone are their own fields
  it('sends postcode, town and contact phone separately', async () => {
    await patchBankWallet({
      walletId: 'w1',
      bankName: 'KCB',
      bankBranch: 'Moi Avenue',
      accountHolderName: 'Wanjiku Maina',
      accountNumber: '998877',
      country: 'KE',
      postcode: '00100',
      town: 'Nairobi',
      contactPhone: '+254712345678',
    });

    expect(api.patch).toHaveBeenCalledWith(
      '/v1/payments/wallets/w1/bank/',
      expect.objectContaining({
        postcode: '00100',
        town: 'Nairobi',
        contact_phone: '+254712345678',
      }),
    );
    expect(api.patch.mock.calls[0][1]).not.toHaveProperty('address');
  });

  // DEV-425: the name on the M-Pesa account is saved with the wallet
  it('sends the M-Pesa holder name', async () => {
    await createPhoneWallet({ phone: '254712345678', accountHolderName: 'Wanjiku Maina' });

    expect(api.post).toHaveBeenCalledWith('/v1/payments/wallets/phone/', {
      phone: '254712345678',
      account_holder_name: 'Wanjiku Maina',
    });
  });

  // DEV-448: M-Pesa wallets are verified with a texted code
  it('sends a code and says where it went', async () => {
    api.post.mockResolvedValue({
      status: 200,
      data: { detail: 'Code sent', sent_to: '+254***678' },
    });

    await expect(sendWalletOtp('w1')).resolves.toEqual({ sentTo: '+254***678' });
    expect(api.post).toHaveBeenCalledWith('/v1/payments/wallets/w1/send-otp/');
  });

  it('checks the code and keeps the error code when it fails', async () => {
    const errors = [{ code: 'invalid_otp', detail: 'Invalid code.', attr: 'otp' }];
    api.post.mockRejectedValue({ response: { status: 400, data: { errors } } });

    await expect(verifyWalletOtp('w1', '000000')).rejects.toMatchObject({ status: 400, errors });
    expect(api.post).toHaveBeenCalledWith('/v1/payments/wallets/w1/verify-otp/', { otp: '000000' });
  });

  // DEV-372: the host's ticket-sales income ledger
  it('reads the income ledger', async () => {
    api.get.mockResolvedValue({
      status: 200,
      data: { results: [{ id: 'e1', kind: 'sale', promo_code: 'JULY500' }] },
    });

    const response = await fetchHostIncome({ page: 1, page_size: 50 });

    expect(api.get).toHaveBeenCalledWith('/v1/payments/wallets/income/', {
      params: { page: 1, page_size: 50 },
    });
    expect(response.data.results[0]).toEqual({ id: 'e1', kind: 'sale', promoCode: 'JULY500' });
  });
});
