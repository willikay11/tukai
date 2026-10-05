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

    const response = await api.post(`/v1/payments/wallets/phone/`, {
      phone: data.phone,
    });
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

    const response = await api.patch(`/v1/payments/wallets/${data.walletId}/phone/`, {
      phone: data.phone,
    });
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

    const response = await api.post(`/v1/payments/wallets/bank/`, {
      bank_name: data.bankName,
      account_number: data.accountNumber,
      account_holder_name: data.accountHolderName,
      bank_branch: data.bankBranch,
      branch_code: data.branchCode,
      country: data.country,
      swift_code: data.swiftCode,
      address: data.address,
    });

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

    const response = await api.patch(`/v1/payments/wallets/${data.walletId}/bank/`, {
      bank_name: data.bankName,
      account_number: data.accountNumber,
      account_holder_name: data.accountHolderName,
      bank_branch: data.bankBranch,
      branch_code: data.branchCode,
      country: data.country,
      swift_code: data.swiftCode,
      address: data.address,
    });

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
