import api from './apiService';
import { parseSnakeToCamel } from '@/utils/parseSnakeToCamel';
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

export const profile = async (id: string) => {
  try {
    const response = await api.get(`/v1/accounts/users/${id}/`);
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
  } catch (error) {
    // console.error(error);
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
