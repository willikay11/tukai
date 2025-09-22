import axios from 'axios';
import { getSession } from 'next-auth/react';

const getAccessToken = async () => {
  const session = await getSession();
  return session?.user?.accessToken;
};

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://api.tukai.co',
  headers: {
    'Content-Type': 'application/json',
    // 'ngrok-skip-browser-warning': 'true'
    // Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJhY2Nlc3MiLCJleHAiOjE3NTY0ODA3OTgsImlhdCI6MTc1NjQ3OTg5OCwianRpIjoiNTllNDNlYmQ4OTVhNDgwNDk2M2NmODdhZTZkYzlkZGUiLCJ1c2VyX2lkIjoiZGU4ODRkNTktYzU5Yy00NjdjLThkOGUtY2I5NzYwNGZlZTRmIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImhhc19pbnRlcmVzdHMiOnRydWUsImhhc19mdWxsX25hbWUiOnRydWUsImhhc19iaWxsaW5nX2RldGFpbHMiOnRydWUsImhhc19zdWJzY3JpYmVkIjp0cnVlfQ.Virohow4c5QxSBiAMZHqxCMasMUqPC_YZWZu8XRUf5E`,
  },
});

export const apiWithToken = async (token?: string) => {
  if (!token) {
    const bearerToken = await getAccessToken();
    token = bearerToken || '';
  }
  console.log('token', token);
  return axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://api.tukai.co',
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
