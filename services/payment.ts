import { ApiResponse } from '@/types/apiResponse';
import {
  CreateBankWallet,
  CreatePhoneWallet,
  UpdateBankWallet,
  UpdatePhoneWallet,
} from '@/types/payment';
import { parseApiError } from '@/utils/parseApiError';
import { parseSnakeToCamel } from '@/utils/parseSnakeToCamel';

import { apiWithToken } from './apiService';

/**
 * A wallet body in the API's field names, leaving out every optional field
 * that is blank. An empty string is a value to the API: a blank branch code,
 * SWIFT code or address used to fail `minLength: 1` and block a first bank
 * account (DEV-367).
 */
export const walletBody = (fields: Record<string, string | undefined>) =>
  Object.fromEntries(
    Object.entries(fields).filter(([, value]) => value !== undefined && value.trim() !== ''),
  );

const bankBody = (data: CreateBankWallet) =>
  walletBody({
    bank_name: data.bankName,
    account_number: data.accountNumber,
    account_holder_name: data.accountHolderName,
    bank_branch: data.bankBranch,
    country: data.country,
    branch_code: data.branchCode,
    swift_code: data.swiftCode,
    address: data.address,
    postcode: data.postcode,
    town: data.town,
    contact_phone: data.contactPhone,
  });

export async function fetchWallets() {
  try {
    const api = await apiWithToken();
    const response = await api.get(`/v1/payments/wallets/`);
    return {
      status: response.status,
      success: true,
      data: parseSnakeToCamel(response.data),
    };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw new Error(parseApiError(error.response?.data, 'An unexpected error occurred'));
  }
}

export async function createPhoneWallet(data: CreatePhoneWallet) {
  try {
    const api = await apiWithToken();

    const response = await api.post(
      `/v1/payments/wallets/phone/`,
      walletBody({ phone: data.phone, account_holder_name: data.accountHolderName }),
    );
    return {
      status: response.status,
      success: true,
      data: parseSnakeToCamel(response.data),
    };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw new Error(parseApiError(error.response?.data, 'An unexpected error occurred'));
  }
}

export async function patchPhoneWallet(data: UpdatePhoneWallet) {
  try {
    const api = await apiWithToken();

    const response = await api.patch(
      `/v1/payments/wallets/${data.walletId}/phone/`,
      walletBody({ phone: data.phone, account_holder_name: data.accountHolderName }),
    );
    return {
      status: response.status,
      success: true,
      data: parseSnakeToCamel(response.data),
    };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw new Error(parseApiError(error.response?.data, 'An unexpected error occurred'));
  }
}

export async function createBankWallet(data: CreateBankWallet) {
  try {
    const api = await apiWithToken();

    const response = await api.post(`/v1/payments/wallets/bank/`, bankBody(data));

    return {
      status: response.status,
      success: true,
      data: parseSnakeToCamel(response.data),
    };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw new Error(parseApiError(error.response?.data, 'An unexpected error occurred'));
  }
}

export async function patchBankWallet(data: UpdateBankWallet) {
  try {
    const api = await apiWithToken();

    const response = await api.patch(`/v1/payments/wallets/${data.walletId}/bank/`, bankBody(data));

    return {
      status: response.status,
      success: true,
      data: parseSnakeToCamel(response.data),
    };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw new Error(parseApiError(error.response?.data, 'An unexpected error occurred'));
  }
}

/**
 * A host's earnings.
 *
 * The schema declares an array of summaries; the fields are plainly one
 * summary, so whichever the API sends, the single record is what comes back
 * here.
 */
export async function fetchEarningsSummary(): Promise<ApiResponse> {
  try {
    const api = await apiWithToken();
    const response = await api.get('/v1/payments/wallets/earnings-summary/');
    const payload = parseSnakeToCamel(response.data);

    return {
      status: response.status,
      success: true,
      data: Array.isArray(payload) ? (payload[0] ?? null) : payload,
    } as ApiResponse;
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);

    return {
      status: error.response?.status || 500,
      success: false,
      message: parseApiError(error.response?.data, 'Could not load your earnings'),
    } as ApiResponse;
  }
}

/** Every payout a host has been sent, newest first as the API orders them. */
export async function fetchPayouts(
  params: { page?: number; page_size?: number } = {},
): Promise<ApiResponse> {
  try {
    const api = await apiWithToken();
    const response = await api.get('/v1/payments/wallets/payouts/', { params });

    return {
      status: response.status,
      success: true,
      data: parseSnakeToCamel(response.data),
    } as ApiResponse;
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);

    return {
      status: error.response?.status || 500,
      success: false,
      message: parseApiError(error.response?.data, 'Could not load your payouts'),
    } as ApiResponse;
  }
}

/**
 * What a withdrawal of this amount would actually pay out.
 *
 * Asked for before anything is committed: the fees are the API's to work out,
 * and `limit_message` is its own explanation of why the maximum is what it is.
 */
export async function fetchPayoutQuote(params: {
  amount: string;
  currency?: string;
  wallet_id?: string;
}): Promise<ApiResponse> {
  try {
    const api = await apiWithToken();
    const response = await api.get('/v1/payments/wallets/payout-quote/', { params });

    return {
      status: response.status,
      success: true,
      data: parseSnakeToCamel(response.data),
    } as ApiResponse;
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);

    return {
      status: error.response?.status || 500,
      success: false,
      message: parseApiError(error.response?.data, 'Could not work out the fees'),
    } as ApiResponse;
  }
}

/** Ask for the money. The wallet it goes to is whichever one is active. */
export async function requestWithdrawal(data: { amount: string; currency: string }) {
  try {
    const api = await apiWithToken();
    const response = await api.post('/v1/payments/wallets/withdraw/', data);

    return { status: response.status, success: true, data: parseSnakeToCamel(response.data) };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);

    throw new Error(parseApiError(error.response?.data, 'Could not request this withdrawal'));
  }
}

/** Which wallet a payout goes to. Exactly one is active at a time. */
export async function setActiveWallet(walletId: string) {
  try {
    const api = await apiWithToken();
    const response = await api.post(`/v1/payments/wallets/${walletId}/set-active/`, {});

    return { status: response.status, success: true, data: parseSnakeToCamel(response.data) };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);

    throw new Error(parseApiError(error.response?.data, 'Could not make this the active wallet'));
  }
}

/**
 * Texts a 6-digit code to an M-Pesa wallet's number (DEV-448). Payouts only
 * go to a verified wallet; bank wallets need no code. A new code can be
 * asked for once a minute, and each lasts 10 minutes.
 *
 * Returns the masked number it went to. Errors keep the API's `errors`
 * list, whose `code` says why: not_required, already_verified, cooldown
 * (429) or no_phone.
 */
export async function sendWalletOtp(walletId: string): Promise<{ sentTo: string }> {
  try {
    const api = await apiWithToken();
    const response = await api.post(`/v1/payments/wallets/${walletId}/send-otp/`);
    return { sentTo: response.data?.sent_to ?? '' };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw {
      status: error.response?.status || 500,
      message: parseApiError(error.response?.data, 'Could not send the code'),
      errors: error.response?.data?.errors,
    };
  }
}

/**
 * Checks the code from sendWalletOtp and returns the wallet, now verified.
 * Error codes: invalid_otp, otp_expired, no_otp, max_attempts_exceeded
 * (after 5 wrong codes), already_verified, not_required.
 */
export async function verifyWalletOtp(walletId: string, otp: string) {
  try {
    const api = await apiWithToken();
    const response = await api.post(`/v1/payments/wallets/${walletId}/verify-otp/`, { otp });
    return parseSnakeToCamel(response.data);
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw {
      status: error.response?.status || 500,
      message: parseApiError(error.response?.data, 'Could not check the code'),
      errors: error.response?.data?.errors,
    };
  }
}
