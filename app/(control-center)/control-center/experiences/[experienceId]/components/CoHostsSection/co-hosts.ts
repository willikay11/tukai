import { LinkedUser } from '@/types/user';

/**
 * The user an address belongs to.
 *
 * A co-host is added by user id, and the only lookup the API offers is
 * `/accounts/users/?email=` - so an address has to be resolved to an account
 * before anyone can be invited. The endpoint answers with a page or a bare list
 * depending on the route, and matches loosely, so the exact address wins.
 */
export const matchUserByEmail = (payload: unknown, email: string): LinkedUser | undefined => {
  const rows: (LinkedUser & { email?: string })[] = Array.isArray(payload)
    ? payload
    : (((payload as { results?: unknown })?.results as (LinkedUser & { email?: string })[]) ?? []);

  const wanted = email.trim().toLowerCase();

  return (
    rows.find((row) => row.email?.toLowerCase() === wanted) ??
    // One result for a search this specific is that person
    (rows.length === 1 ? rows[0] : undefined)
  );
};
