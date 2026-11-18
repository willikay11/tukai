import { apiWithToken } from './apiService';
import { createBankWallet, createPhoneWallet, patchBankWallet, walletBody } from './payment';

jest.mock('./apiService', () => ({ apiWithToken: jest.fn() }));

const api = { post: jest.fn(), patch: jest.fn() };

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
});
