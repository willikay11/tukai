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
    Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJhY2Nlc3MiLCJleHAiOjE3NTQwMjA1OTksImlhdCI6MTc0NjI0NDU5OSwianRpIjoiMDA0OTIwM2QzNDVkNDM2ZDk3MzNlMzRlYTZlZDJlM2YiLCJ1c2VyX2lkIjoiMDU4Yjc4NTMtYzVmNC00ZTQzLWIzNTYtZGExZThjZTA1ZjZlIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImhhc19pbnRlcmVzdHMiOnRydWUsImhhc19iaWxsaW5nX2RldGFpbHMiOnRydWUsImhhc19zdWJzY3JpYmVkIjp0cnVlfQ.5FPxf1e1DyTkCBaJtGV-UvYp4CuPc_Z-H3BwmLqx1p4`,
  },
});

export const apiWithToken = async () => {
  const token = await getAccessToken();
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
