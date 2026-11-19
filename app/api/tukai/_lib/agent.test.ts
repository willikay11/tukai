/**
 * @jest-environment node
 */
import { TukaiAgentError, agentErrorResponse, toTukaiReply } from './agent';

jest.mock('@/lib/auth', () => ({ getAuthSession: jest.fn() }));

describe('agentErrorResponse', () => {
  beforeEach(() => jest.spyOn(console, 'error').mockImplementation(() => {}));
  afterEach(() => jest.restoreAllMocks());

  // DEV-374: the month's free messages are used up - the web shows the
  // paywall, not "TukAI could not answer"
  it('passes the allowance refusal on as a 402 with its code', async () => {
    const response = agentErrorResponse('chat', new TukaiAgentError(402, '{"detail":{}}'));

    expect(response.status).toBe(402);
    await expect(response.json()).resolves.toEqual({
      message: 'You have used your free TukAI messages this month.',
      code: 'tukai_allowance_exhausted',
    });
  });

  it('still says TukAI could not answer for anything else', async () => {
    const response = agentErrorResponse('chat', new TukaiAgentError(500, 'boom'));

    expect(response.status).toBe(502);
  });
});

// DEV-477/486: a reply's recommendations come as cards the API built
describe('toTukaiReply, recommendation cards', () => {
  const lavy = {
    type: 'place',
    id: 'pl-lavy',
    slug: 'lavy',
    name: 'Lavy Restaurant',
    rating: 4.4,
    review_count: 9,
    area: 'Kilimani',
    latitude: -1.29,
    longitude: 36.78,
    blurb: '<div> Lavy is a casual yet cozy restaurant &amp; bar, with a garden <stro',
    photos: [{ md_url: 'https://cdn/lavy-md.webp', thumb_url: 'https://cdn/lavy-thumb.webp' }],
    bookable: true,
    is_bookmarked: false,
  };

  it('turns each recommendation into a card on the reply', () => {
    const reply = toTukaiReply({
      session_id: 'ch_1',
      reply: 'Try **Lavy Restaurant** in Kilimani.',
      recommendations: [lavy],
    });

    expect(reply.cards).toEqual(['pl-lavy']);
    expect(reply.items['pl-lavy']).toMatchObject({
      kind: 'place',
      title: 'Lavy Restaurant',
      area: 'Kilimani',
      photos: ['https://cdn/lavy-md.webp'],
      lat: -1.29,
      lng: 36.78,
    });
  });

  // The API cuts rich-text descriptions short, tags and all
  it('reads the blurb as text, without tags, entities or a cut-off tag', () => {
    const reply = toTukaiReply({ session_id: 'ch_1', reply: 'Here', recommendations: [lavy] });

    expect(reply.items['pl-lavy'].about).toBe(
      'Lavy is a casual yet cozy restaurant & bar, with a garden',
    );
  });

  it('leaves out anything that is not a place or an experience', () => {
    const reply = toTukaiReply({
      session_id: 'ch_1',
      reply: 'Here',
      recommendations: [{ ...lavy, type: 'community' }, { name: 'no id' }],
    });

    expect(reply.cards).toEqual([]);
  });

  it('has no cards when the agent sends none, as before', () => {
    const reply = toTukaiReply({ session_id: 'ch_1', reply: 'Hello' });

    expect(reply.cards).toEqual([]);
    expect(reply.items).toEqual({});
  });

  it('drops the photo the reply embedded, which the card shows', () => {
    const reply = toTukaiReply({
      session_id: 'ch_1',
      reply: 'Lavy Restaurant:\n- ![Lavy](https://cdn/lavy.jpg)\n- Kilimani',
      recommendations: [lavy],
    });

    expect(reply.text).toBe('Lavy Restaurant:\n- Kilimani');
  });
});
