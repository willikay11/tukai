import { NextResponse } from 'next/server';

import {
  agentErrorResponse,
  callTukaiAgent,
  isSessionId,
  requireAccessToken,
} from '../../_lib/agent';

/** DELETE /api/tukai/session/:sessionId - ends a chat on the agent too. */
export async function DELETE(_request: Request, { params }: { params: { sessionId: string } }) {
  const token = await requireAccessToken();
  if (token instanceof NextResponse) return token;

  if (!isSessionId(params.sessionId)) {
    return NextResponse.json({ message: 'Bad request.' }, { status: 400 });
  }

  try {
    await callTukaiAgent({
      path: `/v1/session/${encodeURIComponent(params.sessionId)}`,
      method: 'DELETE',
      accessToken: token,
    });
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    // Already gone on the agent is what deleting wanted
    if (error?.status === 404) return new NextResponse(null, { status: 204 });
    return agentErrorResponse('delete session', error);
  }
}
