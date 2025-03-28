import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://api.tukai.co',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJhY2Nlc3MiLCJleHAiOjE3NDU5NTQwMDYsImlhdCI6MTczODE3ODAwNiwianRpIjoiY2I3YTA1MzEwMTcwNDk0NWJiNzgxMDM1MTAzNTllMTEiLCJ1c2VyX2lkIjoiMDU4Yjc4NTMtYzVmNC00ZTQzLWIzNTYtZGExZThjZTA1ZjZlIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImhhc19pbnRlcmVzdHMiOnRydWUsImhhc19iaWxsaW5nX2RldGFpbHMiOnRydWUsImhhc19zdWJzY3JpYmVkIjp0cnVlfQ.sdlHd4g5vpgQgbbHzx-MokjQMbXciMArky6ipesKGXA`,
  },
});

export default api;
