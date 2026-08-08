'use client';

import { useCallback, useState } from 'react';

/**
 * Tracks which footer action (Save & Exit, Save & Continue, …) is in flight so
 * only that button shows a spinner.
 *
 * Handlers that return a promise — the API saves — clear the spinner once they
 * settle, including when validation fails or the request errors. Sync handlers
 * are the ones that navigate out of the flow, so their spinner is left running
 * until the component unmounts; clearing it would flash for a single frame
 * while the route is still loading.
 */
export const usePendingAction = <TAction extends string>() => {
  const [pendingAction, setPendingAction] = useState<TAction | null>(null);

  const runAction = useCallback((action: TAction, handler?: () => void | Promise<void>) => {
    if (!handler) return;

    setPendingAction(action);

    const result = handler();
    if (!(result instanceof Promise)) return;

    result.finally(() => setPendingAction(null));
  }, []);

  return { pendingAction, runAction };
};
