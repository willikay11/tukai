import { NextResponse } from 'next/server';

import { getAuthSession } from '@/lib/auth';
import type { TukaiAction, TukaiReply } from '@/types/tukai';
import { cleanTukaiText } from '@/utils/tukai';

/**
 * The TukAI agent service (services/tukai-ai.json), called only from these
 * route handlers. Its address stays on the server, and every call carries
 * the person's Tukai access token, which the agent reads the user from.
 */
const AGENT_URL = (process.env.TUKAI_AI_URL || '').replace(/\/+$/, '');
const TIMEOUT_MS = 60_000;

export const TUKAI_MAX_MESSAGE = 2000;
export const TUKAI_MAX_SESSION_ID = 128;

export class TukaiAgentError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export const callTukaiAgent = async <T>({
  path,
  method,
  accessToken,
  body,
}: {
  path: string;
  method: 'GET' | 'POST' | 'DELETE';
  accessToken: string;
  body?: unknown;
}): Promise<T | null> => {
  if (!AGENT_URL) throw new TukaiAgentError(503, 'TUKAI_AI_URL is not set');

  const response = await fetch(`${AGENT_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: 'no-store',
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new TukaiAgentError(response.status, detail.slice(0, 500));
  }
  if (response.status === 204) return null;
  return (await response.json()) as T;
};

/** The agent's ChatResponse and ConfirmResponse, as it sends them. */
export type TukaiAgentReply = {
  session_id: string;
  reply: string;
  requires_confirmation?: boolean;
  actions?: TukaiAction[];
};

/**
 * The agent's reply in the shape the chat renders. The agent sends text and
 * untyped `actions` for now, so cards, plans, drafts and writing options stay
 * empty until those actions have a defined shape to map from.
 */
export const toTukaiReply = (data: TukaiAgentReply | null): TukaiReply => {
  const text = cleanTukaiText(data?.reply);
  return {
    text: text || 'TukAI could not answer just now.',
    error: !text || undefined,
    cards: [],
    plan: null,
    draft: null,
    writing: null,
    suggestions: [],
    items: {},
    requiresConfirmation: Boolean(data?.requires_confirmation),
    actions: Array.isArray(data?.actions) ? data!.actions : [],
  };
};

/** The signed-in person's access token, or the 401 to send back. */
export const requireAccessToken = async (): Promise<string | NextResponse> => {
  const session: any = await getAuthSession();
  const token = session?.user?.accessToken;
  if (!session?.user || !token) {
    return NextResponse.json({ message: 'Sign in to use TukAI.' }, { status: 401 });
  }
  return token;
};

export const isSessionId = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0 && value.length <= TUKAI_MAX_SESSION_ID;

/** Logs the agent's error and answers the browser without its details. */
export const agentErrorResponse = (label: string, error: any) => {
  const status = error instanceof TukaiAgentError ? error.status : 0;
  console.error(`TukAI ${label}:`, status || '', error?.message || error);
  if (status === 401 || status === 403) {
    return NextResponse.json({ message: 'Sign in again to use TukAI.' }, { status: 401 });
  }
  // The month's free messages are used up (tukai_allowance_exhausted)
  if (status === 402) {
    return NextResponse.json(
      {
        message: 'You have used your free TukAI messages this month.',
        code: 'tukai_allowance_exhausted',
      },
      { status: 402 },
    );
  }
  if (status === 404) {
    return NextResponse.json({ message: 'That chat has ended.' }, { status: 404 });
  }
  return NextResponse.json({ message: 'TukAI could not answer just now.' }, { status: 502 });
};
