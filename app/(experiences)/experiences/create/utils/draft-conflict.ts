/**
 * A host keeps one draft experience at a time. Creating another while one
 * exists is a 409 naming the existing draft:
 *
 *   {"type": "client_error",
 *    "errors": [{"code": "draft_exists", "detail": "<draft id>", "attr": "draft_id"}]}
 *
 * The service rethrows that as `{ status, errors, ... }`. This reads the
 * draft's id back out of it, so the flow can open that draft instead of
 * failing. Anything else, including other 409s, is null.
 */
export const draftIdFromConflict = (error: unknown): string | null => {
  if (!error || typeof error !== 'object') return null;

  const { status, errors } = error as {
    status?: number;
    errors?: { code?: string; detail?: unknown; attr?: string | null }[];
  };
  if (status !== 409 || !Array.isArray(errors)) return null;

  const conflict = errors.find(
    (item) => item?.code === 'draft_exists' && (item.attr === 'draft_id' || !item.attr),
  );
  return typeof conflict?.detail === 'string' && conflict.detail ? conflict.detail : null;
};
