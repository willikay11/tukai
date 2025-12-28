import { parseSnakeToCamel } from '@/utils/parseSnakeToCamel';

import { api } from './apiService';

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

export const socialSignIn = async (backend: 'google-oauth2' | 'facebook', accessToken: string) => {
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
    console.error('heere:', error.response.data);
    throw error;
  }
};
