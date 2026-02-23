import { parseSnakeToCamel } from '@/utils/parseSnakeToCamel';

import { api, apiWithToken } from './apiService';

export const signIn = async (email: string, password: string) => {
  try {
    const response = await api.post('/v1/accounts/login/', { email, password });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
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

export const getUsers = async (page = 1, pageSize = 10, email?: string, followers?: string, following?: string, blocked?: string) => {
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
}