import {
  CreateBankWallet,
  CreatePhoneWallet,
  UpdateBankWallet,
  UpdatePhoneWallet,
} from '@/types/payment';
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
    throw new Error(error.response?.data?.message || 'An unexpected error occurred');
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
    throw new Error(error.response?.data?.message || 'An unexpected error occurred');
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
    throw new Error(error.response?.data?.message || 'An unexpected error occurred');
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
    throw new Error(error.response?.data?.message || 'An unexpected error occurred');
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
    throw new Error(error.response?.data?.message || 'An unexpected error occurred');
  }
}
