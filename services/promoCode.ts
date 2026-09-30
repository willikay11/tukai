import { ApiResponse } from '@/types/apiResponse';
import { CreatePromoCode, PromoCode, UpdatePromoCode } from '@/types/promoCode';
import { parseApiError } from '@/utils/parseApiError';
import { parseSnakeToCamel } from '@/utils/parseSnakeToCamel';

import { apiWithToken } from './apiService';

/**
 * A host's own discount codes.
 *
 * `mine/` is the host-facing list; the unfiltered collection also answers for
 * referrers, so it is not what a host wants to see.
 */
export async function fetchMyPromoCodes(params: { page?: number; page_size?: number } = {}) {
  try {
    const api = await apiWithToken();
    const response = await api.get('/v1/experiences/promo-codes/mine/', { params });

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
      message: parseApiError(error.response?.data, 'An unexpected error occurred'),
    } as ApiResponse;
  }
}

/**
 * The canvas asks for three fields. Everything else the serializer accepts —
 * redemption caps, date windows, minimum orders — is left to the API's own
 * defaults rather than sent empty.
 */
export async function createPromoCode(payload: CreatePromoCode): Promise<PromoCode> {
  try {
    const api = await apiWithToken();
    const response = await api.post('/v1/experiences/promo-codes/', {
      code: payload.code,
      experience: payload.experience,
      kind: 'promotion',
      discount_type: payload.discountType,
      ...(payload.discountType === 'percentage'
        ? { discount_percentage: String(payload.discountPercentage ?? 0) }
        : { discount_amount: String(payload.discountAmount ?? 0) }),
    });

    return parseSnakeToCamel(response.data);
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);

    throw new Error(parseApiError(error.response?.data, 'Could not create this code'));
  }
}

export async function updatePromoCode(id: string, payload: UpdatePromoCode): Promise<PromoCode> {
  try {
    const api = await apiWithToken();
    const response = await api.patch(`/v1/experiences/promo-codes/${id}/`, {
      ...(payload.code ? { code: payload.code } : {}),
      ...(payload.discountType ? { discount_type: payload.discountType } : {}),
      ...(payload.discountPercentage !== undefined
        ? { discount_percentage: String(payload.discountPercentage) }
        : {}),
      ...(payload.discountAmount !== undefined
        ? { discount_amount: String(payload.discountAmount) }
        : {}),
      ...(payload.isActive !== undefined ? { is_active: payload.isActive } : {}),
    });

    return parseSnakeToCamel(response.data);
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);

    throw new Error(parseApiError(error.response?.data, 'Could not save this code'));
  }
}

export async function deletePromoCode(id: string): Promise<void> {
  try {
    const api = await apiWithToken();
    await api.delete(`/v1/experiences/promo-codes/${id}/`);
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);

    throw new Error(parseApiError(error.response?.data, 'Could not delete this code'));
  }
}
