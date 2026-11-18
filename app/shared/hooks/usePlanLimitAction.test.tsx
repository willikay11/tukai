import { fireEvent, render, renderHook, screen } from '@testing-library/react';

import { ToastProvider, ToastViewport } from '@/components/ui/toast';
import { useHostingPlan } from '@/context/HostingPlanContext';

import { usePlanLimitAction } from './usePlanLimitAction';

jest.mock('@/context/HostingPlanContext', () => ({ useHostingPlan: jest.fn() }));

const openHostingPlanFlow = jest.fn();

const planLimit = {
  status: 400,
  errors: [{ code: 'plan_limit_recurring', detail: '…', attr: 'recurrence_rule' }],
};

describe('usePlanLimitAction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useHostingPlan as jest.Mock).mockReturnValue({ openHostingPlanFlow });
  });

  it('offers the hosting plans for a plan-limit error', () => {
    const { result } = renderHook(() => usePlanLimitAction());
    const action = result.current(planLimit);

    render(
      <ToastProvider>
        {action}
        <ToastViewport />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'See plans' }));

    expect(openHostingPlanFlow).toHaveBeenCalledWith({ view: 'choose' });
  });

  it('offers nothing for any other error', () => {
    const { result } = renderHook(() => usePlanLimitAction());

    expect(
      result.current({ status: 400, errors: [{ code: 'required', detail: '…', attr: 'title' }] }),
    ).toBeUndefined();
    expect(result.current(new Error('Network Error'))).toBeUndefined();
  });

  it('offers nothing outside the hosting plan provider', () => {
    (useHostingPlan as jest.Mock).mockReturnValue(null);
    const { result } = renderHook(() => usePlanLimitAction());

    expect(result.current(planLimit)).toBeUndefined();
  });
});
