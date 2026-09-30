import { ApiResponse } from '@/types/apiResponse';
import { parseApiError } from '@/utils/parseApiError';
import { parseSnakeToCamel } from '@/utils/parseSnakeToCamel';

import { api, apiWithToken } from './apiService';

export const signIn = async (email: string, password: string) => {
  try {
    const response = await api.post('/v1/accounts/login/', { email, password });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || error;
  }
};

export const signUp = async (email: string, password: string) => {
  try {
    const response = await api.post('/v1/accounts/users/', { email, password });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const profile = async (id: string, token?: string) => {
  try {
    const response = await api.get(`/v1/accounts/users/${id}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return parseSnakeToCamel(response.data);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * The signed-in reader's own profile, read with their session token.
 *
 * `profile()` above is the same endpoint but takes the token as an argument,
 * which the NextAuth callbacks need at sign-in. This one goes through the
 * authenticated client like every other call in the app.
 */
export const fetchMyProfile = async (userId: string) => {
  try {
    const client = await apiWithToken();
    const response = await client.get(`/v1/accounts/users/${userId}/`);

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
      message: parseApiError(error.response?.data, 'Could not load your profile'),
    } as ApiResponse;
  }
};

/** What a reader may change about themselves. */
export const updateMyProfile = async (
  userId: string,
  changes: {
    firstName?: string;
    lastName?: string;
    displayName?: string;
    bio?: string;
    websiteUrl?: string;
    instagramUrl?: string;
    tiktokUrl?: string;
    youtubeUrl?: string;
    xUrl?: string;
  },
) => {
  try {
    const client = await apiWithToken();
    const response = await client.patch(`/v1/accounts/users/${userId}/`, {
      ...(changes.firstName !== undefined ? { first_name: changes.firstName } : {}),
      ...(changes.lastName !== undefined ? { last_name: changes.lastName } : {}),
      ...(changes.displayName !== undefined ? { display_name: changes.displayName } : {}),
      ...(changes.bio !== undefined ? { bio: changes.bio } : {}),
      ...(changes.websiteUrl !== undefined ? { website_url: changes.websiteUrl } : {}),
      ...(changes.instagramUrl !== undefined ? { instagram_url: changes.instagramUrl } : {}),
      ...(changes.tiktokUrl !== undefined ? { tiktok_url: changes.tiktokUrl } : {}),
      ...(changes.youtubeUrl !== undefined ? { youtube_url: changes.youtubeUrl } : {}),
      ...(changes.xUrl !== undefined ? { x_url: changes.xUrl } : {}),
    });

    return { status: response.status, success: true, data: parseSnakeToCamel(response.data) };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);

    throw new Error(parseApiError(error.response?.data, 'Could not save your profile'));
  }
};

export const getUserInterests = async (userId: string, token: string) => {
  try {
    const response = await api.get(`/v1/accounts/users/${userId}/interests/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return parseSnakeToCamel(response.data?.results);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const socialSignIn = async (
  backend: 'google-oauth2' | 'facebook' | 'apple-id',
  accessToken: string,
) => {
  try {
    const response = await api.post(`/v1/accounts/social/${backend}/login/`, {
      access_token: accessToken,
    });
    return parseSnakeToCamel({ ...response.data, success: true });
  } catch (error: any) {
    console.error(error?.response?.data);
    return { success: false };
  }
};

export const userExists = async (email: string) => {
  try {
    const response = await api.get(`/v1/accounts/users/exists?email=${email}`);
    return parseSnakeToCamel(response.data);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getUser = async (email: string) => {
  try {
    const response = await api.get(`/v1/accounts/users?email=${email}`);
    return parseSnakeToCamel(response.data);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const refreshToken = async (refreshToken: string) => {
  try {
    const response = await api.post('/v1/accounts/login/refresh/', { refresh: refreshToken });
    return parseSnakeToCamel(response.data);
  } catch (error: any) {
    throw error;
  }
};

export const getInterestCategories = async (page = 1, pageSize = 10) => {
  try {
    const response = await api.get(`/v1/accounts/interests/?page=${page}&page_size=${pageSize}`);
    return parseSnakeToCamel(response.data?.results);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getUsers = async (
  page = 1,
  pageSize = 10,
  email?: string,
  followers?: string,
  following?: string,
  blocked?: string,
) => {
  try {
    let query = `/v1/accounts/users/?page=${page}&page_size=${pageSize}`;
    if (email) query += `&email=${email}`;
    if (followers) query += `&followers=${followers}`;
    if (following) query += `&following=${following}`;
    if (blocked) query += `&blocked=${blocked}`;

    const api = await apiWithToken();
    const response = await api.get(query);
    return parseSnakeToCamel(response.data?.results);
  } catch (error) {
    console.error(error);
    throw error;
  }
};
