import { NextResponse } from 'next/server';

import type { TukaiConfirmRequest } from '@/types/tukai';

import {
  type TukaiAgentReply,
  agentErrorResponse,
  callTukaiAgent,
  isSessionId,
  requireAccessToken,
  toTukaiReply,
} from '../_lib/agent';

/**
 * POST /api/tukai/confirm - the person's yes or no to the action TukAI
 * proposed in a reply that `requiresConfirmation`, via the agent's
 * POST /v1/confirm.
 */
export async function POST(request: Request) {
  const token = await requireAccessToken();
  if (token instanceof NextResponse) return token;

  let body: TukaiConfirmRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Bad request.' }, { status: 400 });
  }

  if (!isSessionId(body?.sessionId) || typeof body?.confirmed !== 'boolean') {
    return NextResponse.json({ message: 'Bad request.' }, { status: 400 });
  }

  try {
    const data = await callTukaiAgent<TukaiAgentReply>({
      path: '/v1/confirm',
      method: 'POST',
      accessToken: token,
      body: { session_id: body.sessionId, confirmed: body.confirmed },
    });
    return NextResponse.json(toTukaiReply(data));
  } catch (error) {
    return agentErrorResponse('confirm', error);
  }
}
