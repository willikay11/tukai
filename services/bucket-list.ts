import { api, apiWithToken } from '@/services/apiService';
import { ApiResponse } from '@/types/apiResponse';
import { AddBucketListItemPayload, CreateBucketListPayload } from '@/types/bucket-list';
import { parseApiError } from '@/utils/parseApiError';
import { parseCamelToSnake, parseSnakeToCamel } from '@/utils/parseSnakeToCamel';

/**
 * Bucket lists — a reader's saved experiences and places, and the people they
 * share them with.
 *
 * These were mocked in-memory while the endpoints 404'd. They answer now (401
 * without a token, where a route that does not exist still gives 404), so the
 * mock is gone and every call below is the real one.
 */
export const fetchMyBucketLists = async (page = 1, pageSize = 24): Promise<ApiResponse> => {
  try {
    const axiosInstance = await apiWithToken();
    const res = await axiosInstance.get(`/v1/accounts/bucket-lists/`, {
      params: { page, page_size: pageSize },
    });

    return { status: res.status, success: true, data: parseSnakeToCamel(res.data) };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw {
      status: error.response?.status || 500,
      success: false,
      message: parseApiError(error.response?.data, 'Could not load your bucket lists'),
    };
  }
};

/** One list, with the items it holds and the people on it. */
export const fetchBucketList = async (bucketListId: string): Promise<ApiResponse> => {
  try {
    const axiosInstance = await apiWithToken();
    const res = await axiosInstance.get(`/v1/accounts/bucket-lists/${bucketListId}/`);

    return { status: res.status, success: true, data: parseSnakeToCamel(res.data) };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw {
      status: error.response?.status || 500,
      success: false,
      message: parseApiError(error.response?.data, 'Could not load this bucket list'),
    };
  }
};

export const createBucketList = async (data: CreateBucketListPayload): Promise<ApiResponse> => {
  try {
    const axiosInstance = await apiWithToken();
    const res = await axiosInstance.post(`/v1/accounts/bucket-lists/`, parseCamelToSnake(data));

    return { status: res.status, success: true, data: parseSnakeToCamel(res.data) };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw {
      status: error.response?.status || 500,
      success: false,
      message: parseApiError(error.response?.data, 'Could not create this bucket list'),
    };
  }
};

export const updateBucketList = async (
  bucketListId: string,
  data: Partial<CreateBucketListPayload>,
): Promise<ApiResponse> => {
  try {
    const axiosInstance = await apiWithToken();
    const res = await axiosInstance.patch(
      `/v1/accounts/bucket-lists/${bucketListId}/`,
      parseCamelToSnake(data),
    );

    return { status: res.status, success: true, data: parseSnakeToCamel(res.data) };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw {
      status: error.response?.status || 500,
      success: false,
      message: parseApiError(error.response?.data, 'Could not save these changes'),
    };
  }
};

export const deleteBucketList = async (bucketListId: string): Promise<ApiResponse> => {
  try {
    const axiosInstance = await apiWithToken();
    const res = await axiosInstance.delete(`/v1/accounts/bucket-lists/${bucketListId}/`);

    return { status: res.status, success: true, data: null };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw {
      status: error.response?.status || 500,
      success: false,
      message: parseApiError(error.response?.data, 'Could not delete this bucket list'),
    };
  }
};

/** Saves an experience or a place onto a list. Send one or the other. */
export const addBucketListItem = async (
  bucketListId: string,
  data: AddBucketListItemPayload,
): Promise<ApiResponse> => {
  try {
    const axiosInstance = await apiWithToken();
    const res = await axiosInstance.post(
      `/v1/accounts/bucket-lists/${bucketListId}/items/`,
      parseCamelToSnake(data),
    );

    return { status: res.status, success: true, data: parseSnakeToCamel(res.data) };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw {
      status: error.response?.status || 500,
      success: false,
      message: parseApiError(error.response?.data, 'Could not add this to the list'),
    };
  }
};

export const removeBucketListItem = async (
  bucketListId: string,
  itemId: string,
): Promise<ApiResponse> => {
  try {
    const axiosInstance = await apiWithToken();
    const res = await axiosInstance.delete(
      `/v1/accounts/bucket-lists/${bucketListId}/items/${itemId}/`,
    );

    return { status: res.status, success: true, data: null };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw {
      status: error.response?.status || 500,
      success: false,
      message: parseApiError(error.response?.data, 'Could not remove this from the list'),
    };
  }
};

/**
 * Opens a shared list by its token.
 *
 * Public — the whole point of a share link is that it works before the reader
 * has an account.
 */
export const fetchSharedBucketList = async (shareToken: string): Promise<ApiResponse> => {
  try {
    const res = await api.get(`/v1/accounts/bucket-lists/join/${shareToken}/`);

    return { status: res.status, success: true, data: parseSnakeToCamel(res.data) };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw {
      status: error.response?.status || 500,
      success: false,
      message: parseApiError(error.response?.data, 'Could not open this bucket list'),
    };
  }
};

/** Takes the reader up on a share link. */
export const joinBucketList = async (shareToken: string): Promise<ApiResponse> => {
  try {
    const axiosInstance = await apiWithToken();
    const res = await axiosInstance.post(`/v1/accounts/bucket-lists/join/${shareToken}/`, {});

    return { status: res.status, success: true, data: parseSnakeToCamel(res.data) };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw {
      status: error.response?.status || 500,
      success: false,
      message: parseApiError(error.response?.data, 'Could not join this bucket list'),
    };
  }
};

/** The link to hand out, minted on demand. */
export const fetchBucketListShare = async (bucketListId: string): Promise<ApiResponse> => {
  try {
    const axiosInstance = await apiWithToken();
    const res = await axiosInstance.get(`/v1/accounts/bucket-lists/${bucketListId}/share/`);

    return { status: res.status, success: true, data: parseSnakeToCamel(res.data) };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw {
      status: error.response?.status || 500,
      success: false,
      message: parseApiError(error.response?.data, 'Could not get a link for this list'),
    };
  }
};

/**
 * Sets the order items appear in, as a list of item ids.
 *
 * The whole order is sent rather than a moved id and a destination — the API
 * takes the final sequence, so a reorder is one request however many things
 * moved.
 */
export const reorderBucketListItems = async (
  bucketListId: string,
  order: string[],
): Promise<ApiResponse> => {
  try {
    const axiosInstance = await apiWithToken();
    const res = await axiosInstance.patch(
      `/v1/accounts/bucket-lists/${bucketListId}/items/reorder/`,
      { order },
    );

    return { status: res.status, success: true, data: parseSnakeToCamel(res.data) };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw {
      status: error.response?.status || 500,
      success: false,
      message: parseApiError(error.response?.data, 'Could not save this order'),
    };
  }
};
