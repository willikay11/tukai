import Anthropic from '@anthropic-ai/sdk';

/**
 * One call to the model for TukAI. Server-only: the key never reaches the
 * browser, which is the handoff's first production rule.
 *
 * Thinking is always on for this model, and its tokens count against
 * `max_tokens`, so the ceilings here sit above the handoff's reply sizes
 * (2,000 for a chat reply): the prompt keeps the visible reply short, and the
 * headroom stops thinking from cutting the JSON off mid-way.
 */
const MODEL = 'claude-opus-5-5';
const TIMEOUT_MS = 60_000;

let client: Anthropic | null = null;
const getClient = () => {
  if (!client) client = new Anthropic({ timeout: TIMEOUT_MS, maxRetries: 1 });
  return client;
};

export class TukaiModelError extends Error {}

export const callTukaiModel = async ({
  system,
  messages,
  maxTokens,
}: {
  system: string;
  messages: Anthropic.Beta.BetaMessageParam[];
  maxTokens: number;
}): Promise<string> => {
  const response = await getClient().beta.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    // Chat and short copy: low effort keeps answers quick without losing the
    // catalogue rules
    output_config: { effort: 'low' },
    // A safety decline is re-run on a fallback model inside the same call
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    system,
    messages,
  });

  if (response.stop_reason === 'refusal') throw new TukaiModelError('refused');

  const text = response.content
    .filter((block): block is Anthropic.Beta.BetaTextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('');

  if (!text.trim()) throw new TukaiModelError('empty');
  return text;
};
