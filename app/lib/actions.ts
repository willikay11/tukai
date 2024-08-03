'use server';

import { cookies } from 'next/headers';

export async function storeToken(accessToken: string, refreshToken: string) {
  cookies().set({
    name: 'accessToken',
    value: accessToken,
    httpOnly: true,
    sameSite: 'strict',
    secure: true,
    maxAge: 60 * 60 * 24 * 7,
  });

  cookies().set({
    name: 'refreshToken',
    value: refreshToken,
    httpOnly: true,
    sameSite: 'strict',
    secure: true,
    maxAge: 60 * 60 * 24 * 7,
  });
}
