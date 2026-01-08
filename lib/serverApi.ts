import { getServerSession } from 'next-auth';
import { cookies } from 'next/headers';

import axios from 'axios';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function post(path: string, data: any, opts?: { requireAuth?: boolean }) {
  const session: any = await getServerSession(authOptions as any);
  const accessToken = session?.user?.accessToken;

  const cookieStore = cookies();
  const csrfFromCookie = cookieStore.get('csrftoken')?.value ?? cookieStore.get('csrf')?.value;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    accept: 'application/json',
  };

  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  if (csrfFromCookie) headers['X-CSRFTOKEN'] = csrfFromCookie;

  const base = process.env.NEXT_PUBLIC_API_URL || '';
  const url = path.startsWith('/') ? `${base}${path}` : `${base}/${path}`;

  return axios.post(url, data, { headers });
}

export default { post };
