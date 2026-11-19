/**
 * @jest-environment node
 */
import { TukaiAgentError, agentErrorResponse } from './agent';

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
