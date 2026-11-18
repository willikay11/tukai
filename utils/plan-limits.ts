/**
 * What a host's hosting plan stops them doing (DEV-351). The API refuses with
 * a 400 whose error code names the limit, and a message that already reads
 * well to the host, e.g.
 *
 *   {"code": "plan_limit_live_experiences", "attr": null,
 *    "detail": "Your Basic plan allows 3 live experiences at a time. ..."}
 *
 * - live_experiences: publishing past the plan's live-experience limit
 * - recurring: adding a recurrence rule (`attr: "recurrence_rule"`)
 * - discount_codes: creating a discount code (`attr: "discount_type"`)
 */
export type PlanLimit = 'live_experiences' | 'recurring' | 'discount_codes';

const PLAN_LIMITS: Record<string, PlanLimit> = {
  plan_limit_live_experiences: 'live_experiences',
  plan_limit_recurring: 'recurring',
  plan_limit_discount_codes: 'discount_codes',
};

/**
 * The plan limit an error is about, or null for any other error. Services
 * rethrow the API's error list as `errors`, either on a plain object or on
 * an Error, so both are read.
 */
export const planLimitOf = (error: unknown): PlanLimit | null => {
  if (!error || typeof error !== 'object') return null;

  const errors = (error as { errors?: unknown }).errors;
  if (!Array.isArray(errors)) return null;

  for (const item of errors) {
    const code = (item as { code?: unknown })?.code;
    if (typeof code === 'string' && code in PLAN_LIMITS) return PLAN_LIMITS[code];
  }
  return null;
};
