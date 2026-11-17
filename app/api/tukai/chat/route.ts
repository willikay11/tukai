import { NextResponse } from 'next/server';

import type { TukaiChatRequest } from '@/types/tukai';

import {
  TUKAI_MAX_MESSAGE,
  type TukaiAgentReply,
  agentErrorResponse,
  callTukaiAgent,
  isSessionId,
  requireAccessToken,
  toTukaiReply,
} from '../_lib/agent';

/**
 * POST /api/tukai/chat - one TukAI reply, from the agent's POST /v1/chat.
 *
 * The chat's id is the agent's session id, and the agent keeps the history,
 * so the browser sends only the new message.
 */
export async function POST(request: Request) {
  const token = await requireAccessToken();
  if (token instanceof NextResponse) return token;

  let body: TukaiChatRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Bad request.' }, { status: 400 });
  }

  const message = String(body?.message ?? '')
    .trim()
    .slice(0, TUKAI_MAX_MESSAGE);
  if (!isSessionId(body?.sessionId) || !message) {
    return NextResponse.json({ message: 'Bad request.' }, { status: 400 });
  }

  try {
    const data = await callTukaiAgent<TukaiAgentReply>({
      path: '/v1/chat',
      method: 'POST',
      accessToken: token,
      body: { session_id: body.sessionId, message },
    });
    return NextResponse.json(toTukaiReply(data));
  } catch (error) {
    return agentErrorResponse('chat', error);
  }
}
