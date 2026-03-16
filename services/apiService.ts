import { getSession, signOut } from 'next-auth/react';

import axios, { AxiosInstance } from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Single persistent authenticated instance shared across all calls.
const authenticatedApi: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Coordinates a single in-flight refresh so concurrent requests don't each
// trigger their own refresh when the access token is expired.
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function notifyRefreshSubscribers(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

// Request interceptor — attach the latest access token before every call.
authenticatedApi.interceptors.request.use(async (config) => {
  const session = await getSession();

  if (session?.error === 'RefreshAccessTokenError') {
    signOut({ redirect: true, callbackUrl: '/auth/sign-in' });
    return Promise.reject(new Error('Session expired'));
  }

  const token = session?.user?.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — retry once on 401/403 after forcing a session refresh.
authenticatedApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if ((status === 401 || status === 403) && !originalRequest._retry) {
      // Another refresh is already in progress — wait for it to finish.
      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshSubscribers.push((newToken: string) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            originalRequest._retry = true;
            resolve(authenticatedApi(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Hitting /api/auth/session triggers NextAuth's JWT callback which
        // will call refreshAccessToken() if the access token is expired.
        const session = await getSession();
        const newToken = session?.user?.accessToken;

        if (!newToken || session?.error === 'RefreshAccessTokenError') {
          signOut({ redirect: true, callbackUrl: '/auth/sign-in' });
          return Promise.reject(error);
        }

        notifyRefreshSubscribers(newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return authenticatedApi(originalRequest);
      } catch {
        signOut({ redirect: true, callbackUrl: '/auth/sign-in' });
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// Async factory kept for backward compatibility — all callers use
// `const api = await apiWithToken()` then immediately call one method on it.
export const apiWithToken = async (_token?: string): Promise<AxiosInstance> => {
  return authenticatedApi;
};
