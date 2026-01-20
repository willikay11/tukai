import { Session, getServerSession } from 'next-auth';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function getAuthSession(): Promise<Session | null> {
  return getServerSession(authOptions as any);
}
