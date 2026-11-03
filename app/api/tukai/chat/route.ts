import { NextResponse } from 'next/server';

import { getAuthSession } from '@/lib/auth';
import type { TukaiChatRequest, TukaiItem, TukaiReply } from '@/types/tukai';
import { idsInReply, parseTukaiReply } from '@/utils/tukai';

import { buildTukaiCatalogue } from '../_lib/catalogue';
import { callTukaiModel } from '../_lib/model';
import { buildTukaiSystemPrompt } from '../_lib/prompt';

const MAX_TURN_CHARS = 4000;

/**
 * POST /api/tukai/chat - one TukAI reply.
 *
 * The browser sends the chat so far; this builds the catalogue and the
 * prompt, calls the model, and runs every check on what comes back before
 * returning it. The free allowance is counted in the browser for now, since
 * the API has nowhere to keep it yet (see the TukAI notes in the PR).
 */
export async function POST(request: Request) {
  const session: any = await getAuthSession();
  if (!session?.user) {
    return NextResponse.json({ message: 'Sign in to use TukAI.' }, { status: 401 });
  }

  let body: TukaiChatRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Bad request.' }, { status: 400 });
  }

  const messages = (Array.isArray(body?.messages) ? body.messages : [])
    .filter((m) => (m?.role === 'user' || m?.role === 'assistant') && typeof m.content === 'string')
    .slice(-14)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_TURN_CHARS) }));

  if (!messages.length || messages[0].role !== 'user') {
    return NextResponse.json({ message: 'Bad request.' }, { status: 400 });
  }

  const catalogue = await buildTukaiCatalogue({
    accessToken: session.user.accessToken,
    userId: session.user.id,
    question: String(body.question || ''),
    lat: typeof body.lat === 'number' ? body.lat : undefined,
    lng: typeof body.lng === 'number' ? body.lng : undefined,
  });

  const system = buildTukaiSystemPrompt({
    catalogue,
    name: String(session.user.name || '').split(' ')[0],
    city: String(body.city || 'Nairobi').slice(0, 80),
    today: String(body.today || new Date().toDateString()).slice(0, 60),
    draftTitle: body.draftTitle ? String(body.draftTitle).slice(0, 120) : null,
  });

  try {
    const raw = await callTukaiModel({ system, messages, maxTokens: 8000 });
    const parsed = parseTukaiReply(
      raw,
      catalogue.items,
      catalogue.ownedCommunities.map((c) => c.id),
    );
    const items: Record<string, TukaiItem> = {};
    idsInReply(parsed).forEach((id) => {
      if (catalogue.items[id]) items[id] = catalogue.items[id];
    });
    const reply: TukaiReply = { ...parsed, items };
    return NextResponse.json(reply);
  } catch (error: any) {
    console.error('TukAI chat:', error?.status || '', error?.message || error);
    return NextResponse.json({ message: 'TukAI could not answer just now.' }, { status: 502 });
  }
}
