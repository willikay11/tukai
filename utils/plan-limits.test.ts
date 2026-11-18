import { planLimitOf } from './plan-limits';

// The errors the API sends when a host's plan doesn't allow something (DEV-351)
const apiError = (code: string, attr: string | null = null) => ({
  status: 400,
  success: false,
  message: 'Upgrade your plan',
  errors: [{ code, detail: 'Upgrade your plan', attr }],
});

describe('planLimitOf', () => {
  it('names the limit on publishing past the live-experience cap', () => {
    expect(planLimitOf(apiError('plan_limit_live_experiences'))).toBe('live_experiences');
  });

  it('names the limit on adding a recurrence', () => {
    expect(planLimitOf(apiError('plan_limit_recurring', 'recurrence_rule'))).toBe('recurring');
  });

  it('names the limit on creating a discount code', () => {
    expect(planLimitOf(apiError('plan_limit_discount_codes', 'discount_type'))).toBe(
      'discount_codes',
    );
  });

  // The promo code service throws an Error carrying the API's list
  it('reads the list off an Error too', () => {
    const error = Object.assign(new Error('Discount codes aren’t included'), {
      errors: [{ code: 'plan_limit_discount_codes', detail: '…', attr: 'discount_type' }],
    });
    expect(planLimitOf(error)).toBe('discount_codes');
  });

  it('finds the limit among other errors', () => {
    expect(
      planLimitOf({
        errors: [
          { code: 'required', detail: 'Title is required.', attr: 'title' },
          { code: 'plan_limit_recurring', detail: '…', attr: 'recurrence_rule' },
        ],
      }),
    ).toBe('recurring');
  });

  it('is null for every other error', () => {
    expect(planLimitOf(apiError('required', 'title'))).toBeNull();
    expect(planLimitOf({ status: 400, message: 'Bad request' })).toBeNull();
    expect(planLimitOf(new Error('Network Error'))).toBeNull();
    expect(planLimitOf(null)).toBeNull();
    expect(planLimitOf('plan_limit_recurring')).toBeNull();
  });
});
