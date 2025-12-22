import axios from 'axios';
import { getSession } from 'next-auth/react';

const getAccessToken = async () => {
  const session = await getSession();
  return session?.user?.accessToken;
};

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiWithToken = async (token?: string) => {
  if (!token) {
    const bearerToken = await getAccessToken();
    token = bearerToken || '';
  }
  return axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
};
// Add a request interceptor to set the Authorization header
// api.interceptors.request.use(async (config) => {
//   const token = await getAccessToken();
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });
